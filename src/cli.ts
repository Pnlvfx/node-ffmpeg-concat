import path from 'node:path';
import { fileURLToPath } from 'node:url';
import concat from './index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFile = (file: string) => path.join(__dirname, '..', '..', file);

concat({
  videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
  transition: { name: 'directionalwipe', duration: 500 },
  output: './media/example.mp4',
});
