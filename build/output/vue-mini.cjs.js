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
  setText: A,
  parentNode: j,
  nextSibling: M,
  querySelector: N,
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
function A(e, t) {
  e.nodeValue = t;
}
function j(e) {
  return e.parentNode;
}
function M(e) {
  return e.nextSibling;
}
function N(e) {
  return document.querySelector(e);
}
function P(e, t, n) {
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
      a = (r[t] = F(n));
    e.addEventListener(i, a);
  }
}
function F(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
function I(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = ``;
}
function L(e, t) {
  e.className = t || ``;
}
function _e(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function ve(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && R(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      R(e, r, n, null);
    }
}
function R(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    P(e, t, r);
    return;
  }
  switch (t) {
    case `class`:
      L(e, r);
      break;
    case `style`:
      I(e, n, r);
      break;
    default:
      _e(e, t, r);
  }
}
var z = Object.assign({ patchProp: R }, de);
function ye(e) {
  return e.__v_isVnode;
}
function B(e, t) {
  return e.type === t.type && e.key === t.key;
}
function be(e) {
  return e.nodeType === Node.TEXT_NODE;
}
var V = (function (e) {
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
  })({}),
  xe = (e, t) => {
    let n = Object.keys(t);
    if (Object.keys(t).length !== Object.keys(e).length) return !0;
    for (let r = 0; r < n.length; r++) {
      let i = n[r];
      if (t[i] !== e[i]) return !0;
    }
    return !1;
  },
  Se = (e, t, n) => {
    if (xe(t, n)) {
      for (let t in e.props) e.props[t] = n[t];
      for (let t in e.props) t in n || delete e.props[t];
    }
  },
  Ce = (e, t) => {
    let n = {},
      r = {},
      i = e.type.props || [];
    for (let e in t) Array.isArray(i) && i.includes(e) ? (n[e] = t[e]) : (r[e] = t[e]);
    ((e.props = n), (e.attrs = r));
  };
function we(e, t, ...n) {
  let { props: r } = e,
    a = r[o(i(t))];
  typeof a == `function` && a(...n);
}
var H = [],
  U = !1,
  Te = Promise.resolve();
function Ee() {
  U = !1;
  let e = H.slice();
  H.length = 0;
  for (let t of e) t();
}
function De(e) {
  (H.includes(e) || H.push(e), U || ((U = !0), Te.then(Ee)));
}
function Oe(e, t) {
  e.vnode.shapeFlag & V.SLOTS_CHILDREN && ke(t) ? (e.slots = t) : (e.slots = {});
}
function ke(e) {
  return typeof e != `object` || !e || Array.isArray(e) || ye(e)
    ? !1
    : Object.values(e).every((e) => typeof e == `function` || e === void 0);
}
var W = null;
function Ae() {
  return W;
}
function G(e) {
  W = e;
}
var je = (e, t) => {
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
  return ((n.emit = we.bind(null, n)), n);
};
function K(e) {
  e && e.forEach((e) => e());
}
var Me = (e, t) => {
    e.isUnmounted ||
      (K(e.bum),
      (e.isUnmounted = !0),
      e.effect?.stop(),
      e.subTree && t.unmount(e.subTree),
      K(e.um));
  },
  Ne = (t) => {
    (Ce(t, t.vnode.props), Oe(t, t.vnode.children));
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
      G(t);
      let a;
      try {
        a = i.setup(t.props, r);
      } finally {
        G(null);
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
  Pe = (e, t, n, r, i) => {
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
        De(o);
      });
    ((e.effect = s),
      (o = e.update =
        () => {
          e.isUnmounted || s.run();
        }),
      o());
  },
  Fe = (e, t, n, r, i) => {
    console.log(`[mountComponent]: `, e);
    let a = je(e, r);
    ((e.component = a), Ne(a), Pe(a, e, t, n, i));
  },
  Ie = (e, t) => {
    let n = (t.component = e.component);
    if (!n) throw Error(`Component instance is missing`);
    let r = e.props ?? {},
      i = t.props ?? {};
    ((n.vnode = t), (t.el = e.el), Se(n, r, i), n.update?.());
  },
  Le = (e, t, n, r, i, a) => {
    (console.log(`[processComponent]`), e === null ? Fe(t, n, r, i, a) : Ie(e, t));
  },
  Re = {
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
        ((t.el = c(``)), l(t.el, n, r), a(t.children, d));
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
  return typeof e == `string` ? t(e) : e && typeof e == `object` ? e : null;
}
var ze = (e) => !!(e && typeof e == `object` && e.__is_Teleport);
function Be({ type: e, props: t, children: n }) {
  return Ve(e, t, n);
}
function Ve(r, i, a) {
  let o = t(r)
      ? V.ELEMENT
      : ze(r)
        ? V.TELEPORT
        : e(r)
          ? V.STATEFUL_COMPONENT
          : n(r)
            ? V.FUNCTIONAL_COMPONENT
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
  return (He(s), s);
}
function He(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= V.ARRAY_CHILDREN)
      : typeof n == `string` || typeof n == `number`
        ? ((t.children = String(n)), (t.shapeFlag |= V.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= V.SLOTS_CHILDREN));
}
var J = (function (e) {
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
function Ue(e, t, n = Ae()) {
  if (!n) {
    console.warn(`Lifecycle hooks can only be registered during setup()`);
    return;
  }
  n[e].push(t);
}
function Y(e) {
  return (t) => {
    Ue(e, t);
  };
}
var We = Y(J.BEFORE_UNMOUNT),
  Ge = Y(J.UNMOUNTED),
  Ke = Y(J.BEFORE_MOUNT),
  qe = Y(J.MOUNTED),
  X = Y(J.BEFORE_UPDATE),
  Je = Y(J.UPDATED),
  Z = Symbol(`Text`),
  Q = Symbol(`Fragnment`);
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
      console.log(`TODO: diff`, e, t);
      let a = 0,
        o = e.length - 1,
        s = t.length - 1;
      for (; a <= o && a <= s;) {
        let r = e[a],
          o = t[a];
        if (B(r, o)) b(r, o, n, null, i);
        else break;
        a++;
      }
      for (console.log(`[diff]: `, a, o, s); a <= o && a <= s;) {
        let r = e[o],
          a = t[s];
        if (B(r, a)) b(r, a, n, null, i);
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
      (d & V.TEXT_CHILDREN ? a(p, u) : d & V.ARRAY_CHILDREN && f(u, p, o), r(p, n, i));
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
      r && (ve(r, e.props || {}, t.props || {}), _(e, t, r, n));
    },
    _ = (e, t, n, r) => {
      console.log(`[patchChildren]: `, e, t, `patchChildren`);
      let i = e.children,
        o = t.children,
        s = e.shapeFlag,
        c = t.shapeFlag;
      c & V.TEXT_CHILDREN
        ? (s & V.ARRAY_CHILDREN && m(i), i !== o && a(n, o))
        : c & V.ARRAY_CHILDREN
          ? s & V.TEXT_CHILDREN
            ? (a(n, ``), f(o, n, r))
            : s & V.ARRAY_CHILDREN && d(i, o, n, r)
          : s & V.TEXT_CHILDREN
            ? a(n, ``)
            : s & V.ARRAY_CHILDREN && m(i);
    },
    v = (e, t, i) => {
      if (e === null) {
        let e = (t.el = n(t.children));
        r(e, i);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && be(n) && o(n, t.children);
      }
    },
    y = (e, t, n, r) => {
      e === null ? t.children && f(t.children, n, r) : _(e, t, n, r);
    },
    b = (e, t, i, a = null, o = null) => {
      if (e === t) return;
      e !== null && (B(e, t) || (console.log(`[patch<VNode>]`, e, t, `unmount`), x(e), (e = null)));
      let { type: s, shapeFlag: c } = t;
      switch (s) {
        case Z:
          v(e, t, i);
          break;
        case Q:
          y(e, t, i, o);
          break;
        default:
          c & V.ELEMENT
            ? h(e, t, i, a, o)
            : c & V.COMPONENT
              ? (console.log(`[patch]: component`), Le(e, t, i, a, o, C))
              : c & V.TELEPORT &&
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
      if (e.shapeFlag & V.COMPONENT) {
        e.component && Me(e.component, C);
        return;
      }
      if (e.type === Q) {
        e.children && m(e.children);
        return;
      }
      (e.shapeFlag & V.TELEPORT && Array.isArray(e.children) && m(e.children),
        e.shapeFlag & V.ELEMENT &&
          e.shapeFlag & V.ARRAY_CHILDREN &&
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
var { render: Ye } = $(z);
((exports.Fragment = Q),
  (exports.Teleport = Re),
  (exports.Text = Z),
  (exports.computed = oe),
  (exports.createRenderer = $),
  (exports.effect = s),
  (exports.h = Be),
  (exports.isRef = w),
  (exports.onBeforeMount = Ke),
  (exports.onBeforeUnmount = We),
  (exports.onBeforeUpdate = X),
  (exports.onMounted = qe),
  (exports.onUnmounted = Ge),
  (exports.onUpdated = Je),
  (exports.proxyRefs = E),
  (exports.reactive = g),
  (exports.ref = C),
  (exports.render = Ye),
  (exports.renderOptions = z),
  (exports.toRef = ie),
  (exports.toRefs = ae),
  (exports.watch = le));
