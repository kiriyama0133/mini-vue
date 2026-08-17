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
    constructor(e, t) {
      ((this.fn = e),
        (this.scheduler = t),
        (this.executeCount = 0),
        (this.active = !0),
        (this.deps = []),
        (this.running = 0));
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
      if (n === '__v_isReactive') return !0;
      if (n === '__v_isReadonly') return !1;
      if (n === '__v_raw') return t;
      g(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = v(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !0;
      let i = Reflect.set(e, t, n, r);
      return (i && y(e, t), i);
    },
  };
function m(e) {
  return !!(e && e.__v_isReactive);
}
function h(e) {
  return v(e);
}
function g(e, t) {
  if (!c) return;
  let n = f.get(e);
  n || f.set(e, (n = /* @__PURE__ */ new Map()));
  let r = n.get(t);
  (r || n.set(t, (r = /* @__PURE__ */ new Set())), _(r));
}
function _(e) {
  e.has(c) || (e.add(c), c.deps.push(e));
}
function v(t) {
  if (!e(t)) return t;
  if (d.has(t)) return d.get(t);
  let n = new Proxy(t, p);
  return (d.set(t, n), n);
}
function y(e, t) {
  let n = f.get(e);
  if (!n) return;
  let r = n.get(t);
  if ((console.log('[trigger]', t, r), !r)) return;
  let i = new Set(r);
  (console.log('[execute]', i), b(r));
}
function b(e) {
  new Set(e).forEach((e) => {
    e !== c && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function x(t) {
  return e(t) ? v(t) : t;
}
//#endregion
//#region lib/ref/index.ts
function S(e) {
  return C(e);
}
function C(e) {
  return new w(e);
}
var w = class {
  constructor(e) {
    ((this.rawValue = e), (this.__v_isRef = !0), (this._value = x(e)));
  }
  get value() {
    return (ee(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = x(e)), te(this));
  }
};
function ee(e) {
  c && ((e.dep ||= /* @__PURE__ */ new Set()), _(e.dep));
}
function te(e) {
  e.dep && b(e.dep);
}
function T(e) {
  return !!(e && e.__v_isRef);
}
var E = class {
  constructor(e, t) {
    ((this._object = e), (this._key = t), (this.__v_isRef = !0));
  }
  get value() {
    return this._object[this._key];
  }
  set value(e) {
    this._object[this._key] = e;
  }
};
function ne(e, t) {
  return new E(e, t);
}
function re(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new E(e, r);
  }
  return t;
}
function D(e) {
  return new Proxy(e, {
    get(e, t, n) {
      let r = Reflect.get(e, t, n);
      return T(r) ? r.value : r;
    },
    set(e, t, n, r) {
      let i = Reflect.get(e, t, r);
      return T(i) && !T(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
    },
  });
}
//#endregion
//#region lib/effect/computed.ts
function ie(e) {
  return typeof e == 'function' ? new O(e, void 0) : new O(e.get, e.set);
}
var O = class {
  constructor(e, t) {
    ((this.getter = e),
      (this.setter = t),
      (this.__v_isRef = !0),
      (this.dirtyLevel = 4),
      (this.effect = new u(this.getter, () => {
        ((this.dirtyLevel = 4), oe(this));
      })));
  }
  set dirty(e) {
    this.dirtyLevel = e ? 4 : 0;
  }
  get dirty() {
    return this.dirtyLevel === 4;
  }
  get value() {
    return (
      ae(this),
      this.dirtyLevel === 4 && ((this._value = this.effect.run()), (this.dirtyLevel = 0)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn('computed ref is readonly');
  }
};
function ae(e) {
  c && ((e.dep ||= /* @__PURE__ */ new Set()), _(e.dep));
}
function oe(e) {
  e.dep && b(e.dep);
}
//#endregion
//#region lib/effect/watch.ts
function se(e, t, n) {
  ce(e, t, n);
}
function ce(e, t, n) {
  let r = (e) => k(e, n?.deep ? 1 : void 0),
    i;
  i = T(e) ? () => e.value : m(e) ? () => r(e) : () => e;
  let a,
    o = () => {
      let e = s.run();
      (t(e, a), (a = e));
    };
  n?.immediate && o();
  let s = new u(i, o);
  a = s.run();
}
function k(e, t, n = 0, r = /* @__PURE__ */ new Set()) {
  if (typeof e != 'object' || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) k(e[i], t, n + 1, r);
  return e;
}
//#endregion
//#region lib/runtime-dom/nodeOps.ts
var le = {
  createElement: ue,
  createText: de,
  insert: fe,
  remove: pe,
  setElementText: me,
  setText: he,
  parentNode: ge,
  nextSibling: _e,
  querySelector: ve,
};
function ue(e) {
  return document.createElement(e);
}
function de(e) {
  return document.createTextNode(e);
}
function fe(e, t, n) {
  t.insertBefore(e, n || null);
}
function pe(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function me(e, t) {
  e.textContent = t;
}
function he(e, t) {
  e.nodeValue = t;
}
function ge(e) {
  return e.parentNode;
}
function _e(e) {
  return e.nextSibling;
}
function ve(e) {
  return document.querySelector(e);
}
//#endregion
//#region lib/runtime-dom/event.ts
function ye(e, t, n) {
  let r = (e._vei ||= {}),
    i = r[t];
  if (i) {
    if (n) i.value = n;
    else {
      let n = t.slice(2).toLowerCase();
      (e.removeEventListener(n, i), delete r[t]);
    }
    return;
  }
  if (n) {
    let i = t.slice(2).toLowerCase(),
      a = (r[t] = be(n));
    e.addEventListener(i, a);
  }
}
function be(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
//#endregion
//#region lib/runtime-dom/style.ts
function xe(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = '';
}
//#endregion
//#region lib/runtime-dom/class.ts
function A(e, t) {
  e.className = t || '';
}
//#endregion
//#region lib/runtime-dom/attr.ts
var j = /* @__PURE__ */ new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'selected',
]);
function M(e, t, n) {
  let r = j.has(t.toLowerCase());
  n == null || (r && n === !1)
    ? e.removeAttribute(t)
    : r
      ? e.setAttribute(t, '')
      : e.setAttribute(t, n);
}
//#endregion
//#region lib/runtime-dom/patchProps.ts
function Se(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && N(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      N(e, r, n, null);
    }
}
function N(e, t, n, r) {
  if (t !== 'key') {
    if (/^on[^a-z]/.test(t)) {
      ye(e, t, r);
      return;
    }
    switch (t) {
      case 'class':
        A(e, r);
        break;
      case 'style':
        xe(e, n, r);
        break;
      default:
        M(e, t, r);
    }
  }
}
//#endregion
//#region lib/runtime-dom/index.ts
var P = Object.assign({ patchProp: N }, le),
  F = Symbol('Text'),
  I = Symbol('Fragment');
function L(e) {
  return typeof e == 'object' && !!e && e.__v_isVnode === !0;
}
function R(e, t) {
  return e.type === t.type && e.key === t.key;
}
function Ce(e) {
  return e.nodeType === Node.TEXT_NODE;
}
//#endregion
//#region lib/shared/shapeFlags.ts
var z = /* @__PURE__ */ (function (e) {
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
//#region lib/runtime-dom/object.ts
function B(e, t) {
  for (let n in t) e[n] = t[n];
  for (let n in e) n in t || delete e[n];
}
//#endregion
//#region lib/utils/props.ts
var we = (e, t) => {
    let n = Object.keys(t);
    if (Object.keys(t).length !== Object.keys(e).length) return !0;
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      if (t[i] !== e[i]) return !0;
    }
    return !1;
  },
  Te = (e, t, n) => {
    if (!we(t, n)) return;
    let r = {},
      i = {},
      a = e.type.props || [];
    for (let e in n) (Array.isArray(a) ? a.includes(e) : e in a) ? (r[e] = n[e]) : (i[e] = n[e]);
    (B(e.props, r), B(e.attrs, i));
  },
  Ee = (e, t) => {
    let n = {},
      r = {},
      i = e.type.props || [];
    for (let e in t) Array.isArray(i) ? (n[e] = t[e]) : (r[e] = t[e]);
    ((e.props = n), (e.attrs = r));
  };
//#endregion
//#region lib/runtime-core/emit.ts
function De(e, t, ...n) {
  let { props: r } = e,
    a = r[o(i(t))];
  typeof a == 'function' && a(...n);
}
//#endregion
//#region lib/runtime-core/schedular.ts
var V = [],
  H = !1,
  Oe = Promise.resolve();
function ke() {
  H = !1;
  let e = V.slice();
  V.length = 0;
  for (let t of e) t();
}
function U(e) {
  (V.includes(e) || V.push(e), H || ((H = !0), Oe.then(ke)));
}
//#endregion
//#region lib/runtime-core/slot.ts
function Ae(e, t) {
  e.vnode.shapeFlag & z.SLOTS_CHILDREN && je(t) ? (e.slots = t) : (e.slots = {});
}
function je(e) {
  return typeof e != 'object' || !e || Array.isArray(e) || L(e)
    ? !1
    : Object.values(e).every((e) => typeof e == 'function' || e === void 0);
}
//#endregion
//#region lib/runtime-core/component.ts
var W = null;
function Me() {
  return W;
}
function G(e) {
  W = e;
}
var Ne = (e, t) => {
  let n = {
    vnode: e,
    bm: [],
    u: [],
    um: [],
    bum: [],
    m: [],
    bu: [],
    isUnmounted: !1,
    effect: null,
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
  return ((n.emit = De.bind(null, n)), n);
};
function K(e) {
  e && e.forEach((e) => e());
}
var Pe = (e, t) => {
    e.isUnmounted ||
      (K(e.bum),
      (e.isUnmounted = !0),
      e.effect?.stop(),
      e.subTree && t.unmount(e.subTree),
      K(e.um));
  },
  Fe = (t) => {
    (Ee(t, t.vnode.props), Ae(t, t.vnode.children));
    let i = t.type;
    if (
      ((t.render = i.render ?? null),
      i.data && (t.data = h(i.data())),
      i.mounted &&
        t.m.push(() => {
          i.mounted?.call(t.proxy, t.proxy);
        }),
      i.setup)
    ) {
      let r = {
        attrs: t.attrs,
        slots: t.slots,
        emit: t.emit,
        expose(e = {}) {
          t.exposed = e;
        },
      };
      G(t);
      let a;
      try {
        a = i.setup(t.props, r);
      } finally {
        G(null);
      }
      n(a) ? (t.render = a) : e(a) && (t.setupState = D(a));
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
  Ie = (e, t, n, r, i) => {
    let a = () => {
        if (e.isMounted) {
          let t = e.subTree,
            a = e.render?.call(e.proxy, e.proxy);
          ((e.subTree = a), i.patch(t, a, n, r, e), K(e.u));
        } else {
          K(e.bm);
          let a = e.render?.call(e.proxy, e.proxy);
          ((e.subTree = a), i.patch(null, a, n, r, e), (t.el = a.el), (e.isMounted = !0), K(e.m));
        }
      },
      o,
      s = new u(a, () => {
        U(o);
      });
    ((e.effect = s),
      (o = e.update =
        () => {
          e.isUnmounted || s.run();
        }),
      o());
  },
  Le = (e, t, n, r, i) => {
    console.log('[mountComponent]: ', e);
    let a = Ne(e, r);
    ((e.component = a), Fe(a), Ie(a, e, t, n, i));
  },
  Re = (e, t) => {
    let n = (t.component = e.component);
    if (!n) throw Error('Component instance is missing');
    let r = e.props ?? {},
      i = t.props ?? {};
    ((n.vnode = t), (t.el = e.el), Te(n, r, i), n.update?.());
  },
  ze = (e, t, n, r, i, a) => {
    (console.log('[processComponent]'), e === null ? Le(t, n, r, i, a) : Re(e, t));
  },
  Be = {
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
        d = q(t.props?.to, u);
      if (!d) {
        console.warn(`[Teleport]: target "${t.props?.to}" not found`);
        return;
      }
      if (e === null) {
        ((t.el = c('')), l(t.el, n, r), a(t.children, d));
        return;
      }
      ((t.el = e.el),
        q(e.props?.to, u) === d
          ? o(e, t, d)
          : (Array.isArray(e.children) && s(e.children),
            Array.isArray(t.children) && a(t.children, d)));
    },
  };
function q(e, t) {
  return typeof e == 'string' ? t(e) : e && typeof e == 'object' ? e : null;
}
var Ve = (e) => !!(e && typeof e == 'object' && e.__is_Teleport);
//#endregion
//#region lib/runtime-core/h.ts
function J({ type: e, props: t, children: n }) {
  return Y(e, t, n);
}
function Y(r, i, a) {
  let o = t(r)
      ? z.ELEMENT
      : Ve(r)
        ? z.TELEPORT
        : e(r)
          ? z.STATEFUL_COMPONENT
          : n(r)
            ? z.FUNCTIONAL_COMPONENT
            : 0,
    s = {
      __v_isVnode: !0,
      type: r,
      props: i ?? null,
      children: a ?? null,
      key: i?.key ?? null,
      el: null,
      shapeFlag: o,
    };
  return (He(s), s);
}
function He(t) {
  let { children: n } = t;
  if (n != null)
    if (Array.isArray(n)) {
      let e = [];
      (X(n, e), (t.children = e), (t.shapeFlag |= z.ARRAY_CHILDREN));
    } else if (L(n)) {
      ((t.children = [n]), (t.shapeFlag |= z.ARRAY_CHILDREN));
      return;
    } else if (typeof n == 'string' || typeof n == 'number') {
      t.type === I || t.shapeFlag & z.TELEPORT
        ? ((t.children = [Y(F, void 0, String(n))]), (t.shapeFlag |= z.ARRAY_CHILDREN))
        : ((t.children = String(n)), (t.shapeFlag |= z.TEXT_CHILDREN));
      return;
    } else e(n) && t.shapeFlag & z.COMPONENT && (t.shapeFlag |= z.SLOTS_CHILDREN);
}
function X(e, t) {
  for (let n of e) {
    if (Array.isArray(n)) {
      X(n, t);
      continue;
    }
    if (!(n == null || typeof n == 'boolean')) {
      if (L(n)) {
        t.push(n);
        continue;
      }
      (typeof n == 'string' || typeof n == 'number') && t.push(Y(F, void 0, String(n)));
    }
  }
}
//#endregion
//#region lib/runtime-core/defineAsyncComponent.ts
function Ue(e) {
  return {
    expose: () => {},
    setup(t, { attrs: n, slots: r }) {
      let i = S(!1),
        a = null;
      return (
        e()
          .then((e) => {
            ((a = e), (i.value = !0));
          })
          .catch((e) => {}),
        () =>
          !i.value || !a
            ? J({
                type: 'div',
                children: 'loading...',
              })
            : J({
                type: a,
                props: {
                  ...n,
                  ...t,
                },
                children: r,
              })
      );
    },
  };
}
//#endregion
//#region lib/runtime-core/apiLifecyle.ts
function We(e, t, n = Me()) {
  if (!n) {
    console.warn('Lifecycle hooks can only be registered during setup()');
    return;
  }
  n[e].push(t);
}
function Z(e) {
  return (t) => {
    We(e, t);
  };
}
var Ge = Z('bum'),
  Ke = Z('um'),
  qe = Z('bm'),
  Je = Z('m'),
  Ye = Z('bu'),
  Xe = Z('u');
//#endregion
//#region lib/runtime-core/index.ts
function Q(e) {
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
    d = (e, t, n, r, i = null) => {
      console.log('TODO: diff', e, t);
      let a = 0,
        o = e.length - 1,
        s = t.length - 1;
      for (; a <= o && a <= s;) {
        let i = e[a],
          o = t[a];
        if (R(i, o)) x(i, o, n, null, r);
        else break;
        a++;
      }
      for (console.log('[diff]: ', a, o, s); a <= o && a <= s;) {
        let i = e[o],
          a = t[s];
        if (R(i, a)) x(i, a, n, null, r);
        else break;
        (o--, s--);
      }
      if ((console.log('[diff]: ', a, o, s), a > o)) {
        if (a <= s) {
          let e = t[s + 1]?.el ?? i;
          for (; a <= s;) (x(null, t[a], n, e, r), a++);
        }
      } else if (a > s) for (; a <= o;) (S(e[a]), a++);
      else {
        let c = a,
          l = a,
          u = /* @__PURE__ */ new Map(),
          d = s - l + 1,
          f = Array(d).fill(0);
        for (let e = l; e <= s; e++) {
          let n = t[e];
          n.key != null && u.set(n.key, e);
        }
        for (let i = c; i <= o; i++) {
          let a = e[i],
            o;
          if (a.key != null) o = u.get(a.key);
          else
            for (let e = l; e <= s; e++)
              if (f[e - l] === 0 && R(a, t[e])) {
                o = e;
                break;
              }
          if (o === void 0) {
            S(a);
            continue;
          }
          ((f[o - l] = i + 1), x(a, t[o], n, null, r));
        }
        for (let e = d - 1; e >= 0; e--) {
          let a = l + e,
            o = a + 1 < t.length ? t[a + 1].el : i,
            s = t[a];
          f[e] === 0 ? x(null, s, n, o, r) : b(s, n, o);
        }
      }
    },
    f = (e, t, n = null, r = null) => {
      console.log('[mountChildren]: ', e, t, 'mount');
      for (let i of e) x(null, i, t, r, n);
    },
    p = (e, n, i, o) => {
      let { type: s, props: c, children: u, shapeFlag: d } = e,
        p = (e.el = t(s));
      if (c) for (let e in c) l(p, e, null, c[e]);
      (d & z.TEXT_CHILDREN ? a(p, u) : d & z.ARRAY_CHILDREN && f(u, p, o), r(p, n, i));
    },
    m = (e) => {
      e.forEach((e) => {
        S(e);
      });
    },
    h = (e, t, n, r, i) => {
      (console.log('[processElement]:', e, t, n, 'patch'), e === null ? p(t, n, r, i) : g(e, t, i));
    },
    g = (e, t, n) => {
      let r = (t.el = e.el);
      r && (Se(r, e.props || {}, t.props || {}), _(e, t, r, n));
    },
    _ = (e, t, n, r, i = null) => {
      console.log('[patchChildren]: ', e, t, 'patchChildren');
      let o = e.children,
        s = t.children,
        c = e.shapeFlag,
        l = t.shapeFlag;
      l & z.TEXT_CHILDREN
        ? (c & z.ARRAY_CHILDREN && m(o), o !== s && a(n, s))
        : l & z.ARRAY_CHILDREN
          ? c & z.TEXT_CHILDREN
            ? (a(n, ''), f(s, n, r, i))
            : c & z.ARRAY_CHILDREN && d(o, s, n, r, i)
          : c & z.TEXT_CHILDREN
            ? a(n, '')
            : c & z.ARRAY_CHILDREN && m(o);
    },
    v = (e, t, i, a) => {
      if (e === null) {
        let e = (t.el = n(t.children));
        r(e, i, a);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && Ce(n) && o(n, t.children);
      }
    },
    y = (e, t, i, a, o) => {
      if (e === null) {
        let e = (t.el = n('')),
          s = (t.anchor = n(''));
        (r(e, i, a), r(s, i, a), Array.isArray(t.children) && f(t.children, i, o, s));
      } else ((t.el = e.el), (t.anchor = e.anchor), _(e, t, i, o, t.anchor ?? a));
    },
    b = (e, t, n) => {
      if (e.shapeFlag & z.COMPONENT && e.component?.subTree) {
        b(e.component.subTree, t, n);
        return;
      }
      if (e.type === I) {
        let i = e.el,
          a = e.anchor;
        for (; i;) {
          let e = c(i);
          if ((r(i, t, n), i === a)) break;
          i = e;
        }
        return;
      }
      e.el && r(e.el, t, n);
    },
    x = (e, t, i, a = null, o = null) => {
      if (e === t) return;
      e !== null && (R(e, t) || (console.log('[patch<VNode>]', e, t, 'unmount'), S(e), (e = null)));
      let { type: s, shapeFlag: c } = t;
      switch (s) {
        case F:
          v(e, t, i, a);
          break;
        case I:
          y(e, t, i, a, o);
          break;
        default:
          c & z.ELEMENT
            ? h(e, t, i, a, o)
            : c & z.COMPONENT
              ? (console.log('[patch]: component'), ze(e, t, i, a, o, w))
              : c & z.TELEPORT &&
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
    S = (e) => {
      if (e.shapeFlag & z.COMPONENT) {
        e.component && Pe(e.component, w);
        return;
      }
      if (e.type === I) {
        (e.children && m(e.children), e.el && i(e.el), e.anchor && i(e.anchor));
        return;
      }
      (e.shapeFlag & z.TELEPORT && Array.isArray(e.children) && m(e.children),
        e.shapeFlag & z.ELEMENT &&
          e.shapeFlag & z.ARRAY_CHILDREN &&
          Array.isArray(e.children) &&
          m(e.children),
        (e.el &&= (i(e.el), null)));
    },
    C = (e, t) => {
      if (e === null) {
        (t._vnode && S(t._vnode), (t._vnode = null));
        return;
      }
      (x(t._vnode || null, e, t), (t._vnode = e));
    },
    w = {
      patch: x,
      unmount: S,
    };
  return { render: C };
}
var { render: Ze } = Q(P);
//#endregion
//#region lib/helper/runtimeHelpers.ts
function $(e) {
  if (e == null) return '';
  if (typeof e == 'string') return e;
  if (typeof e == 'object')
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  return String(e);
}
function Qe(e) {
  return Y(F, void 0, $(e));
}
function $e(e, t) {
  let n = [];
  if (Array.isArray(e) || typeof e == 'string') {
    for (let r = 0; r < e.length; r++) n.push(t(e[r], r));
    return n;
  }
  return n;
}
//#endregion
export {
  I as Fragment,
  Be as Teleport,
  F as Text,
  ie as computed,
  Q as createRenderer,
  Qe as createTextVNode,
  Ue as defineAsyncComponent,
  s as effect,
  J as h,
  T as isRef,
  qe as onBeforeMount,
  Ge as onBeforeUnmount,
  Ye as onBeforeUpdate,
  Je as onMounted,
  Ke as onUnmounted,
  Xe as onUpdated,
  D as proxyRefs,
  h as reactive,
  S as ref,
  Ze as render,
  $e as renderList,
  P as renderOptions,
  $ as toDisplayString,
  ne as toRef,
  re as toRefs,
  se as watch,
};
