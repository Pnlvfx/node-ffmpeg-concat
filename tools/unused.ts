import { findUnusedExports } from '@goatjs/ts-unused-exports';

const unused = await findUnusedExports({
  ignoreFiles: ['ffmpeg-concat.ts', 'eslint.config.js', 'jest.config.ts'],
  ignoreVars: [],
});

if (unused) {
  throw new Error(`The following exports are unused, add them on the ignore or remove the exports to continue.\n${JSON.stringify(unused)}`);
}
