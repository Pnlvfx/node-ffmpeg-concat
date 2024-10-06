declare module 'gl-buffer' {
  interface GLBuffer {
    bind: () => void;
    update: (data: BufferSource) => void;
    dispose: () => void;
    length: number;
    usage: number;
    type: number;
  }
  const createBuffer: (gl: WebGLRenderingContext, data: BufferSource | number[], type: number, usage: number) => GLBuffer;
  export default createBuffer;
}
