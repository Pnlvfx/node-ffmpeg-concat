import path from 'node:path';

const extWhitelist = new Set([
  // videos
  'gif',
  'mp4',
  'webm',
  'mkv',
  'mov',
  'avi',

  // images
  'bmp',
  'jpg',
  'jpeg',
  'png',
  'tif',
  'webp',

  // audio
  'mp3',
  'aac',
  'wav',
  'flac',
  'opus',
  'ogg',
]);

export const getFileExt = (url: string, { strict = true } = {}) => {
  const ext = path.extname(url).replaceAll('.', '');
  if (!strict || extWhitelist.has(ext)) {
    return ext;
  }
  return 'raw';
};
