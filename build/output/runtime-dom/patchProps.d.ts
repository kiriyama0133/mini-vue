import { MiniElement } from './nodeOps';
export type Props = Record<string, any>;
export declare function patchProps(el: MiniElement, oldProps: Props, newProps: Props): void;
export declare function patchProp(el: MiniElement, key: string, oldValue: any, newValue: any): void;
