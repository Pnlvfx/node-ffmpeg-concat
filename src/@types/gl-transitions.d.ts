declare module 'gl-transitions' {
  interface ParamsType {
    color?: string;
    colorPhase: string;
  }
  type TransitionName = 'fade' | string;
  interface GLTransition {
    name: TransitionName;
    paramsType: ParamsType | object;
    defaultParams: object;
    glsl: string;
    author: string;
    license: string;
    createdAt: string;
    updatedAt: string;
  }

  const transitions: GLTransition[];
  export = transitions;
}
