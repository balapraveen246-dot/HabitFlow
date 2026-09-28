const fs = require('fs/promises');
const path = require('path');
const DEFAULTS = () => ({ settings: { displayName: 'Friend', theme: 'light', timezone: 'UTC', weekStart: 1 }, habits: [] });
let file = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'habits.json');
let queue = Promise.resolve();
const setFile = (f) => { file = f; queue = Promise.resolve(); };

async function read() {
  try {
    const d = JSON.parse(await fs.readFile(file, 'utf8'));
    return { settings: { ...DEFAULTS().settings, ...(d.settings || {}) }, habits: Array.isArray(d.habits) ? d.habits : [] };
  } catch (e) {
    if (e.code === 'ENOENT' || e instanceof SyntaxError) { const d = DEFAULTS(); await write(d); return d; }
    throw e;
  }
}
async function write(data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file); // atomic replace
}
// Serialized read-modify-write: concurrent updates never overwrite each other.
function update(fn) {
  const run = queue.then(async () => {
    const data = await read();
    const result = await fn(data);
    await write(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
const reset = () => update((d) => { Object.assign(d, DEFAULTS()); });
module.exports = { read, update, reset, setFile, DEFAULTS };
