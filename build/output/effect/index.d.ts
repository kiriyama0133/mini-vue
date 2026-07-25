export declare function effect(fn: () => void, options?: object): ReactiveEffect;
export declare let activeEffect: ReactiveEffect | undefined;
export type Dep = Set<ReactiveEffect>;
export declare function cleanupEffect(effect: ReactiveEffect): void;
export declare class ReactiveEffect {
  fn: () => void;
  scheduler?: (() => void) | undefined;
  executeCount: number;
  active: boolean;
  deps: Dep[];
  running: number;
  constructor(fn: () => void, scheduler?: (() => void) | undefined);
  run(): void;
  stop(): void;
}
