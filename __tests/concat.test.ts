import { describe, it } from '@jest/globals';
import path from 'node:path';
import os from 'node:os';
import { concat } from '../src/ffmpeg-concat.js';

const getFile = (file: string) => path.join(process.cwd(), file);

describe('concat function', () => {
  it(
    'should concatenate videos successfully',
    async () => {
      await concat({
        videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
        output: path.join('media', `example_${os.platform()}.mp4`),
        transition: { name: 'directionalwipe', duration: 500, params: {} },
      });
    },
    2 * 60 * 1000,
  );
});
