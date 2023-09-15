import GL from 'gl';
import { FrameWriter, createFrameWriter } from './frame-writer.js';
import { DrawOpts, getTransition } from './transition.js';
import { FrameFormat } from '../types/index.js';
import { ResizeMode, Theme } from '../types/internal.js';

interface ContextOpts {
  frameFormat: FrameFormat;
  theme: Theme;
}

interface GLTransitionFn {
  name: string;
  // eslint-disable-next-line no-unused-vars
  draw: ({ imagePathFrom, imagePathTo, progress, params }: DrawOpts) => Promise<void>;
  dispose: () => void;
}

export interface Context {
  gl: WebGLRenderingContext & GL.StackGLExtension;
  width: number;
  height: number;
  frameWriter: FrameWriter;
  transition: GLTransitionFn | null;
  // eslint-disable-next-line no-unused-vars
  setTransition: ({ name, resizeMode }: { name: string; resizeMode?: ResizeMode }) => undefined;
  // eslint-disable-next-line no-unused-vars
  capture: (filePath: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  render: GLTransitionFn['draw'];
  flush: FrameWriter['flush'];
  dispose: GLTransitionFn['dispose'];
}

export const createContext = async (opts: ContextOpts) => {
  const { frameFormat, theme } = opts;

  const { width, height } = theme;

  const gl = GL(width, height);

  if (!gl) {
    console.error(
      'Failed to create OpenGL context. Please see https://github.com/stackgl/headless-gl#supported-platforms-and-nodejs-versions for compatibility.',
    );
    throw new Error('failed to create OpenGL context');
  }

  const frameWriter = await createFrameWriter({
    gl,
    width,
    height,
    frameFormat,
  });

  const ctx: Partial<Context> & { frameWriter: FrameWriter } = {
    gl,
    width,
    height,
    frameWriter,
    transition: undefined,
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

  ctx.render = async (...args) => {
    if (ctx.transition) {
      return ctx.transition.draw(...args);
    }
  };

  ctx.flush = async () => {
    return ctx.frameWriter.flush();
  };

  ctx.dispose = async () => {
    if (ctx.transition) {
      ctx.transition.dispose();
      ctx.transition = undefined;
    }

    gl.getExtension('STACKGL_destroy_context')?.destroy();
  };

  return ctx as Context;
};
