/* eslint-disable no-unused-vars */
import { Transition } from '.';

export type ResizeMode = 'stretch' | string;

export type OnProgress = (p: number) => void;

export interface Scene extends InitialScene {
  transition: Transition;
  // eslint-disable-next-line no-unused-vars
  getFrame: (frame: number) => string;
  sourceAudioPath: string;
  //
  frameStart: number;
  numFramesTransition: number;
  numFramesPreTransition: number;
}

export interface InitialScene {
  video: string;
  index: number;
  width: number;
  height: number;
  duration: number;
  numFrames: number;
  fps: number;
}

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
