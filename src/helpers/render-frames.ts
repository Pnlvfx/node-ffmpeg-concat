import fs from 'fs-extra';
import path from 'node:path'
import pMap from 'p-map';
import leftPad from 'left-pad';
import { FrameFormat } from '../types/index.js';
import { createContext } from './context.js';

interface RenderFramesOpts {
  frameFormat: FrameFormat;
  frames: string[];
  outputDir: string;
}

export const renderFrames = async (opts: RenderFramesOpts) => {
  const {
    frameFormat,
    frames,
    onProgress,
    outputDir,
    theme
  } = opts

  const ctx = await createContext({
    frameFormat,
    theme
  })

  await pMap(frames, (frame, index) => {
    return renderFrame({
      ctx,
      frame,
      frameFormat,
      index,
      onProgress,
      outputDir,
      theme
    })
  }, {
    concurrency: 8
  })

  await ctx.flush()
  await ctx.dispose()

  const framePattern = path.join(outputDir, `%012d.${frameFormat}`)
  return framePattern
}

export const renderFrame = async (opts) => {
  const {
    ctx,
    frame,
    frameFormat,
    index,
    onProgress,
    outputDir,
    theme
  } = opts

  const fileName = `${leftPad(index, 12, '0')}.${frameFormat}`
  const filePath = path.join(outputDir, fileName)

  const {
    current,
    next
  } = frame

  const cFrame = index - current.frameStart
  const cFramePath = current.getFrame(cFrame)

  if (!next) {
    await fs.move(cFramePath, filePath, { overwrite: true })
  } else {
    ctx.setTransition(current.transition)

    const nFrame = index - next.frameStart
    const nFramePath = next.getFrame(nFrame)
    const cProgress = (cFrame - current.numFramesPreTransition) / current.numFramesTransition

    await ctx.render({
      imagePathFrom: cFramePath,
      imagePathTo: nFramePath,
      progress: cProgress,
      params: current.transition.params
    })

    await ctx.capture(filePath)
  }

  if (onProgress && index % 16 === 0) {
    onProgress(index / theme.numFrames)
  }
}