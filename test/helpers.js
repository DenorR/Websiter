import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createGenerator } from '../src/ai.js';
import { loadConfig } from '../src/config.js';

export const VALID_INPUT = {
  name: 'Барбершоп «Борода»',
  description: 'Мужской барбершоп на 4 кресла. Стрижки, борода, бритьё. Работаем по записи.',
  city: 'Екатеринбург',
  goal: 'bookings',
  phone: '+7 900 000-00-00',
  email: 'hi@boroda.example',
};

export function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'websiter-test-'));
}

export async function listen(server) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { port, url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

/** Поднимает настоящее приложение в демо-режиме (без ключа). */
export async function startApp(env = {}) {
  const config = loadConfig({ DATA_DIR: tmpDir(), MOCK_DELAY_MS: '0', ...env });
  const generator = createGenerator(config);
  const app = createApp({ config, generator });
  const server = http.createServer(app);
  return { ...(await listen(server)), config, generator };
}

/** Читает SSE-ответ целиком и возвращает список {event, data}. */
export async function readSse(res) {
  const text = await res.text();
  return text
    .split('\n\n')
    .map((frame) => {
      let event = 'message';
      let data = '';
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
      }
      return data ? { event, data: JSON.parse(data) } : null;
    })
    .filter(Boolean);
}

export const post = (url, body) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/**
 * Фейковый Anthropic API. handler(body, req, res) вызывается на каждый POST /v1/messages.
 * Помогает проверить стриминг и разбор ответа без настоящего ключа.
 */
export async function fakeAnthropic(handler) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const body = raw ? JSON.parse(raw) : {};
      requests.push({ url: req.url, headers: req.headers, body });
      handler(body, req, res);
    });
  });
  const srv = await listen(server);
  return { ...srv, requests };
}

/** Отдаёт текстовый ответ в формате SSE Messages API, разбив его на куски. */
export function sendTextStream(res, text, { stopReason = 'end_turn', chunks = 6 } = {}) {
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  res.writeHead(200, { 'Content-Type': 'text/event-stream' });
  send('message_start', {
    type: 'message_start',
    message: {
      id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [],
      stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 },
    },
  });
  if (text !== null) {
    send('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    const size = Math.ceil(text.length / chunks);
    for (let i = 0; i < text.length; i += size) {
      send('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: text.slice(i, i + size) } });
    }
    send('content_block_stop', { type: 'content_block_stop', index: 0 });
  }
  send('message_delta', { type: 'message_delta', delta: { stop_reason: stopReason, stop_sequence: null }, usage: { output_tokens: 100 } });
  send('message_stop', { type: 'message_stop' });
  res.end();
}
