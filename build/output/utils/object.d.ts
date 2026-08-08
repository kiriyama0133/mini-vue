export declare function isObject(value: any): boolean;
export declare function isString(value: any): value is string;
export declare function isArray(value: any): value is any[];
export declare function isFunction(value: any): value is Function;
export declare function hasOwn(target: object, key: PropertyKey): boolean;
export declare const camelize: (value: string) => string;
export declare const capitalize: (value: string) => string;
export declare const toHandlerKey: (value: string) => string;
