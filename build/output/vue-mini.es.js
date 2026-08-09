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
function ee(e) {
  return te(e);
}
function te(e) {
  return new ne(e);
}
var ne = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = S(e)));
  }
  get value() {
    return (re(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = S(e)), ie(this));
  }
};
function re(e) {
  c && ((e.dep ||= /* @__PURE__ */ new Set()), v(e.dep));
}
function ie(e) {
  e.dep && x(e.dep);
}
function C(e) {
  return !!(e && e.__v_isRef);
}
var w = class {
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
function ae(e, t) {
  return new w(e, t);
}
function oe(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new w(e, r);
  }
  return t;
}
function T(e) {
  return new Proxy(e, {
    get(e, t, n) {
      let r = Reflect.get(e, t, n);
      return C(r) ? r.value : r;
    },
    set(e, t, n, r) {
      let i = Reflect.get(e, t, r);
      return C(i) && !C(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
    },
  });
}
//#endregion
//#region lib/effect/computed.ts
var E = /* @__PURE__ */ (function (e) {
  return ((e[(e.Dirty = 4)] = 'Dirty'), (e[(e.NoDirty = 0)] = 'NoDirty'), e);
})({});
function se(e) {
  return typeof e == 'function' ? new D(e, void 0) : new D(e.get, e.set);
}
var D = class {
  getter;
  setter;
  __v_isRef = !0;
  dep;
  dirtyLevel = E.Dirty;
  _value;
  effect;
  constructor(e, t) {
    ((this.getter = e),
      (this.setter = t),
      (this.effect = new u(this.getter, () => {
        ((this.dirtyLevel = E.Dirty), le(this));
      })));
  }
  set dirty(e) {
    this.dirtyLevel = e ? E.Dirty : E.NoDirty;
  }
  get dirty() {
    return this.dirtyLevel === E.Dirty;
  }
  get value() {
    return (
      ce(this),
      this.dirtyLevel === E.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = E.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn('computed ref is readonly');
  }
};
function ce(e) {
  c && ((e.dep ||= /* @__PURE__ */ new Set()), v(e.dep));
}
function le(e) {
  e.dep && x(e.dep);
}
//#endregion
//#region lib/effect/watch.ts
function ue(e, t, n) {
  de(e, t, n);
}
function de(e, t, n) {
  let r = (e) => O(e, n?.deep ? 1 : void 0),
    i;
  i = C(e) ? () => e.value : h(e) ? () => r(e) : () => e;
  let a,
    o = () => {
      let e = s.run();
      (t(e, a), (a = e));
    };
  n?.immediate && o();
  let s = new u(i, o);
  a = s.run();
}
function O(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
  if (typeof e != 'object' || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) O(e[i], t, n + 1, r);
  return e;
}
//#endregion
//#region lib/runtime-dom/nodeOps.ts
var k = {
  createElement: A,
  createText: j,
  insert: M,
  remove: N,
  setElementText: P,
  setText: F,
  parentNode: I,
  nextSibling: L,
  querySelector: R,
};
function A(e) {
  return document.createElement(e);
}
function j(e) {
  return document.createTextNode(e);
}
function M(e, t, n) {
  t.insertBefore(e, n || null);
}
function N(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function P(e, t) {
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
var W = Object.assign({ patchProp: U }, k);
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
  ge = (e, t) => {
    let n = Object.keys(t);
    if (Object.keys(t).length !== Object.keys(e).length) return !0;
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      if (t[i] !== e[i]) return !0;
    }
    return !1;
  },
  _e = (e, t, n) => {
    if (ge(t, n)) {
      for (let t in e.props) e.props[t] = n[t];
      for (let t in e.props) t in n || delete e.props[t];
    }
  },
  ve = (e, t) => {
    let n = {},
      r = {},
      i = e.type.props || [];
    for (let e in t) Array.isArray(i) && i.includes(e) ? (n[e] = t[e]) : (r[e] = t[e]);
    ((e.props = n), (e.attrs = r));
  };
//#endregion
//#region lib/runtime-core/emit.ts
function ye(e, t, ...n) {
  let { props: r } = e,
    a = r[o(i(t))];
  typeof a == 'function' && a(...n);
}
//#endregion
//#region lib/runtime-core/schedular.ts
var q = [],
  J = !1,
  be = Promise.resolve();
function xe() {
  J = !1;
  let e = q.slice();
  q.length = 0;
  for (let t of e) t();
}
function Se(e) {
  (q.includes(e) || q.push(e), J || ((J = !0), be.then(xe)));
}
//#endregion
//#region lib/runtime-core/slot.ts
function Ce(e, t) {
  e.vnode.shapeFlag & K.SLOTS_CHILDREN && we(t) ? (e.slots = t) : (e.slots = {});
}
function we(e) {
  return typeof e != 'object' || !e || Array.isArray(e) || me(e)
    ? !1
    : Object.values(e).every((e) => typeof e == 'function' || e === void 0);
}
var Te = (e, t) => {
    let n = {
      vnode: e,
      parent: t,
      provides: t ? t.provides : Object.create(null),
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
    return ((n.emit = ye.bind(null, n)), n);
  },
  Ee = (t) => {
    (ve(t, t.vnode.props), Ce(t, t.vnode.children));
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
        a;
      try {
        a = i.setup(t.props, r);
      } finally {
      }
      n(a) ? (t.render = a) : e(a) && (t.setupState = T(a));
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
        let { setupState: i, data: a, props: o } = e;
        return typeof t == 'symbol'
          ? !0
          : r(i, t)
            ? ((i[t] = n), !0)
            : r(a, t)
              ? ((a[t] = n), !0)
              : (r(o, t) && console.warn('props is readonly'), !0);
      },
    });
  },
  De = (e, t, n, r, i) => {
    let a = () => {
        if (e.isMounted) {
          let t = e.subTree,
            a = e.render?.call(e.proxy, e.proxy);
          ((e.subTree = a), i.patch(t, a, n, r, e));
        } else {
          let a = e.render?.call(e.proxy, e.proxy);
          ((e.subTree = a),
            i.patch(null, a, n, r, e),
            (t.el = a.el),
            (e.isMounted = !0),
            e.type.mounted?.call(e.proxy, e.proxy));
        }
      },
      o,
      s = new u(a, () => {
        Se(o);
      });
    ((o = e.update = () => s.run()), o());
  },
  Oe = (e, t, n, r, i) => {
    console.log('[mountComponent]: ', e);
    let a = Te(e, r);
    ((e.component = a), Ee(a), De(a, e, t, n, i));
  },
  ke = (e, t) => {
    let n = (t.component = e.component);
    if (!n) throw Error('Component instance is missing');
    let r = e.props ?? {},
      i = t.props ?? {};
    ((n.vnode = t), (t.el = e.el), _e(n, r, i), n.update?.());
  },
  Ae = (e, t, n, r, i, a) => {
    (console.log('[processComponent]'), e === null ? Oe(t, n, r, i, a) : ke(e, t));
  },
  je = {
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
        d = Y(t.props?.to, u);
      if (!d) {
        console.warn(`[Teleport]: target "${t.props?.to}" not found`);
        return;
      }
      if (e === null) {
        ((t.el = c('')), l(t.el, n, r), a(t.children, d));
        return;
      }
      ((t.el = e.el),
        Y(e.props?.to, u) === d
          ? o(e, t, d)
          : (Array.isArray(e.children) && s(e.children),
            Array.isArray(t.children) && a(t.children, d)));
    },
  };
function Y(e, t) {
  return typeof e == 'string' ? t(e) : e && typeof e == 'object' ? e : null;
}
var Me = (e) => !!(e && typeof e == 'object' && e.__is_Teleport);
//#endregion
//#region lib/runtime-core/h.ts
function Ne({ type: e, props: t, children: n }) {
  return X(e, t, n);
}
function X(r, i, a) {
  let o = t(r)
      ? K.ELEMENT
      : Me(r)
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
  return (Pe(s), s);
}
function Pe(t) {
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
      querySelector: u,
    } = e,
    d = (e, t, n, i) => {
      console.log('TODO: diff', e, t);
      let a = 0,
        o = e.length - 1,
        s = t.length - 1;
      for (; a <= o && a <= s;) {
        let r = e[a],
          o = t[a];
        if (G(r, o)) b(r, o, n, null, i);
        else break;
        a++;
      }
      for (console.log('[diff]: ', a, o, s); a <= o && a <= s;) {
        let r = e[o],
          a = t[s];
        if (G(r, a)) b(r, a, n, null, i);
        else break;
        (o--, s--);
      }
      if ((console.log('[diff]: ', a, o, s), a > o)) {
        if (a <= s) {
          let e = t[s + 1]?.el ?? null;
          for (; a <= s;) (b(null, t[a], n, e, i), a++);
        }
      } else if (a > s) for (; a <= o;) (x(e[a]), a++);
      else {
        let c = a,
          l = a,
          u = /* @__PURE__ */ new Map();
        for (let e = l; e <= s; e++) {
          let n = t[e];
          u.set(n.key, e);
        }
        for (let r = c; r <= o; r++) {
          let a = e[r],
            o = u.get(a.key);
          o == null ? x(a) : b(a, t[o], n, null, i);
        }
        let d = s - l + 1;
        for (let e = d - 1; e >= 0; e--) {
          let a = l + e,
            o = a + 1 < t.length ? t[a + 1].el : null,
            s = t[a];
          s.el ? r(s.el, n, o) : b(null, s, n, o, i);
        }
      }
    },
    f = (e, t, n) => {
      console.log('[mountChildren]: ', e, t, 'mount');
      for (let r of e) b(null, r, t, null, n);
    },
    p = (e, n, i, o) => {
      let { type: s, props: c, children: u, shapeFlag: d } = e,
        p = (e.el = t(s));
      if (c) for (let e in c) l(p, e, null, c[e]);
      (d & K.TEXT_CHILDREN ? a(p, u) : d & K.ARRAY_CHILDREN && f(u, p, o), r(p, n, i));
    },
    m = (e) => {
      e.forEach((e) => {
        x(e);
      });
    },
    h = (e, t, n, r, i) => {
      (console.log('[processElement]:', e, t, n, 'patch'), e === null ? p(t, n, r, i) : g(e, t, i));
    },
    g = (e, t, n) => {
      let r = (t.el = e.el);
      r && (pe(r, e.props || {}, t.props || {}), _(e, t, r, n));
    },
    _ = (e, t, n, r) => {
      console.log('[patchChildren]: ', e, t, 'patchChildren');
      let i = e.children,
        o = t.children,
        s = e.shapeFlag,
        c = t.shapeFlag;
      c & K.TEXT_CHILDREN
        ? (s & K.ARRAY_CHILDREN && m(i), i !== o && a(n, o))
        : c & K.ARRAY_CHILDREN
          ? s & K.TEXT_CHILDREN
            ? (a(n, ''), f(o, n, r))
            : s & K.ARRAY_CHILDREN && d(i, o, n, r)
          : s & K.TEXT_CHILDREN
            ? a(n, '')
            : s & K.ARRAY_CHILDREN && m(i);
    },
    v = (e, t, i) => {
      if (e === null) {
        let e = (t.el = n(t.children));
        r(e, i);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && he(n) && o(n, t.children);
      }
    },
    y = (e, t, n, r) => {
      e === null ? t.children && f(t.children, n, r) : _(e, t, n, r);
    },
    b = (e, t, i, a = null, o = null) => {
      if (e === t) return;
      e !== null && (G(e, t) || (console.log('[patch<VNode>]', e, t, 'unmount'), x(e), (e = null)));
      let { type: s, shapeFlag: c } = t;
      switch (s) {
        case Z:
          v(e, t, i);
          break;
        case Q:
          y(e, t, i, o);
          break;
        default:
          c & K.ELEMENT
            ? h(e, t, i, a, o)
            : c & K.COMPONENT
              ? (console.log('[patch]: component'), Ae(e, t, i, a, o, { patch: b }))
              : c & K.TELEPORT &&
                s.process(e, t, i, a, {
                  mountChildren: f,
                  patchChildren: _,
                  unmountChildren: m,
                  createText: n,
                  insert: r,
                  querySelector: u,
                });
          break;
      }
    },
    x = (e) => {
      if (e.type === Q) {
        e.children && m(e.children);
        return;
      }
      (e.shapeFlag & K.TELEPORT && Array.isArray(e.children) && m(e.children),
        (e.el &&= (i(e.el), null)));
    };
  return {
    render: (e, t) => {
      (e === null && t._vnode && x(t._vnode), b(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
var { render: Fe } = $(W);
//#endregion
export {
  Q as Fragment,
  je as Teleport,
  Z as Text,
  se as computed,
  $ as createRenderer,
  s as effect,
  Ne as h,
  C as isRef,
  T as proxyRefs,
  g as reactive,
  ee as ref,
  Fe as render,
  W as renderOptions,
  ae as toRef,
  oe as toRefs,
  ue as watch,
};
