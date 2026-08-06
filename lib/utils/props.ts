// lib/utils/props.ts
import type { VNodeProps, ComponentInstance } from '../runtime-core/vnode';

export type SetupProps = Readonly<Record<string, any>>;
export interface SetupContext {
  attrs: Record<string, any>; // 没有被声明为 props 的属性
  slots: Record<string, Function>; // 父组件传入的插槽
  emit: (event: string, ...args: any[]) => void; // 触发组件事件
  expose: (exposed?: Record<string, any>) => void; // 决定父组件通过 ref 能访问哪些内容
}
export const hasPropsChange = (prev: VNodeProps, next: VNodeProps) => {
  let nkeys = Object.keys(next);
  if (Object.keys(next).length !== Object.keys(prev).length) {
    return true;
  }
  for (let i = 0; i < nkeys.length; i++) {
    const key = nkeys[i];
    if (next[key] !== prev[key]) {
      return true;
    }
  }
  return false;
};

export const updateProps = (instance: ComponentInstance, prev: VNodeProps, next: VNodeProps) => {
  if (hasPropsChange(prev, next)) {
    for (let key in instance.props) {
      instance.props[key] = next[key];
    }
    for (let key in instance.props) {
      if (!(key in next)) {
        delete instance.props[key];
      }
    }
  }
};

export const initProps = (instance: ComponentInstance, rawProps: any) => {
  const props: Record<string, any> = {};
  const attrs: Record<string, any> = {};
  const propsOptions = instance.type.props || [];
  for (const key in rawProps) {
    if (Array.isArray(propsOptions) && propsOptions.includes(key)) {
      props[key] = rawProps[key];
    } else {
      attrs[key] = rawProps[key];
    }
  }
  instance.props = props;
  instance.attrs = attrs;
};
