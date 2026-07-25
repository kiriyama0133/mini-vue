export function effect(fn: () => void, options?: object) {
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  });
  _effect.run();
  return _effect;
}
export let activeEffect: ReactiveEffect | undefined = undefined;
export type Dep = Set<ReactiveEffect>;
export function cleanupEffect(effect: ReactiveEffect) {
  const deps = effect.deps;
  deps.forEach((dep) => dep.delete(effect));
  deps.length = 0;
}
export class ReactiveEffect {
  public executeCount = 0;
  public active = true;
  public deps: Dep[] = []; // deps from this ReactiveEffect used
  public running = 0;
  constructor(
    public fn: () => void,
    public scheduler?: () => void
  ) {}
  run() {
    this.executeCount++;
    if (!this.active) return this.fn();
    cleanupEffect(this);
    let lastActiveEffect = activeEffect;
    try {
      this.running++;
      activeEffect = this;
      return this.fn();
    } finally {
      this.running--;
      activeEffect = lastActiveEffect;
    }
  }
  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}
