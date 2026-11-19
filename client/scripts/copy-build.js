import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const buildDirectory = path.resolve(scriptDirectory, '../dist');
const publicDirectory = path.resolve(scriptDirectory, '../../server/public');

if (!existsSync(path.join(buildDirectory, 'index.html'))) {
  throw new Error('Vite build output not found in client/dist.');
}

rmSync(publicDirectory, { recursive: true, force: true });
mkdirSync(publicDirectory, { recursive: true });
cpSync(buildDirectory, publicDirectory, { recursive: true, force: true });
console.log(`Copied client/dist to ${path.relative(process.cwd(), publicDirectory)}.`);
