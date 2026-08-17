//lib/runtime-core/h.ts

import { ShapeFlags } from '../shared/shapeFlags';
import { isObject, isString, isArray, isFunction } from '../utils/object';
import { isTeleport } from './teleport';
import {
  VNodeChildren,
  VNode,
  VNodeProps,
  isVNode,
  VNodeOptions,
  VNodeArrayChildren,
  Text,
} from './vnode';

export function h({ type, props, children }: VNodeOptions) {
  return createVNode(type, props, children);
}
export function createVNode(type: any, props?: VNodeProps, children?: VNodeChildren) {
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
    const normalized: VNode[] = [];
    normalizeArrayChildren(children, normalized);
    vnode.children = normalized;
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  } else if (isVNode(children)) {
    // 单个VNode
    vnode.children = [children];
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    return;
  } else if (typeof children === 'string' || typeof children === 'number') {
    vnode.children = String(children);
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (isObject(children) && vnode.shapeFlag & ShapeFlags.COMPONENT) {
    vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
  }
}

function normalizeArrayChildren(children: VNodeArrayChildren, normalized: VNode[]): void {
  for (const child of children) {
    if (Array.isArray(child)) {
      normalizeArrayChildren(child, normalized);
      continue;
    }
    if (child == null || typeof child === 'boolean') {
      continue;
    }
    if (isVNode(child)) {
      normalized.push(child);
      continue;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      normalized.push(createVNode(Text, undefined, String(child)));
    }
  }
}
