//#region lib/utils/object.ts
function e(e) {
  return typeof e == 'object' && !!e;
}
function t(e) {
  return typeof e == 'string';
}
function n(e) {
  return typeof e == 'function';
}
function r(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
//#endregion
//#region lib/effect/index.ts
function i(e, t) {
  let n = new s(e, () => {
    n.run();
  });
  return (n.run(), n.run.bind(n));
}
var a = void 0;
function o(e) {
  let t = e.deps;
  (t.forEach((t) => t.delete(e)), (t.length = 0));
}
var s = class {
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
      o(this);
      let e = a;
      try {
        return (this.running++, (a = this), this.fn());
      } finally {
        (this.running--, (a = e));
      }
    }
    stop() {
      this.active &&= (o(this), !1);
    }
  },
  c = /* @__PURE__ */ new WeakMap(),
  l = /* @__PURE__ */ new WeakMap(),
  u = {
    get(t, n, r) {
      if (n === d.IS_REACTIVE) return !0;
      if (n === d.IS_READONLY) return !1;
      if (n === d.RAW) return t;
      p(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = h(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !0;
      let i = Reflect.set(e, t, n, r);
      return (i && g(e, t), i);
    },
  },
  d = /* @__PURE__ */ (function (e) {
    return (
      (e.IS_REACTIVE = '__v_isReactive'),
      (e.IS_READONLY = '__v_isReadonly'),
      (e.RAW = '__v_raw'),
      e
    );
  })({});
function ee(e) {
  return !!(e && e[d.IS_REACTIVE]);
}
function f(e) {
  return h(e);
}
function p(e, t) {
  if (!a) return;
  let n = l.get(e);
  n || l.set(e, (n = /* @__PURE__ */ new Map()));
  let r = n.get(t);
  (r || n.set(t, (r = /* @__PURE__ */ new Set())), m(r));
}
function m(e) {
  e.has(a) || (e.add(a), a.deps.push(e));
}
function h(t) {
  if (!e(t)) return t;
  if (c.has(t)) return c.get(t);
  let n = new Proxy(t, u);
  return (c.set(t, n), n);
}
function g(e, t) {
  let n = l.get(e);
  if (!n) return;
  let r = n.get(t);
  if ((console.log('[trigger]', t, r), !r)) return;
  let i = new Set(r);
  (console.log('[execute]', i), _(r));
}
function _(e) {
  new Set(e).forEach((e) => {
    e !== a && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function v(t) {
  return e(t) ? h(t) : t;
}
//#endregion
//#region lib/ref/index.ts
function y(e) {
  return b(e);
}
function b(e) {
  return new x(e);
}
var x = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = v(e)));
  }
  get value() {
    return (S(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = v(e)), C(this));
  }
};
function S(e) {
  a && ((e.dep ||= /* @__PURE__ */ new Set()), m(e.dep));
}
function C(e) {
  e.dep && _(e.dep);
}
function w(e) {
  return !!(e && e.__v_isRef);
}
var T = class {
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
function E(e, t) {
  return new T(e, t);
}
function D(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new T(e, r);
  }
  return t;
}
function O(e) {
  return new Proxy(e, {
    get(e, t, n) {
      let r = Reflect.get(e, t, n);
      return w(r) ? r.value : r;
    },
    set(e, t, n, r) {
      let i = Reflect.get(e, t, r);
      return w(i) && !w(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
    },
  });
}
//#endregion
//#region lib/effect/computed.ts
var k = /* @__PURE__ */ (function (e) {
  return ((e[(e.Dirty = 4)] = 'Dirty'), (e[(e.NoDirty = 0)] = 'NoDirty'), e);
})({});
function A(e) {
  return typeof e == 'function' ? new j(e, void 0) : new j(e.get, e.set);
}
var j = class {
  getter;
  setter;
  __v_isRef = !0;
  dep;
  dirtyLevel = k.Dirty;
  _value;
  effect;
  constructor(e, t) {
    ((this.getter = e),
      (this.setter = t),
      (this.effect = new s(this.getter, () => {
        ((this.dirtyLevel = k.Dirty), N(this));
      })));
  }
  set dirty(e) {
    this.dirtyLevel = e ? k.Dirty : k.NoDirty;
  }
  get dirty() {
    return this.dirtyLevel === k.Dirty;
  }
  get value() {
    return (
      M(this),
      this.dirtyLevel === k.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = k.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn('computed ref is readonly');
  }
};
function M(e) {
  a && ((e.dep ||= /* @__PURE__ */ new Set()), m(e.dep));
}
function N(e) {
  e.dep && _(e.dep);
}
//#endregion
//#region lib/effect/watch.ts
function te(e, t, n) {
  ne(e, t, n);
}
function ne(e, t, n) {
  let r = (e) => P(e, n?.deep ? 1 : void 0),
    i;
  i = w(e) ? () => e.value : ee(e) ? () => r(e) : () => e;
  let a,
    o = () => {
      let e = c.run();
      (t(e, a), (a = e));
    };
  n?.immediate && o();
  let c = new s(i, o);
  a = c.run();
}
function P(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
  if (typeof e != 'object' || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) P(e[i], t, n + 1, r);
  return e;
}
//#endregion
//#region lib/runtime-dom/nodeOps.ts
var re = {
  createElement: ie,
  createText: ae,
  insert: oe,
  remove: se,
  setElementText: ce,
  setText: F,
  parentNode: I,
  nextSibling: L,
};
function ie(e) {
  return document.createElement(e);
}
function ae(e) {
  return document.createTextNode(e);
}
function oe(e, t, n) {
  t.insertBefore(e, n || null);
}
function se(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function ce(e, t) {
  e.textContent = t;
}
function F(e, t) {
  e.nodeValue = t;
}
function I(e) {
  return e.parentNode;
}
function L(e) {
  return e.nextSibling;
}
//#endregion
//#region lib/runtime-dom/event.ts
function R(e, t, n) {
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
      a = (r[t] = z(n));
    e.addEventListener(i, a);
  }
}
function z(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
//#endregion
//#region lib/runtime-dom/style.ts
function B(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = '';
}
//#endregion
//#region lib/runtime-dom/class.ts
function V(e, t) {
  e.className = t || '';
}
//#endregion
//#region lib/runtime-dom/attr.ts
function H(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
//#endregion
//#region lib/runtime-dom/patchProps.ts
function U(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && W(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      W(e, r, n, null);
    }
}
function W(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    R(e, t, r);
    return;
  }
  switch (t) {
    case 'class':
      V(e, r);
      break;
    case 'style':
      B(e, n, r);
      break;
    default:
      H(e, t, r);
  }
}
//#endregion
//#region lib/runtime-dom/index.ts
var G = Object.assign({ patchProp: W }, re);
//#endregion
//#region lib/runtime-core/vnode.ts
function le(e) {
  return e.__v_isVnode;
}
function K(e, t) {
  return e.type === t.type && e.key === t.key;
}
function ue(e) {
  return e.nodeType === Node.TEXT_NODE;
}
//#endregion
//#region lib/shared/shapeFlags.ts
var q = /* @__PURE__ */ (function (e) {
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
  })({}),
  J = [],
  Y = !1,
  de = Promise.resolve();
function fe() {
  Y = !1;
  let e = J.slice();
  J.length = 0;
  for (let t of e) t();
}
function pe(e) {
  (J.includes(e) || J.push(e), Y || ((Y = !0), de.then(fe)));
}
//#endregion
//#region lib/utils/props.ts
var me = (e, t) => {
    let n = Object.keys(t);
    if (Object.keys(t).length !== Object.keys(e).length) return !0;
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      if (t[i] !== e[i]) return !0;
    }
    return !1;
  },
  he = (e, t, n) => {
    if (me(t, n)) {
      for (let t in e.props) e.props[t] = n[t];
      for (let t in e.props) t in n || delete e.props[t];
    }
  },
  ge = (e, t) => {
    let n = {},
      r = {},
      i = e.type.props || [];
    for (let e in t) Array.isArray(i) && i.includes(e) ? (n[e] = t[e]) : (r[e] = t[e]);
    ((e.props = n), (e.attrs = r));
  };
//#endregion
//#region lib/runtime-core/slot.ts
function X(e, t) {
  e.vnode.shapeFlag & q.SLOTS_CHILDREN && _e(t) ? (e.slots = t) : (e.slots = {});
}
function _e(e) {
  return typeof e != 'object' || !e || Array.isArray(e) || le(e)
    ? !1
    : Object.values(e).every((e) => typeof e == 'function' || e === void 0);
}
//#endregion
//#region lib/runtime-core/h.ts
function ve({ type: e, props: t, children: n }) {
  return ye(e, t, n);
}
function ye(n, r, i) {
  let a = t(n) ? q.ELEMENT : e(n) ? q.STATEFUL_COMPONENT : 0,
    o = {
      __v_isVnode: !0,
      type: n,
      props: r || null,
      children: i || null,
      key: r?.key,
      el: null,
      shapeFlag: a,
    };
  return (be(o), o);
}
function be(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= q.ARRAY_CHILDREN)
      : typeof n == 'string' || typeof n == 'number'
        ? ((t.children = String(n)), (t.shapeFlag |= q.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= q.SLOTS_CHILDREN));
}
//#endregion
//#region lib/runtime-core/index.ts
var Z = Symbol('Text'),
  Q = Symbol('Fragnment');
function $(t) {
  let {
      createElement: i,
      createText: a,
      insert: o,
      remove: c,
      setElementText: l,
      setText: u,
      parentNode: d,
      nextSibling: ee,
      patchProp: p,
    } = t,
    m = (e, t, n) => {
      console.log('TODO: diff', e, t);
      let r = 0,
        i = e.length - 1,
        a = t.length - 1;
      for (; r <= i && r <= a;) {
        let i = e[r],
          a = t[r];
        if (K(i, a)) A(i, a, n);
        else break;
        r++;
      }
      for (console.log('[diff]: ', r, i, a); r <= i && r <= a;) {
        let r = e[i],
          o = t[a];
        if (K(r, o)) A(r, o, n);
        else break;
        (i--, a--);
      }
      if ((console.log('[diff]: ', r, i, a), r > i)) {
        if (r <= a) {
          let e = t[a + 1]?.el ?? null;
          for (; r <= a;) (A(null, t[r], n, e), r++);
        }
      } else if (r > a) for (; r <= i;) (j(e[r]), r++);
      else {
        let s = r,
          c = r,
          l = /* @__PURE__ */ new Map();
        for (let e = c; e <= a; e++) {
          let n = t[e];
          l.set(n.key, e);
        }
        for (let r = s; r <= i; r++) {
          let i = e[r],
            a = l.get(i.key);
          a == null ? j(i) : A(i, t[a], n);
        }
        let u = a - c + 1;
        for (let e = u - 1; e >= 0; e--) {
          let r = c + e,
            i = r + 1 < t.length ? t[r + 1].el : null,
            a = t[r];
          a.el ? o(a.el, n, i) : A(null, a, n, i);
        }
      }
    },
    h = (e, t) => {
      console.log('[mountChildren]: ', e, t, 'mount');
      for (let n of e) A(null, n, t);
    },
    g = (e, t, n) => {
      let { type: r, props: a, children: s, shapeFlag: c } = e,
        u = (e.el = i(r));
      if (a) for (let e in a) p(u, e, null, a[e]);
      (c & q.TEXT_CHILDREN ? l(u, s) : c & q.ARRAY_CHILDREN && h(s, u), o(u, t, n));
    },
    _ = (e) => {
      e.forEach((e) => {
        j(e);
      });
    },
    v = (e, t, n, r) => {
      (console.log('[processElement]:', e, t, n, 'patch'), e === null ? g(t, n, r) : y(e, t));
    },
    y = (e, t) => {
      let n = (t.el = e.el);
      n && (U(n, e.props || {}, t.props || {}), b(e, t, n));
    },
    b = (e, t, n) => {
      console.log('[patchChildren]: ', e, t, 'patchChildren');
      let r = e.children,
        i = t.children,
        a = e.shapeFlag,
        o = t.shapeFlag;
      o & q.TEXT_CHILDREN
        ? (a & q.ARRAY_CHILDREN && _(r), r !== i && l(n, i))
        : o & q.ARRAY_CHILDREN
          ? a & q.TEXT_CHILDREN
            ? (l(n, ''), h(i, n))
            : a & q.ARRAY_CHILDREN && m(r, i, n)
          : a & q.TEXT_CHILDREN
            ? l(n, '')
            : a & q.ARRAY_CHILDREN && _(r);
    },
    x = (e, t, n) => {
      if (e === null) {
        let e = (t.el = a(t.children));
        o(e, n);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && ue(n) && u(n, t.children);
      }
    },
    S = (e) => ({
      vnode: e,
      data: {},
      attrs: {},
      proxy: null,
      update: null,
      props: e.props || {},
      type: e.type,
      setupState: {},
      render: null,
      slots: {},
      subTree: null,
      isMounted: !1,
    }),
    C = (t) => {
      (ge(t, t.vnode.props), X(t, t.vnode.children));
      let i = t.type;
      if (((t.render = i.render ?? null), i.data && (t.data = f(i.data())), i.setup)) {
        let r = {
            attrs: t.attrs,
            slots: t.slots,
          },
          a = i.setup(t.props, r);
        n(a) ? (t.render = a) : e(a) && (t.setupState = O(a));
      }
      t.proxy = new Proxy(t, {
        get(e, t) {
          let { setupState: n, data: i, props: a, attrs: o, slots: s } = e;
          if (typeof t != 'symbol') {
            if (r(n, t)) return n[t];
            if (r(i, t)) return i[t];
            if (r(a, t)) return a[t];
            if (t === '$attrs') return o;
            if (t === '$slots') return s;
          }
        },
        set(e, t, n) {
          let { setupState: i, data: a, props: o, attrs: s } = e;
          return typeof t == 'symbol'
            ? !0
            : r(i, t) && i
              ? ((i[t] = n), !0)
              : r(a, t) && a
                ? ((a[t] = n), !0)
                : (r(o, t) && o && console.warn('props is readonly'), !0);
        },
      });
    },
    w = (e, t, n = null) => {
      console.log('[mountComponent]: ', e);
      let r = S(e);
      ((e.component = r), C(r), T(r, e, t, n));
    },
    T = (e, t, n, r = null) => {
      let i = () => {
          if (e.isMounted) {
            let t = e.subTree,
              i = e.render?.call(e.proxy, e.proxy);
            ((e.subTree = i), A(t, i, n, r));
          } else {
            let i = e.render?.call(e.proxy, e.proxy);
            ((e.subTree = i),
              A(null, i, n, r),
              (t.el = i.el),
              (e.isMounted = !0),
              e.type.mounted?.call(e.proxy, e.proxy));
          }
        },
        a,
        o = new s(i, () => {
          pe(a);
        });
      ((a = e.update = () => o.run()), a());
    },
    E = (e, t) => {
      let n = (t.component = e.component);
      if (!n) throw Error('Component instance is missing');
      let r = e.props ?? {},
        i = t.props ?? {};
      ((n.vnode = t), (t.el = e.el), he(n, r, i), n.update?.());
    },
    D = (e, t, n, r = null) => {
      (console.log('[processComponent]'), e === null ? w(t, n, r) : E(e, t));
    },
    k = (e, t, n) => {
      e === null ? t.children && h(t.children, n) : b(e, t, n);
    },
    A = (e, t, n, r = null) => {
      if (e === t) return;
      e !== null && (K(e, t) || (console.log('[patch<VNode>]', e, t, 'unmount'), j(e), (e = null)));
      let { type: i, shapeFlag: a } = t;
      switch (i) {
        case Z:
          x(e, t, n);
          break;
        case Q:
          k(e, t, n);
          break;
        default:
          a & q.ELEMENT
            ? v(e, t, n, r)
            : a & q.COMPONENT && (console.log('[patch]: component'), D(e, t, n, r));
          break;
      }
    },
    j = (e) => {
      if (e.type === Q) {
        e.children && _(e.children);
        return;
      }
      e.el &&= (c(e.el), null);
    };
  return {
    render: (e, t) => {
      (e === null && t._vnode && j(t._vnode), A(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
var { render: xe } = $(G);
//#endregion
export {
  Q as Fragment,
  Z as Text,
  A as computed,
  $ as createRenderer,
  i as effect,
  ve as h,
  w as isRef,
  O as proxyRefs,
  f as reactive,
  y as ref,
  xe as render,
  G as renderOptions,
  E as toRef,
  D as toRefs,
  te as watch,
};
