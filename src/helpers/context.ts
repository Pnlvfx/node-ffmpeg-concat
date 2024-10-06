import type { Theme } from '../types/internal.js';
import type { FrameFormat } from '../types/ffmpeg-concat.js';
import { type FrameWriter, createFrameWriter } from './frame-writer.js';
import GL from 'gl';
import { getTransition, GLTransition, TransitionOpts } from './transition.js';

interface ContextOpts {
  frameFormat: FrameFormat;
  theme: Theme;
}

export interface Context {
  gl: WebGLRenderingContext & GL.StackGLExtension;
  width: number;
  height: number;
  frameWriter: FrameWriter;
  transition: GLTransition;
  setTransition: ({ name, resizeMode }: Omit<TransitionOpts, 'gl'>) => undefined;
  capture: (filePath: string) => Promise<void>;
  render: GLTransition['draw'];
  flush: FrameWriter['flush'];
  dispose: GLTransition['dispose'];
}

export const createContext = (opts: ContextOpts) => {
  const { frameFormat, theme } = opts;

  const { width, height } = theme;

  const gl = GL(width, height);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!gl) {
    // eslint-disable-next-line no-console
    console.error(
      'Failed to create OpenGL context. Please see https://github.com/stackgl/headless-gl#supported-platforms-and-nodejs-versions for compatibility.',
    );
    throw new Error('failed to create OpenGL context');
  }

  const ctx = {
    gl,
    width,
    height,
    frameWriter: createFrameWriter({
      gl,
      width,
      height,
      frameFormat,
    }),
  };

  ctx.setTransition = ({ name, resizeMode }) => {
    if (ctx.transition) {
      if (ctx.transition.name === name) {
        return;
      }

      ctx.transition.dispose();
      ctx.transition = undefined;
    }

    ctx.transition = getTransition({
      gl,
      name,
      resizeMode,
    });
  };

  ctx.capture = ctx.frameWriter.write.bind(ctx.frameWriter);

  ctx.render = (...args) => {
    if (!ctx.transition) return;
    return ctx.transition.draw(...args);
  };

  ctx.flush = () => {
    ctx.frameWriter.flush();
  };

  ctx.dispose = () => {
    if (ctx.transition) {
      ctx.transition.dispose();
      ctx.transition = undefined;
    }

    gl.getExtension('STACKGL_destroy_context')?.destroy();
  };

  return ctx as Context;
};
