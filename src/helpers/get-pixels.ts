import fs from 'node:fs';
import getPixels from 'get-pixels';
import ndarray from 'ndarray';
import { getFileExt } from './get-file-ext.js';

export const getPixelsFn = async (filePath: string, opts: { width: number; height: number }) => {
  const ext = getFileExt(filePath, { strict: false });

  if (ext === 'raw') {
    const data = fs.readFileSync(filePath);

    // @see https://github.com/stackgl/gl-texture2d/issues/16
    return ndarray(data, [opts.width, opts.height, 4], [4, opts.width * 4, 1]);
  }

  return asyncGetPixels(filePath);
};

const asyncGetPixels = (filePath: string) => {
  return new Promise<ndarray.NdArray<Uint8Array>>((resolve, reject) => {
    getPixels(filePath, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};
