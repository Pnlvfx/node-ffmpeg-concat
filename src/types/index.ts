/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type FrameFormat = 'jpg' | 'png' | 'raw' | undefined

export interface ConcatOptions {
  audio?: string | undefined;
  cleanupFrames?: boolean | undefined;
  concurrency?: number | undefined;
  frameFormat?: FrameFormat;
  log?: ((stdout?: string) => void) | undefined;
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
  name: string;
  params?: Record<string, any>;
}

export interface ExtractAudioOpts {
  // eslint-disable-next-line no-unused-vars
  log: ({ cmd }: { cmd: unknown }) => void;
  videoPath: string;
  outputFileName: string;
  start: number;
  duration: number;
}

export interface InitFramesOptions extends Omit<InitSceneOptions, 'index'> {
  concurrency?: number;
}

export interface InitSceneOptions {
  log: ((stdout: string) => void) | undefined;
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
