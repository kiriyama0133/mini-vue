import { ComponentInstance } from './vnode';
export type Emit = (event: string, ...args: unknown[]) => void;
export type Expose = (exposed?: Record<string, unknown>) => void;
export declare function emit(instance: ComponentInstance, event: string, ...args: any[]): void;
