import { goateslint } from '@goatjs/node-eslint';

export default goateslint({ ignores: ['dist', '.yarn', 'coverage'], tsconfigRootDir: import.meta.dirname });
