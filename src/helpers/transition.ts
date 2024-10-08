import type { TransitionName, TransitionParams } from '../types/transitions.js';
import createBuffer from 'gl-buffer';
import createTexture from 'gl-texture2d';
import { getPixels } from './get-pixels.js';
import GL from 'gl';
import transitions from 'gl-transitions';
import createTransition, { type ResizeMode } from './gl-transition.js';

export interface TransitionOpts {
  name: TransitionName;
  resizeMode?: ResizeMode;
  gl: WebGLRenderingContext & GL.StackGLExtension;
}

interface DrawOpts {
  imagePathFrom: string;
  imagePathTo: string;
  progress: number;
  params: TransitionParams;
}

export const getTransition = ({ name = 'directionalwarp', resizeMode = 'stretch', gl }: TransitionOpts) => {
  const buffer = createBuffer(gl, [-1, -1, -1, 4, 4, -1], gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  const source = transitions.find((t) => t.name === name) ?? transitions.find((t) => t.name.toLowerCase() === 'fade');
  if (!source) throw new Error('Transition not found!');
  const transition = createTransition(gl, source, { resizeMode });

  return {
    name,
    draw: async ({ imagePathFrom, imagePathTo, progress, params }: DrawOpts) => {
      gl.clear(gl.COLOR_BUFFER_BIT);

      const dataFrom = await getPixels(imagePathFrom, {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
      });

      const textureFrom = createTexture(gl, dataFrom);
      textureFrom.minFilter = gl.LINEAR;
      textureFrom.magFilter = gl.LINEAR;

      const dataTo = await getPixels(imagePathTo, {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
      });

      const textureTo = createTexture(gl, dataTo);
      textureTo.minFilter = gl.LINEAR;
      textureTo.magFilter = gl.LINEAR;

      buffer.bind();
      transition.draw(progress, textureFrom, textureTo, gl.drawingBufferWidth, gl.drawingBufferHeight, params);

      textureFrom.dispose();
      textureTo.dispose();
    },
    dispose: () => {
      buffer.dispose();
      transition.dispose();
    },
  };
};

export type GLTransition = ReturnType<typeof getTransition>;
