import { renderOptions } from '../runtime-dom';
import { VNode, Container } from './vnode';
export { h } from './h';
export declare function createRenderer(RenderOptions: typeof renderOptions): {
  render: (vnode: VNode, container: Container) => void;
};
export declare const render: (vnode: VNode, container: Container) => void;
