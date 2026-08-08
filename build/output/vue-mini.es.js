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
var i = (e) => e.replace(/-(\w)/g, (e, t) => (t ? t.toUpperCase() : '')),
  a = (e) => e.charAt(0).toUpperCase() + e.slice(1),
  o = (e) => (e ? `on${a(e)}` : '');
//#endregion
//#region lib/effect/index.ts
function s(e, t) {
  let n = new u(e, () => {
    n.run();
  });
  return (n.run(), n.run.bind(n));
}
var c = void 0;
function l(e) {
  let t = e.deps;
  (t.forEach((t) => t.delete(e)), (t.length = 0));
}
var u = class {
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
      l(this);
      let e = c;
      try {
        return (this.running++, (c = this), this.fn());
      } finally {
        (this.running--, (c = e));
      }
    }
    stop() {
      this.active &&= (l(this), !1);
    }
  },
  d = /* @__PURE__ */ new WeakMap(),
  f = /* @__PURE__ */ new WeakMap(),
  p = {
    get(t, n, r) {
      if (n === m.IS_REACTIVE) return !0;
      if (n === m.IS_READONLY) return !1;
      if (n === m.RAW) return t;
      _(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = y(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !0;
      let i = Reflect.set(e, t, n, r);
      return (i && b(e, t), i);
    },
  },
  m = /* @__PURE__ */ (function (e) {
    return (
      (e.IS_REACTIVE = '__v_isReactive'),
      (e.IS_READONLY = '__v_isReadonly'),
      (e.RAW = '__v_raw'),
      e
    );
  })({});
function h(e) {
  return !!(e && e[m.IS_REACTIVE]);
}
function g(e) {
  return y(e);
}
function _(e, t) {
  if (!c) return;
  let n = f.get(e);
  n || f.set(e, (n = /* @__PURE__ */ new Map()));
  let r = n.get(t);
  (r || n.set(t, (r = /* @__PURE__ */ new Set())), v(r));
}
function v(e) {
  e.has(c) || (e.add(c), c.deps.push(e));
}
function y(t) {
  if (!e(t)) return t;
  if (d.has(t)) return d.get(t);
  let n = new Proxy(t, p);
  return (d.set(t, n), n);
}
function b(e, t) {
  let n = f.get(e);
  if (!n) return;
  let r = n.get(t);
  if ((console.log('[trigger]', t, r), !r)) return;
  let i = new Set(r);
  (console.log('[execute]', i), x(r));
}
function x(e) {
  new Set(e).forEach((e) => {
    e !== c && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function S(t) {
  return e(t) ? y(t) : t;
}
//#endregion
//#region lib/ref/index.ts
function C(e) {
  return w(e);
}
function w(e) {
  return new T(e);
}
var T = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = S(e)));
  }
  get value() {
    return (E(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = S(e)), D(this));
  }
};
function E(e) {
  c && ((e.dep ||= /* @__PURE__ */ new Set()), v(e.dep));
}
function D(e) {
  e.dep && x(e.dep);
}
function O(e) {
  return !!(e && e.__v_isRef);
}
var k = class {
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
function A(e, t) {
  return new k(e, t);
}
function j(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new k(e, r);
  }
  return t;
}
function M(e) {
  return new Proxy(e, {
    get(e, t, n) {
      let r = Reflect.get(e, t, n);
      return O(r) ? r.value : r;
    },
    set(e, t, n, r) {
      let i = Reflect.get(e, t, r);
      return O(i) && !O(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
    },
  });
}
//#endregion
//#region lib/effect/computed.ts
var N = /* @__PURE__ */ (function (e) {
  return ((e[(e.Dirty = 4)] = 'Dirty'), (e[(e.NoDirty = 0)] = 'NoDirty'), e);
})({});
function ee(e) {
  return typeof e == 'function' ? new P(e, void 0) : new P(e.get, e.set);
}
var P = class {
  getter;
  setter;
  __v_isRef = !0;
  dep;
  dirtyLevel = N.Dirty;
  _value;
  effect;
  constructor(e, t) {
    ((this.getter = e),
      (this.setter = t),
      (this.effect = new u(this.getter, () => {
        ((this.dirtyLevel = N.Dirty), ne(this));
      })));
  }
  set dirty(e) {
    this.dirtyLevel = e ? N.Dirty : N.NoDirty;
  }
  get dirty() {
    return this.dirtyLevel === N.Dirty;
  }
  get value() {
    return (
      te(this),
      this.dirtyLevel === N.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = N.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn('computed ref is readonly');
  }
};
function te(e) {
  c && ((e.dep ||= /* @__PURE__ */ new Set()), v(e.dep));
}
function ne(e) {
  e.dep && x(e.dep);
}
//#endregion
//#region lib/effect/watch.ts
function re(e, t, n) {
  ie(e, t, n);
}
function ie(e, t, n) {
  let r = (e) => F(e, n?.deep ? 1 : void 0),
    i;
  i = O(e) ? () => e.value : h(e) ? () => r(e) : () => e;
  let a,
    o = () => {
      let e = s.run();
      (t(e, a), (a = e));
    };
  n?.immediate && o();
  let s = new u(i, o);
  a = s.run();
}
function F(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
  if (typeof e != 'object' || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) F(e[i], t, n + 1, r);
  return e;
}
//#endregion
//#region lib/runtime-dom/nodeOps.ts
var ae = {
  createElement: oe,
  createText: se,
  insert: ce,
  remove: le,
  setElementText: ue,
  setText: de,
  parentNode: I,
  nextSibling: L,
  querySelector: R,
};
function oe(e) {
  return document.createElement(e);
}
function se(e) {
  return document.createTextNode(e);
}
function ce(e, t, n) {
  t.insertBefore(e, n || null);
}
function le(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function ue(e, t) {
  e.textContent = t;
}
function de(e, t) {
  e.nodeValue = t;
}
function I(e) {
  return e.parentNode;
}
function L(e) {
  return e.nextSibling;
}
function R(e) {
  return document.querySelector(e);
}
//#endregion
//#region lib/runtime-dom/event.ts
function z(e, t, n) {
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
      a = (r[t] = B(n));
    e.addEventListener(i, a);
  }
}
function B(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
//#endregion
//#region lib/runtime-dom/style.ts
function V(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = '';
}
//#endregion
//#region lib/runtime-dom/class.ts
function H(e, t) {
  e.className = t || '';
}
//#endregion
//#region lib/runtime-dom/attr.ts
function fe(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
//#endregion
//#region lib/runtime-dom/patchProps.ts
function pe(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && U(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      U(e, r, n, null);
    }
}
function U(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    z(e, t, r);
    return;
  }
  switch (t) {
    case 'class':
      H(e, r);
      break;
    case 'style':
      V(e, n, r);
      break;
    default:
      fe(e, t, r);
  }
}
//#endregion
//#region lib/runtime-dom/index.ts
var W = Object.assign({ patchProp: U }, ae);
//#endregion
//#region lib/runtime-core/vnode.ts
function me(e) {
  return e.__v_isVnode;
}
function G(e, t) {
  return e.type === t.type && e.key === t.key;
}
function he(e) {
  return e.nodeType === Node.TEXT_NODE;
}
//#endregion
//#region lib/shared/shapeFlags.ts
var K = /* @__PURE__ */ (function (e) {
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
  q = [],
  J = !1,
  ge = Promise.resolve();
function _e() {
  J = !1;
  let e = q.slice();
  q.length = 0;
  for (let t of e) t();
}
function ve(e) {
  (q.includes(e) || q.push(e), J || ((J = !0), ge.then(_e)));
}
//#endregion
//#region lib/utils/props.ts
var ye = (e, t) => {
    let n = Object.keys(t);
    if (Object.keys(t).length !== Object.keys(e).length) return !0;
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      if (t[i] !== e[i]) return !0;
    }
    return !1;
  },
  be = (e, t, n) => {
    if (ye(t, n)) {
      for (let t in e.props) e.props[t] = n[t];
      for (let t in e.props) t in n || delete e.props[t];
    }
  },
  xe = (e, t) => {
    let n = {},
      r = {},
      i = e.type.props || [];
    for (let e in t) Array.isArray(i) && i.includes(e) ? (n[e] = t[e]) : (r[e] = t[e]);
    ((e.props = n), (e.attrs = r));
  };
//#endregion
//#region lib/runtime-core/slot.ts
function Se(e, t) {
  e.vnode.shapeFlag & K.SLOTS_CHILDREN && Ce(t) ? (e.slots = t) : (e.slots = {});
}
function Ce(e) {
  return typeof e != 'object' || !e || Array.isArray(e) || me(e)
    ? !1
    : Object.values(e).every((e) => typeof e == 'function' || e === void 0);
}
//#endregion
//#region lib/runtime-core/emit.ts
function we(e, t, ...n) {
  let { props: r } = e,
    a = r[o(i(t))];
  typeof a == 'function' && a(...n);
}
//#endregion
//#region lib/runtime-core/teleport.ts
var Y = {
  __is_Teleport: !0,
  process(e, t, n, r, i) {
    let {
        mountChildren: a,
        patchChildren: o,
        unmountChildren: s,
        createText: c,
        insert: l,
        querySelector: u,
      } = i,
      d = X(t.props?.to, u);
    if (!d) {
      console.warn(`[Teleport]: target "${t.props?.to}" not found`);
      return;
    }
    if (e === null) {
      ((t.el = c('')), l(t.el, n, r), a(t.children, d));
      return;
    }
    ((t.el = e.el),
      X(e.props?.to, u) === d
        ? o(e, t, d)
        : (Array.isArray(e.children) && s(e.children),
          Array.isArray(t.children) && a(t.children, d)));
  },
};
function X(e, t) {
  return typeof e == 'string' ? t(e) : e && typeof e == 'object' ? e : null;
}
var Te = (e) => !!(e && typeof e == 'object' && e.__is_Teleport);
//#endregion
//#region lib/runtime-core/h.ts
function Ee({ type: e, props: t, children: n }) {
  return De(e, t, n);
}
function De(r, i, a) {
  let o = t(r)
      ? K.ELEMENT
      : Te(r)
        ? K.TELEPORT
        : e(r)
          ? K.STATEFUL_COMPONENT
          : n(r)
            ? K.FUNCTIONAL_COMPONENT
            : 0,
    s = {
      __v_isVnode: !0,
      type: r,
      props: i || null,
      children: a || null,
      key: i?.key,
      el: null,
      shapeFlag: o,
    };
  return (Oe(s), s);
}
function Oe(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= K.ARRAY_CHILDREN)
      : typeof n == 'string' || typeof n == 'number'
        ? ((t.children = String(n)), (t.shapeFlag |= K.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= K.SLOTS_CHILDREN));
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
      remove: s,
      setElementText: c,
      setText: l,
      parentNode: d,
      nextSibling: f,
      patchProp: p,
      querySelector: m,
    } = t,
    h = (e, t, n) => {
      console.log('TODO: diff', e, t);
      let r = 0,
        i = e.length - 1,
        a = t.length - 1;
      for (; r <= i && r <= a;) {
        let i = e[r],
          a = t[r];
        if (G(i, a)) j(i, a, n);
        else break;
        r++;
      }
      for (console.log('[diff]: ', r, i, a); r <= i && r <= a;) {
        let r = e[i],
          o = t[a];
        if (G(r, o)) j(r, o, n);
        else break;
        (i--, a--);
      }
      if ((console.log('[diff]: ', r, i, a), r > i)) {
        if (r <= a) {
          let e = t[a + 1]?.el ?? null;
          for (; r <= a;) (j(null, t[r], n, e), r++);
        }
      } else if (r > a) for (; r <= i;) (N(e[r]), r++);
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
          a == null ? N(i) : j(i, t[a], n);
        }
        let u = a - c + 1;
        for (let e = u - 1; e >= 0; e--) {
          let r = c + e,
            i = r + 1 < t.length ? t[r + 1].el : null,
            a = t[r];
          a.el ? o(a.el, n, i) : j(null, a, n, i);
        }
      }
    },
    _ = (e, t) => {
      console.log('[mountChildren]: ', e, t, 'mount');
      for (let n of e) j(null, n, t);
    },
    v = (e, t, n) => {
      let { type: r, props: a, children: s, shapeFlag: l } = e,
        u = (e.el = i(r));
      if (a) for (let e in a) p(u, e, null, a[e]);
      (l & K.TEXT_CHILDREN ? c(u, s) : l & K.ARRAY_CHILDREN && _(s, u), o(u, t, n));
    },
    y = (e) => {
      e.forEach((e) => {
        N(e);
      });
    },
    b = (e, t, n, r) => {
      (console.log('[processElement]:', e, t, n, 'patch'), e === null ? v(t, n, r) : x(e, t));
    },
    x = (e, t) => {
      let n = (t.el = e.el);
      n && (pe(n, e.props || {}, t.props || {}), S(e, t, n));
    },
    S = (e, t, n) => {
      console.log('[patchChildren]: ', e, t, 'patchChildren');
      let r = e.children,
        i = t.children,
        a = e.shapeFlag,
        o = t.shapeFlag;
      o & K.TEXT_CHILDREN
        ? (a & K.ARRAY_CHILDREN && y(r), r !== i && c(n, i))
        : o & K.ARRAY_CHILDREN
          ? a & K.TEXT_CHILDREN
            ? (c(n, ''), _(i, n))
            : a & K.ARRAY_CHILDREN && h(r, i, n)
          : a & K.TEXT_CHILDREN
            ? c(n, '')
            : a & K.ARRAY_CHILDREN && y(r);
    },
    C = (e, t, n) => {
      if (e === null) {
        let e = (t.el = a(t.children));
        o(e, n);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && he(n) && l(n, t.children);
      }
    },
    w = (e) => {
      let t = {
        vnode: e,
        data: {},
        attrs: {},
        emit: () => {},
        exposed: {},
        proxy: null,
        update: null,
        props: e.props || {},
        type: e.type,
        setupState: {},
        render: null,
        slots: {},
        subTree: null,
        isMounted: !1,
      };
      return ((t.emit = we.bind(null, t)), t);
    },
    T = (t) => {
      (xe(t, t.vnode.props), Se(t, t.vnode.children));
      let i = t.type;
      if (((t.render = i.render ?? null), i.data && (t.data = g(i.data())), i.setup)) {
        let r = {
            attrs: t.attrs,
            slots: t.slots,
            emit: t.emit,
            expose(e = {}) {
              t.exposed = e;
            },
          },
          a = i.setup(t.props, r);
        n(a) ? (t.render = a) : e(a) && (t.setupState = M(a));
      }
      t.proxy = new Proxy(t, {
        get(e, t) {
          let { setupState: n, data: i, props: a, attrs: o, slots: s, emit: c } = e;
          if (typeof t != 'symbol') {
            if (r(n, t)) return n[t];
            if (r(i, t)) return i[t];
            if (r(a, t)) return a[t];
            if (t === '$emit') return c;
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
    E = (e, t, n = null) => {
      console.log('[mountComponent]: ', e);
      let r = w(e);
      ((e.component = r), T(r), D(r, e, t, n));
    },
    D = (e, t, n, r = null) => {
      let i = () => {
          if (e.isMounted) {
            let t = e.subTree,
              i = e.render?.call(e.proxy, e.proxy);
            ((e.subTree = i), j(t, i, n, r));
          } else {
            let i = e.render?.call(e.proxy, e.proxy);
            ((e.subTree = i),
              j(null, i, n, r),
              (t.el = i.el),
              (e.isMounted = !0),
              e.type.mounted?.call(e.proxy, e.proxy));
          }
        },
        a,
        o = new u(i, () => {
          ve(a);
        });
      ((a = e.update = () => o.run()), a());
    },
    O = (e, t) => {
      let n = (t.component = e.component);
      if (!n) throw Error('Component instance is missing');
      let r = e.props ?? {},
        i = t.props ?? {};
      ((n.vnode = t), (t.el = e.el), be(n, r, i), n.update?.());
    },
    k = (e, t, n, r = null) => {
      (console.log('[processComponent]'), e === null ? E(t, n, r) : O(e, t));
    },
    A = (e, t, n) => {
      e === null ? t.children && _(t.children, n) : S(e, t, n);
    },
    j = (e, t, n, r = null) => {
      if (e === t) return;
      e !== null && (G(e, t) || (console.log('[patch<VNode>]', e, t, 'unmount'), N(e), (e = null)));
      let { type: i, shapeFlag: s } = t;
      switch (i) {
        case Z:
          C(e, t, n);
          break;
        case Q:
          A(e, t, n);
          break;
        default:
          s & K.ELEMENT
            ? b(e, t, n, r)
            : s & K.COMPONENT
              ? (console.log('[patch]: component'), k(e, t, n, r))
              : s & K.TELEPORT &&
                i.process(e, t, n, r, {
                  mountChildren: _,
                  patchChildren: S,
                  unmountChildren: y,
                  createText: a,
                  insert: o,
                  querySelector: m,
                });
          break;
      }
    },
    N = (e) => {
      if (e.type === Q) {
        e.children && y(e.children);
        return;
      }
      (e.shapeFlag & K.TELEPORT && Array.isArray(e.children) && y(e.children),
        (e.el &&= (s(e.el), null)));
    };
  return {
    render: (e, t) => {
      (e === null && t._vnode && N(t._vnode), j(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
var { render: ke } = $(W);
//#endregion
export {
  Q as Fragment,
  Y as Teleport,
  Z as Text,
  ee as computed,
  $ as createRenderer,
  s as effect,
  Ee as h,
  O as isRef,
  M as proxyRefs,
  g as reactive,
  C as ref,
  ke as render,
  W as renderOptions,
  A as toRef,
  j as toRefs,
  re as watch,
};
