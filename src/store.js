import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ID_RE = /^[a-f0-9]{20}$/;

/** Простое файловое хранилище: один JSON-файл на сайт. */
export function createStore(dataDir) {
  const dir = path.join(dataDir, 'sites');
  fs.mkdirSync(dir, { recursive: true });

  const file = (id) => path.join(dir, `${id}.json`);

  return {
    isValidId: (id) => typeof id === 'string' && ID_RE.test(id),

    create(record) {
      const id = crypto.randomBytes(10).toString('hex');
      const now = new Date().toISOString();
      const site = { revisions: 0, ...record, id, createdAt: now, updatedAt: now };
      this.save(site);
      return site;
    },

    save(site) {
      site.updatedAt = new Date().toISOString();
      const tmp = file(site.id) + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(site));
      fs.renameSync(tmp, file(site.id)); // атомарно, чтобы не читать наполовину записанный файл
      return site;
    },

    get(id) {
      if (!ID_RE.test(id)) return null;
      try {
        return JSON.parse(fs.readFileSync(file(id), 'utf8'));
      } catch {
        return null;
      }
    },
  };
}
