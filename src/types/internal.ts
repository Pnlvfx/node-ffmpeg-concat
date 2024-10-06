export interface Frame {
  current: Scene;
  next: Scene | undefined;
}

export interface Theme {
  numFrames: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
}
