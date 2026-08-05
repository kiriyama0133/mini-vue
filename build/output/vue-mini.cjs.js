Object.defineProperty(exports, Symbol.toStringTag, { value: `Module` });
function e(e) {
  return typeof e == `object` && !!e;
}
function t(e) {
  return typeof e == `string`;
}
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
  o = new WeakMap(),
  s = new WeakMap(),
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
  l = (function (e) {
    return (
      (e.IS_REACTIVE = `__v_isReactive`),
      (e.IS_READONLY = `__v_isReadonly`),
      (e.RAW = `__v_raw`),
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
  n || s.set(e, (n = new Map()));
  let i = n.get(t);
  (i || n.set(t, (i = new Set())), p(i));
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
  if ((console.log(`[trigger]`, t, r), !r)) return;
  let i = new Set(r);
  (console.log(`[execute]`, i), g(r));
}
function g(e) {
  new Set(e).forEach((e) => {
    e !== r && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function _(t) {
  return e(t) ? m(t) : t;
}
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
    ((this.rawValue = e), (this._value = _(e)), S(this));
  }
};
function x(e) {
  r && ((e.dep ||= new Set()), p(e.dep));
}
function S(e) {
  e.dep && g(e.dep);
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
function T(e, t) {
  return new w(e, t);
}
function E(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new w(e, r);
  }
  return t;
}
function D(e) {
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
var O = (function (e) {
  return ((e[(e.Dirty = 4)] = `Dirty`), (e[(e.NoDirty = 0)] = `NoDirty`), e);
})({});
function ee(e) {
  return typeof e == `function` ? new k(e, void 0) : new k(e.get, e.set);
}
var k = class {
  getter;
  setter;
  __v_isRef = !0;
  dep;
  dirtyLevel = O.Dirty;
  _value;
  effect;
  constructor(e, t) {
    ((this.getter = e),
      (this.setter = t),
      (this.effect = new a(this.getter, () => {
        ((this.dirtyLevel = O.Dirty), j(this));
      })));
  }
  set dirty(e) {
    this.dirtyLevel = e ? O.Dirty : O.NoDirty;
  }
  get dirty() {
    return this.dirtyLevel === O.Dirty;
  }
  get value() {
    return (
      A(this),
      this.dirtyLevel === O.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = O.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn(`computed ref is readonly`);
  }
};
function A(e) {
  r && ((e.dep ||= new Set()), p(e.dep));
}
function j(e) {
  e.dep && g(e.dep);
}
function M(e, t, n) {
  te(e, t, n);
}
function te(e, t, n) {
  let r = (e) => N(e, n?.deep ? 1 : void 0),
    i;
  i = C(e) ? () => e.value : u(e) ? () => r(e) : () => e;
  let o,
    s = () => {
      let e = c.run();
      (t(e, o), (o = e));
    };
  n?.immediate && s();
  let c = new a(i, s);
  o = c.run();
}
function N(e, t, n = 0, r = new Set()) {
  if (typeof e != `object` || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) N(e[i], t, n + 1, r);
  return e;
}
var ne = {
  createElement: re,
  createText: ie,
  insert: ae,
  remove: oe,
  setElementText: P,
  setText: F,
  parentNode: I,
  nextSibling: L,
};
function re(e) {
  return document.createElement(e);
}
function ie(e) {
  return document.createTextNode(e);
}
function ae(e, t, n) {
  t.insertBefore(e, n || null);
}
function oe(e) {
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
function B(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = ``;
}
function V(e, t) {
  e.className = t || ``;
}
function H(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
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
    case `class`:
      V(e, r);
      break;
    case `style`:
      B(e, n, r);
      break;
    default:
      H(e, t, r);
  }
}
var G = Object.assign({ patchProp: W }, ne);
function K(e, t) {
  return e.type === t.type && e.key === t.key;
}
function se(e) {
  return e.nodeType === Node.TEXT_NODE;
}
var q = (function (e) {
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
  J = [],
  Y = !1,
  ce = Promise.resolve();
function le() {
  Y = !1;
  let e = J.slice();
  J.length = 0;
  for (let t of e) t();
}
function ue(e) {
  (J.includes(e) || J.push(e), Y || ((Y = !0), ce.then(le)));
}
function de({ type: e, props: t, children: n }) {
  return fe(e, t, n);
}
function fe(n, r, i) {
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
  return (X(o), o);
}
function X(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= q.ARRAY_CHILDREN)
      : typeof n == `string` || typeof n == `number`
        ? ((t.children = String(n)), (t.shapeFlag |= q.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= q.SLOTS_CHILDREN));
}
var Z = Symbol(`Text`),
  Q = Symbol(`Fragnment`);
function $(e) {
  let {
      createElement: t,
      createText: n,
      insert: r,
      remove: i,
      setElementText: o,
      setText: s,
      parentNode: c,
      nextSibling: l,
      patchProp: u,
    } = e,
    f = (e, t, n) => {
      console.log(`TODO: diff`, e, t);
      let i = 0,
        a = e.length - 1,
        o = t.length - 1;
      for (; i <= a && i <= o;) {
        let r = e[i],
          a = t[i];
        if (K(r, a)) D(r, a, n);
        else break;
        i++;
      }
      for (console.log(`[diff]: `, i, a, o); i <= a && i <= o;) {
        let r = e[a],
          i = t[o];
        if (K(r, i)) D(r, i, n);
        else break;
        (a--, o--);
      }
      if ((console.log(`[diff]: `, i, a, o), i > a)) {
        if (i <= o) {
          let e = t[o + 1]?.el ?? null;
          for (; i <= o;) (D(null, t[i], n, e), i++);
        }
      } else if (i > o) for (; i <= a;) (O(e[i]), i++);
      else {
        let s = i,
          c = i,
          l = new Map();
        for (let e = c; e <= o; e++) {
          let n = t[e];
          l.set(n.key, e);
        }
        for (let r = s; r <= a; r++) {
          let i = e[r],
            a = l.get(i.key);
          a == null ? O(i) : D(i, t[a], n);
        }
        let u = o - c + 1;
        for (let e = u - 1; e >= 0; e--) {
          let i = c + e,
            a = i + 1 < t.length ? t[i + 1].el : null,
            o = t[i];
          o.el ? r(o.el, n, a) : D(null, o, n, a);
        }
      }
    },
    p = (e, t) => {
      console.log(`[mountChildren]: `, e, t, `mount`);
      for (let n of e) D(null, n, t);
    },
    m = (e, n, i) => {
      let { type: a, props: s, children: c, shapeFlag: l } = e,
        d = (e.el = t(a));
      if (s) for (let e in s) u(d, e, null, s[e]);
      (l & q.TEXT_CHILDREN ? o(d, c) : l & q.ARRAY_CHILDREN && p(c, d), r(d, n, i));
    },
    h = (e) => {
      e.forEach((e) => {
        O(e);
      });
    },
    g = (e, t, n, r) => {
      (console.log(`[processElement]:`, e, t, n, `patch`), e === null ? m(t, n, r) : _(e, t));
    },
    _ = (e, t) => {
      let n = (t.el = e.el);
      n && (U(n, e.props || {}, t.props || {}), v(e, t, n));
    },
    v = (e, t, n) => {
      console.log(`[patchChildren]: `, e, t, `patchChildren`);
      let r = e.children,
        i = t.children,
        a = e.shapeFlag,
        s = t.shapeFlag;
      s & q.TEXT_CHILDREN
        ? (a & q.ARRAY_CHILDREN && h(r), r !== i && o(n, i))
        : s & q.ARRAY_CHILDREN
          ? a & q.TEXT_CHILDREN
            ? (o(n, ``), p(i, n))
            : a & q.ARRAY_CHILDREN && f(r, i, n)
          : a & q.TEXT_CHILDREN
            ? o(n, ``)
            : a & q.ARRAY_CHILDREN && h(r);
    },
    y = (e, t, i) => {
      if (e === null) {
        let e = (t.el = n(t.children));
        r(e, i);
      } else {
        let n = (t.el = e.el);
        t.children !== e.children && n && se(n) && s(n, t.children);
      }
    },
    b = (e) => ({
      vnode: e,
      data: {},
      attrs: {},
      proxy: null,
      update: null,
      props: e.props || {},
      type: e.type,
      setupState: {},
      render: null,
      subTree: null,
      isMounted: !1,
    }),
    x = (e, t) => {
      let n = {},
        r = {},
        i = e.type.props || [];
      for (let e in t) Array.isArray(i) && i.includes(e) ? (n[e] = t[e]) : (r[e] = t[e]);
      ((e.props = n), (e.attrs = r));
    },
    S = (e) => {
      x(e, e.vnode.props);
      let t = e.type;
      ((e.render = t.render ?? null),
        t.data && (e.data = d(t.data())),
        (e.proxy = new Proxy(e, {
          get(e, t) {
            if (typeof t != `symbol`) {
              if (t in e.props) return e.props[t];
              if (t in e.data) return e.data[t];
              if (t === `$attrs`) return e.attrs;
            }
          },
          set(e, t, n) {
            return typeof t == `symbol`
              ? !1
              : t in e.data
                ? ((e.data[t] = n), !0)
                : t in e.props
                  ? (console.warn(`props is readonly`), !1)
                  : !0;
          },
        })),
        (e.render = t.render ?? null));
    },
    C = (e, t, n = null) => {
      console.log(`[mountComponent]: `, e);
      let r = b(e);
      (S(r), w(r, e, t, n));
    },
    w = (e, t, n, r = null) => {
      let i = () => {
          if (e.isMounted) {
            let t = e.subTree,
              i = e.render?.call(e.data, e.data);
            ((e.subTree = i), D(t, i, n, r));
          } else {
            let i = e.render?.call(e.proxy, e.proxy);
            ((e.subTree = i), D(null, i, n, r), (t.el = i.el), (e.isMounted = !0));
          }
        },
        o,
        s = new a(i, () => {
          ue(o);
        });
      ((o = e.update = () => s.run()), o());
    },
    T = (e, t, n, r = null) => {
      (console.log(`[processComponent]`), e === null && C(t, n, r));
    },
    E = (e, t, n) => {
      e === null ? t.children && p(t.children, n) : v(e, t, n);
    },
    D = (e, t, n, r = null) => {
      if (e === t) return;
      e !== null && (K(e, t) || (console.log(`[patch<VNode>]`, e, t, `unmount`), O(e), (e = null)));
      let { type: i, shapeFlag: a } = t;
      switch (i) {
        case Z:
          y(e, t, n);
          break;
        case Q:
          E(e, t, n);
          break;
        default:
          a & q.ELEMENT
            ? g(e, t, n, r)
            : a & q.COMPONENT && (console.log(`[patch]: component`), T(e, t, n, r));
          break;
      }
    },
    O = (e) => {
      if (e.type === Q) {
        e.children && h(e.children);
        return;
      }
      e.el &&= (i(e.el), null);
    };
  return {
    render: (e, t) => {
      (e === null && t._vnode && O(t._vnode), D(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
var { render: pe } = $(G);
((exports.Fragment = Q),
  (exports.Text = Z),
  (exports.computed = ee),
  (exports.createRenderer = $),
  (exports.effect = n),
  (exports.h = de),
  (exports.isRef = C),
  (exports.proxyRefs = D),
  (exports.reactive = d),
  (exports.ref = v),
  (exports.render = pe),
  (exports.renderOptions = G),
  (exports.toRef = T),
  (exports.toRefs = E),
  (exports.watch = M));
