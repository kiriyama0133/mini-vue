// lib/utils/props.ts
import type { VNodeProps, ComponentInstance } from '../runtime-core/vnode';

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
