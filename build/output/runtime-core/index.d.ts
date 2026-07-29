import { renderOptions } from '../runtime-dom';
import { VNode, Container } from './vnode';
export declare function createRenderer(RenderOptions: typeof renderOptions): {
  render: (vnode: VNode, container: Container) => void;
};
