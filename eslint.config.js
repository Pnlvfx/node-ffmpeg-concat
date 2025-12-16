import { defineConfig, globalIgnores } from '@eslint/config-helpers';
import { nodeConfigs } from '@goatjs/node-eslint';

export default defineConfig([globalIgnores(['dist', '.yarn']), ...nodeConfigs({ tsconfigRootDir: import.meta.dirname })]);
