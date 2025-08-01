import { goateslint } from '@goatjs/node-eslint';

export default goateslint({ ignores: ['dist', '.yarn'], tsconfigRootDir: import.meta.dirname });
