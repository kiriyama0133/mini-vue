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
    return (ee(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = _(e)), x(this));
  }
};
function ee(e) {
  r && ((e.dep ||= new Set()), p(e.dep));
}
function x(e) {
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
function te(e, t) {
  return new C(e, t);
}
function w(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new C(e, r);
  }
  return t;
}
function T(e) {
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
var E = (function (e) {
  return ((e[(e.Dirty = 4)] = `Dirty`), (e[(e.NoDirty = 0)] = `NoDirty`), e);
})({});
function D(e) {
  return typeof e == `function` ? new O(e, void 0) : new O(e.get, e.set);
}
var O = class {
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
      (this.effect = new a(this.getter, () => {
        ((this.dirtyLevel = E.Dirty), A(this));
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
      k(this),
      this.dirtyLevel === E.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = E.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn(`computed ref is readonly`);
  }
};
function k(e) {
  r && ((e.dep ||= new Set()), p(e.dep));
}
function A(e) {
  e.dep && g(e.dep);
}
function j(e, t, n) {
  M(e, t, n);
}
function M(e, t, n) {
  let r = (e) => N(e, n?.deep ? 1 : void 0),
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
function N(e, t, n = 0, r = new Set()) {
  if (typeof e != `object` || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) N(e[i], t, n + 1, r);
  return e;
}
var P = {
  createElement: F,
  createText: I,
  insert: L,
  remove: R,
  setElementText: z,
  setText: B,
  parentNode: V,
  nextSibling: H,
};
function F(e) {
  return document.createElement(e);
}
function I(e) {
  return document.createTextNode(e);
}
function L(e, t, n) {
  t.insertBefore(e, n || null);
}
function R(e) {
  let t = e.parentNode;
  t && t.removeChild(e);
}
function z(e, t) {
  e.textContent = t;
}
function B(e, t) {
  e.nodeValue = t;
}
function V(e) {
  return e.parentNode;
}
function H(e) {
  return e.nextSibling;
}
function U(e, t, n) {
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
      a = (r[t] = W(n));
    e.addEventListener(i, a);
  }
}
function W(e) {
  let t = (e) => {
    t.value(e);
  };
  return ((t.value = e), t);
}
function G(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = ``;
}
function K(e, t) {
  e.className = t || ``;
}
function q(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function J(e, t, n) {
  for (let r in n) {
    let i = t[r],
      a = n[r];
    i !== a && Y(e, r, i, a);
  }
  for (let r in t)
    if (!(r in n)) {
      let n = t[r];
      Y(e, r, n, null);
    }
}
function Y(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    U(e, t, r);
    return;
  }
  switch (t) {
    case `class`:
      K(e, r);
      break;
    case `style`:
      G(e, n, r);
      break;
    default:
      q(e, t, r);
  }
}
var X = Object.assign({ patchProp: Y }, P);
function Z(e, t) {
  return e.type === t.type && e.key === t.key;
}
var Q = (function (e) {
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
function ne({ type: e, props: t, children: n }) {
  return re(e, t, n);
}
function re(e, n, r) {
  let i = t(e) ? Q.ELEMENT : 0,
    a = {
      __v_isVnode: !0,
      type: e,
      props: n || null,
      children: r || null,
      key: n?.key,
      el: null,
      shapeFlag: i,
    };
  return (ie(a), a);
}
function ie(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= Q.ARRAY_CHILDREN)
      : typeof n == `string` || typeof n == `number`
        ? ((t.children = String(n)), (t.shapeFlag |= Q.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= Q.SLOTS_CHILDREN));
}
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
      console.log(`TODO: diff`, e, t);
    },
    d = (e, t) => {
      console.log(`[mountChildren]: `, e, t, `mount`);
      for (let n of e) _(null, n, t);
    },
    f = (e, n) => {
      let { type: i, props: o, children: s, shapeFlag: c } = e,
        u = (e.el = t(i));
      if (o) for (let e in o) l(u, e, null, o[e]);
      (c & Q.TEXT_CHILDREN ? a(u, s) : c & Q.ARRAY_CHILDREN && d(s, u), r(u, n));
    },
    p = (e) => {
      e.forEach((e) => {
        v(e);
      });
    },
    m = (e, t, n) => {
      (console.log(`[processElement]:`, e, t, n, `patch`), e === null ? f(t, n) : h(e, t));
    },
    h = (e, t) => {
      let n = (t.el = e.el);
      n && (J(n, e.props || {}, t.props || {}), g(e, t, n));
    },
    g = (e, t, n) => {
      console.log(`[patchChildren]: `, e, t, `patchChildren`);
      let r = e.children,
        i = t.children,
        o = e.shapeFlag,
        s = t.shapeFlag;
      s & Q.TEXT_CHILDREN
        ? (o & Q.ARRAY_CHILDREN && p(r), r !== i && a(n, i))
        : s & Q.ARRAY_CHILDREN
          ? o & Q.TEXT_CHILDREN
            ? (a(n, ``), d(i, n))
            : o & Q.ARRAY_CHILDREN && u(r, i, n)
          : o & Q.TEXT_CHILDREN
            ? a(n, ``)
            : o & Q.ARRAY_CHILDREN && p(r);
    },
    _ = (e, t, n) => {
      e !== t &&
        (e !== null &&
          (Z(e, t) || (console.log(`[patch<VNode>]`, e, t, `unmount`), v(e), (e = null))),
        m(e, t, n));
    },
    v = (e) => {
      e.el &&= (i(e.el), null);
    };
  return {
    render: (e, t) => {
      (e === null && t._vnode && v(t._vnode), _(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
var { render: ae } = $(X);
((exports.computed = D),
  (exports.createRenderer = $),
  (exports.effect = n),
  (exports.h = ne),
  (exports.isRef = S),
  (exports.proxyRefs = T),
  (exports.reactive = d),
  (exports.ref = v),
  (exports.render = ae),
  (exports.renderOptions = X),
  (exports.toRef = te),
  (exports.toRefs = w),
  (exports.watch = j));
