import { describe, it, jest } from '@jest/globals';
import { fileURLToPath } from 'node:url';
import concat from '../src/index';
import path from 'node:path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFile = (file: string) => path.join(__dirname, '..', file);

describe('concat function', () => {
  it(
    'should concatenate videos successfully',
    async () => {
      const mockEnsureDirSync = jest.fn();
      // const mockInitFrames = jest.fn(() => Promise.resolve({ frames: [], scenes: [], theme: {} }));
      // const mockRenderFrames = jest.fn(() => Promise.resolve('framePattern'));
      // const mockRenderAudio = jest.fn(() => Promise.resolve('audioFile'));
      // const mockTranscodeVideo = jest.fn(() => Promise.resolve());

      jest.mock('fs-extra', () => ({
        ensureDirSync: mockEnsureDirSync,
      }));

      // jest.mock('../src/helpers/init-frames', () => ({
      //   initFrames: mockInitFrames,
      // }));
      // jest.mock('../src/helpers/render-frames', () => ({
      //   renderFrames: mockRenderFrames,
      // }));
      // jest.mock('../src/helpers/render-audio', () => ({
      //   renderAudio: mockRenderAudio,
      // }));
      // jest.mock('../src/helpers/transcode-video', () => ({
      //   transcodeVideo: mockTranscodeVideo,
      // }));

      const options = {
        videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
        output: './media/example.mp4',
        transition: { name: 'directionalWipe', duration: 500 },
      };

      // Call the concat function with the prepared options
      await concat(options);

      // Perform assertions to ensure mock functions were called as expected
      // expect(mockInitFrames).toHaveBeenCalled();
      // expect(mockRenderFrames).toHaveBeenCalled();
      // expect(mockRenderAudio).toHaveBeenCalled();
      // expect(mockTranscodeVideo).toHaveBeenCalled();
    },
    2 * 60 * 1000,
  );
});
