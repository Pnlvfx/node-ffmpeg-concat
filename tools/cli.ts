import { input } from '@goatjs/node/input';
import os from 'node:os';
import path from 'node:path';
import { concat } from '../src/ffmpeg-concat.js';

const run = async () => {
  await input.create();
  const getFile = (file: string) => path.join(process.cwd(), file);
  await concat({
    videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
    output: path.join('media', `example_${os.platform()}.mp4`),
    transition: { name: 'directionalwipe', duration: 500, params: {} },
  });

  void run();
};

void run();
