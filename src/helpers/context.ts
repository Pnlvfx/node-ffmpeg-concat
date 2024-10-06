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
  transition?: GLTransition;
  setTransition: ({ name, resizeMode }: Omit<TransitionOpts, 'gl'>) => undefined;
  render: GLTransition['draw'];
  flush: FrameWriter['flush'];
  dispose: GLTransition['dispose'];
}

export const createContext = ({ frameFormat, theme: { width, height } }: ContextOpts) => {
  const gl = GL(width, height);
  const ctx: Context = {
    gl,
    width,
    height,
    frameWriter: createFrameWriter({
      gl,
      width,
      height,
      frameFormat,
    }),
    setTransition: ({ name, resizeMode }) => {
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
    },
    render: async (...args) => {
      if (!ctx.transition) return;
      await ctx.transition.draw(...args);
    },
    flush: () => {
      ctx.frameWriter.flush();
    },
    dispose: () => {
      if (ctx.transition) {
        ctx.transition.dispose();
        ctx.transition = undefined;
      }
      gl.getExtension('STACKGL_destroy_context')?.destroy();
    },
  };

  return ctx;
};
