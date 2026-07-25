import { defineConfig } from 'vite';
import path from 'node:path';
import copyFilesFromDirPlugin from './scripts/copy.js';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'vue-mini',
      formats: ['es', 'cjs'],
      fileName: (format) => `vue-mini.${format}.js`,
    },
    outDir: 'build/output',
  },
  plugins: [
    copyFilesFromDirPlugin(
      [
        { src: 'CHANGELOG.md', dest: 'CHANGELOG.md' },
        { src: 'README.md', dest: 'README.md' },
        { src: 'LICENSE', dest: 'LICENSE' },
      ],
      'build/output'
    ),
    dts({
      include: ['lib/**/*.ts', 'lib/**/*.d.ts'],
      outDir: 'build/output',
      rollupTypes: true,
      insertTypesEntry: true,
      copyDtsFiles: true,
      logDiagnostics: true,
    }),
  ],
});
