import coraline from 'coraline';
import { concat } from './ffmpeg-concat.js';
import os from 'node:os';
import path from 'node:path';

const run = async () => {
  await coraline.input.create();
  const isMac = os.platform() === 'darwin';
  const getFile = (file: string) => path.join(process.cwd(), file);
  const output = isMac ? 'example_mac.mp4' : 'example_linux.mp4';
  await concat({
    videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
    output: path.join('media', output),
    transition: { name: 'directionalwipe', duration: 500, params: {} },
  });
};

void run();
