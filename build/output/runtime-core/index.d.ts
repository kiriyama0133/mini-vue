import { renderOptions } from '../runtime-dom';
import { VNode, Container } from './vnode';
export { h } from './h';
export declare const Text: unique symbol;
export declare const Fragment: unique symbol;
export declare function createRenderer(RenderOptions: typeof renderOptions): {
  render: (vnode: VNode, container: Container) => void;
};
export declare const render: (vnode: VNode, container: Container) => void;
