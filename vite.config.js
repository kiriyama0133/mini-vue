/// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'lib/index.ts'),
            name: 'vue-mini',
            formats: ['es', 'cjs'],
            fileName: (format) => `vue-mini.${format}.js`
        },
        outDir: 'build/output'
    }
})