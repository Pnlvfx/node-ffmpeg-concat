import { describe, it, jest } from '@jest/globals';
import path from 'node:path';
import os from 'node:os';
import concat from '../src';
const isMac = os.platform() === 'darwin';
const getFile = (file: string) => path.join(process.cwd(), file);
const output = isMac ? 'example_mac.mp4' : 'example_linux.mp4';

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

      await concat({
        videos: [getFile('media/0.mp4'), getFile('media/0a.mp4'), getFile('media/1.mp4'), getFile('media/2.mp4')],
        output: path.join('media', output),
        transition: { name: 'directionalwipe', duration: 500 },
      });

      // Perform assertions to ensure mock functions were called as expected
      // expect(mockInitFrames).toHaveBeenCalled();
      // expect(mockRenderFrames).toHaveBeenCalled();
      // expect(mockRenderAudio).toHaveBeenCalled();
      // expect(mockTranscodeVideo).toHaveBeenCalled();
    },
    2 * 60 * 1000,
  );
});
