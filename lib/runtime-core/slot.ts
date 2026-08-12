//lib/runtime-core

import { ShapeFlags } from '../shared/shapeFlags';
import { ComponentInstance, isVNode, VNode, VNodeChildren } from './vnode';

export type SlotProps = Record<string, any>;
export type SlotValue = VNode | VNode[];
export type Slot = (props?: SlotProps) => SlotValue;
export type Slots = Record<string, Slot | undefined>;
export function initSlots(instance: ComponentInstance, children: VNodeChildren) {
  if (instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN && isSlots(children)) {
    instance.slots = children;
  } else {
    instance.slots = {};
  }
}
export function isSlots(children: unknown): children is Slots {
  if (
    children === null ||
    typeof children !== 'object' ||
    Array.isArray(children) ||
    isVNode(children)
  ) {
    return false;
  }
  return Object.values(children).every((slot) => typeof slot === 'function' || slot === undefined);
}
