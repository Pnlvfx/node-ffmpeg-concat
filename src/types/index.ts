import { DefaultParams, TransitionName } from '../helpers/transitions-wrap.js';

export type FrameFormat = 'jpg' | 'png' | 'raw' | undefined;

// eslint-disable-next-line no-unused-vars
export type Log = ((stdout?: string) => void) | undefined;

export interface ConcatOptions {
  audio?: string | undefined;
  cleanupFrames?: boolean | undefined;
  concurrency?: number | undefined;
  frameFormat?: FrameFormat;
  log?: Log;
  output: string;
  tempDir?: string | undefined;
  transition?: Transition | undefined;
  transitions?: ReadonlyArray<Transition> | undefined;
  videos: ReadonlyArray<string>;
  verbose?: boolean;
  args?: string[];
}

export interface Transition {
  duration: number;
  name: TransitionName;
  params?: DefaultParams;
}

export interface ExtractAudioOpts {
  log: Log;
  videoPath: string;
  outputFileName: string;
  start: number;
  duration: number;
}

export interface InitFramesOptions extends Omit<InitSceneOptions, 'index'> {
  concurrency?: number;
}

export interface InitSceneOptions {
  log: Log;
  index: number;
  videos: ReadonlyArray<string>;
  transition?: Transition;
  transitions?: ReadonlyArray<Transition> | undefined;
  frameFormat: FrameFormat;
  outputDir: string;
  renderAudio: boolean;
  verbose?: boolean;
}

// declare function concat(concatOptions: ConcatOptions): Promise<void>;

// export default concat;
