import path from 'node:path';

// Подхватываем .env, если он есть (Node 20.12+).
try {
  process.loadEnvFile?.('.env');
} catch {
  /* файла нет — это нормально */
}

const int = (value, fallback) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export function loadConfig(env = process.env) {
  const apiKey = (env.ANTHROPIC_API_KEY ?? '').trim();
  const effort = ['low', 'medium', 'high'].includes(env.ANTHROPIC_EFFORT) ? env.ANTHROPIC_EFFORT : 'medium';
  return {
    port: int(env.PORT, 3000),
    anthropicApiKey: apiKey,
    model: (env.ANTHROPIC_MODEL ?? '').trim() || 'claude-opus-5-5',
    effort,
    // В демо-режиме ИИ не тратит деньги, поэтому лимит мягче.
    rateLimitPerHour: int(env.RATE_LIMIT_PER_HOUR, apiKey ? 10 : 100),
    maxRevisionsPerSite: int(env.MAX_REVISIONS_PER_SITE, 10),
    trustProxy: env.TRUST_PROXY === undefined ? false : /^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : env.TRUST_PROXY === 'true',
    dataDir: path.resolve(env.DATA_DIR ?? './data'),
    mockDelayMs: int(env.MOCK_DELAY_MS, 900),
  };
}
