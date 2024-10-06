import type { TransitionName, TransitionParams } from 'gl-transitions';

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
  transition?: Transition;
  transitions?: readonly Transition[];
  videos: readonly string[];
  verbose?: boolean;
  args?: string[];
}

export interface Transition {
  duration: number;
  name: TransitionName;
  params?: TransitionParams;
}

export interface ExtractAudioOpts {
  videoPath: string;
  outputFileName: string;
  start: number;
  duration: number;
}

export interface InitFramesOptions extends Omit<InitSceneOptions, 'index' | 'video'> {
  concurrency?: number;
}

export interface InitSceneOptions {
  index: number;
  video: string;
  videos: readonly string[];
  transition?: Transition;
  transitions?: readonly Transition[];
  frameFormat: FrameFormat;
  outputDir: string;
  renderAudio: boolean;
  verbose?: boolean;
}
