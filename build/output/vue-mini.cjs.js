Object.defineProperty(exports, Symbol.toStringTag, { value: `Module` });
function e(e) {
  return typeof e == `object` && !!e;
}
function t(e) {
  return typeof e == `string`;
}
function n(e) {
  return typeof e == `function`;
}
function r(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
var i = (e) => e.replace(/-(\w)/g, (e, t) => (t ? t.toUpperCase() : ``)),
  a = (e) => e.charAt(0).toUpperCase() + e.slice(1),
  o = (e) => (e ? `on${a(e)}` : ``);
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
  d = new WeakMap(),
  f = new WeakMap(),
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
  m = (function (e) {
    return (
      (e.IS_REACTIVE = `__v_isReactive`),
      (e.IS_READONLY = `__v_isReadonly`),
      (e.RAW = `__v_raw`),
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
  n || f.set(e, (n = new Map()));
  let r = n.get(t);
  (r || n.set(t, (r = new Set())), v(r));
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
  if ((console.log(`[trigger]`, t, r), !r)) return;
  let i = new Set(r);
  (console.log(`[execute]`, i), x(r));
}
function x(e) {
  new Set(e).forEach((e) => {
    e !== c && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function S(t) {
  return e(t) ? y(t) : t;
}
function C(e) {
  return ee(e);
}
function ee(e) {
  return new te(e);
}
var te = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = S(e)));
  }
  get value() {
    return (ne(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = S(e)), re(this));
  }
};
function ne(e) {
  c && ((e.dep ||= new Set()), v(e.dep));
}
function re(e) {
  e.dep && x(e.dep);
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
function ie(e, t) {
  return new T(e, t);
}
function ae(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new T(e, r);
  }
  return t;
}
function E(e) {
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
var D = (function (e) {
  return ((e[(e.Dirty = 4)] = `Dirty`), (e[(e.NoDirty = 0)] = `NoDirty`), e);
})({});
function oe(e) {
  return typeof e == `function` ? new O(e, void 0) : new O(e.get, e.set);
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
      (this.effect = new u(this.getter, () => {
        ((this.dirtyLevel = D.Dirty), ce(this));
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
      se(this),
      this.dirtyLevel === D.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = D.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn(`computed ref is readonly`);
  }
};
function se(e) {
  c && ((e.dep ||= new Set()), v(e.dep));
}
function ce(e) {
  e.dep && x(e.dep);
}
function le(e, t, n) {
  ue(e, t, n);
}
function ue(e, t, n) {
  let r = (e) => k(e, n?.deep ? 1 : void 0),
    i;
  i = w(e) ? () => e.value : h(e) ? () => r(e) : () => e;
  let a,
    o = () => {
      let e = s.run();
      (t(e, a), (a = e));
    };
  n?.immediate && o();
  let s = new u(i, o);
  a = s.run();
}
function k(e, t, n = 0, r = new Set()) {
  if (typeof e != `object` || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) k(e[i], t, n + 1, r);
  return e;
}
var de = {
  createElement: fe,
  createText: pe,
  insert: me,
  remove: he,
  setElementText: ge,
  setText: _e,
  parentNode: ve,
  nextSibling: ye,
  querySelector: be,
};
function fe(e) {
  return document.createElement(e);
}
function pe(e) {
  return document.createTextNode(e);
}
function me(e, t, n) {
  t.insertBefore(e, n || null);
}
function he(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function ge(e, t) {
  e.textContent = t;
}
function _e(e, t) {
  e.nodeValue = t;
}
function ve(e) {
  return e.parentNode;
}
function ye(e) {
  return e.nextSibling;
}
function be(e) {
  return document.querySelector(e);
}
function xe(e, t, n) {
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
      a = (r[t] = Se(n));
    e.addEventListener(i, a);
  }
}
function Se(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
function A(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = ``;
}
function j(e, t) {
  e.className = t || ``;
}
function Ce(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function we(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && M(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      M(e, r, n, null);
    }
}
function M(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    xe(e, t, r);
    return;
  }
  switch (t) {
    case `class`:
      j(e, r);
      break;
    case `style`:
      A(e, n, r);
      break;
    default:
      Ce(e, t, r);
  }
}
var N = Object.assign({ patchProp: M }, de),
  P = Symbol(`Text`),
  F = Symbol(`Fragment`);
function I(e) {
  return e.__v_isVnode;
}
function L(e, t) {
  return e.type === t.type && e.key === t.key;
}
function Te(e) {
  return e.nodeType === Node.TEXT_NODE;
}
var R = (function (e) {
  return (
    (e[(e.ELEMENT = 1)] = `ELEMENT`),
    (e[(e.FUNCTIONAL_COMPONENT = 2)] = `FUNCTIONAL_COMPONENT`),
    (e[(e.STATEFUL_COMPONENT = 4)] = `STATEFUL_COMPONENT`),
    (e[(e.TEXT_CHILDREN = 8)] = `TEXT_CHILDREN`),
    (e[(e.ARRAY_CHILDREN = 16)] = `ARRAY_CHILDREN`),
    (e[(e.SLOTS_CHILDREN = 32)] = `SLOTS_CHILDREN`),
    (e[(e.TELEPORT = 64)] = `TELEPORT`),
    (e[(e.SUSPENSE = 128)] = `SUSPENSE`),
    (e[(e.COMPONENT_SHOULD_KEEP_ALIVE = 256)] = `COMPONENT_SHOULD_KEEP_ALIVE`),
    (e[(e.COMPONENT_KEEP_ALIVE = 512)] = `COMPONENT_KEEP_ALIVE`),
    (e[(e.COMPONENT = 6)] = `COMPONENT`),
    e
  );
})({});
function z(e, t) {
  for (let n in t) e[n] = t[n];
  for (let n in e) n in t || delete e[n];
}
var Ee = (e, t) => {
    let n = Object.keys(t);
    if (Object.keys(t).length !== Object.keys(e).length) return !0;
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      if (t[i] !== e[i]) return !0;
    }
    return !1;
  },
  De = (e, t, n) => {
    if (!Ee(t, n)) return;
    let r = {},
      i = {},
      a = e.type.props || [];
    for (let e in n) (Array.isArray(a) ? a.includes(e) : e in a) ? (r[e] = n[e]) : (i[e] = n[e]);
    (z(e.props, r), z(e.attrs, i));
  },
  Oe = (e, t) => {
    let n = {},
      r = {},
      i = e.type.props || [];
    for (let e in t) Array.isArray(i) ? (n[e] = t[e]) : (r[e] = t[e]);
    ((e.props = n), (e.attrs = r));
  };
function ke(e, t, ...n) {
  let { props: r } = e,
    a = r[o(i(t))];
  typeof a == `function` && a(...n);
}
var B = [],
  V = !1,
  Ae = Promise.resolve();
function je() {
  V = !1;
  let e = B.slice();
  B.length = 0;
  for (let t of e) t();
}
function H(e) {
  (B.includes(e) || B.push(e), V || ((V = !0), Ae.then(je)));
}
function Me(e, t) {
  e.vnode.shapeFlag & R.SLOTS_CHILDREN && Ne(t) ? (e.slots = t) : (e.slots = {});
}
function Ne(e) {
  return typeof e != `object` || !e || Array.isArray(e) || I(e)
    ? !1
    : Object.values(e).every((e) => typeof e == `function` || e === void 0);
}
var U = null;
function Pe() {
  return U;
}
function W(e) {
  U = e;
}
var Fe = (e, t) => {
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
  return ((n.emit = ke.bind(null, n)), n);
};
function G(e) {
  e && e.forEach((e) => e());
}
var Ie = (e, t) => {
    e.isUnmounted ||
      (G(e.bum),
      (e.isUnmounted = !0),
      e.effect?.stop(),
      e.subTree && t.unmount(e.subTree),
      G(e.um));
  },
  Le = (t) => {
    (Oe(t, t.vnode.props), Me(t, t.vnode.children));
    let i = t.type;
    if (
      ((t.render = i.render ?? null),
      i.data && (t.data = g(i.data())),
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
      W(t);
      let a;
      try {
        a = i.setup(t.props, r);
      } finally {
        W(null);
      }
      n(a) ? (t.render = a) : e(a) && (t.setupState = E(a));
    }
    t.proxy = new Proxy(t, {
      get(e, t) {
        let { setupState: n, data: i, props: a, attrs: o, slots: s, emit: c } = e;
        if (typeof t != `symbol`) {
          if (r(n, t)) return n[t];
          if (r(i, t)) return i[t];
          if (r(a, t)) return a[t];
          if (t === `$emit`) return c;
          if (t === `$attrs`) return o;
          if (t === `$slots`) return s;
        }
      },
      set(e, t, n) {
        let { setupState: i, data: a, props: o } = e;
        return typeof t == `symbol`
          ? !0
          : r(i, t)
            ? ((i[t] = n), !0)
            : r(a, t)
              ? ((a[t] = n), !0)
              : (r(o, t) && console.warn(`props is readonly`), !0);
      },
    });
  },
  Re = (e, t, n, r, i) => {
    let a = () => {
        if (e.isMounted) {
          let t = e.subTree,
            a = e.render?.call(e.proxy, e.proxy);
          ((e.subTree = a), i.patch(t, a, n, r, e), G(e.u));
        } else {
          G(e.bm);
          let a = e.render?.call(e.proxy, e.proxy);
          ((e.subTree = a), i.patch(null, a, n, r, e), (t.el = a.el), (e.isMounted = !0), G(e.m));
        }
      },
      o,
      s = new u(a, () => {
        H(o);
      });
    ((e.effect = s),
      (o = e.update =
        () => {
          e.isUnmounted || s.run();
        }),
      o());
  },
  ze = (e, t, n, r, i) => {
    console.log(`[mountComponent]: `, e);
    let a = Fe(e, r);
    ((e.component = a), Le(a), Re(a, e, t, n, i));
  },
  Be = (e, t) => {
    let n = (t.component = e.component);
    if (!n) throw Error(`Component instance is missing`);
    let r = e.props ?? {},
      i = t.props ?? {};
    ((n.vnode = t), (t.el = e.el), De(n, r, i), n.update?.());
  },
  Ve = (e, t, n, r, i, a) => {
    (console.log(`[processComponent]`), e === null ? ze(t, n, r, i, a) : Be(e, t));
  },
  He = {
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
        d = K(t.props?.to, u);
      if (!d) {
        console.warn(`[Teleport]: target "${t.props?.to}" not found`);
        return;
      }
      if (e === null) {
        ((t.el = c(``)), l(t.el, n, r), a(t.children, d));
        return;
      }
      ((t.el = e.el),
        K(e.props?.to, u) === d
          ? o(e, t, d)
          : (Array.isArray(e.children) && s(e.children),
            Array.isArray(t.children) && a(t.children, d)));
    },
  };
function K(e, t) {
  return typeof e == `string` ? t(e) : e && typeof e == `object` ? e : null;
}
var Ue = (e) => !!(e && typeof e == `object` && e.__is_Teleport);
function q({ type: e, props: t, children: n }) {
  return J(e, t, n);
}
function J(r, i, a) {
  let o = t(r)
      ? R.ELEMENT
      : Ue(r)
        ? R.TELEPORT
        : e(r)
          ? R.STATEFUL_COMPONENT
          : n(r)
            ? R.FUNCTIONAL_COMPONENT
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
  return (We(s), s);
}
function We(t) {
  let { children: n } = t;
  if (n != null)
    if (Array.isArray(n)) {
      let e = [];
      (Y(n, e), (t.children = e), (t.shapeFlag |= R.ARRAY_CHILDREN));
    } else if (I(n)) {
      ((t.children = [n]), (t.shapeFlag |= R.ARRAY_CHILDREN));
      return;
    } else
      typeof n == `string` || typeof n == `number`
        ? ((t.children = String(n)), (t.shapeFlag |= R.TEXT_CHILDREN))
        : e(n) && t.shapeFlag & R.COMPONENT && (t.shapeFlag |= R.SLOTS_CHILDREN);
}
function Y(e, t) {
  for (let n of e) {
    if (Array.isArray(n)) {
      Y(n, t);
      continue;
    }
    if (!(n == null || typeof n == `boolean`)) {
      if (I(n)) {
        t.push(n);
        continue;
      }
      (typeof n == `string` || typeof n == `number`) && t.push(J(P, void 0, String(n)));
    }
  }
}
function Ge(e) {
  return {
    expose: () => {},
    setup(t, { attrs: n, slots: r }) {
      let i = C(!1),
        a = null;
      return (
        e()
          .then((e) => {
            ((a = e), (i.value = !0));
          })
          .catch((e) => {}),
        () =>
          !i.value || !a
            ? q({ type: `div`, children: `loading...` })
            : q({ type: a, props: { ...n, ...t }, children: r })
      );
    },
  };
}
var X = (function (e) {
  return (
    (e.BEFORE_MOUNT = `bm`),
    (e.MOUNTED = `m`),
    (e.BEFORE_UPDATE = `bu`),
    (e.UPDATED = `u`),
    (e.BEFORE_UNMOUNT = `bum`),
    (e.UNMOUNTED = `um`),
    e
  );
})({});
function Ke(e, t, n = Pe()) {
  if (!n) {
    console.warn(`Lifecycle hooks can only be registered during setup()`);
    return;
  }
  n[e].push(t);
}
function Z(e) {
  return (t) => {
    Ke(e, t);
  };
}
var qe = Z(X.BEFORE_UNMOUNT),
  Je = Z(X.UNMOUNTED),
  Ye = Z(X.BEFORE_MOUNT),
  Xe = Z(X.MOUNTED),
  Ze = Z(X.BEFORE_UPDATE),
  Qe = Z(X.UPDATED);
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
    d = (e, t, n, i) => {
      console.log(`TODO: diff`, e, t);
      let a = 0,
        o = e.length - 1,
        s = t.length - 1;
      for (; a <= o && a <= s;) {
        let r = e[a],
          o = t[a];
        if (L(r, o)) b(r, o, n, null, i);
        else break;
        a++;
      }
      for (console.log(`[diff]: `, a, o, s); a <= o && a <= s;) {
        let r = e[o],
          a = t[s];
        if (L(r, a)) b(r, a, n, null, i);
        else break;
        (o--, s--);
      }
      if ((console.log(`[diff]: `, a, o, s), a > o)) {
        if (a <= s) {
          let e = t[s + 1]?.el ?? null;
          for (; a <= s;) (b(null, t[a], n, e, i), a++);
        }
      } else if (a > s) for (; a <= o;) (x(e[a]), a++);
      else {
        let c = a,
          l = a,
          u = new Map();
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
      console.log(`[mountChildren]: `, e, t, `mount`);
      for (let r of e) b(null, r, t, null, n);
    },
    p = (e, n, i, o) => {
      let { type: s, props: c, children: u, shapeFlag: d } = e,
        p = (e.el = t(s));
      if (c) for (let e in c) l(p, e, null, c[e]);
      (d & R.TEXT_CHILDREN ? a(p, u) : d & R.ARRAY_CHILDREN && f(u, p, o), r(p, n, i));
    },
    m = (e) => {
      e.forEach((e) => {
        x(e);
      });
    },
    h = (e, t, n, r, i) => {
      (console.log(`[processElement]:`, e, t, n, `patch`), e === null ? p(t, n, r, i) : g(e, t, i));
    },
    g = (e, t, n) => {
      let r = (t.el = e.el);
      r && (we(r, e.props || {}, t.props || {}), _(e, t, r, n));
    },
    _ = (e, t, n, r) => {
      console.log(`[patchChildren]: `, e, t, `patchChildren`);
      let i = e.children,
        o = t.children,
        s = e.shapeFlag,
        c = t.shapeFlag;
      c & R.TEXT_CHILDREN
        ? (s & R.ARRAY_CHILDREN && m(i), i !== o && a(n, o))
        : c & R.ARRAY_CHILDREN
          ? s & R.TEXT_CHILDREN
            ? (a(n, ``), f(o, n, r))
            : s & R.ARRAY_CHILDREN && d(i, o, n, r)
          : s & R.TEXT_CHILDREN
            ? a(n, ``)
            : s & R.ARRAY_CHILDREN && m(i);
    },
    v = (e, t, i) => {
      if (e === null) {
        let e = (t.el = n(t.children));
        r(e, i);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && Te(n) && o(n, t.children);
      }
    },
    y = (e, t, n, r) => {
      e === null ? t.children && f(t.children, n, r) : _(e, t, n, r);
    },
    b = (e, t, i, a = null, o = null) => {
      if (e === t) return;
      e !== null && (L(e, t) || (console.log(`[patch<VNode>]`, e, t, `unmount`), x(e), (e = null)));
      let { type: s, shapeFlag: c } = t;
      switch (s) {
        case P:
          v(e, t, i);
          break;
        case F:
          y(e, t, i, o);
          break;
        default:
          c & R.ELEMENT
            ? h(e, t, i, a, o)
            : c & R.COMPONENT
              ? (console.log(`[patch]: component`), Ve(e, t, i, a, o, C))
              : c & R.TELEPORT &&
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
      if (e.shapeFlag & R.COMPONENT) {
        e.component && Ie(e.component, C);
        return;
      }
      if (e.type === F) {
        e.children && m(e.children);
        return;
      }
      (e.shapeFlag & R.TELEPORT && Array.isArray(e.children) && m(e.children),
        e.shapeFlag & R.ELEMENT &&
          e.shapeFlag & R.ARRAY_CHILDREN &&
          Array.isArray(e.children) &&
          m(e.children),
        (e.el &&= (i(e.el), null)));
    },
    S = (e, t) => {
      if (e === null) {
        (t._vnode && x(t._vnode), (t._vnode = null));
        return;
      }
      (b(t._vnode || null, e, t), (t._vnode = e));
    },
    C = { patch: b, unmount: x };
  return { render: S };
}
var { render: $e } = Q(N);
function $(e) {
  if (e == null) return ``;
  if (typeof e == `string`) return e;
  if (typeof e == `object`)
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  return String(e);
}
function et(e) {
  return J(P, void 0, $(e));
}
function tt(e, t) {
  let n = [];
  if (Array.isArray(e) || typeof e == `string`) {
    for (let r = 0; r < e.length; r++) n.push(t(e[r], r));
    return n;
  }
  return n;
}
((exports.Fragment = F),
  (exports.Teleport = He),
  (exports.Text = P),
  (exports.computed = oe),
  (exports.createRenderer = Q),
  (exports.createTextVNode = et),
  (exports.defineAsyncComponent = Ge),
  (exports.effect = s),
  (exports.h = q),
  (exports.isRef = w),
  (exports.onBeforeMount = Ye),
  (exports.onBeforeUnmount = qe),
  (exports.onBeforeUpdate = Ze),
  (exports.onMounted = Xe),
  (exports.onUnmounted = Je),
  (exports.onUpdated = Qe),
  (exports.proxyRefs = E),
  (exports.reactive = g),
  (exports.ref = C),
  (exports.render = $e),
  (exports.renderList = tt),
  (exports.renderOptions = N),
  (exports.toDisplayString = $),
  (exports.toRef = ie),
  (exports.toRefs = ae),
  (exports.watch = le));
