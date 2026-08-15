// lib/runtime-dom/object.ts

export function patchObject(target: Record<string, any>, source: Record<string, any>) {
  for (const key in source) {
    target[key] = source[key];
  }

  for (const key in target) {
    if (!(key in source)) {
      delete target[key];
    }
  }
}
