//lib/runtime-core/h.ts
import { ShapeFlags } from '../shared/shapeFlags';
import { isObject, isString, isArray, isFunction } from '../utils/object';
import { isTeleport } from './teleport';
import { VNodeChildren, VNode, VNodeProps, isVNode, VNodeOptions } from './vnode';

export function h({ type, props, children }: VNodeOptions) {
  return createVNode(type, props, children);
}
function createVNode(type: any, props?: VNodeProps, children?: VNodeChildren) {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isTeleport(type)
      ? ShapeFlags.TELEPORT
      : isObject(type)
        ? ShapeFlags.STATEFUL_COMPONENT
        : isFunction(type)
          ? ShapeFlags.FUNCTIONAL_COMPONENT
          : 0;
  const vnode: VNode = {
    __v_isVnode: true,
    type,
    props: props || null,
    children: children || null,
    key: props?.key as string | number,
    el: null,
    shapeFlag,
  };
  normalizeChildren(vnode);
  return vnode;
}
function normalizeChildren(vnode: VNode) {
  const { children } = vnode;
  if (children == null) {
    return;
  }
  if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  } else if (typeof children === 'string' || typeof children === 'number') {
    vnode.children = String(children);
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (isObject(children)) {
    vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
  }
}
