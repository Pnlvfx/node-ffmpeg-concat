import parseUrl from 'url-parse';

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
  const { pathname } = parseUrl(url);
  const parts = pathname.split('.');
  const ext = (parts.at(-1) || '').trim().toLowerCase();

  if (!strict || extWhitelist.has(ext)) {
    return ext;
  }
  return 'raw'; // default
};
