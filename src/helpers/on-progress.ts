import { toMs } from 'hh-mm-ss';

interface Event {
  timemark: string;
  percent?: number;
}

export type ProgressFunction = (progress: number, event?: unknown) => void;

export const ffmpegOnProgress = (onProgress: ProgressFunction, durationMs: number): ((...args: Event[]) => void) => {
  return (event) => {
    let progress = 0;

    try {
      const timestamp = toMs(event.timemark);
      progress = timestamp / durationMs;
    } catch {
      /* empty */
    }

    if (Number.isNaN(progress) && typeof event.percent === 'number') {
      progress = event.percent / 100;
    }

    if (!Number.isNaN(progress)) {
      progress = Math.max(0, Math.min(1, progress));
      onProgress(progress, event);
    }
  };
};
