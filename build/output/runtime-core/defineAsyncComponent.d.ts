import { Component } from './component';
export type AsyncComponent = () => Promise<Component>;
export declare function defineAsyncComponent(loader: AsyncComponent): Component;
