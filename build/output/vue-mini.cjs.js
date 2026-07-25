Object.defineProperty(exports, Symbol.toStringTag, { value: `Module` });
function e(e) {
  return typeof e == `object` && !!e;
}
function t(e, t) {
  let n = new i(e, () => {
    n.run();
  });
  return (n.run(), n);
}
var n = void 0;
function r(e) {
  let t = e.deps;
  (t.forEach((t) => t.delete(e)), (t.length = 0));
}
var i = class {
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
      r(this);
      let e = n;
      try {
        return (this.running++, (n = this), this.fn());
      } finally {
        (this.running--, (n = e));
      }
    }
    stop() {
      this.active &&= (r(this), !1);
    }
  },
  a = new WeakMap(),
  o = new WeakMap(),
  s = {
    get(t, n, r) {
      if (n === c.IS_REACTIVE) return !0;
      if (n === c.IS_READONLY) return !1;
      if (n === c.RAW) return t;
      u(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = f(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !1;
      let i = Reflect.set(e, t, n, r);
      return (i && p(e, t), i);
    },
  },
  c = (function (e) {
    return (
      (e.IS_REACTIVE = `__v_isReactive`),
      (e.IS_READONLY = `__v_isReadonly`),
      (e.RAW = `__v_raw`),
      e
    );
  })({});
function l(e) {
  return f(e);
}
function u(e, t) {
  if (!n) return;
  let r = o.get(e);
  r || o.set(e, (r = new Map()));
  let i = r.get(t);
  (i || r.set(t, (i = new Set())), d(i));
}
function d(e) {
  e.has(n) || (e.add(n), n.deps.push(e));
}
function f(t) {
  if (!e(t)) return t;
  if (a.has(t)) return a.get(t);
  let n = new Proxy(t, s);
  return (a.set(t, n), n);
}
function p(e, t) {
  let n = o.get(e);
  if (!n) return;
  let r = n.get(t);
  if ((console.log(`[trigger]`, t, r), !r)) return;
  let i = new Set(r);
  (console.log(`[execute]`, i), m(r));
}
function m(e) {
  new Set(e).forEach((e) => {
    e !== n && (e.scheduler ? e.running || e.scheduler() : e.run());
  });
}
function h(t) {
  return e(t) ? f(t) : t;
}
function g(e) {
  return _(e);
}
function _(e) {
  return new v(e);
}
var v = class {
  rawValue;
  __v_isRef = !0;
  _value;
  dep;
  constructor(e) {
    ((this.rawValue = e), (this._value = h(e)));
  }
  get value() {
    return (y(this), this._value);
  }
  set value(e) {
    ((this.rawValue = e), (this._value = h(e)), b(this));
  }
};
function y(e) {
  n && ((e.dep ||= new Set()), d(e.dep));
}
function b(e) {
  e.dep && m(e.dep);
}
function x(e) {
  return !!(e && e.__v_isRef);
}
var S = class {
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
function C(e, t) {
  return new S(e, t);
}
function w(e) {
  let t = {};
  for (let n in e) {
    let r = n;
    t[r] = new S(e, r);
  }
  return t;
}
function T(e) {
  return new Proxy(e, {
    get(e, t, n) {
      let r = Reflect.get(e, t, n);
      return x(r) ? r.value : r;
    },
    set(e, t, n, r) {
      let i = Reflect.get(e, t, r);
      return x(i) && !x(n) ? ((i.value = n), !0) : Reflect.set(e, t, n, r);
    },
  });
}
((exports.effect = t),
  (exports.isRef = x),
  (exports.proxyRefs = T),
  (exports.reactive = l),
  (exports.ref = g),
  (exports.toRef = C),
  (exports.toRefs = w));
