/* eslint-disable unicorn/no-null */

import type { FrameFormat } from '../types/ffmpeg-concat.js';
import fs from 'node:fs';
import sharp, { type Sharp } from 'sharp';
import GL from 'gl';

const supportedFormats = new Set(['png', 'jpg', 'raw']);

interface FrameWriterOpts {
  frameFormat: FrameFormat;
  gl: WebGLRenderingContext & GL.StackGLExtension;
  width: number;
  height: number;
}

interface Worker {
  byteArray: Uint8Array;
  encoder: Sharp | null;
}

export const createFrameWriter = ({ frameFormat = 'raw', gl, width, height }: FrameWriterOpts) => {
  if (!supportedFormats.has(frameFormat)) throw new Error(`frame writer unsupported format "${frameFormat}"`);
  let worker: Worker | null = {
    byteArray: new Uint8Array(width * height * 4),
    encoder: null,
  };

  if (frameFormat === 'png') {
    const buffer = Buffer.from(worker.byteArray.buffer);
    worker.encoder = sharp(buffer, {
      raw: {
        width,
        height,
        channels: 4,
      },
    }).png({
      compressionLevel: 0,
      adaptiveFiltering: false,
    });
  } else if (frameFormat === 'jpg') {
    const buffer = Buffer.from(worker.byteArray.buffer);
    worker.encoder = sharp(buffer, {
      raw: {
        width,
        height,
        channels: 4,
      },
    }).jpeg();
  }

  return {
    write: async (filePath: string) => {
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, worker?.byteArray ?? null);

      if (worker && frameFormat === 'raw') {
        // don't change this to promise
        fs.writeFileSync(filePath, worker.byteArray);
      } else {
        await new Promise<void>((resolve, reject) => {
          worker?.encoder?.toFile(filePath, (err) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (err) reject(err);
            resolve();
          });
        });
      }
    },

    flush: () => {
      return;
    },

    dispose: () => {
      worker = null;
    },
  };
};

export type FrameWriter = ReturnType<typeof createFrameWriter>;
