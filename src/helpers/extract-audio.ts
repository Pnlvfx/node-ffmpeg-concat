import ffmpeg from 'async-ffmpeg';

interface ExtractAudioOpts {
  videoPath: string;
  outputFileName: string;
  start: number;
  duration: number;
}

export const extractAudio = (opts: ExtractAudioOpts) => {
  const { videoPath, outputFileName, start, duration } = opts;
  return ffmpeg({ input: videoPath, audioCodec: 'libmp3lame', debug: true, inputSeeking: start, duration, output: outputFileName });
};
