declare module 'gl-transition' {
  export type ResizeMode = 'cover' | 'contain' | 'stretch';
  interface TransitionObjectLike {
    glsl: string;
    defaultParams: Record<string, unknown>;
    paramsTypes?: Record<string, string>;
  }
  interface Options {
    resizeMode?: ResizeMode;
  }

  interface GLTextureLike {
    bind: (unit: number) => number;
    shape: [number, number];
  }

  export type DrawOptionParams = Record<string, number | boolean | GLTextureLike>;

  interface GLTransition {
    draw: (progress: number, from: GLTextureLike, to: GLTextureLike, width: number, height: number, params: DrawOptionParams) => void;
    dispose: () => void;
  }

  const createGLTransition: (gl: WebGLRenderingContext, transition: TransitionObjectLike, options?: Options) => GLTransition;

  export default createGLTransition;
}
