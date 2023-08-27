import fs from 'fs';
import getPixels from 'get-pixels'
import ndarray from 'ndarray'
import util from 'node:util'
import { getFileExt } from './get-file-ext.js'

const getPixelsP = util.promisify(getPixels)

export const getPixelsFn = async (filePath: string, opts: { width: number, height: number }) => {
    const ext = getFileExt(filePath, { strict: false })

    if (ext === 'raw') {
        const data = fs.readFileSync(filePath)

        // @see https://github.com/stackgl/gl-texture2d/issues/16
        return ndarray(data, [
            opts.width,
            opts.height,
            4
        ], [
            4,
            opts.width * 4,
            1
        ])
    }

    const pixels = await getPixelsP(filePath)
    return pixels
}