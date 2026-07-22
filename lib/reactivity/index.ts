// dependences collect
import { isPlainObject } from "../utils/_object"

export function reactivity(target: Object){
    return createReactiveObject(target)
}
const mutableHandlers: ProxyHandler<any> = {
    get(target, key, recevier){
        
    },
    set(target, key, value, recevier){
        return true
    }
}
function createReactiveObject(target: Object) {
    if (!isPlainObject(reactivity)) return;
    let proxy = new Proxy(target, mutableHandlers)
}