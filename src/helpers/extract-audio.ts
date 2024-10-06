import ffmpeg from 'async-ffmpeg';

interface ExtractAudioOpts {
  videoPath: string;
  outputFileName: string;
  start: number;
  duration: number;
  debug?: boolean;
}

export const extractAudio = ({ videoPath, outputFileName, start, duration, debug }: ExtractAudioOpts) => {
  return ffmpeg({ input: videoPath, audioCodec: 'libmp3lame', debug, inputSeeking: start, duration, output: outputFileName });
};
