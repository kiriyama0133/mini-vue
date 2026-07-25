export declare function effect(fn: () => void, options?: object): ReactiveEffect<void>;
export declare let activeEffect: ReactiveEffect | undefined;
export type Dep = Set<ReactiveEffect>;
export declare function cleanupEffect(effect: ReactiveEffect): void;
export declare class ReactiveEffect<T = any> {
  fn: () => T;
  scheduler?: (() => void) | undefined;
  executeCount: number;
  active: boolean;
  deps: Dep[];
  running: number;
  constructor(fn: () => T, scheduler?: (() => void) | undefined);
  run(): T;
  stop(): void;
}
