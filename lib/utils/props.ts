// lib/utils/props.ts
import type { VNodeProps, ComponentInstance } from '../runtime-core/vnode';
import { patchObject } from '../runtime-dom/object';

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

export const updateProps = (
  instance: ComponentInstance,
  prev: VNodeProps,
  next: VNodeProps
): void => {
  if (!hasPropsChange(prev, next)) {
    return;
  }
  const nextProps: Record<string, any> = {};
  const nextAttrs: Record<string, any> = {};
  const propsOptions = instance.type.props;
  for (const key in next) {
    const isDeclaredProp = hasDeclaredProp(propsOptions, key);

    if (isDeclaredProp) {
      nextProps[key] = next[key];
    } else {
      nextAttrs[key] = next[key];
    }
  }
  patchObject(instance.props, nextProps);
  patchObject(instance.attrs, nextAttrs);
};

export const initProps = (instance: ComponentInstance, rawProps: VNodeProps | null): void => {
  const props: Record<string, any> = {};
  const attrs: Record<string, any> = {};
  const propsOptions = instance.type.props;

  for (const key in rawProps) {
    const isDeclaredProp = hasDeclaredProp(propsOptions, key);

    if (isDeclaredProp) {
      props[key] = rawProps![key];
    } else {
      attrs[key] = rawProps![key];
    }
  }

  instance.props = props;
  instance.attrs = attrs;
};

const hasDeclaredProp = (
  propsOptions: ComponentInstance['type']['props'],
  key: string
): boolean => {
  if (!propsOptions) {
    return false;
  }

  return Array.isArray(propsOptions) ? propsOptions.includes(key) : key in propsOptions;
};
