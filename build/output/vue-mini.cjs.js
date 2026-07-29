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
function k(e) {
  return typeof e == `function` ? new A(e, void 0) : new A(e.get, e.set);
}
var A = class {
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
        ((this.dirtyLevel = O.Dirty), M(this));
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
      j(this),
      this.dirtyLevel === O.Dirty &&
        ((this._value = this.effect.run()), (this.dirtyLevel = O.NoDirty)),
      this._value
    );
  }
  set value(e) {
    this.setter ? this.setter?.call(this, e) : console.warn(`computed ref is readonly`);
  }
};
function j(e) {
  r && ((e.dep ||= new Set()), p(e.dep));
}
function M(e) {
  e.dep && g(e.dep);
}
function N(e, t, n) {
  P(e, t, n);
}
function P(e, t, n) {
  let r = (e) => F(e, n?.deep ? 1 : void 0),
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
function F(e, t, n = 0, r = new Set()) {
  if (typeof e != `object` || !e || (t !== void 0 && n >= t) || r.has(e)) return e;
  r.add(e);
  for (let i in e) F(e[i], t, n + 1, r);
  return e;
}
var I = {
  createElement: L,
  createText: R,
  insert: z,
  remove: ee,
  setElementText: B,
  setText: V,
  parentNode: H,
  nextSibling: U,
};
function L(e) {
  return document.createElement(e);
}
function R(e) {
  return document.createTextNode(e);
}
function z(e, t, n) {
  t.insertBefore(e, n || null);
}
function ee(e) {
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
function K(e, t, n) {
  let r = e.style;
  if (n) for (let e in n) r[e] = n[e];
  if (t) for (let e in t) r[e] = ``;
}
function q(e, t) {
  e.className = t || ``;
}
function J(e, t, n) {
  n == null ? e.removeAttribute(t) : e.setAttribute(t, n);
}
function Y(e, t, n, r) {
  if (/^on[^a-z]/.test(t)) {
    W(e, t, r);
    return;
  }
  switch (t) {
    case `class`:
      q(e, r);
      break;
    case `style`:
      K(e, n, r);
      break;
    default:
      J(e, t, r);
  }
}
var X = Object.assign({ patchProp: Y }, I),
  Z = (function (e) {
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
function Q({ type: e, props: t, children: n }) {
  return $(e, t, n);
}
function $(e, n, r) {
  let i = t(e) ? Z.ELEMENT : 0,
    a = {
      __v_isVnode: !0,
      type: e,
      props: n || null,
      children: r || null,
      key: n?.key,
      el: null,
      shapeFlag: i,
    };
  return (te(a), a);
}
function te(t) {
  let { children: n } = t;
  n != null &&
    (Array.isArray(n)
      ? (t.shapeFlag |= Z.ARRAY_CHILDREN)
      : typeof n == `string` || typeof n == `number`
        ? ((t.children = String(n)), (t.shapeFlag |= Z.TEXT_CHILDREN))
        : e(n) && (t.shapeFlag |= Z.SLOTS_CHILDREN));
}
function ne(e) {
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
    u = (e, t) => {
      if (Array.isArray(e)) for (let n of e) d(n, t);
    },
    d = (e, n) => {
      let { type: i, props: o, children: s, shapeFlag: c } = e,
        d = t(i);
      if ((r(d, n), o)) for (let e in o) l(d, e, null, o[e]);
      (c & Z.TEXT_CHILDREN ? a(d, s) : c & Z.ARRAY_CHILDREN && u(s, d),
        console.log(`[mountElement<VNode>]`, e));
    },
    f = (e, t, n) => {
      e != t && e === null && d(t, n);
    };
  return {
    render: (e, t) => {
      (f(t._vnode || null, e, t), (t._vnode = e));
    },
  };
}
((exports.computed = k),
  (exports.createRenderer = ne),
  (exports.effect = n),
  (exports.h = Q),
  (exports.isRef = C),
  (exports.proxyRefs = D),
  (exports.reactive = d),
  (exports.ref = v),
  (exports.renderOptions = X),
  (exports.toRef = T),
  (exports.toRefs = E),
  (exports.watch = N));
