import { VNodeProps, ComponentInstance } from '../runtime-core/vnode';
export declare const hasPropsChange: (prev: VNodeProps, next: VNodeProps) => boolean;
export declare const updateProps: (
  instance: ComponentInstance,
  prev: VNodeProps,
  next: VNodeProps
) => void;
