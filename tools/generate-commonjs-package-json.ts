import fs from 'node:fs/promises';
import path from 'node:path';

const output = process.argv[2];

if (!output) throw new Error('No output specified.');

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, `{"type": "commonjs"}`);
