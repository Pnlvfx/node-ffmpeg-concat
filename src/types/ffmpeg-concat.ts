import type { TransitionName, TransitionParams } from './transitions.js';

export type FrameFormat = 'jpg' | 'png' | 'raw';

export type Log = (stdout?: string) => void;

export interface ConcatOptions {
  audio?: string;
  cleanupFrames?: boolean;
  concurrency?: number;
  frameFormat?: FrameFormat;
  log?: Log;
  output: string;
  tempDir?: string;
  transition?: TransitionInput;
  transitions?: readonly TransitionInput[];
  videos: readonly string[];
  verbose?: boolean;
  args?: string[];
}

export interface TransitionInput {
  duration: number;
  name: TransitionName;
  params: TransitionParams;
}

interface InitOptions {
  videos: readonly string[];
  transition?: TransitionInput;
  transitions?: readonly TransitionInput[];
  frameFormat: FrameFormat;
  outputDir: string;
  renderAudio: boolean;
  verbose?: boolean;
}

export interface InitFramesOptions extends InitOptions {
  concurrency?: number;
}

export interface InitSceneOptions extends InitOptions {
  index: number;
  video: string;
}
