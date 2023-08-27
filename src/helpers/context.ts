import GL from 'gl';
import { createFrameWriter } from './frame-writer.js';
import { createTransitionfn } from './transition.js'

interface ContextOpts {
  frameFormat: string;
  theme: {
    width: number;
    height: number;
  }
}

export const createContext = async (opts: ContextOpts) => {
  const {
    frameFormat,
    theme
  } = opts

  const {
    width,
    height
  } = theme

  const gl = GL(width, height)

  if (!gl) {
    console.error('Failed to create OpenGL context. Please see https://github.com/stackgl/headless-gl#supported-platforms-and-nodejs-versions for compatibility.')
    throw new Error('failed to create OpenGL context')
  }

  const frameWriter = await createFrameWriter({
    gl,
    width,
    height,
    frameFormat
  })

  const ctx = {
    gl,
    width,
    height,
    frameWriter,
    transition: null
  }

  ctx.setTransition = ({ name, resizeMode }) => {
    if (ctx.transition) {
      if (ctx.transition.name === name) {
        return
      }

      ctx.transition.dispose()
      ctx.transition = null
    }

    ctx.transition = createTransitionfn({
      gl,
      name,
      resizeMode
    })
  }

  ctx.capture = ctx.frameWriter.write.bind(ctx.frameWriter)

  ctx.render = async (...args) => {
    if (ctx.transition) {
      return ctx.transition.draw(...args)
    }
  }

  ctx.flush = async () => {
    return ctx.frameWriter.flush()
  }

  ctx.dispose = async () => {
    if (ctx.transition) {
      ctx.transition.dispose()
      ctx.transition = null
    }

    gl.destroy()
  }

  return ctx
}