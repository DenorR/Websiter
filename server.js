import { loadConfig } from './src/config.js';
import { createGenerator } from './src/ai.js';
import { createApp } from './src/app.js';

const config = loadConfig();
const generator = createGenerator(config);
const app = createApp({ config, generator });

app.listen(config.port, () => {
  console.log(`Websiter запущен: http://localhost:${config.port}`);
  if (generator.mode === 'ai') {
    console.log(`Режим: ИИ (${config.model}, effort=${config.effort}), лимит ${config.rateLimitPerHour} генераций/час на IP`);
  } else {
    console.log('Режим: ДЕМО — ключ ANTHROPIC_API_KEY не задан, сайты собираются из встроенных заготовок.');
    console.log('Добавьте ключ в .env (см. .env.example), чтобы подключить ИИ.');
  }
});
