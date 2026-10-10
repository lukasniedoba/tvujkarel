import { build } from 'esbuild';
await build({
  entryPoints: ['server/aws-entry.ts'],
  outfile: 'build/lambda/index.mjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  packages: 'bundle',
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
});
