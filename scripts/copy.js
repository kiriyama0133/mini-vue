import fs from 'node:fs';
import path from 'node:path';

export default function copyFilesFromDirPlugin(files, destDir) {
  return {
    name: 'vite-plugin-copy-custom',
    closeBundle() {
      // execute after build
      files.forEach((file) => {
        const src = typeof file === 'string' ? file : file.src;
        const dest = typeof file === 'string' ? file : file.dest;

        const targetPath = path.resolve(destDir, dest);

        if (fs.existsSync(src)) {
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });

          fs.copyFileSync(src, targetPath);
          console.log(`[copy-plugin] Copied: ${src} -> ${targetPath}`);
        } else {
          console.warn(`[copy-plugin] File ${src} does not exist, skipped.`);
        }
      });
    },
  };
}
