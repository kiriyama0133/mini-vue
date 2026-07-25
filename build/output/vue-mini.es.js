//#region lib/utils/object.ts
function e(e) {
  return typeof e == 'object' && !!e;
}
//#endregion
//#region lib/effect/index.ts
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
  a = /* @__PURE__ */ new WeakMap(),
  o = /* @__PURE__ */ new WeakMap(),
  s = {
    get(t, n, r) {
      if (n === c.IS_REACTIVE) return !0;
      if (n === c.IS_READONLY) return !1;
      if (n === c.RAW) return t;
      u(t, n);
      let i = Reflect.get(t, n, r);
      return (e(i) && (i = d(i)), i);
    },
    set(e, t, n, r) {
      if (Reflect.get(e, t, r) === n) return !1;
      let i = Reflect.set(e, t, n, r);
      return (i && f(e, t), i);
    },
  },
  c = /* @__PURE__ */ (function (e) {
    return (
      (e.IS_REACTIVE = '__v_isReactive'),
      (e.IS_READONLY = '__v_isReadonly'),
      (e.RAW = '__v_raw'),
      e
    );
  })({});
function l(e) {
  return d(e);
}
function u(e, t) {
  if (!n) return;
  let r = o.get(e);
  r || o.set(e, (r = /* @__PURE__ */ new Map()));
  let i = r.get(t);
  (i || r.set(t, (i = /* @__PURE__ */ new Set())), i.has(n) || (i.add(n), n.deps.push(i)));
}
function d(t) {
  if (!e(t)) return t;
  if (a.has(t)) return a.get(t);
  let n = new Proxy(t, s);
  return (a.set(t, n), n);
}
function f(e, t) {
  let r = o.get(e);
  if (!r) return;
  let i = r.get(t);
  if ((console.log('[trigger]', t, i), !i)) return;
  let a = new Set(i);
  (console.log('[execute]', a),
    a.forEach((e) => {
      e !== n && (e.scheduler ? e.running || e.scheduler() : e.run());
    }));
}
//#endregion
export { t as effect, l as reactive };
