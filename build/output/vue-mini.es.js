//#region lib/utils/object.ts
function e(e) {
  return typeof e == 'object' && !!e;
}
function t(e) {
  return typeof e == 'string';
}
//#endregion
//#region lib/effect/index.ts
function n(e, t) {
  let n = new a(e, () => {
    n.run();
  });
  return (n.run(), n.run.bind(n));
}
var r = void 0;
function i(e) {
  let t = e.deps;
  (t.forEach((t) => t.delete(e)), (t.length = 0));
}
var a = class {
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
      i(this);
      let e = r;
      try {
        return (this.running++, (r = this), this.fn());
      } finally {
        (this.running--, (r = e));
      }
    }
    stop() {
      this.active &&= (i(this), !1);
    }
  },
  o = /* @__PURE__ */ new WeakMap(),
  s = /* @__PURE__ */ new WeakMap(),
  c = {
    get(t, n, r) {
      if (n === l.IS_REACTIVE) return !0;
      if (n === l.IS_READONLY) return !1;
      if (n === l.RAW) return t;
      f(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = m(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !1;
      let i = Reflect.set(e, t, n, r);
      return (i && h(e, t), i);
    },
  },
  l = /* @__PURE__ */ (function (e) {
    return (
      (e.IS_REACTIVE = '__v_isReactive'),
      (e.IS_READONLY = '__v_isReadonly'),
      (e.RAW = '__v_raw'),
      e
    );
  })({});
function u(e) {
  return !!(e && e[l.IS_REACTIVE]);
}
function d(e) {
  return m(e);
}
function f(e, t) {
  if (!r) return;
  let n = s.get(e);
  n || s.set(e, (n = /* @__PURE__ */ new Map()));
  let i = n.get(t);
  (i || n.set(t, (i = /* @__PURE__ */ new Set())), p(i));
}
function p(e) {
  e.has(r) || (e.add(r), r.deps.push(e));
}
function m(t) {
  if (!e(t)) return t;
  if (o.has(t)) return o.get(t);
  let n = new Proxy(t, c);
  return (o.set(t, n), n);
}
function h(e, t) {
  let n = s.get(e);
  if (!n) return;
  let r = n.get(t);
  if ((console.log('[trigger]', t, r), !r)) return;
  let i = new Set(r);
  (console.log('[execute]', i), g(r));
}
function g(e) {
  new Set(e).forEach((e) => {
    e !== r && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function _(t) {
  return e(t) ? m(t) : t;
}
//#endregion
//#region lib/ref/index.ts
function v(e) {
  return y(e);
}
function y(e) {
  return new b(e);
}
var b = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = _(e)));
  }
  get value() {
    return (x(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = _(e)), ee(this));
  }
};
function x(e) {
  r && ((e.dep ||= /* @__PURE__ */ new Set()), p(e.dep));
}
function ee(e) {
  e.dep && g(e.dep);
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
function te(e) {
  return typeof e == 'function' ? new O(e, void 0) : new O(e.get, e.set);
}
var O = class {
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
      (this.effect = new a(this.getter, () => {
        ((this.dirtyLevel = D.Dirty), re(this));
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
      ne(this),
      this.dirtyLevel === D.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = D.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn('computed ref is readonly');
  }
};
function ne(e) {
  r && ((e.dep ||= /* @__PURE__ */ new Set()), p(e.dep));
}
function re(e) {
  e.dep && g(e.dep);
}
//#endregion
//#region lib/effect/watch.ts
function ie(e, t, n) {
  k(e, t, n);
}
function k(e, t, n) {
  let r = (e) => A(e, n?.deep ? 1 : void 0),
    i;
  i = S(e) ? () => e.value : u(e) ? () => r(e) : () => e;
  let o,
    s = () => {
      let e = c.run();
      (t(e, o), (o = e));
    };
  n?.immediate && s();
  let c = new a(i, s);
  o = c.run();
}
function A(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
  if (typeof e != 'object' || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) A(e[i], t, n + 1, r);
  return e;
}
//#endregion
//#region lib/runtime-dom/nodeOps.ts
var j = {
  createElement: M,
  createText: N,
  insert: P,
  remove: F,
  setElementText: I,
  setText: L,
  parentNode: R,
  nextSibling: z,
};
function M(e) {
  return document.createElement(e);
}
function N(e) {
  return document.createTextNode(e);
}
function P(e, t, n) {
  t.insertBefore(e, n || null);
}
function F(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function I(e, t) {
  e.textContent = t;
}
function L(e, t) {
  e.nodeValue = t;
}
function R(e) {
  return e.parentNode;
}
function z(e) {
  return e.nextSibling;
}
//#endregion
//#region lib/runtime-dom/event.ts
function B(e, t, n) {
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
      a = (r[t] = V(n));
    e.addEventListener(i, a);
  }
}
function V(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
//#endregion
//#region lib/runtime-dom/style.ts
function H(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = '';
}
//#endregion
//#region lib/runtime-dom/class.ts
function U(e, t) {
  e.className = t || '';
}
//#endregion
//#region lib/runtime-dom/attr.ts
function W(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
//#endregion
//#region lib/runtime-dom/patchProps.ts
function G(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && K(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      K(e, r, n, null);
    }
}
function K(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    B(e, t, r);
    return;
  }
  switch (t) {
    case 'class':
      U(e, r);
      break;
    case 'style':
      H(e, n, r);
      break;
    default:
      W(e, t, r);
  }
}
//#endregion
//#region lib/runtime-dom/index.ts
var q = Object.assign({ patchProp: K }, j);
//#endregion
//#region lib/runtime-core/vnode.ts
function J(e, t) {
  return e.type === t.type && e.key === t.key;
}
function Y(e) {
  return e.nodeType === Node.TEXT_NODE;
}
//#endregion
//#region lib/shared/shapeFlags.ts
var X = /* @__PURE__ */ (function (e) {
  return (
    (e[(e.ELEMENT = 1)] = 'ELEMENT'),
    (e[(e.FUNCTIONAL_COMPONENT = 2)] = 'FUNCTIONAL_COMPONENT'),
    (e[(e.STATEFUL_COMPONENT = 4)] = 'STATEFUL_COMPONENT'),
    (e[(e.TEXT_CHILDREN = 8)] = 'TEXT_CHILDREN'),
    (e[(e.ARRAY_CHILDREN = 16)] = 'ARRAY_CHILDREN'),
    (e[(e.SLOTS_CHILDREN = 32)] = 'SLOTS_CHILDREN'),
    (e[(e.TELEPORT = 64)] = 'TELEPORT'),
    (e[(e.SUSPENSE = 128)] = 'SUSPENSE'),
    (e[(e.COMPONENT_SHOULD_KEEP_ALIVE = 256)] = 'COMPONENT_SHOULD_KEEP_ALIVE'),
    (e[(e.COMPONENT_KEEP_ALIVE = 512)] = 'COMPONENT_KEEP_ALIVE'),
    (e[(e.COMPONENT = 6)] = 'COMPONENT'),
    e
  );
})({});
//#endregion
//#region lib/runtime-core/h.ts
function ae({ type: e, props: t, children: n }) {
  return oe(e, t, n);
}
function oe(e, n, r) {
  let i = t(e) ? X.ELEMENT : 0,
    a = {
      __v_isVnode: !0,
      type: e,
      props: n || null,
      children: r || null,
      key: n?.key,
      el: null,
      shapeFlag: i,
    };
  return (se(a), a);
}
function se(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= X.ARRAY_CHILDREN)
      : typeof n == 'string' || typeof n == 'number'
        ? ((t.children = String(n)), (t.shapeFlag |= X.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= X.SLOTS_CHILDREN));
}
//#endregion
//#region lib/runtime-core/index.ts
var Z = Symbol('Text'),
  Q = Symbol('Fragnment');
function $(e) {
  let {
      createElement: t,
      createText: n,
      insert: r,
      remove: i,
      setElementText: a,
      setText: o,
      parentNode: s,
      nextSibling: c,
      patchProp: l,
    } = e,
    u = (e, t, n) => {
      console.log('TODO: diff', e, t);
      let i = 0,
        a = e.length - 1,
        o = t.length - 1;
      for (; i <= a && i <= o;) {
        let r = e[i],
          a = t[i];
        if (J(r, a)) y(r, a, n);
        else break;
        i++;
      }
      for (console.log('[diff]: ', i, a, o); i <= a && i <= o;) {
        let r = e[a],
          i = t[o];
        if (J(r, i)) y(r, i, n);
        else break;
        (a--, o--);
      }
      if ((console.log('[diff]: ', i, a, o), i > a)) {
        if (i <= o) {
          let e = t[o + 1]?.el ?? null;
          for (; i <= o;) (y(null, t[i], n, e), i++);
        }
      } else if (i > o) for (; i <= a;) (b(e[i]), i++);
      else {
        let s = i,
          c = i,
          l = /* @__PURE__ */ new Map();
        for (let e = c; e <= o; e++) {
          let n = t[e];
          l.set(n.key, e);
        }
        for (let r = s; r <= a; r++) {
          let i = e[r],
            a = l.get(i.key);
          a == null ? b(i) : y(i, t[a], n);
        }
        let u = o - c + 1;
        for (let e = u - 1; e >= 0; e--) {
          let i = c + e,
            a = i + 1 < t.length ? t[i + 1].el : null,
            o = t[i];
          o.el ? r(o.el, n, a) : y(null, o, n, a);
        }
      }
    },
    d = (e, t) => {
      console.log('[mountChildren]: ', e, t, 'mount');
      for (let n of e) y(null, n, t);
    },
    f = (e, n, i) => {
      let { type: o, props: s, children: c, shapeFlag: u } = e,
        f = (e.el = t(o));
      if (s) for (let e in s) l(f, e, null, s[e]);
      (u & X.TEXT_CHILDREN ? a(f, c) : u & X.ARRAY_CHILDREN && d(c, f), r(f, n, i));
    },
    p = (e) => {
      e.forEach((e) => {
        b(e);
      });
    },
    m = (e, t, n, r) => {
      (console.log('[processElement]:', e, t, n, 'patch'), e === null ? f(t, n, r) : h(e, t));
    },
    h = (e, t) => {
      let n = (t.el = e.el);
      n && (G(n, e.props || {}, t.props || {}), g(e, t, n));
    },
    g = (e, t, n) => {
      console.log('[patchChildren]: ', e, t, 'patchChildren');
      let r = e.children,
        i = t.children,
        o = e.shapeFlag,
        s = t.shapeFlag;
      s & X.TEXT_CHILDREN
        ? (o & X.ARRAY_CHILDREN && p(r), r !== i && a(n, i))
        : s & X.ARRAY_CHILDREN
          ? o & X.TEXT_CHILDREN
            ? (a(n, ''), d(i, n))
            : o & X.ARRAY_CHILDREN && u(r, i, n)
          : o & X.TEXT_CHILDREN
            ? a(n, '')
            : o & X.ARRAY_CHILDREN && p(r);
    },
    _ = (e, t, i) => {
      if (e === null) {
        let e = (t.el = n(t.children));
        r(e, i);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && Y(n) && o(n, t.children);
      }
    },
    v = (e, t, n) => {
      e === null ? t.children && d(t.children, n) : g(e, t, n);
    },
    y = (e, t, n, r = null) => {
      if (e === t) return;
      e !== null && (J(e, t) || (console.log('[patch<VNode>]', e, t, 'unmount'), b(e), (e = null)));
      let { type: i, shapeFlag: a } = t;
      switch (i) {
        case Z:
          _(e, t, n);
          break;
        case Q:
          v(e, t, n);
          break;
        default:
          m(e, t, n, r);
          break;
      }
    },
    b = (e) => {
      if (e.type === Q) {
        e.children && p(e.children);
        return;
      }
      e.el &&= (i(e.el), null);
    };
  return {
    render: (e, t) => {
      (e === null && t._vnode && b(t._vnode), y(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
var { render: ce } = $(q);
//#endregion
export {
  Q as Fragment,
  Z as Text,
  te as computed,
  $ as createRenderer,
  n as effect,
  ae as h,
  S as isRef,
  E as proxyRefs,
  d as reactive,
  v as ref,
  ce as render,
  q as renderOptions,
  w as toRef,
  T as toRefs,
  ie as watch,
};
