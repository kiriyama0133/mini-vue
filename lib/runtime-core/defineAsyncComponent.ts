// lib/runtime-core/defineAsyncComponent.ts

import { ref } from '../ref';
import type { Component } from './component';
import { h } from './h';
import { SetupContext, SetupProps } from './vnode';

export type AsyncComponent = () => Promise<Component>;
export function defineAsyncComponent(loader: AsyncComponent): Component {
  return {
    expose: () => {},
    setup(props: SetupProps, { attrs, slots }: SetupContext) {
      const loaded = ref(false);
      let resolvedComponent: Component | null = null;
      loader()
        .then((component) => {
          resolvedComponent = component;
          loaded.value = true;
        })
        .catch((err) => {});
      return () => {
        if (!loaded.value || !resolvedComponent) {
          return h({
            type: 'div',
            children: 'loading...',
          });
        }
        return h({
          type: resolvedComponent,
          props: {
            ...attrs,
            ...props,
          },
          children: slots,
        });
      };
    },
  };
}
