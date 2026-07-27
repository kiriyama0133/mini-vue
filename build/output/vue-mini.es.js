//#region lib/utils/object.ts
function e(e) {
  return typeof e == 'object' && !!e;
}
//#endregion
//#region lib/effect/index.ts
function t(e, t) {
  let n = new i(e, () => {
    n.run();
  });
  return (n.run(), n.run.bind(n));
}
var n = void 0;
function r(e) {
  let t = e.deps;
  (t.forEach((t) => t.delete(e)), (t.length = 0));
}
var i = class {
    fn;
    scheduler;
    executeCount = 0;
    active = !0;
    deps = [];
    running = 0;
    constructor(e, t) {
      ((this.fn = e), (this.scheduler = t));
    }
    run() {
      if ((this.executeCount++, !this.active)) return this.fn();
      r(this);
      let e = n;
      try {
        return (this.running++, (n = this), this.fn());
      } finally {
        (this.running--, (n = e));
      }
    }
    stop() {
      this.active &&= (r(this), !1);
    }
  },
  a = /* @__PURE__ */ new WeakMap(),
  o = /* @__PURE__ */ new WeakMap(),
  s = {
    get(t, n, r) {
      if (n === c.IS_REACTIVE) return !0;
      if (n === c.IS_READONLY) return !1;
      if (n === c.RAW) return t;
      d(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = p(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !1;
      let i = Reflect.set(e, t, n, r);
      return (i && m(e, t), i);
    },
  },
  c = /* @__PURE__ */ (function (e) {
    return (
      (e.IS_REACTIVE = '__v_isReactive'),
      (e.IS_READONLY = '__v_isReadonly'),
      (e.RAW = '__v_raw'),
      e
    );
  })({});
function l(e) {
  return !!(e && e[c.IS_REACTIVE]);
}
function u(e) {
  return p(e);
}
function d(e, t) {
  if (!n) return;
  let r = o.get(e);
  r || o.set(e, (r = /* @__PURE__ */ new Map()));
  let i = r.get(t);
  (i || r.set(t, (i = /* @__PURE__ */ new Set())), f(i));
}
function f(e) {
  e.has(n) || (e.add(n), n.deps.push(e));
}
function p(t) {
  if (!e(t)) return t;
  if (a.has(t)) return a.get(t);
  let n = new Proxy(t, s);
  return (a.set(t, n), n);
}
function m(e, t) {
  let n = o.get(e);
  if (!n) return;
  let r = n.get(t);
  if ((console.log('[trigger]', t, r), !r)) return;
  let i = new Set(r);
  (console.log('[execute]', i), h(r));
}
function h(e) {
  new Set(e).forEach((e) => {
    e !== n && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function g(t) {
  return e(t) ? p(t) : t;
}
//#endregion
//#region lib/ref/index.ts
function _(e) {
  return v(e);
}
function v(e) {
  return new y(e);
}
var y = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = g(e)));
  }
  get value() {
    return (b(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = g(e)), x(this));
  }
};
function b(e) {
  n && ((e.dep ||= /* @__PURE__ */ new Set()), f(e.dep));
}
function x(e) {
  e.dep && h(e.dep);
}
function S(e) {
  return !!(e && e.__v_isRef);
}
var C = class {
  _object;
  _key;
  constructor(e, t) {
    ((this._object = e), (this._key = t));
  }
  __v_isRef = !0;
  get value() {
    return this._object[this._key];
  }
  set value(e) {
    this._object[this._key] = e;
  }
};
function w(e, t) {
  return new C(e, t);
}
function T(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new C(e, r);
  }
  return t;
}
function E(e) {
  return new Proxy(e, {
    get(e, t, n) {
      let r = Reflect.get(e, t, n);
      return S(r) ? r.value : r;
    },
    set(e, t, n, r) {
      let i = Reflect.get(e, t, r);
      return S(i) && !S(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
    },
  });
}
//#endregion
//#region lib/effect/computed.ts
var D = /* @__PURE__ */ (function (e) {
  return ((e[(e.Dirty = 4)] = 'Dirty'), (e[(e.NoDirty = 0)] = 'NoDirty'), e);
})({});
function O(e) {
  return typeof e == 'function' ? new k(e, void 0) : new k(e.get, e.set);
}
var k = class {
  getter;
  setter;
  __v_isRef = !0;
  dep;
  dirtyLevel = D.Dirty;
  _value;
  effect;
  constructor(e, t) {
    ((this.getter = e),
      (this.setter = t),
      (this.effect = new i(this.getter, () => {
        ((this.dirtyLevel = D.Dirty), j(this));
      })));
  }
  set dirty(e) {
    this.dirtyLevel = e ? D.Dirty : D.NoDirty;
  }
  get dirty() {
    return this.dirtyLevel === D.Dirty;
  }
  get value() {
    return (
      A(this),
      this.dirtyLevel === D.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = D.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn('computed ref is readonly');
  }
};
function A(e) {
  n && ((e.dep ||= /* @__PURE__ */ new Set()), f(e.dep));
}
function j(e) {
  e.dep && h(e.dep);
}
//#endregion
//#region lib/effect/watch.ts
function M(e, t, n) {
  N(e, t, n);
}
function N(e, t, n) {
  let r = (e) => P(e, n?.deep ? 1 : void 0),
    a;
  a = S(e) ? () => e.value : l(e) ? () => r(e) : () => e;
  let o,
    s = () => {
      let e = c.run();
      (t(e, o), (o = e));
    };
  n?.immediate && s();
  let c = new i(a, s);
  o = c.run();
}
function P(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
  if (typeof e != 'object' || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) P(e[i], t, n + 1, r);
  return e;
}
//#endregion
//#region lib/runtime-dom/nodeOps.ts
var F = {
  createElement: I,
  createText: L,
  intsert: R,
  remove: z,
  setElementText: B,
  setText: V,
  parentNode: H,
  nextSibling: U,
};
function I(e) {
  return document.createElement(e);
}
function L(e) {
  return document.createTextNode(e);
}
function R(e, t, n) {
  t.insertBefore(e, n || null);
}
function z(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function B(e, t) {
  e.textContent = t;
}
function V(e, t) {
  e.nodeValue = t;
}
function H(e) {
  return e.parentNode;
}
function U(e) {
  return e.nextSibling;
}
//#endregion
//#region lib/runtime-dom/event.ts
function W(e, t, n) {
  let r = (e._vei ||= {}),
    i = r[t];
  if (i)
    if (n) i.value = n;
    else {
      let n = t.slice(2).toLowerCase();
      (e.removeEventListener(n, i), delete r[t]);
    }
  if (n) {
    let i = t.slice(2).toLowerCase(),
      a = (r[t] = G(n));
    e.addEventListener(i, a);
  }
}
function G(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
//#endregion
//#region lib/runtime-dom/style.ts
function K(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = '';
}
//#endregion
//#region lib/runtime-dom/class.ts
function q(e, t) {
  e.className = t || '';
}
//#endregion
//#region lib/runtime-dom/attr.ts
function J(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
//#endregion
//#region lib/runtime-dom/patchProps.ts
function Y(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    W(e, t, r);
    return;
  }
  switch (t) {
    case 'class':
      q(e, r);
      break;
    case 'style':
      K(e, n, r);
      break;
    default:
      J(e, t, r);
  }
}
//#endregion
//#region lib/runtime-dom/index.ts
var X = Object.assign({ patchProp: Y }, F);
//#endregion
export {
  O as computed,
  t as effect,
  S as isRef,
  E as proxyRefs,
  u as reactive,
  _ as ref,
  X as renderOptions,
  w as toRef,
  T as toRefs,
  M as watch,
};
