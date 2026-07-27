// lib/runtime-dom/index.ts
import { nodeOps } from './nodeOps';
import { patchProp } from './patchProps';

const renderOptions = Object.assign({ patchProp }, nodeOps);
export { renderOptions };
