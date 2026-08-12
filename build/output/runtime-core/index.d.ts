import { renderOptions } from '../runtime-dom';
import { VNode, Container } from './vnode';
export { h } from './h';
export declare const Text: unique symbol;
export declare const Fragment: unique symbol;
export { Teleport } from '../runtime-core/teleport';
export {
  onBeforeUnmount,
  onUnmounted,
  onMounted,
  onBeforeMount,
  onUpdated,
  onBeforeUpdate,
} from './apiLifecyle';
export declare function createRenderer(RenderOptions: typeof renderOptions): {
  render: (vnode: VNode | null, container: Container) => void;
};
export declare const render: (vnode: VNode | null, container: Container) => void;
