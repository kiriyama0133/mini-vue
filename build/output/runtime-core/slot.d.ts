import { ComponentInstance, VNode, VNodeChildren } from './vnode';
export type SlotProps = Record<string, any>;
export type SlotValue = VNode | VNode[];
export type Slot = (props?: SlotProps) => SlotValue;
export type Slots = Record<string, Slot | undefined>;
export declare function initSlots(instance: ComponentInstance, children: VNodeChildren): void;
export declare function isSlots(children: unknown): children is Slots;
