import { defineComponent as vf, ref as mf, onMounted as yf, watch as _a, onUnmounted as wf, createElementBlock as bf, openBlock as xf, normalizeStyle as kf, normalizeClass as _f } from "vue";
const $f = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add($f);
const Tl = 1, zl = 2, Vl = 4, Cf = 8, Sf = 16, Ef = 1, Pf = 2, Ll = 4, Nf = 8, Df = 16, Il = 1, Hf = 2, jl = "[", Si = "[!", Ls = "]", hr = {}, ct = Symbol(), Of = "http://www.w3.org/1999/xhtml", Mf = "http://www.w3.org/2000/svg", Af = "@attach", Tf = !1;
var Ei = Array.isArray, zf = Array.prototype.indexOf, Is = Array.from, ii = Object.keys, si = Object.defineProperty, Dn = Object.getOwnPropertyDescriptor, Rl = Object.getOwnPropertyDescriptors, Kl = Object.prototype, Vf = Array.prototype, Pi = Object.getPrototypeOf, $a = Object.isExtensible;
function Gr(e) {
  return typeof e == "function";
}
const bt = () => {
};
function Lf(e) {
  return e();
}
function fs(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Zl() {
  var e, t, n = new Promise((r, o) => {
    e = r, t = o;
  });
  return { promise: n, resolve: e, reject: t };
}
function kt(e, t, n = !1) {
  return e === void 0 ? n ? (
    /** @type {() => V} */
    t()
  ) : (
    /** @type {V} */
    t
  ) : e;
}
function ko(e, t) {
  if (Array.isArray(e))
    return e;
  if (t === void 0 || !(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const ht = 2, js = 4, Ni = 8, Bl = 1 << 24, Vn = 16, Ln = 32, tr = 64, Di = 128, nn = 512, yt = 1024, Ot = 2048, In = 4096, It = 8192, Hn = 16384, Hi = 32768, An = 65536, Ca = 1 << 17, Yl = 1 << 18, br = 1 << 19, ql = 1 << 20, so = 32768, ps = 1 << 21, Rs = 1 << 22, Fn = 1 << 23, gn = Symbol("$state"), Ks = Symbol("legacy props"), If = Symbol(""), Er = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), jf = 1, Oi = 3, xr = 8;
function Zs(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Rf() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Kf(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Zf() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Bf(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Yf() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function qf() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Xf(e) {
  throw new Error("https://svelte.dev/e/props_invalid_value");
}
function Ff() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Wf() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Gf() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Uf() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function _o(e) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Jf() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Qf() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
let ke = !1;
function Lt(e) {
  ke = e;
}
let De;
function ot(e) {
  if (e === null)
    throw _o(), hr;
  return De = e;
}
function yn() {
  return ot(
    /** @type {TemplateNode} */
    /* @__PURE__ */ sn(De)
  );
}
function R(e) {
  if (ke) {
    if (/* @__PURE__ */ sn(De) !== null)
      throw _o(), hr;
    De = e;
  }
}
function me(e = 1) {
  if (ke) {
    for (var t = e, n = De; t--; )
      n = /** @type {TemplateNode} */
      /* @__PURE__ */ sn(n);
    De = n;
  }
}
function ai(e = !0) {
  for (var t = 0, n = De; ; ) {
    if (n.nodeType === xr) {
      var r = (
        /** @type {Comment} */
        n.data
      );
      if (r === Ls) {
        if (t === 0) return n;
        t -= 1;
      } else (r === jl || r === Si) && (t += 1);
    }
    var o = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ sn(n)
    );
    e && n.remove(), n = o;
  }
}
function Xl(e) {
  if (!e || e.nodeType !== xr)
    throw _o(), hr;
  return (
    /** @type {Comment} */
    e.data
  );
}
function Fl(e) {
  return e === this.v;
}
function Wl(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Gl(e) {
  return !Wl(e, this.v);
}
let qr = !1, ep = !1;
function tp() {
  qr = !0;
}
const np = [];
function Ul(e, t = !1, n = !1) {
  return Go(e, /* @__PURE__ */ new Map(), "", np, null, n);
}
function Go(e, t, n, r, o = null, i = !1) {
  if (typeof e == "object" && e !== null) {
    var s = t.get(e);
    if (s !== void 0) return s;
    if (e instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(e)
    );
    if (e instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(e)
    );
    if (Ei(e)) {
      var a = (
        /** @type {Snapshot<any>} */
        Array(e.length)
      );
      t.set(e, a), o !== null && t.set(o, a);
      for (var l = 0; l < e.length; l += 1) {
        var u = e[l];
        l in e && (a[l] = Go(u, t, n, r, null, i));
      }
      return a;
    }
    if (Pi(e) === Kl) {
      a = {}, t.set(e, a), o !== null && t.set(o, a);
      for (var d in e)
        a[d] = Go(
          // @ts-expect-error
          e[d],
          t,
          n,
          r,
          null,
          i
        );
      return a;
    }
    if (e instanceof Date)
      return (
        /** @type {Snapshot<T>} */
        structuredClone(e)
      );
    if (typeof /** @type {T & { toJSON?: any } } */
    e.toJSON == "function" && !i)
      return Go(
        /** @type {T & { toJSON(): any } } */
        e.toJSON(),
        t,
        n,
        r,
        // Associate the instance with the toJSON clone
        e
      );
  }
  if (e instanceof EventTarget)
    return (
      /** @type {Snapshot<T>} */
      e
    );
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(e)
    );
  } catch {
    return (
      /** @type {Snapshot<T>} */
      e
    );
  }
}
let Fe = null;
function Ar(e) {
  Fe = e;
}
function Un(e) {
  return (
    /** @type {T} */
    Jl().get(e)
  );
}
function Tr(e, t) {
  return Jl().set(e, t), t;
}
function de(e, t = !1, n) {
  Fe = {
    p: Fe,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    l: qr && !t ? { s: null, u: null, $: [] } : null
  };
}
function fe(e) {
  var t = (
    /** @type {ComponentContext} */
    Fe
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      vu(r);
  }
  return e !== void 0 && (t.x = e), t.i = !0, Fe = t.p, e ?? /** @type {T} */
  {};
}
function Xr() {
  return !qr || Fe !== null && Fe.l === null;
}
function Jl(e) {
  return Fe === null && Zs(), Fe.c ??= new Map(rp(Fe) || void 0);
}
function rp(e) {
  let t = e.p;
  for (; t !== null; ) {
    const n = t.c;
    if (n !== null)
      return n;
    t = t.p;
  }
  return null;
}
let lr = [];
function Ql() {
  var e = lr;
  lr = [], fs(e);
}
function nr(e) {
  if (lr.length === 0 && !ro) {
    var t = lr;
    queueMicrotask(() => {
      t === lr && Ql();
    });
  }
  lr.push(e);
}
function op() {
  for (; lr.length > 0; )
    Ql();
}
function eu(e) {
  var t = Oe;
  if (t === null)
    return Ve.f |= Fn, e;
  if ((t.f & Hi) === 0) {
    if ((t.f & Di) === 0)
      throw e;
    t.b.error(e);
  } else
    zr(e, t);
}
function zr(e, t) {
  for (; t !== null; ) {
    if ((t.f & Di) !== 0)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e;
}
const Ro = /* @__PURE__ */ new Set();
let We = null, Bt = null, Zt = [], Mi = null, hs = !1, ro = !1;
class en {
  committed = !1;
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<() => void>}
   */
  #e = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #n = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #r = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #l = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Effect[]}
   */
  #a = [];
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Effect[]}
   */
  #o = [];
  /**
   * A set of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`
   * @type {Set<Effect>}
   */
  skipped_effects = /* @__PURE__ */ new Set();
  is_fork = !1;
  is_deferred() {
    return this.is_fork || this.#r > 0;
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    Zt = [], this.apply();
    var n = {
      parent: null,
      effect: null,
      effects: [],
      render_effects: [],
      block_effects: []
    };
    for (const r of t)
      this.#i(r, n);
    this.is_fork || this.#c(), this.is_deferred() ? (this.#s(n.effects), this.#s(n.render_effects), this.#s(n.block_effects)) : (We = null, Sa(n.render_effects), Sa(n.effects), this.#l?.resolve()), Bt = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {EffectTarget} target
   */
  #i(t, n) {
    t.f ^= yt;
    for (var r = t.first; r !== null; ) {
      var o = r.f, i = (o & (Ln | tr)) !== 0, s = i && (o & yt) !== 0, a = s || (o & It) !== 0 || this.skipped_effects.has(r);
      if ((r.f & Di) !== 0 && r.b?.is_pending() && (n = {
        parent: n,
        effect: r,
        effects: [],
        render_effects: [],
        block_effects: []
      }), !a && r.fn !== null) {
        i ? r.f ^= yt : (o & js) !== 0 ? n.effects.push(r) : So(r) && ((r.f & Vn) !== 0 && n.block_effects.push(r), uo(r));
        var l = r.first;
        if (l !== null) {
          r = l;
          continue;
        }
      }
      var u = r.parent;
      for (r = r.next; r === null && u !== null; )
        u === n.effect && (this.#s(n.effects), this.#s(n.render_effects), this.#s(n.block_effects), n = /** @type {EffectTarget} */
        n.parent), r = u.next, u = u.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #s(t) {
    for (const n of t)
      ((n.f & Ot) !== 0 ? this.#a : this.#o).push(n), this.#u(n.deps), wt(n, yt);
  }
  /**
   * @param {Value[] | null} deps
   */
  #u(t) {
    if (t !== null)
      for (const n of t)
        (n.f & ht) === 0 || (n.f & so) === 0 || (n.f ^= so, this.#u(
          /** @type {Derived} */
          n.deps
        ));
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    this.previous.has(t) || this.previous.set(t, n), (t.f & Fn) === 0 && (this.current.set(t, t.v), Bt?.set(t, t.v));
  }
  activate() {
    We = this, this.apply();
  }
  deactivate() {
    We === this && (We = null, Bt = null);
  }
  flush() {
    if (this.activate(), Zt.length > 0) {
      if (tu(), We !== null && We !== this)
        return;
    } else this.#n === 0 && this.process([]);
    this.deactivate();
  }
  discard() {
    for (const t of this.#t) t(this);
    this.#t.clear();
  }
  #c() {
    if (this.#r === 0) {
      for (const t of this.#e) t();
      this.#e.clear();
    }
    this.#n === 0 && this.#d();
  }
  #d() {
    if (Ro.size > 1) {
      this.previous.clear();
      var t = Bt, n = !0, r = {
        parent: null,
        effect: null,
        effects: [],
        render_effects: [],
        block_effects: []
      };
      for (const i of Ro) {
        if (i === this) {
          n = !1;
          continue;
        }
        const s = [];
        for (const [l, u] of this.current) {
          if (i.current.has(l))
            if (n && u !== i.current.get(l))
              i.current.set(l, u);
            else
              continue;
          s.push(l);
        }
        if (s.length === 0)
          continue;
        const a = [...i.current.keys()].filter((l) => !this.current.has(l));
        if (a.length > 0) {
          var o = Zt;
          Zt = [];
          const l = /* @__PURE__ */ new Set(), u = /* @__PURE__ */ new Map();
          for (const d of s)
            nu(d, a, l, u);
          if (Zt.length > 0) {
            We = i, i.apply();
            for (const d of Zt)
              i.#i(d, r);
            i.deactivate();
          }
          Zt = o;
        }
      }
      We = null, Bt = t;
    }
    this.committed = !0, Ro.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(t) {
    this.#n += 1, t && (this.#r += 1);
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(t) {
    this.#n -= 1, t && (this.#r -= 1), this.revive();
  }
  revive() {
    for (const t of this.#a)
      wt(t, Ot), gr(t);
    for (const t of this.#o)
      wt(t, In), gr(t);
    this.#a = [], this.#o = [], this.flush();
  }
  /** @param {() => void} fn */
  oncommit(t) {
    this.#e.add(t);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#l ??= Zl()).promise;
  }
  static ensure() {
    if (We === null) {
      const t = We = new en();
      Ro.add(We), ro || en.enqueue(() => {
        We === t && t.flush();
      });
    }
    return We;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    nr(t);
  }
  apply() {
  }
}
function g(e) {
  var t = ro;
  ro = !0;
  try {
    for (var n; ; ) {
      if (op(), Zt.length === 0 && (We?.flush(), Zt.length === 0))
        return Mi = null, /** @type {T} */
        n;
      tu();
    }
  } finally {
    ro = t;
  }
}
function tu() {
  var e = Gn;
  hs = !0;
  try {
    var t = 0;
    for (ui(!0); Zt.length > 0; ) {
      var n = en.ensure();
      if (t++ > 1e3) {
        var r, o;
        ip();
      }
      n.process(Zt), Wn.clear();
    }
  } finally {
    hs = !1, ui(e), Mi = null;
  }
}
function ip() {
  try {
    Yf();
  } catch (e) {
    zr(e, Mi);
  }
}
let _n = null;
function Sa(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (Hn | It)) === 0 && So(r) && (_n = /* @__PURE__ */ new Set(), uo(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null && r.ac === null ? ku(r) : r.fn = null), _n?.size > 0)) {
        Wn.clear();
        for (const o of _n) {
          if ((o.f & (Hn | It)) !== 0) continue;
          const i = [o];
          let s = o.parent;
          for (; s !== null; )
            _n.has(s) && (_n.delete(s), i.push(s)), s = s.parent;
          for (let a = i.length - 1; a >= 0; a--) {
            const l = i[a];
            (l.f & (Hn | It)) === 0 && uo(l);
          }
        }
        _n.clear();
      }
    }
    _n = null;
  }
}
function nu(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const o of e.reactions) {
      const i = o.f;
      (i & ht) !== 0 ? nu(
        /** @type {Derived} */
        o,
        t,
        n,
        r
      ) : (i & (Rs | Vn)) !== 0 && (i & Ot) === 0 && ru(o, t, r) && (wt(o, Ot), gr(
        /** @type {Effect} */
        o
      ));
    }
}
function ru(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const o of e.deps) {
      if (t.includes(o))
        return !0;
      if ((o.f & ht) !== 0 && ru(
        /** @type {Derived} */
        o,
        t,
        n
      ))
        return n.set(
          /** @type {Derived} */
          o,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function gr(e) {
  for (var t = Mi = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (hs && t === Oe && (n & Vn) !== 0 && (n & Yl) === 0)
      return;
    if ((n & (tr | Ln)) !== 0) {
      if ((n & yt) === 0) return;
      t.f ^= yt;
    }
  }
  Zt.push(t);
}
function ou(e) {
  let t = 0, n = Jn(0), r;
  return () => {
    ao() && (c(n), Co(() => (t === 0 && (r = dt(() => e(() => oo(n)))), t += 1, () => {
      nr(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, oo(n));
      });
    })));
  };
}
var sp = An | br | Di;
function ap(e, t, n) {
  new lp(e, t, n);
}
class lp {
  /** @type {Boundary | null} */
  parent;
  #e = !1;
  /** @type {TemplateNode} */
  #t;
  /** @type {TemplateNode | null} */
  #n = ke ? De : null;
  /** @type {BoundaryProps} */
  #r;
  /** @type {((anchor: Node) => void)} */
  #l;
  /** @type {Effect} */
  #a;
  /** @type {Effect | null} */
  #o = null;
  /** @type {Effect | null} */
  #i = null;
  /** @type {Effect | null} */
  #s = null;
  /** @type {DocumentFragment | null} */
  #u = null;
  /** @type {TemplateNode | null} */
  #c = null;
  #d = 0;
  #f = 0;
  #h = !1;
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #p = null;
  #w = ou(() => (this.#p = Jn(this.#d), () => {
    this.#p = null;
  }));
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   */
  constructor(t, n, r) {
    this.#t = t, this.#r = n, this.#l = r, this.parent = /** @type {Effect} */
    Oe.b, this.#e = !!this.#r.pending, this.#a = kr(() => {
      if (Oe.b = this, ke) {
        const i = this.#n;
        yn(), /** @type {Comment} */
        i.nodeType === xr && /** @type {Comment} */
        i.data === Si ? this.#x() : this.#b();
      } else {
        var o = this.#m();
        try {
          this.#o = Vt(() => r(o));
        } catch (i) {
          this.error(i);
        }
        this.#f > 0 ? this.#v() : this.#e = !1;
      }
      return () => {
        this.#c?.remove();
      };
    }, sp), ke && (this.#t = De);
  }
  #b() {
    try {
      this.#o = Vt(() => this.#l(this.#t));
    } catch (t) {
      this.error(t);
    }
    this.#e = !1;
  }
  #x() {
    const t = this.#r.pending;
    t && (this.#i = Vt(() => t(this.#t)), en.enqueue(() => {
      var n = this.#m();
      this.#o = this.#g(() => (en.ensure(), Vt(() => this.#l(n)))), this.#f > 0 ? this.#v() : (Nr(
        /** @type {Effect} */
        this.#i,
        () => {
          this.#i = null;
        }
      ), this.#e = !1);
    }));
  }
  #m() {
    var t = this.#t;
    return this.#e && (this.#c = Mt(), this.#t.before(this.#c), t = this.#c), t;
  }
  /**
   * Returns `true` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_pending() {
    return this.#e || !!this.parent && this.parent.is_pending();
  }
  has_pending_snippet() {
    return !!this.#r.pending;
  }
  /**
   * @param {() => Effect | null} fn
   */
  #g(t) {
    var n = Oe, r = Ve, o = Fe;
    qt(this.#a), Nt(this.#a), Ar(this.#a.ctx);
    try {
      return t();
    } catch (i) {
      return eu(i), null;
    } finally {
      qt(n), Nt(r), Ar(o);
    }
  }
  #v() {
    const t = (
      /** @type {(anchor: Node) => void} */
      this.#r.pending
    );
    this.#o !== null && (this.#u = document.createDocumentFragment(), this.#u.append(
      /** @type {TemplateNode} */
      this.#c
    ), Cu(this.#o, this.#u)), this.#i === null && (this.#i = Vt(() => t(this.#t)));
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  #y(t) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#y(t);
      return;
    }
    this.#f += t, this.#f === 0 && (this.#e = !1, this.#i && Nr(this.#i, () => {
      this.#i = null;
    }), this.#u && (this.#t.before(this.#u), this.#u = null));
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(t) {
    this.#y(t), this.#d += t, this.#p && Vr(this.#p, this.#d);
  }
  get_effect_pending() {
    return this.#w(), c(
      /** @type {Source<number>} */
      this.#p
    );
  }
  /** @param {unknown} error */
  error(t) {
    var n = this.#r.onerror;
    let r = this.#r.failed;
    if (this.#h || !n && !r)
      throw t;
    this.#o && (lt(this.#o), this.#o = null), this.#i && (lt(this.#i), this.#i = null), this.#s && (lt(this.#s), this.#s = null), ke && (ot(
      /** @type {TemplateNode} */
      this.#n
    ), me(), ot(ai()));
    var o = !1, i = !1;
    const s = () => {
      if (o) {
        Qf();
        return;
      }
      o = !0, i && Uf(), en.ensure(), this.#d = 0, this.#s !== null && Nr(this.#s, () => {
        this.#s = null;
      }), this.#e = this.has_pending_snippet(), this.#o = this.#g(() => (this.#h = !1, Vt(() => this.#l(this.#t)))), this.#f > 0 ? this.#v() : this.#e = !1;
    };
    var a = Ve;
    try {
      Nt(null), i = !0, n?.(t, s), i = !1;
    } catch (l) {
      zr(l, this.#a && this.#a.parent);
    } finally {
      Nt(a);
    }
    r && nr(() => {
      this.#s = this.#g(() => {
        en.ensure(), this.#h = !0;
        try {
          return Vt(() => {
            r(
              this.#t,
              () => t,
              () => s
            );
          });
        } catch (l) {
          return zr(
            l,
            /** @type {Effect} */
            this.#a.parent
          ), null;
        } finally {
          this.#h = !1;
        }
      });
    });
  }
}
function Cn(e, t) {
  return t;
}
function up(e, t, n) {
  for (var r = [], o = t.length, i = 0; i < o; i++)
    Ws(t[i].e, r, !0);
  _u(r, () => {
    var s = r.length === 0 && n !== null;
    if (s) {
      var a = (
        /** @type {Element} */
        n
      ), l = (
        /** @type {Element} */
        a.parentNode
      );
      qs(l), l.append(a), e.items.clear(), Ut(e, t[0].prev, t[o - 1].next);
    }
    for (var u = 0; u < o; u++) {
      var d = t[u];
      s || (e.items.delete(d.k), Ut(e, d.prev, d.next)), lt(d.e, !s);
    }
    e.first === t[0] && (e.first = t[0].prev);
  });
}
function at(e, t, n, r, o, i = null) {
  var s = e, a = /* @__PURE__ */ new Map(), l = null, u = (t & Vl) !== 0, d = (t & Tl) !== 0, f = (t & zl) !== 0;
  if (u) {
    var p = (
      /** @type {Element} */
      e
    );
    s = ke ? ot(
      /** @type {Comment | Text} */
      /* @__PURE__ */ st(p)
    ) : p.appendChild(Mt());
  }
  ke && yn();
  var h = null, y = /* @__PURE__ */ Bs(() => {
    var x = n();
    return Ei(x) ? x : x == null ? [] : Is(x);
  }), m, w = !0;
  function b() {
    cp($, m, s, t, r), h !== null && (m.length === 0 ? (h.fragment ? (s.before(h.fragment), h.fragment = null) : Gs(h.effect), _.first = h.effect) : Nr(h.effect, () => {
      h = null;
    }));
  }
  var _ = kr(() => {
    m = /** @type {V[]} */
    c(y);
    var x = m.length;
    let C = !1;
    if (ke) {
      var S = Xl(s) === Si;
      S !== (x === 0) && (s = ai(), ot(s), Lt(!1), C = !0);
    }
    for (var M = /* @__PURE__ */ new Set(), j = (
      /** @type {Batch} */
      We
    ), L = null, I = hu(), T = 0; T < x; T += 1) {
      ke && De.nodeType === xr && /** @type {Comment} */
      De.data === Ls && (s = /** @type {Comment} */
      De, C = !0, Lt(!1));
      var N = m[T], H = r(N, T), k = w ? null : a.get(H);
      k ? (d && Vr(k.v, N), f ? Vr(
        /** @type {Value<number>} */
        k.i,
        T
      ) : k.i = T, I && j.skipped_effects.delete(k.e)) : (k = dp(
        w ? s : null,
        L,
        N,
        H,
        T,
        o,
        t,
        n
      ), w && (k.o = !0, L === null ? l = k : L.next = k, L = k), a.set(H, k)), M.add(H);
    }
    if (x === 0 && i && !h)
      if (w)
        h = {
          fragment: null,
          effect: Vt(() => i(s))
        };
      else {
        var P = document.createDocumentFragment(), O = Mt();
        P.append(O), h = {
          fragment: P,
          effect: Vt(() => i(O))
        };
      }
    if (ke && x > 0 && ot(ai()), !w)
      if (I) {
        for (const [B, V] of a)
          M.has(B) || j.skipped_effects.add(V.e);
        j.oncommit(b), j.ondiscard(() => {
        });
      } else
        b();
    C && Lt(!0), c(y);
  }), $ = { effect: _, items: a, first: l };
  w = !1, ke && (s = De);
}
function cp(e, t, n, r, o) {
  var i = (r & Cf) !== 0, s = t.length, a = e.items, l = e.first, u, d = null, f, p = [], h = [], y, m, w, b;
  if (i)
    for (b = 0; b < s; b += 1)
      y = t[b], m = o(y, b), w = /** @type {EachItem} */
      a.get(m), w.o && (w.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(w));
  for (b = 0; b < s; b += 1) {
    if (y = t[b], m = o(y, b), w = /** @type {EachItem} */
    a.get(m), e.first ??= w, !w.o) {
      w.o = !0;
      var _ = d ? d.next : l;
      Ut(e, d, w), Ut(e, w, _), Wi(w, _, n), d = w, p = [], h = [], l = d.next;
      continue;
    }
    if ((w.e.f & It) !== 0 && (Gs(w.e), i && (w.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(w))), w !== l) {
      if (u !== void 0 && u.has(w)) {
        if (p.length < h.length) {
          var $ = h[0], x;
          d = $.prev;
          var C = p[0], S = p[p.length - 1];
          for (x = 0; x < p.length; x += 1)
            Wi(p[x], $, n);
          for (x = 0; x < h.length; x += 1)
            u.delete(h[x]);
          Ut(e, C.prev, S.next), Ut(e, d, C), Ut(e, S, $), l = $, d = S, b -= 1, p = [], h = [];
        } else
          u.delete(w), Wi(w, l, n), Ut(e, w.prev, w.next), Ut(e, w, d === null ? e.first : d.next), Ut(e, d, w), d = w;
        continue;
      }
      for (p = [], h = []; l !== null && l.k !== m; )
        (l.e.f & It) === 0 && (u ??= /* @__PURE__ */ new Set()).add(l), h.push(l), l = l.next;
      if (l === null)
        continue;
      w = l;
    }
    p.push(w), d = w, l = w.next;
  }
  let M = a.size > s;
  if (l !== null || u !== void 0) {
    for (var j = u === void 0 ? [] : Is(u); l !== null; )
      (l.e.f & It) === 0 && j.push(l), l = l.next;
    var L = j.length;
    if (M = a.size - L > s, L > 0) {
      var I = (r & Vl) !== 0 && s === 0 ? n : null;
      if (i) {
        for (b = 0; b < L; b += 1)
          j[b].a?.measure();
        for (b = 0; b < L; b += 1)
          j[b].a?.fix();
      }
      up(e, j, I);
    }
  }
  if (M)
    for (const T of a.values())
      T.o || (Ut(e, d, T), d = T);
  e.effect.last = d && d.e, i && nr(() => {
    if (f !== void 0)
      for (w of f)
        w.a?.apply();
  });
}
function dp(e, t, n, r, o, i, s, a) {
  var l = (s & Tl) !== 0, u = (s & Sf) === 0, d = l ? u ? /* @__PURE__ */ uu(n, !1, !1) : Jn(n) : n, f = (s & zl) === 0 ? o : Jn(o), p = {
    i: f,
    v: d,
    k: r,
    a: null,
    // @ts-expect-error
    e: null,
    o: !1,
    prev: t,
    next: null
  };
  try {
    if (e === null) {
      var h = document.createDocumentFragment();
      h.append(e = Mt());
    }
    return p.e = Vt(() => i(
      /** @type {Node} */
      e,
      d,
      f,
      a
    )), t !== null && (t.next = p), p;
  } finally {
  }
}
function Wi(e, t, n) {
  for (var r = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : n, o = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : n, i = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); i !== null && i !== r; ) {
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ sn(i)
    );
    o.before(i), i = s;
  }
}
function Ut(e, t, n) {
  t === null ? (e.first = n, e.effect.first = n && n.e) : (t.e.next && (t.e.next.prev = null), t.next = n, t.e.next = n && n.e), n !== null && (n.e.prev && (n.e.prev.next = null), n.prev = t, n.e.prev = t && t.e);
}
function iu(e, t, n, r) {
  const o = Xr() ? $o : Bs;
  if (n.length === 0 && e.length === 0) {
    r(t.map(o));
    return;
  }
  var i = We, s = (
    /** @type {Effect} */
    Oe
  ), a = fp();
  function l() {
    Promise.all(n.map((u) => /* @__PURE__ */ pp(u))).then((u) => {
      a();
      try {
        r([...t.map(o), ...u]);
      } catch (d) {
        (s.f & Hn) === 0 && zr(d, s);
      }
      i?.deactivate(), li();
    }).catch((u) => {
      zr(u, s);
    });
  }
  e.length > 0 ? Promise.all(e).then(() => {
    a();
    try {
      return l();
    } finally {
      i?.deactivate(), li();
    }
  }) : l();
}
function fp() {
  var e = Oe, t = Ve, n = Fe, r = We;
  return function(o = !0) {
    qt(e), Nt(t), Ar(n), o && r?.activate();
  };
}
function li() {
  qt(null), Nt(null), Ar(null);
}
// @__NO_SIDE_EFFECTS__
function $o(e) {
  var t = ht | Ot, n = Ve !== null && (Ve.f & ht) !== 0 ? (
    /** @type {Derived} */
    Ve
  ) : null;
  return Oe !== null && (Oe.f |= br), {
    ctx: Fe,
    deps: null,
    effects: null,
    equals: Fl,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      ct
    ),
    wv: 0,
    parent: n ?? Oe,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function pp(e, t) {
  let n = (
    /** @type {Effect | null} */
    Oe
  );
  n === null && Rf();
  var r = (
    /** @type {Boundary} */
    n.b
  ), o = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), i = Jn(
    /** @type {V} */
    ct
  ), s = !Ve, a = /* @__PURE__ */ new Map();
  return kp(() => {
    var l = Zl();
    o = l.promise;
    try {
      Promise.resolve(e()).then(l.resolve, l.reject).then(() => {
        u === We && u.committed && u.deactivate(), li();
      });
    } catch (p) {
      l.reject(p), li();
    }
    var u = (
      /** @type {Batch} */
      We
    );
    if (s) {
      var d = !r.is_pending();
      r.update_pending_count(1), u.increment(d), a.get(u)?.reject(Er), a.delete(u), a.set(u, l);
    }
    const f = (p, h = void 0) => {
      if (u.activate(), h)
        h !== Er && (i.f |= Fn, Vr(i, h));
      else {
        (i.f & Fn) !== 0 && (i.f ^= Fn), Vr(i, p);
        for (const [y, m] of a) {
          if (a.delete(y), y === u) break;
          m.reject(Er);
        }
      }
      s && (r.update_pending_count(-1), u.decrement(d));
    };
    l.promise.then(f, (p) => f(null, p || "unknown"));
  }), Ai(() => {
    for (const l of a.values())
      l.reject(Er);
  }), new Promise((l) => {
    function u(d) {
      function f() {
        d === o ? l(i) : u(o);
      }
      d.then(f, f);
    }
    u(o);
  });
}
// @__NO_SIDE_EFFECTS__
function E(e) {
  const t = /* @__PURE__ */ $o(e);
  return Su(t), t;
}
// @__NO_SIDE_EFFECTS__
function Bs(e) {
  const t = /* @__PURE__ */ $o(e);
  return t.equals = Gl, t;
}
function su(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      lt(
        /** @type {Effect} */
        t[n]
      );
  }
}
function hp(e) {
  for (var t = e.parent; t !== null; ) {
    if ((t.f & ht) === 0)
      return (t.f & Hn) === 0 ? (
        /** @type {Effect} */
        t
      ) : null;
    t = t.parent;
  }
  return null;
}
function Ys(e) {
  var t, n = Oe;
  qt(hp(e));
  try {
    e.f &= ~so, su(e), t = Du(e);
  } finally {
    qt(n);
  }
  return t;
}
function au(e) {
  var t = Ys(e);
  if (e.equals(t) || (We?.is_fork || (e.v = t), e.wv = Pu()), !_r)
    if (Bt !== null)
      (ao() || We?.is_fork) && Bt.set(e, t);
    else {
      var n = (e.f & nn) === 0 ? In : yt;
      wt(e, n);
    }
}
let gs = /* @__PURE__ */ new Set();
const Wn = /* @__PURE__ */ new Map();
let lu = !1;
function Jn(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Fl,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Ne(e, t) {
  const n = Jn(e);
  return Su(n), n;
}
// @__NO_SIDE_EFFECTS__
function uu(e, t = !1, n = !0) {
  const r = Jn(e);
  return t || (r.equals = Gl), qr && n && Fe !== null && Fe.l !== null && (Fe.l.s ??= []).push(r), r;
}
function Q(e, t, n = !1) {
  Ve !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!hn || (Ve.f & Ca) !== 0) && Xr() && (Ve.f & (ht | Vn | Rs | Ca)) !== 0 && !On?.includes(e) && Gf();
  let r = n ? Pt(t) : t;
  return Vr(e, r);
}
function Vr(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    _r ? Wn.set(e, t) : Wn.set(e, n), e.v = t;
    var r = en.ensure();
    r.capture(e, n), (e.f & ht) !== 0 && ((e.f & Ot) !== 0 && Ys(
      /** @type {Derived} */
      e
    ), wt(e, (e.f & nn) !== 0 ? yt : In)), e.wv = Pu(), cu(e, Ot), Xr() && Oe !== null && (Oe.f & yt) !== 0 && (Oe.f & (Ln | tr)) === 0 && (Kt === null ? $p([e]) : Kt.push(e)), !r.is_fork && gs.size > 0 && !lu && gp();
  }
  return t;
}
function gp() {
  lu = !1;
  var e = Gn;
  ui(!0);
  const t = Array.from(gs);
  try {
    for (const n of t)
      (n.f & yt) !== 0 && wt(n, In), So(n) && uo(n);
  } finally {
    ui(e);
  }
  gs.clear();
}
function Ea(e, t = 1) {
  var n = c(e), r = t === 1 ? n++ : n--;
  return Q(e, n), r;
}
function oo(e) {
  Q(e, e.v + 1);
}
function cu(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Xr(), o = n.length, i = 0; i < o; i++) {
      var s = n[i], a = s.f;
      if (!(!r && s === Oe)) {
        var l = (a & Ot) === 0;
        if (l && wt(s, t), (a & ht) !== 0) {
          var u = (
            /** @type {Derived} */
            s
          );
          Bt?.delete(u), (a & so) === 0 && (a & nn && (s.f |= so), cu(u, In));
        } else l && ((a & Vn) !== 0 && _n !== null && _n.add(
          /** @type {Effect} */
          s
        ), gr(
          /** @type {Effect} */
          s
        ));
      }
    }
}
function Pt(e) {
  if (typeof e != "object" || e === null || gn in e)
    return e;
  const t = Pi(e);
  if (t !== Kl && t !== Vf)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ei(e), o = /* @__PURE__ */ Ne(0), i = dr, s = (a) => {
    if (dr === i)
      return a();
    var l = Ve, u = dr;
    Nt(null), Ha(i);
    var d = a();
    return Nt(l), Ha(u), d;
  };
  return r && n.set("length", /* @__PURE__ */ Ne(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(a, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Ff();
        var d = n.get(l);
        return d === void 0 ? d = s(() => {
          var f = /* @__PURE__ */ Ne(u.value);
          return n.set(l, f), f;
        }) : Q(d, u.value, !0), !0;
      },
      deleteProperty(a, l) {
        var u = n.get(l);
        if (u === void 0) {
          if (l in a) {
            const d = s(() => /* @__PURE__ */ Ne(ct));
            n.set(l, d), oo(o);
          }
        } else
          Q(u, ct), oo(o);
        return !0;
      },
      get(a, l, u) {
        if (l === gn)
          return e;
        var d = n.get(l), f = l in a;
        if (d === void 0 && (!f || Dn(a, l)?.writable) && (d = s(() => {
          var h = Pt(f ? a[l] : ct), y = /* @__PURE__ */ Ne(h);
          return y;
        }), n.set(l, d)), d !== void 0) {
          var p = c(d);
          return p === ct ? void 0 : p;
        }
        return Reflect.get(a, l, u);
      },
      getOwnPropertyDescriptor(a, l) {
        var u = Reflect.getOwnPropertyDescriptor(a, l);
        if (u && "value" in u) {
          var d = n.get(l);
          d && (u.value = c(d));
        } else if (u === void 0) {
          var f = n.get(l), p = f?.v;
          if (f !== void 0 && p !== ct)
            return {
              enumerable: !0,
              configurable: !0,
              value: p,
              writable: !0
            };
        }
        return u;
      },
      has(a, l) {
        if (l === gn)
          return !0;
        var u = n.get(l), d = u !== void 0 && u.v !== ct || Reflect.has(a, l);
        if (u !== void 0 || Oe !== null && (!d || Dn(a, l)?.writable)) {
          u === void 0 && (u = s(() => {
            var p = d ? Pt(a[l]) : ct, h = /* @__PURE__ */ Ne(p);
            return h;
          }), n.set(l, u));
          var f = c(u);
          if (f === ct)
            return !1;
        }
        return d;
      },
      set(a, l, u, d) {
        var f = n.get(l), p = l in a;
        if (r && l === "length")
          for (var h = u; h < /** @type {Source<number>} */
          f.v; h += 1) {
            var y = n.get(h + "");
            y !== void 0 ? Q(y, ct) : h in a && (y = s(() => /* @__PURE__ */ Ne(ct)), n.set(h + "", y));
          }
        if (f === void 0)
          (!p || Dn(a, l)?.writable) && (f = s(() => /* @__PURE__ */ Ne(void 0)), Q(f, Pt(u)), n.set(l, f));
        else {
          p = f.v !== ct;
          var m = s(() => Pt(u));
          Q(f, m);
        }
        var w = Reflect.getOwnPropertyDescriptor(a, l);
        if (w?.set && w.set.call(d, u), !p) {
          if (r && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              n.get("length")
            ), _ = Number(l);
            Number.isInteger(_) && _ >= b.v && Q(b, _ + 1);
          }
          oo(o);
        }
        return !0;
      },
      ownKeys(a) {
        c(o);
        var l = Reflect.ownKeys(a).filter((f) => {
          var p = n.get(f);
          return p === void 0 || p.v !== ct;
        });
        for (var [u, d] of n)
          d.v !== ct && !(u in a) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        Wf();
      }
    }
  );
}
function Pa(e) {
  try {
    if (e !== null && typeof e == "object" && gn in e)
      return e[gn];
  } catch {
  }
  return e;
}
function vp(e, t) {
  return Object.is(Pa(e), Pa(t));
}
var Et, du, fu, pu;
function vs() {
  if (Et === void 0) {
    Et = window, du = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    fu = Dn(t, "firstChild").get, pu = Dn(t, "nextSibling").get, $a(e) && (e.__click = void 0, e.__className = void 0, e.__attributes = null, e.__style = void 0, e.__e = void 0), $a(n) && (n.__t = void 0);
  }
}
function Mt(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function st(e) {
  return fu.call(e);
}
// @__NO_SIDE_EFFECTS__
function sn(e) {
  return pu.call(e);
}
function Z(e, t) {
  if (!ke)
    return /* @__PURE__ */ st(e);
  var n = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ st(De)
  );
  if (n === null)
    n = De.appendChild(Mt());
  else if (t && n.nodeType !== Oi) {
    var r = Mt();
    return n?.before(r), ot(r), r;
  }
  return ot(n), n;
}
function re(e, t = !1) {
  if (!ke) {
    var n = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ st(
        /** @type {Node} */
        e
      )
    );
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ sn(n) : n;
  }
  if (t && De?.nodeType !== Oi) {
    var r = Mt();
    return De?.before(r), ot(r), r;
  }
  return De;
}
function A(e, t = 1, n = !1) {
  let r = ke ? De : e;
  for (var o; t--; )
    o = r, r = /** @type {TemplateNode} */
    /* @__PURE__ */ sn(r);
  if (!ke)
    return r;
  if (n && r?.nodeType !== Oi) {
    var i = Mt();
    return r === null ? o?.after(i) : r.before(i), ot(i), i;
  }
  return ot(r), /** @type {TemplateNode} */
  r;
}
function qs(e) {
  e.textContent = "";
}
function hu() {
  return !1;
}
function mp(e, t) {
  if (t) {
    const n = document.body;
    e.autofocus = !0, nr(() => {
      document.activeElement === n && e.focus();
    });
  }
}
function yp(e) {
  ke && /* @__PURE__ */ st(e) !== null && qs(e);
}
let Na = !1;
function wp() {
  Na || (Na = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        if (!e.defaultPrevented)
          for (
            const t of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            t.__on_r?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
    { capture: !0 }
  ));
}
function Xs(e) {
  var t = Ve, n = Oe;
  Nt(null), qt(null);
  try {
    return e();
  } finally {
    Nt(t), qt(n);
  }
}
function gu(e) {
  Oe === null && (Ve === null && Bf(), Zf()), _r && Kf();
}
function bp(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function Xt(e, t, n) {
  var r = Oe;
  r !== null && (r.f & It) !== 0 && (e |= It);
  var o = {
    ctx: Fe,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | Ot | nn,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null
  };
  if (n)
    try {
      uo(o), o.f |= Hi;
    } catch (a) {
      throw lt(o), a;
    }
  else t !== null && gr(o);
  var i = o;
  if (n && i.deps === null && i.teardown === null && i.nodes_start === null && i.first === i.last && // either `null`, or a singular child
  (i.f & br) === 0 && (i = i.first, (e & Vn) !== 0 && (e & An) !== 0 && i !== null && (i.f |= An)), i !== null && (i.parent = r, r !== null && bp(i, r), Ve !== null && (Ve.f & ht) !== 0 && (e & tr) === 0)) {
    var s = (
      /** @type {Derived} */
      Ve
    );
    (s.effects ??= []).push(i);
  }
  return o;
}
function ao() {
  return Ve !== null && !hn;
}
function Ai(e) {
  const t = Xt(Ni, null, !1);
  return wt(t, yt), t.teardown = e, t;
}
function Je(e) {
  gu();
  var t = (
    /** @type {Effect} */
    Oe.f
  ), n = !Ve && (t & Ln) !== 0 && (t & Hi) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      Fe
    );
    (r.e ??= []).push(e);
  } else
    return vu(e);
}
function vu(e) {
  return Xt(js | ql, e, !1);
}
function mu(e) {
  return gu(), Xt(Ni | ql, e, !0);
}
function Fs(e) {
  en.ensure();
  const t = Xt(tr | br, e, !0);
  return () => {
    lt(t);
  };
}
function xp(e) {
  en.ensure();
  const t = Xt(tr | br, e, !0);
  return (n = {}) => new Promise((r) => {
    n.outro ? Nr(t, () => {
      lt(t), r(void 0);
    }) : (lt(t), r(void 0));
  });
}
function Fr(e) {
  return Xt(js, e, !1);
}
function kp(e) {
  return Xt(Rs | br, e, !0);
}
function Co(e, t = 0) {
  return Xt(Ni | t, e, !0);
}
function xe(e, t = [], n = [], r = []) {
  iu(r, t, n, (o) => {
    Xt(Ni, () => e(...o.map(c)), !0);
  });
}
function kr(e, t = 0) {
  var n = Xt(Vn | t, e, !0);
  return n;
}
function yu(e, t = 0) {
  var n = Xt(Bl | t, e, !0);
  return n;
}
function Vt(e) {
  return Xt(Ln | br, e, !0);
}
function wu(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = _r, r = Ve;
    Da(!0), Nt(null);
    try {
      t.call(null);
    } finally {
      Da(n), Nt(r);
    }
  }
}
function bu(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const o = n.ac;
    o !== null && Xs(() => {
      o.abort(Er);
    });
    var r = n.next;
    (n.f & tr) !== 0 ? n.parent = null : lt(n, t), n = r;
  }
}
function _p(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Ln) === 0 && lt(t), t = n;
  }
}
function lt(e, t = !0) {
  var n = !1;
  (t || (e.f & Yl) !== 0) && e.nodes_start !== null && e.nodes_end !== null && (xu(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), n = !0), bu(e, t && !n), ci(e, 0), wt(e, Hn);
  var r = e.transitions;
  if (r !== null)
    for (const i of r)
      i.stop();
  wu(e);
  var o = e.parent;
  o !== null && o.first !== null && ku(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function xu(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ sn(e)
    );
    e.remove(), e = n;
  }
}
function ku(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Nr(e, t, n = !0) {
  var r = [];
  Ws(e, r, !0), _u(r, () => {
    n && lt(e), t && t();
  });
}
function _u(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var o of e)
      o.out(r);
  } else
    t();
}
function Ws(e, t, n) {
  if ((e.f & It) === 0) {
    if (e.f ^= It, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || n) && t.push(s);
    for (var r = e.first; r !== null; ) {
      var o = r.next, i = (r.f & An) !== 0 || // If this is a branch effect without a block effect parent,
      // it means the parent block effect was pruned. In that case,
      // transparency information was transferred to the branch effect.
      (r.f & Ln) !== 0 && (e.f & Vn) !== 0;
      Ws(r, t, i ? n : !1), r = o;
    }
  }
}
function Gs(e) {
  $u(e, !0);
}
function $u(e, t) {
  if ((e.f & It) !== 0) {
    e.f ^= It, (e.f & yt) === 0 && (wt(e, Ot), gr(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, o = (n.f & An) !== 0 || (n.f & Ln) !== 0;
      $u(n, o ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || t) && i.in();
  }
}
function Cu(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var o = n === r ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ sn(n)
    );
    t.append(n), n = o;
  }
}
let Gn = !1;
function ui(e) {
  Gn = e;
}
let _r = !1;
function Da(e) {
  _r = e;
}
let Ve = null, hn = !1;
function Nt(e) {
  Ve = e;
}
let Oe = null;
function qt(e) {
  Oe = e;
}
let On = null;
function Su(e) {
  Ve !== null && (On === null ? On = [e] : On.push(e));
}
let _t = null, zt = 0, Kt = null;
function $p(e) {
  Kt = e;
}
let Eu = 1, lo = 0, dr = lo;
function Ha(e) {
  dr = e;
}
function Pu() {
  return ++Eu;
}
function So(e) {
  var t = e.f;
  if ((t & Ot) !== 0)
    return !0;
  if (t & ht && (e.f &= -32769), (t & In) !== 0) {
    var n = e.deps;
    if (n !== null)
      for (var r = n.length, o = 0; o < r; o++) {
        var i = n[o];
        if (So(
          /** @type {Derived} */
          i
        ) && au(
          /** @type {Derived} */
          i
        ), i.wv > e.wv)
          return !0;
      }
    (t & nn) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    Bt === null && wt(e, yt);
  }
  return !1;
}
function Nu(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !On?.includes(e))
    for (var o = 0; o < r.length; o++) {
      var i = r[o];
      (i.f & ht) !== 0 ? Nu(
        /** @type {Derived} */
        i,
        t,
        !1
      ) : t === i && (n ? wt(i, Ot) : (i.f & yt) !== 0 && wt(i, In), gr(
        /** @type {Effect} */
        i
      ));
    }
}
function Du(e) {
  var t = _t, n = zt, r = Kt, o = Ve, i = On, s = Fe, a = hn, l = dr, u = e.f;
  _t = /** @type {null | Value[]} */
  null, zt = 0, Kt = null, Ve = (u & (Ln | tr)) === 0 ? e : null, On = null, Ar(e.ctx), hn = !1, dr = ++lo, e.ac !== null && (Xs(() => {
    e.ac.abort(Er);
  }), e.ac = null);
  try {
    e.f |= ps;
    var d = (
      /** @type {Function} */
      e.fn
    ), f = d(), p = e.deps;
    if (_t !== null) {
      var h;
      if (ci(e, zt), p !== null && zt > 0)
        for (p.length = zt + _t.length, h = 0; h < _t.length; h++)
          p[zt + h] = _t[h];
      else
        e.deps = p = _t;
      if (Gn && ao() && (e.f & nn) !== 0)
        for (h = zt; h < p.length; h++)
          (p[h].reactions ??= []).push(e);
    } else p !== null && zt < p.length && (ci(e, zt), p.length = zt);
    if (Xr() && Kt !== null && !hn && p !== null && (e.f & (ht | In | Ot)) === 0)
      for (h = 0; h < /** @type {Source[]} */
      Kt.length; h++)
        Nu(
          Kt[h],
          /** @type {Effect} */
          e
        );
    return o !== null && o !== e && (lo++, Kt !== null && (r === null ? r = Kt : r.push(.../** @type {Source[]} */
    Kt))), (e.f & Fn) !== 0 && (e.f ^= Fn), f;
  } catch (y) {
    return eu(y);
  } finally {
    e.f ^= ps, _t = t, zt = n, Kt = r, Ve = o, On = i, Ar(s), hn = a, dr = l;
  }
}
function Cp(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = zf.call(n, e);
    if (r !== -1) {
      var o = n.length - 1;
      o === 0 ? n = t.reactions = null : (n[r] = n[o], n.pop());
    }
  }
  n === null && (t.f & ht) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (_t === null || !_t.includes(t)) && (wt(t, In), (t.f & nn) !== 0 && (t.f ^= nn, t.f &= -32769), su(
    /** @type {Derived} **/
    t
  ), ci(
    /** @type {Derived} **/
    t,
    0
  ));
}
function ci(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Cp(e, n[r]);
}
function uo(e) {
  var t = e.f;
  if ((t & Hn) === 0) {
    wt(e, yt);
    var n = Oe, r = Gn;
    Oe = e, Gn = !0;
    try {
      (t & (Vn | Bl)) !== 0 ? _p(e) : bu(e), wu(e);
      var o = Du(e);
      e.teardown = typeof o == "function" ? o : null, e.wv = Eu;
      var i;
      Tf && ep && (e.f & Ot) !== 0 && e.deps;
    } finally {
      Gn = r, Oe = n;
    }
  }
}
function c(e) {
  var t = e.f, n = (t & ht) !== 0;
  if (Ve !== null && !hn) {
    var r = Oe !== null && (Oe.f & Hn) !== 0;
    if (!r && !On?.includes(e)) {
      var o = Ve.deps;
      if ((Ve.f & ps) !== 0)
        e.rv < lo && (e.rv = lo, _t === null && o !== null && o[zt] === e ? zt++ : _t === null ? _t = [e] : _t.includes(e) || _t.push(e));
      else {
        (Ve.deps ??= []).push(e);
        var i = e.reactions;
        i === null ? e.reactions = [Ve] : i.includes(Ve) || i.push(Ve);
      }
    }
  }
  if (_r) {
    if (Wn.has(e))
      return Wn.get(e);
    if (n) {
      var s = (
        /** @type {Derived} */
        e
      ), a = s.v;
      return ((s.f & yt) === 0 && s.reactions !== null || Ou(s)) && (a = Ys(s)), Wn.set(s, a), a;
    }
  } else n && (!Bt?.has(e) || We?.is_fork && !ao()) && (s = /** @type {Derived} */
  e, So(s) && au(s), Gn && ao() && (s.f & nn) === 0 && Hu(s));
  if (Bt?.has(e))
    return Bt.get(e);
  if ((e.f & Fn) !== 0)
    throw e.v;
  return e.v;
}
function Hu(e) {
  if (e.deps !== null) {
    e.f ^= nn;
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & ht) !== 0 && (t.f & nn) === 0 && Hu(
        /** @type {Derived} */
        t
      );
  }
}
function Ou(e) {
  if (e.v === ct) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Wn.has(t) || (t.f & ht) !== 0 && Ou(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function dt(e) {
  var t = hn;
  try {
    return hn = !0, e();
  } finally {
    hn = t;
  }
}
const Sp = -7169;
function wt(e, t) {
  e.f = e.f & Sp | t;
}
function Ep(e, t) {
  var n = {};
  for (var r in e)
    t.includes(r) || (n[r] = e[r]);
  for (var o of Object.getOwnPropertySymbols(e))
    Object.propertyIsEnumerable.call(e, o) && !t.includes(o) && (n[o] = e[o]);
  return n;
}
function Us(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (gn in e)
      ms(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && gn in n && ms(n);
      }
  }
}
function ms(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        ms(e[r], t);
      } catch {
      }
    const n = Pi(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = Rl(n);
      for (let o in r) {
        const i = r[o].get;
        if (i)
          try {
            i.call(e);
          } catch {
          }
      }
    }
  }
}
const Mu = /* @__PURE__ */ new Set(), ys = /* @__PURE__ */ new Set();
function Js(e, t, n, r = {}) {
  function o(i) {
    if (r.capture || Qr.call(t, i), !i.cancelBubble)
      return Xs(() => n?.call(this, i));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? nr(() => {
    t.addEventListener(e, o, r);
  }) : t.addEventListener(e, o, r), o;
}
function ws(e, t, n, r = {}) {
  var o = Js(t, e, n, r);
  return () => {
    e.removeEventListener(t, o, r);
  };
}
function Lr(e, t, n, r, o) {
  var i = { capture: r, passive: o }, s = Js(e, t, n, i);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Ai(() => {
    t.removeEventListener(e, s, i);
  });
}
function rr(e) {
  for (var t = 0; t < e.length; t++)
    Mu.add(e[t]);
  for (var n of ys)
    n(e);
}
let Oa = null;
function Qr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, o = e.composedPath?.() || [], i = (
    /** @type {null | Element} */
    o[0] || e.target
  );
  Oa = e;
  var s = 0, a = Oa === e && e.__root;
  if (a) {
    var l = o.indexOf(a);
    if (l !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = o.indexOf(t);
    if (u === -1)
      return;
    l <= u && (s = l);
  }
  if (i = /** @type {Element} */
  o[s] || e.target, i !== t) {
    si(e, "currentTarget", {
      configurable: !0,
      get() {
        return i || n;
      }
    });
    var d = Ve, f = Oe;
    Nt(null), qt(null);
    try {
      for (var p, h = []; i !== null; ) {
        var y = i.assignedSlot || i.parentNode || /** @type {any} */
        i.host || null;
        try {
          var m = i["__" + r];
          m != null && (!/** @type {any} */
          i.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === i) && m.call(i, e);
        } catch (w) {
          p ? h.push(w) : p = w;
        }
        if (e.cancelBubble || y === t || y === null)
          break;
        i = y;
      }
      if (p) {
        for (let w of h)
          queueMicrotask(() => {
            throw w;
          });
        throw p;
      }
    } finally {
      e.__root = t, delete e.currentTarget, Nt(d), qt(f);
    }
  }
}
function Qs(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Ht(e, t) {
  var n = (
    /** @type {Effect} */
    Oe
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function J(e, t) {
  var n = (t & Il) !== 0, r = (t & Hf) !== 0, o, i = !e.startsWith("<!>");
  return () => {
    if (ke)
      return Ht(De, null), De;
    o === void 0 && (o = Qs(i ? e : "<!>" + e), n || (o = /** @type {Node} */
    /* @__PURE__ */ st(o)));
    var s = (
      /** @type {TemplateNode} */
      r || du ? document.importNode(o, !0) : o.cloneNode(!0)
    );
    if (n) {
      var a = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ st(s)
      ), l = (
        /** @type {TemplateNode} */
        s.lastChild
      );
      Ht(a, l);
    } else
      Ht(s, s);
    return s;
  };
}
// @__NO_SIDE_EFFECTS__
function Pp(e, t, n = "svg") {
  var r = !e.startsWith("<!>"), o = (t & Il) !== 0, i = `<${n}>${r ? e : "<!>" + e}</${n}>`, s;
  return () => {
    if (ke)
      return Ht(De, null), De;
    if (!s) {
      var a = (
        /** @type {DocumentFragment} */
        Qs(i)
      ), l = (
        /** @type {Element} */
        /* @__PURE__ */ st(a)
      );
      if (o)
        for (s = document.createDocumentFragment(); /* @__PURE__ */ st(l); )
          s.appendChild(
            /** @type {Node} */
            /* @__PURE__ */ st(l)
          );
      else
        s = /** @type {Element} */
        /* @__PURE__ */ st(l);
    }
    var u = (
      /** @type {TemplateNode} */
      s.cloneNode(!0)
    );
    if (o) {
      var d = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ st(u)
      ), f = (
        /** @type {TemplateNode} */
        u.lastChild
      );
      Ht(d, f);
    } else
      Ht(u, u);
    return u;
  };
}
// @__NO_SIDE_EFFECTS__
function ye(e, t) {
  return /* @__PURE__ */ Pp(e, t, "svg");
}
function Se(e = "") {
  if (!ke) {
    var t = Mt(e + "");
    return Ht(t, t), t;
  }
  var n = De;
  return n.nodeType !== Oi && (n.before(n = Mt()), ot(n)), Ht(n, n), n;
}
function Ce() {
  if (ke)
    return Ht(De, null), De;
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Mt();
  return e.append(t, n), Ht(t, n), e;
}
function D(e, t) {
  if (ke) {
    var n = (
      /** @type {Effect} */
      Oe
    );
    ((n.f & Hi) === 0 || n.nodes_end === null) && (n.nodes_end = De), yn();
    return;
  }
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function Np(e) {
  return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
const Dp = [
  "beforeinput",
  "click",
  "change",
  "dblclick",
  "contextmenu",
  "focusin",
  "focusout",
  "input",
  "keydown",
  "keyup",
  "mousedown",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "pointerdown",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "touchend",
  "touchmove",
  "touchstart"
];
function Hp(e) {
  return Dp.includes(e);
}
const Op = {
  // no `class: 'className'` because we handle that separately
  formnovalidate: "formNoValidate",
  ismap: "isMap",
  nomodule: "noModule",
  playsinline: "playsInline",
  readonly: "readOnly",
  defaultvalue: "defaultValue",
  defaultchecked: "defaultChecked",
  srcobject: "srcObject",
  novalidate: "noValidate",
  allowfullscreen: "allowFullscreen",
  disablepictureinpicture: "disablePictureInPicture",
  disableremoteplayback: "disableRemotePlayback"
};
function Mp(e) {
  return e = e.toLowerCase(), Op[e] ?? e;
}
const Ap = ["touchstart", "touchmove"];
function Tp(e) {
  return Ap.includes(e);
}
const zp = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function Vp(e) {
  return zp.includes(
    /** @type {typeof RAW_TEXT_ELEMENTS[number]} */
    e
  );
}
function Re(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = n + "");
}
function Au(e, t) {
  return Tu(e, t);
}
function Lp(e, t) {
  vs(), t.intro = t.intro ?? !1;
  const n = t.target, r = ke, o = De;
  try {
    for (var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ st(n)
    ); i && (i.nodeType !== xr || /** @type {Comment} */
    i.data !== jl); )
      i = /** @type {TemplateNode} */
      /* @__PURE__ */ sn(i);
    if (!i)
      throw hr;
    Lt(!0), ot(
      /** @type {Comment} */
      i
    );
    const s = Tu(e, { ...t, anchor: i });
    return Lt(!1), /**  @type {Exports} */
    s;
  } catch (s) {
    if (s instanceof Error && s.message.split(`
`).some((a) => a.startsWith("https://svelte.dev/e/")))
      throw s;
    return s !== hr && console.warn("Failed to hydrate: ", s), t.recover === !1 && qf(), vs(), qs(n), Lt(!1), Au(e, t);
  } finally {
    Lt(r), ot(o);
  }
}
const Cr = /* @__PURE__ */ new Map();
function Tu(e, { target: t, anchor: n, props: r = {}, events: o, context: i, intro: s = !0 }) {
  vs();
  var a = /* @__PURE__ */ new Set(), l = (f) => {
    for (var p = 0; p < f.length; p++) {
      var h = f[p];
      if (!a.has(h)) {
        a.add(h);
        var y = Tp(h);
        t.addEventListener(h, Qr, { passive: y });
        var m = Cr.get(h);
        m === void 0 ? (document.addEventListener(h, Qr, { passive: y }), Cr.set(h, 1)) : Cr.set(h, m + 1);
      }
    }
  };
  l(Is(Mu)), ys.add(l);
  var u = void 0, d = xp(() => {
    var f = n ?? t.appendChild(Mt());
    return ap(
      /** @type {TemplateNode} */
      f,
      {
        pending: () => {
        }
      },
      (p) => {
        if (i) {
          de({});
          var h = (
            /** @type {ComponentContext} */
            Fe
          );
          h.c = i;
        }
        if (o && (r.$$events = o), ke && Ht(
          /** @type {TemplateNode} */
          p,
          null
        ), u = e(p, r) || {}, ke && (Oe.nodes_end = De, De === null || De.nodeType !== xr || /** @type {Comment} */
        De.data !== Ls))
          throw _o(), hr;
        i && fe();
      }
    ), () => {
      for (var p of a) {
        t.removeEventListener(p, Qr);
        var h = (
          /** @type {number} */
          Cr.get(p)
        );
        --h === 0 ? (document.removeEventListener(p, Qr), Cr.delete(p)) : Cr.set(p, h);
      }
      ys.delete(l), f !== n && f.parentNode?.removeChild(f);
    };
  });
  return bs.set(u, d), u;
}
let bs = /* @__PURE__ */ new WeakMap();
function Ip(e, t) {
  const n = bs.get(e);
  return n ? (bs.delete(e), n(t)) : Promise.resolve();
}
class Eo {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #e = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #t = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #n = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #r = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #l = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#l = n;
  }
  #a = () => {
    var t = (
      /** @type {Batch} */
      We
    );
    if (this.#e.has(t)) {
      var n = (
        /** @type {Key} */
        this.#e.get(t)
      ), r = this.#t.get(n);
      if (r)
        Gs(r), this.#r.delete(n);
      else {
        var o = this.#n.get(n);
        o && (this.#t.set(n, o.effect), this.#n.delete(n), o.fragment.lastChild.remove(), this.anchor.before(o.fragment), r = o.effect);
      }
      for (const [i, s] of this.#e) {
        if (this.#e.delete(i), i === t)
          break;
        const a = this.#n.get(s);
        a && (lt(a.effect), this.#n.delete(s));
      }
      for (const [i, s] of this.#t) {
        if (i === n || this.#r.has(i)) continue;
        const a = () => {
          if (Array.from(this.#e.values()).includes(i)) {
            var l = document.createDocumentFragment();
            Cu(s, l), l.append(Mt()), this.#n.set(i, { effect: s, fragment: l });
          } else
            lt(s);
          this.#r.delete(i), this.#t.delete(i);
        };
        this.#l || !r ? (this.#r.add(i), Nr(s, a, !1)) : a();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #o = (t) => {
    this.#e.delete(t);
    const n = Array.from(this.#e.values());
    for (const [r, o] of this.#n)
      n.includes(r) || (lt(o.effect), this.#n.delete(r));
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      We
    ), o = hu();
    n && !this.#t.has(t) && !this.#n.has(t) && this.#t.set(
      t,
      Vt(() => n(this.anchor))
    ), this.#e.set(r, t), o || (ke && (this.anchor = De), this.#a());
  }
}
function tt(e, t, ...n) {
  var r = new Eo(e);
  kr(() => {
    const o = t() ?? null;
    r.ensure(o, o && ((i) => o(i, ...n)));
  }, An);
}
function jn(e) {
  Fe === null && Zs(), qr && Fe.l !== null ? jp(Fe).m.push(e) : Je(() => {
    const t = dt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Po(e) {
  Fe === null && Zs(), jn(() => () => dt(e));
}
function jp(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ??= { a: [], b: [], m: [] };
}
function oe(e, t, n = !1) {
  ke && yn();
  var r = new Eo(e), o = n ? An : 0;
  function i(s, a) {
    if (ke) {
      const u = Xl(e) === Si;
      if (s === u) {
        var l = ai();
        ot(l), r.anchor = l, Lt(!1), r.ensure(s, a), Lt(!0);
        return;
      }
    }
    r.ensure(s, a);
  }
  kr(() => {
    var s = !1;
    t((a, l = !0) => {
      s = !0, i(l, a);
    }), s || i(!1, null);
  }, o);
}
function Gi(e, t, n) {
  ke && yn();
  var r = new Eo(e), o = !Xr();
  kr(() => {
    var i = t();
    o && i !== null && typeof i == "object" && (i = /** @type {V} */
    {}), r.ensure(i, n);
  });
}
function Rp(e, t) {
  ke && ot(
    /** @type {TemplateNode} */
    /* @__PURE__ */ st(e)
  ), Co(() => {
    var n = t();
    for (var r in n) {
      var o = n[r];
      o ? e.style.setProperty(r, o) : e.style.removeProperty(r);
    }
  });
}
function zu(e, t, n = !1, r = !1, o = !1) {
  var i = e, s = "";
  xe(() => {
    var a = (
      /** @type {Effect} */
      Oe
    );
    if (s === (s = t() ?? "")) {
      ke && yn();
      return;
    }
    if (a.nodes_start !== null && (xu(
      a.nodes_start,
      /** @type {TemplateNode} */
      a.nodes_end
    ), a.nodes_start = a.nodes_end = null), s !== "") {
      if (ke) {
        De.data;
        for (var l = yn(), u = l; l !== null && (l.nodeType !== xr || /** @type {Comment} */
        l.data !== ""); )
          u = l, l = /** @type {TemplateNode} */
          /* @__PURE__ */ sn(l);
        if (l === null)
          throw _o(), hr;
        Ht(De, u), i = ot(l);
        return;
      }
      var d = s + "";
      n ? d = `<svg>${d}</svg>` : r && (d = `<math>${d}</math>`);
      var f = Qs(d);
      if ((n || r) && (f = /** @type {Element} */
      /* @__PURE__ */ st(f)), Ht(
        /** @type {TemplateNode} */
        /* @__PURE__ */ st(f),
        /** @type {TemplateNode} */
        f.lastChild
      ), n || r)
        for (; /* @__PURE__ */ st(f); )
          i.before(
            /** @type {Node} */
            /* @__PURE__ */ st(f)
          );
      else
        i.before(f);
    }
  });
}
function Ti(e, t, n) {
  ke && yn();
  var r = new Eo(e);
  kr(() => {
    var o = t() ?? null;
    r.ensure(o, o && ((i) => n(i, o)));
  }, An);
}
function Kp(e, t, n, r, o, i) {
  let s = ke;
  ke && yn();
  var a = null;
  ke && De.nodeType === jf && (a = /** @type {Element} */
  De, yn());
  var l = (
    /** @type {TemplateNode} */
    ke ? De : e
  ), u = new Eo(l, !1);
  kr(() => {
    const d = t() || null;
    var f = d === "svg" ? Mf : null;
    if (d === null) {
      u.ensure(null, null);
      return;
    }
    return u.ensure(d, (p) => {
      if (d) {
        if (a = ke ? (
          /** @type {Element} */
          a
        ) : f ? document.createElementNS(f, d) : document.createElement(d), Ht(a, a), r) {
          ke && Vp(d) && a.append(document.createComment(""));
          var h = (
            /** @type {TemplateNode} */
            ke ? /* @__PURE__ */ st(a) : a.appendChild(Mt())
          );
          ke && (h === null ? Lt(!1) : ot(h)), r(a, h);
        }
        Oe.nodes_end = a, p.before(a);
      }
      ke && ot(p);
    }), () => {
    };
  }, An), Ai(() => {
  }), s && (Lt(!0), ot(l));
}
function Ke(e, t) {
  Fr(() => {
    var n = e.getRootNode(), r = (
      /** @type {ShadowRoot} */
      n.host ? (
        /** @type {ShadowRoot} */
        n
      ) : (
        /** @type {Document} */
        n.head ?? /** @type {Document} */
        n.ownerDocument.head
      )
    );
    if (!r.querySelector("#" + t.hash)) {
      const o = document.createElement("style");
      o.id = t.hash, o.textContent = t.code, r.appendChild(o);
    }
  });
}
function mt(e, t, n) {
  Fr(() => {
    var r = dt(() => t(e, n?.()) || {});
    if (n && r?.update) {
      var o = !1, i = (
        /** @type {any} */
        {}
      );
      Co(() => {
        var s = n();
        Us(s), o && Wl(i, s) && (i = s, r.update(s));
      }), o = !0;
    }
    if (r?.destroy)
      return () => (
        /** @type {Function} */
        r.destroy()
      );
  });
}
function Zp(e, t) {
  var n = void 0, r;
  yu(() => {
    n !== (n = t()) && (r && (lt(r), r = null), n && (r = Vt(() => {
      Fr(() => (
        /** @type {(node: Element) => void} */
        n(e)
      ));
    })));
  });
}
function Vu(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (n = Vu(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Bp() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (t = Vu(e)) && (r && (r += " "), r += t);
  return r;
}
function Rn(e) {
  return typeof e == "object" ? Bp(e) : e ?? "";
}
const Ma = [...` 	
\r\f \v\uFEFF`];
function Yp(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (t && (r = r ? r + " " + t : t), n) {
    for (var o in n)
      if (n[o])
        r = r ? r + " " + o : o;
      else if (r.length)
        for (var i = o.length, s = 0; (s = r.indexOf(o, s)) >= 0; ) {
          var a = s + i;
          (s === 0 || Ma.includes(r[s - 1])) && (a === r.length || Ma.includes(r[a])) ? r = (s === 0 ? "" : r.substring(0, s)) + r.substring(a + 1) : s = a;
        }
  }
  return r === "" ? null : r;
}
function Aa(e, t = !1) {
  var n = t ? " !important;" : ";", r = "";
  for (var o in e) {
    var i = e[o];
    i != null && i !== "" && (r += " " + o + ": " + i + n);
  }
  return r;
}
function Ui(e) {
  return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function qp(e, t) {
  if (t) {
    var n = "", r, o;
    if (Array.isArray(t) ? (r = t[0], o = t[1]) : r = t, e) {
      e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var i = !1, s = 0, a = !1, l = [];
      r && l.push(...Object.keys(r).map(Ui)), o && l.push(...Object.keys(o).map(Ui));
      var u = 0, d = -1;
      const m = e.length;
      for (var f = 0; f < m; f++) {
        var p = e[f];
        if (a ? p === "/" && e[f - 1] === "*" && (a = !1) : i ? i === p && (i = !1) : p === "/" && e[f + 1] === "*" ? a = !0 : p === '"' || p === "'" ? i = p : p === "(" ? s++ : p === ")" && s--, !a && i === !1 && s === 0) {
          if (p === ":" && d === -1)
            d = f;
          else if (p === ";" || f === m - 1) {
            if (d !== -1) {
              var h = Ui(e.substring(u, d).trim());
              if (!l.includes(h)) {
                p !== ";" && f++;
                var y = e.substring(u, f).trim();
                n += " " + y + ";";
              }
            }
            u = f + 1, d = -1;
          }
        }
      }
    }
    return r && (n += Aa(r)), o && (n += Aa(o, !0)), n = n.trim(), n === "" ? null : n;
  }
  return e == null ? null : String(e);
}
function ft(e, t, n, r, o, i) {
  var s = e.__className;
  if (ke || s !== n || s === void 0) {
    var a = Yp(n, r, i);
    (!ke || a !== e.getAttribute("class")) && (a == null ? e.removeAttribute("class") : t ? e.className = a : e.setAttribute("class", a)), e.__className = n;
  } else if (i && o !== i)
    for (var l in i) {
      var u = !!i[l];
      (o == null || u !== !!o[l]) && e.classList.toggle(l, u);
    }
  return i;
}
function Ji(e, t = {}, n, r) {
  for (var o in n) {
    var i = n[o];
    t[o] !== i && (n[o] == null ? e.style.removeProperty(o) : e.style.setProperty(o, i, r));
  }
}
function gt(e, t, n, r) {
  var o = e.__style;
  if (ke || o !== t) {
    var i = qp(t, r);
    (!ke || i !== e.getAttribute("style")) && (i == null ? e.removeAttribute("style") : e.style.cssText = i), e.__style = t;
  } else r && (Array.isArray(r) ? (Ji(e, n?.[0], r[0]), Ji(e, n?.[1], r[1], "important")) : Ji(e, n, r));
  return r;
}
function xs(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Ei(t))
      return Jf();
    for (var r of e.options)
      r.selected = t.includes(Ta(r));
    return;
  }
  for (r of e.options) {
    var o = Ta(r);
    if (vp(o, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Xp(e) {
  var t = new MutationObserver(() => {
    xs(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), Ai(() => {
    t.disconnect();
  });
}
function Ta(e) {
  return "__value" in e ? e.__value : e.value;
}
const Yn = Symbol("class"), pn = Symbol("style"), Lu = Symbol("is custom element"), Iu = Symbol("is html");
function Sn(e) {
  if (ke) {
    var t = !1, n = () => {
      if (!t) {
        if (t = !0, e.hasAttribute("value")) {
          var r = e.value;
          _e(e, "value", null), e.value = r;
        }
        if (e.hasAttribute("checked")) {
          var o = e.checked;
          _e(e, "checked", null), e.checked = o;
        }
      }
    };
    e.__on_r = n, nr(n), wp();
  }
}
function Uo(e, t) {
  var n = zi(e);
  n.value === (n.value = // treat null and undefined the same for the initial value
  t ?? void 0) || // @ts-expect-error
  // `progress` elements always need their value set when it's `0`
  e.value === t && (t !== 0 || e.nodeName !== "PROGRESS") || (e.value = t ?? "");
}
function Ko(e, t) {
  var n = zi(e);
  n.checked !== (n.checked = // treat null and undefined the same for the initial value
  t ?? void 0) && (e.checked = t);
}
function Fp(e, t) {
  t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function _e(e, t, n, r) {
  var o = zi(e);
  ke && (o[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === "LINK") || o[t] !== (o[t] = n) && (t === "loading" && (e[If] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ju(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function Wp(e, t, n, r, o = !1, i = !1) {
  if (ke && o && e.tagName === "INPUT") {
    var s = (
      /** @type {HTMLInputElement} */
      e
    ), a = s.type === "checkbox" ? "defaultChecked" : "defaultValue";
    a in n || Sn(s);
  }
  var l = zi(e), u = l[Lu], d = !l[Iu];
  let f = ke && u;
  f && Lt(!1);
  var p = t || {}, h = e.tagName === "OPTION";
  for (var y in t)
    y in n || (n[y] = null);
  n.class ? n.class = Rn(n.class) : (r || n[Yn]) && (n.class = null), n[pn] && (n.style ??= null);
  var m = ju(e);
  for (const S in n) {
    let M = n[S];
    if (h && S === "value" && M == null) {
      e.value = e.__value = "", p[S] = M;
      continue;
    }
    if (S === "class") {
      var w = e.namespaceURI === "http://www.w3.org/1999/xhtml";
      ft(e, w, M, r, t?.[Yn], n[Yn]), p[S] = M, p[Yn] = n[Yn];
      continue;
    }
    if (S === "style") {
      gt(e, M, t?.[pn], n[pn]), p[S] = M, p[pn] = n[pn];
      continue;
    }
    var b = p[S];
    if (!(M === b && !(M === void 0 && e.hasAttribute(S)))) {
      p[S] = M;
      var _ = S[0] + S[1];
      if (_ !== "$$")
        if (_ === "on") {
          const j = {}, L = "$$" + S;
          let I = S.slice(2);
          var $ = Hp(I);
          if (Np(I) && (I = I.slice(0, -7), j.capture = !0), !$ && b) {
            if (M != null) continue;
            e.removeEventListener(I, p[L], j), p[L] = null;
          }
          if (M != null)
            if ($)
              e[`__${I}`] = M, rr([I]);
            else {
              let T = function(N) {
                p[S].call(this, N);
              };
              p[L] = Js(I, e, T, j);
            }
          else $ && (e[`__${I}`] = void 0);
        } else if (S === "style")
          _e(e, S, M);
        else if (S === "autofocus")
          mp(
            /** @type {HTMLElement} */
            e,
            !!M
          );
        else if (!u && (S === "__value" || S === "value" && M != null))
          e.value = e.__value = M;
        else if (S === "selected" && h)
          Fp(
            /** @type {HTMLOptionElement} */
            e,
            M
          );
        else {
          var x = S;
          d || (x = Mp(x));
          var C = x === "defaultValue" || x === "defaultChecked";
          if (M == null && !u && !C)
            if (l[S] = null, x === "value" || x === "checked") {
              let j = (
                /** @type {HTMLInputElement} */
                e
              );
              const L = t === void 0;
              if (x === "value") {
                let I = j.defaultValue;
                j.removeAttribute(x), j.defaultValue = I, j.value = j.__value = L ? I : null;
              } else {
                let I = j.defaultChecked;
                j.removeAttribute(x), j.defaultChecked = I, j.checked = L ? I : !1;
              }
            } else
              e.removeAttribute(S);
          else C || m.includes(x) && (u || typeof M != "string") ? (e[x] = M, x in l && (l[x] = ct)) : typeof M != "function" && _e(e, x, M);
        }
    }
  }
  return f && Lt(!0), p;
}
function vt(e, t, n = [], r = [], o = [], i, s = !1, a = !1) {
  iu(o, n, r, (l) => {
    var u = void 0, d = {}, f = e.nodeName === "SELECT", p = !1;
    if (yu(() => {
      var y = t(...l.map(c)), m = Wp(
        e,
        u,
        y,
        i,
        s,
        a
      );
      p && f && "value" in y && xs(
        /** @type {HTMLSelectElement} */
        e,
        y.value
      );
      for (let b of Object.getOwnPropertySymbols(d))
        y[b] || lt(d[b]);
      for (let b of Object.getOwnPropertySymbols(y)) {
        var w = y[b];
        b.description === Af && (!u || w !== u[b]) && (d[b] && lt(d[b]), d[b] = Vt(() => Zp(e, () => w))), m[b] = w;
      }
      u = m;
    }), f) {
      var h = (
        /** @type {HTMLSelectElement} */
        e
      );
      Fr(() => {
        xs(
          h,
          /** @type {Record<string | symbol, any>} */
          u.value,
          !0
        ), Xp(h);
      });
    }
    p = !0;
  });
}
function zi(e) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    e.__attributes ??= {
      [Lu]: e.nodeName.includes("-"),
      [Iu]: e.namespaceURI === Of
    }
  );
}
var za = /* @__PURE__ */ new Map();
function ju(e) {
  var t = e.getAttribute("is") || e.nodeName, n = za.get(t);
  if (n) return n;
  za.set(t, n = []);
  for (var r, o = e, i = Element.prototype; i !== o; ) {
    r = Rl(o);
    for (var s in r)
      r[s].set && n.push(s);
    o = Pi(o);
  }
  return n;
}
class ea {
  /** */
  #e = /* @__PURE__ */ new WeakMap();
  /** @type {ResizeObserver | undefined} */
  #t;
  /** @type {ResizeObserverOptions} */
  #n;
  /** @static */
  static entries = /* @__PURE__ */ new WeakMap();
  /** @param {ResizeObserverOptions} options */
  constructor(t) {
    this.#n = t;
  }
  /**
   * @param {Element} element
   * @param {(entry: ResizeObserverEntry) => any} listener
   */
  observe(t, n) {
    var r = this.#e.get(t) || /* @__PURE__ */ new Set();
    return r.add(n), this.#e.set(t, r), this.#r().observe(t, this.#n), () => {
      var o = this.#e.get(t);
      o.delete(n), o.size === 0 && (this.#e.delete(t), this.#t.unobserve(t));
    };
  }
  #r() {
    return this.#t ?? (this.#t = new ResizeObserver(
      /** @param {any} entries */
      (t) => {
        for (var n of t) {
          ea.entries.set(n.target, n);
          for (var r of this.#e.get(n.target) || [])
            r(n);
        }
      }
    ));
  }
}
var Gp = /* @__PURE__ */ new ea({
  box: "border-box"
});
function Va(e, t, n) {
  var r = Gp.observe(e, () => n(e[t]));
  Fr(() => (dt(() => n(e[t])), r));
}
function La(e, t) {
  return e === t || e?.[gn] === t;
}
function At(e = {}, t, n, r) {
  return Fr(() => {
    var o, i;
    return Co(() => {
      o = i, i = [], dt(() => {
        e !== n(...i) && (t(e, ...i), o && La(n(...o), e) && t(null, ...o));
      });
    }), () => {
      nr(() => {
        i && La(n(...i), e) && t(null, ...i);
      });
    };
  }), e;
}
function Ru(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    Fe
  ), n = t.l.u;
  if (!n) return;
  let r = () => Us(t.s);
  if (e) {
    let o = 0, i = (
      /** @type {Record<string, any>} */
      {}
    );
    const s = /* @__PURE__ */ $o(() => {
      let a = !1;
      const l = t.s;
      for (const u in l)
        l[u] !== i[u] && (i[u] = l[u], a = !0);
      return a && o++, o;
    });
    r = () => c(s);
  }
  n.b.length && mu(() => {
    Ia(t, r), fs(n.b);
  }), Je(() => {
    const o = dt(() => n.m.map(Lf));
    return () => {
      for (const i of o)
        typeof i == "function" && i();
    };
  }), n.a.length && Je(() => {
    Ia(t, r), fs(n.a);
  });
}
function Ia(e, t) {
  if (e.l.s)
    for (const n of e.l.s) c(n);
  t();
}
let Zo = !1;
function Up(e) {
  var t = Zo;
  try {
    return Zo = !1, [e(), Zo];
  } finally {
    Zo = t;
  }
}
const Jp = {
  get(e, t) {
    if (!e.exclude.includes(t))
      return e.props[t];
  },
  set(e, t) {
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    if (!e.exclude.includes(t) && t in e.props)
      return {
        enumerable: !0,
        configurable: !0,
        value: e.props[t]
      };
  },
  has(e, t) {
    return e.exclude.includes(t) ? !1 : t in e.props;
  },
  ownKeys(e) {
    return Reflect.ownKeys(e.props).filter((t) => !e.exclude.includes(t));
  }
};
// @__NO_SIDE_EFFECTS__
function Be(e, t, n) {
  return new Proxy(
    { props: e, exclude: t },
    Jp
  );
}
const Qp = {
  get(e, t) {
    if (!e.exclude.includes(t))
      return c(e.version), t in e.special ? e.special[t]() : e.props[t];
  },
  set(e, t, n) {
    if (!(t in e.special)) {
      var r = Oe;
      try {
        qt(e.parent_effect), e.special[t] = v(
          {
            get [t]() {
              return e.props[t];
            }
          },
          /** @type {string} */
          t,
          Ll
        );
      } finally {
        qt(r);
      }
    }
    return e.special[t](n), Ea(e.version), !0;
  },
  getOwnPropertyDescriptor(e, t) {
    if (!e.exclude.includes(t) && t in e.props)
      return {
        enumerable: !0,
        configurable: !0,
        value: e.props[t]
      };
  },
  deleteProperty(e, t) {
    return e.exclude.includes(t) || (e.exclude.push(t), Ea(e.version)), !0;
  },
  has(e, t) {
    return e.exclude.includes(t) ? !1 : t in e.props;
  },
  ownKeys(e) {
    return Reflect.ownKeys(e.props).filter((t) => !e.exclude.includes(t));
  }
};
function ja(e, t) {
  return new Proxy(
    {
      props: e,
      exclude: t,
      special: {},
      version: Jn(0),
      // TODO this is only necessary because we need to track component
      // destruction inside `prop`, because of `bind:this`, but it
      // seems likely that we can simplify `bind:this` instead
      parent_effect: (
        /** @type {Effect} */
        Oe
      )
    },
    Qp
  );
}
const eh = {
  get(e, t) {
    let n = e.props.length;
    for (; n--; ) {
      let r = e.props[n];
      if (Gr(r) && (r = r()), typeof r == "object" && r !== null && t in r) return r[t];
    }
  },
  set(e, t, n) {
    let r = e.props.length;
    for (; r--; ) {
      let o = e.props[r];
      Gr(o) && (o = o());
      const i = Dn(o, t);
      if (i && i.set)
        return i.set(n), !0;
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let n = e.props.length;
    for (; n--; ) {
      let r = e.props[n];
      if (Gr(r) && (r = r()), typeof r == "object" && r !== null && t in r) {
        const o = Dn(r, t);
        return o && !o.configurable && (o.configurable = !0), o;
      }
    }
  },
  has(e, t) {
    if (t === gn || t === Ks) return !1;
    for (let n of e.props)
      if (Gr(n) && (n = n()), n != null && t in n) return !0;
    return !1;
  },
  ownKeys(e) {
    const t = [];
    for (let n of e.props)
      if (Gr(n) && (n = n()), !!n) {
        for (const r in n)
          t.includes(r) || t.push(r);
        for (const r of Object.getOwnPropertySymbols(n))
          t.includes(r) || t.push(r);
      }
    return t;
  }
};
function Ge(...e) {
  return new Proxy({ props: e }, eh);
}
function v(e, t, n, r) {
  var o = !qr || (n & Pf) !== 0, i = (n & Nf) !== 0, s = (n & Df) !== 0, a = (
    /** @type {V} */
    r
  ), l = !0, u = () => (l && (l = !1, a = s ? dt(
    /** @type {() => V} */
    r
  ) : (
    /** @type {V} */
    r
  )), a), d;
  if (i) {
    var f = gn in e || Ks in e;
    d = Dn(e, t)?.set ?? (f && t in e ? ($) => e[t] = $ : void 0);
  }
  var p, h = !1;
  i ? [p, h] = Up(() => (
    /** @type {V} */
    e[t]
  )) : p = /** @type {V} */
  e[t], p === void 0 && r !== void 0 && (p = u(), d && (o && Xf(), d(p)));
  var y;
  if (o ? y = () => {
    var $ = (
      /** @type {V} */
      e[t]
    );
    return $ === void 0 ? u() : (l = !0, $);
  } : y = () => {
    var $ = (
      /** @type {V} */
      e[t]
    );
    return $ !== void 0 && (a = /** @type {V} */
    void 0), $ === void 0 ? a : $;
  }, o && (n & Ll) === 0)
    return y;
  if (d) {
    var m = e.$$legacy;
    return (
      /** @type {() => V} */
      function($, x) {
        return arguments.length > 0 ? ((!o || !x || m || h) && d(x ? y() : $), $) : y();
      }
    );
  }
  var w = !1, b = ((n & Ef) !== 0 ? $o : Bs)(() => (w = !1, y()));
  i && c(b);
  var _ = (
    /** @type {Effect} */
    Oe
  );
  return (
    /** @type {() => V} */
    function($, x) {
      if (arguments.length > 0) {
        const C = x ? c(b) : o && i ? Pt($) : $;
        return Q(b, C), w = !0, a !== void 0 && (a = C), $;
      }
      return _r && w || (_.f & Hn) !== 0 ? b.v : c(b);
    }
  );
}
function th(e) {
  return new nh(e);
}
class nh {
  /** @type {any} */
  #e;
  /** @type {Record<string, any>} */
  #t;
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(t) {
    var n = /* @__PURE__ */ new Map(), r = (i, s) => {
      var a = /* @__PURE__ */ uu(s, !1, !1);
      return n.set(i, a), a;
    };
    const o = new Proxy(
      { ...t.props || {}, $$events: {} },
      {
        get(i, s) {
          return c(n.get(s) ?? r(s, Reflect.get(i, s)));
        },
        has(i, s) {
          return s === Ks ? !0 : (c(n.get(s) ?? r(s, Reflect.get(i, s))), Reflect.has(i, s));
        },
        set(i, s, a) {
          return Q(n.get(s) ?? r(s, a), a), Reflect.set(i, s, a);
        }
      }
    );
    this.#t = (t.hydrate ? Lp : Au)(t.component, {
      target: t.target,
      anchor: t.anchor,
      props: o,
      context: t.context,
      intro: t.intro ?? !1,
      recover: t.recover
    }), (!t?.props?.$$host || t.sync === !1) && g(), this.#e = o.$$events;
    for (const i of Object.keys(this.#t))
      i === "$set" || i === "$destroy" || i === "$on" || si(this, i, {
        get() {
          return this.#t[i];
        },
        /** @param {any} value */
        set(s) {
          this.#t[i] = s;
        },
        enumerable: !0
      });
    this.#t.$set = /** @param {Record<string, any>} next */
    (i) => {
      Object.assign(o, i);
    }, this.#t.$destroy = () => {
      Ip(this.#t);
    };
  }
  /** @param {Record<string, any>} props */
  $set(t) {
    this.#t.$set(t);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(t, n) {
    this.#e[t] = this.#e[t] || [];
    const r = (...o) => n.call(this, ...o);
    return this.#e[t].push(r), () => {
      this.#e[t] = this.#e[t].filter(
        /** @param {any} fn */
        (o) => o !== r
      );
    };
  }
  $destroy() {
    this.#t.$destroy();
  }
}
let Ku;
typeof HTMLElement == "function" && (Ku = class extends HTMLElement {
  /** The Svelte component constructor */
  $$ctor;
  /** Slots */
  $$s;
  /** @type {any} The Svelte component instance */
  $$c;
  /** Whether or not the custom element is connected */
  $$cn = !1;
  /** @type {Record<string, any>} Component props data */
  $$d = {};
  /** `true` if currently in the process of reflecting component props back to attributes */
  $$r = !1;
  /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
  $$p_d = {};
  /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
  $$l = {};
  /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
  $$l_u = /* @__PURE__ */ new Map();
  /** @type {any} The managed render effect for reflecting attributes */
  $$me;
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(e, t, n) {
    super(), this.$$ctor = e, this.$$s = t, n && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(e, t, n) {
    if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(t), this.$$c) {
      const r = this.$$c.$on(e, t);
      this.$$l_u.set(t, r);
    }
    super.addEventListener(e, t, n);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(e, t, n) {
    if (super.removeEventListener(e, t, n), this.$$c) {
      const r = this.$$l_u.get(t);
      r && (r(), this.$$l_u.delete(t));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let e = function(r) {
        return (o) => {
          const i = document.createElement("slot");
          r !== "default" && (i.name = r), D(o, i);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const t = {}, n = rh(this);
      for (const r of this.$$s)
        r in n && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), t.default = !0) : t[r] = e(r));
      for (const r of this.attributes) {
        const o = this.$$g_p(r.name);
        o in this.$$d || (this.$$d[o] = Jo(o, r.value, this.$$p_d, "toProp"));
      }
      for (const r in this.$$p_d)
        !(r in this.$$d) && this[r] !== void 0 && (this.$$d[r] = this[r], delete this[r]);
      this.$$c = th({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: t,
          $$host: this
        }
      }), this.$$me = Fs(() => {
        Co(() => {
          this.$$r = !0;
          for (const r of ii(this.$$c)) {
            if (!this.$$p_d[r]?.reflect) continue;
            this.$$d[r] = this.$$c[r];
            const o = Jo(
              r,
              this.$$d[r],
              this.$$p_d,
              "toAttribute"
            );
            o == null ? this.removeAttribute(this.$$p_d[r].attribute || r) : this.setAttribute(this.$$p_d[r].attribute || r, o);
          }
          this.$$r = !1;
        });
      });
      for (const r in this.$$l)
        for (const o of this.$$l[r]) {
          const i = this.$$c.$on(r, o);
          this.$$l_u.set(o, i);
        }
      this.$$l = {};
    }
  }
  // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
  // and setting attributes through setAttribute etc, this is helpful
  /**
   * @param {string} attr
   * @param {string} _oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(e, t, n) {
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Jo(e, n, this.$$p_d, "toProp"), this.$$c?.$set({ [e]: this.$$d[e] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(e) {
    return ii(this.$$p_d).find(
      (t) => this.$$p_d[t].attribute === e || !this.$$p_d[t].attribute && t.toLowerCase() === e
    ) || e;
  }
});
function Jo(e, t, n, r) {
  const o = n[e]?.type;
  if (t = o === "Boolean" && typeof t != "boolean" ? t != null : t, !r || !n[e])
    return t;
  if (r === "toAttribute")
    switch (o) {
      case "Object":
      case "Array":
        return t == null ? null : JSON.stringify(t);
      case "Boolean":
        return t ? "" : null;
      case "Number":
        return t ?? null;
      default:
        return t;
    }
  else
    switch (o) {
      case "Object":
      case "Array":
        return t && JSON.parse(t);
      case "Boolean":
        return t;
      // conversion already handled above
      case "Number":
        return t != null ? +t : t;
      default:
        return t;
    }
}
function rh(e) {
  const t = {};
  return e.childNodes.forEach((n) => {
    t[
      /** @type {Element} node */
      n.slot || "default"
    ] = !0;
  }), t;
}
function le(e, t, n, r, o, i) {
  let s = class extends Ku {
    constructor() {
      super(e, n, o), this.$$p_d = t;
    }
    static get observedAttributes() {
      return ii(t).map(
        (a) => (t[a].attribute || a).toLowerCase()
      );
    }
  };
  return ii(t).forEach((a) => {
    si(s.prototype, a, {
      get() {
        return this.$$c && a in this.$$c ? this.$$c[a] : this.$$d[a];
      },
      set(l) {
        l = Jo(a, l, t), this.$$d[a] = l;
        var u = this.$$c;
        if (u) {
          var d = Dn(u, a)?.get;
          d ? u[a] = l : u.$set({ [a]: l });
        }
      }
    });
  }), r.forEach((a) => {
    si(s.prototype, a, {
      get() {
        return this.$$c?.[a];
      }
    });
  }), e.element = /** @type {any} */
  s, s;
}
var oh = { value: () => {
} };
function Vi() {
  for (var e = 0, t = arguments.length, n = {}, r; e < t; ++e) {
    if (!(r = arguments[e] + "") || r in n || /[\s.]/.test(r)) throw new Error("illegal type: " + r);
    n[r] = [];
  }
  return new Qo(n);
}
function Qo(e) {
  this._ = e;
}
function ih(e, t) {
  return e.trim().split(/^|\s+/).map(function(n) {
    var r = "", o = n.indexOf(".");
    if (o >= 0 && (r = n.slice(o + 1), n = n.slice(0, o)), n && !t.hasOwnProperty(n)) throw new Error("unknown type: " + n);
    return { type: n, name: r };
  });
}
Qo.prototype = Vi.prototype = {
  constructor: Qo,
  on: function(e, t) {
    var n = this._, r = ih(e + "", n), o, i = -1, s = r.length;
    if (arguments.length < 2) {
      for (; ++i < s; ) if ((o = (e = r[i]).type) && (o = sh(n[o], e.name))) return o;
      return;
    }
    if (t != null && typeof t != "function") throw new Error("invalid callback: " + t);
    for (; ++i < s; )
      if (o = (e = r[i]).type) n[o] = Ra(n[o], e.name, t);
      else if (t == null) for (o in n) n[o] = Ra(n[o], e.name, null);
    return this;
  },
  copy: function() {
    var e = {}, t = this._;
    for (var n in t) e[n] = t[n].slice();
    return new Qo(e);
  },
  call: function(e, t) {
    if ((o = arguments.length - 2) > 0) for (var n = new Array(o), r = 0, o, i; r < o; ++r) n[r] = arguments[r + 2];
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (i = this._[e], r = 0, o = i.length; r < o; ++r) i[r].value.apply(t, n);
  },
  apply: function(e, t, n) {
    if (!this._.hasOwnProperty(e)) throw new Error("unknown type: " + e);
    for (var r = this._[e], o = 0, i = r.length; o < i; ++o) r[o].value.apply(t, n);
  }
};
function sh(e, t) {
  for (var n = 0, r = e.length, o; n < r; ++n)
    if ((o = e[n]).name === t)
      return o.value;
}
function Ra(e, t, n) {
  for (var r = 0, o = e.length; r < o; ++r)
    if (e[r].name === t) {
      e[r] = oh, e = e.slice(0, r).concat(e.slice(r + 1));
      break;
    }
  return n != null && e.push({ name: t, value: n }), e;
}
var ks = "http://www.w3.org/1999/xhtml";
const Ka = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: ks,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};
function Li(e) {
  var t = e += "", n = t.indexOf(":");
  return n >= 0 && (t = e.slice(0, n)) !== "xmlns" && (e = e.slice(n + 1)), Ka.hasOwnProperty(t) ? { space: Ka[t], local: e } : e;
}
function ah(e) {
  return function() {
    var t = this.ownerDocument, n = this.namespaceURI;
    return n === ks && t.documentElement.namespaceURI === ks ? t.createElement(e) : t.createElementNS(n, e);
  };
}
function lh(e) {
  return function() {
    return this.ownerDocument.createElementNS(e.space, e.local);
  };
}
function Zu(e) {
  var t = Li(e);
  return (t.local ? lh : ah)(t);
}
function uh() {
}
function ta(e) {
  return e == null ? uh : function() {
    return this.querySelector(e);
  };
}
function ch(e) {
  typeof e != "function" && (e = ta(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], s = i.length, a = r[o] = new Array(s), l, u, d = 0; d < s; ++d)
      (l = i[d]) && (u = e.call(l, l.__data__, d, i)) && ("__data__" in l && (u.__data__ = l.__data__), a[d] = u);
  return new Rt(r, this._parents);
}
function dh(e) {
  return e == null ? [] : Array.isArray(e) ? e : Array.from(e);
}
function fh() {
  return [];
}
function Bu(e) {
  return e == null ? fh : function() {
    return this.querySelectorAll(e);
  };
}
function ph(e) {
  return function() {
    return dh(e.apply(this, arguments));
  };
}
function hh(e) {
  typeof e == "function" ? e = ph(e) : e = Bu(e);
  for (var t = this._groups, n = t.length, r = [], o = [], i = 0; i < n; ++i)
    for (var s = t[i], a = s.length, l, u = 0; u < a; ++u)
      (l = s[u]) && (r.push(e.call(l, l.__data__, u, s)), o.push(l));
  return new Rt(r, o);
}
function Yu(e) {
  return function() {
    return this.matches(e);
  };
}
function qu(e) {
  return function(t) {
    return t.matches(e);
  };
}
var gh = Array.prototype.find;
function vh(e) {
  return function() {
    return gh.call(this.children, e);
  };
}
function mh() {
  return this.firstElementChild;
}
function yh(e) {
  return this.select(e == null ? mh : vh(typeof e == "function" ? e : qu(e)));
}
var wh = Array.prototype.filter;
function bh() {
  return Array.from(this.children);
}
function xh(e) {
  return function() {
    return wh.call(this.children, e);
  };
}
function kh(e) {
  return this.selectAll(e == null ? bh : xh(typeof e == "function" ? e : qu(e)));
}
function _h(e) {
  typeof e != "function" && (e = Yu(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], s = i.length, a = r[o] = [], l, u = 0; u < s; ++u)
      (l = i[u]) && e.call(l, l.__data__, u, i) && a.push(l);
  return new Rt(r, this._parents);
}
function Xu(e) {
  return new Array(e.length);
}
function $h() {
  return new Rt(this._enter || this._groups.map(Xu), this._parents);
}
function di(e, t) {
  this.ownerDocument = e.ownerDocument, this.namespaceURI = e.namespaceURI, this._next = null, this._parent = e, this.__data__ = t;
}
di.prototype = {
  constructor: di,
  appendChild: function(e) {
    return this._parent.insertBefore(e, this._next);
  },
  insertBefore: function(e, t) {
    return this._parent.insertBefore(e, t);
  },
  querySelector: function(e) {
    return this._parent.querySelector(e);
  },
  querySelectorAll: function(e) {
    return this._parent.querySelectorAll(e);
  }
};
function Ch(e) {
  return function() {
    return e;
  };
}
function Sh(e, t, n, r, o, i) {
  for (var s = 0, a, l = t.length, u = i.length; s < u; ++s)
    (a = t[s]) ? (a.__data__ = i[s], r[s] = a) : n[s] = new di(e, i[s]);
  for (; s < l; ++s)
    (a = t[s]) && (o[s] = a);
}
function Eh(e, t, n, r, o, i, s) {
  var a, l, u = /* @__PURE__ */ new Map(), d = t.length, f = i.length, p = new Array(d), h;
  for (a = 0; a < d; ++a)
    (l = t[a]) && (p[a] = h = s.call(l, l.__data__, a, t) + "", u.has(h) ? o[a] = l : u.set(h, l));
  for (a = 0; a < f; ++a)
    h = s.call(e, i[a], a, i) + "", (l = u.get(h)) ? (r[a] = l, l.__data__ = i[a], u.delete(h)) : n[a] = new di(e, i[a]);
  for (a = 0; a < d; ++a)
    (l = t[a]) && u.get(p[a]) === l && (o[a] = l);
}
function Ph(e) {
  return e.__data__;
}
function Nh(e, t) {
  if (!arguments.length) return Array.from(this, Ph);
  var n = t ? Eh : Sh, r = this._parents, o = this._groups;
  typeof e != "function" && (e = Ch(e));
  for (var i = o.length, s = new Array(i), a = new Array(i), l = new Array(i), u = 0; u < i; ++u) {
    var d = r[u], f = o[u], p = f.length, h = Dh(e.call(d, d && d.__data__, u, r)), y = h.length, m = a[u] = new Array(y), w = s[u] = new Array(y), b = l[u] = new Array(p);
    n(d, f, m, w, b, h, t);
    for (var _ = 0, $ = 0, x, C; _ < y; ++_)
      if (x = m[_]) {
        for (_ >= $ && ($ = _ + 1); !(C = w[$]) && ++$ < y; ) ;
        x._next = C || null;
      }
  }
  return s = new Rt(s, r), s._enter = a, s._exit = l, s;
}
function Dh(e) {
  return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Hh() {
  return new Rt(this._exit || this._groups.map(Xu), this._parents);
}
function Oh(e, t, n) {
  var r = this.enter(), o = this, i = this.exit();
  return typeof e == "function" ? (r = e(r), r && (r = r.selection())) : r = r.append(e + ""), t != null && (o = t(o), o && (o = o.selection())), n == null ? i.remove() : n(i), r && o ? r.merge(o).order() : o;
}
function Mh(e) {
  for (var t = e.selection ? e.selection() : e, n = this._groups, r = t._groups, o = n.length, i = r.length, s = Math.min(o, i), a = new Array(o), l = 0; l < s; ++l)
    for (var u = n[l], d = r[l], f = u.length, p = a[l] = new Array(f), h, y = 0; y < f; ++y)
      (h = u[y] || d[y]) && (p[y] = h);
  for (; l < o; ++l)
    a[l] = n[l];
  return new Rt(a, this._parents);
}
function Ah() {
  for (var e = this._groups, t = -1, n = e.length; ++t < n; )
    for (var r = e[t], o = r.length - 1, i = r[o], s; --o >= 0; )
      (s = r[o]) && (i && s.compareDocumentPosition(i) ^ 4 && i.parentNode.insertBefore(s, i), i = s);
  return this;
}
function Th(e) {
  e || (e = zh);
  function t(f, p) {
    return f && p ? e(f.__data__, p.__data__) : !f - !p;
  }
  for (var n = this._groups, r = n.length, o = new Array(r), i = 0; i < r; ++i) {
    for (var s = n[i], a = s.length, l = o[i] = new Array(a), u, d = 0; d < a; ++d)
      (u = s[d]) && (l[d] = u);
    l.sort(t);
  }
  return new Rt(o, this._parents).order();
}
function zh(e, t) {
  return e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function Vh() {
  var e = arguments[0];
  return arguments[0] = this, e.apply(null, arguments), this;
}
function Lh() {
  return Array.from(this);
}
function Ih() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var r = e[t], o = 0, i = r.length; o < i; ++o) {
      var s = r[o];
      if (s) return s;
    }
  return null;
}
function jh() {
  let e = 0;
  for (const t of this) ++e;
  return e;
}
function Rh() {
  return !this.node();
}
function Kh(e) {
  for (var t = this._groups, n = 0, r = t.length; n < r; ++n)
    for (var o = t[n], i = 0, s = o.length, a; i < s; ++i)
      (a = o[i]) && e.call(a, a.__data__, i, o);
  return this;
}
function Zh(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Bh(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Yh(e, t) {
  return function() {
    this.setAttribute(e, t);
  };
}
function qh(e, t) {
  return function() {
    this.setAttributeNS(e.space, e.local, t);
  };
}
function Xh(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttribute(e) : this.setAttribute(e, n);
  };
}
function Fh(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? this.removeAttributeNS(e.space, e.local) : this.setAttributeNS(e.space, e.local, n);
  };
}
function Wh(e, t) {
  var n = Li(e);
  if (arguments.length < 2) {
    var r = this.node();
    return n.local ? r.getAttributeNS(n.space, n.local) : r.getAttribute(n);
  }
  return this.each((t == null ? n.local ? Bh : Zh : typeof t == "function" ? n.local ? Fh : Xh : n.local ? qh : Yh)(n, t));
}
function Fu(e) {
  return e.ownerDocument && e.ownerDocument.defaultView || e.document && e || e.defaultView;
}
function Gh(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function Uh(e, t, n) {
  return function() {
    this.style.setProperty(e, t, n);
  };
}
function Jh(e, t, n) {
  return function() {
    var r = t.apply(this, arguments);
    r == null ? this.style.removeProperty(e) : this.style.setProperty(e, r, n);
  };
}
function Qh(e, t, n) {
  return arguments.length > 1 ? this.each((t == null ? Gh : typeof t == "function" ? Jh : Uh)(e, t, n ?? "")) : Ir(this.node(), e);
}
function Ir(e, t) {
  return e.style.getPropertyValue(t) || Fu(e).getComputedStyle(e, null).getPropertyValue(t);
}
function eg(e) {
  return function() {
    delete this[e];
  };
}
function tg(e, t) {
  return function() {
    this[e] = t;
  };
}
function ng(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    n == null ? delete this[e] : this[e] = n;
  };
}
function rg(e, t) {
  return arguments.length > 1 ? this.each((t == null ? eg : typeof t == "function" ? ng : tg)(e, t)) : this.node()[e];
}
function Wu(e) {
  return e.trim().split(/^|\s+/);
}
function na(e) {
  return e.classList || new Gu(e);
}
function Gu(e) {
  this._node = e, this._names = Wu(e.getAttribute("class") || "");
}
Gu.prototype = {
  add: function(e) {
    var t = this._names.indexOf(e);
    t < 0 && (this._names.push(e), this._node.setAttribute("class", this._names.join(" ")));
  },
  remove: function(e) {
    var t = this._names.indexOf(e);
    t >= 0 && (this._names.splice(t, 1), this._node.setAttribute("class", this._names.join(" ")));
  },
  contains: function(e) {
    return this._names.indexOf(e) >= 0;
  }
};
function Uu(e, t) {
  for (var n = na(e), r = -1, o = t.length; ++r < o; ) n.add(t[r]);
}
function Ju(e, t) {
  for (var n = na(e), r = -1, o = t.length; ++r < o; ) n.remove(t[r]);
}
function og(e) {
  return function() {
    Uu(this, e);
  };
}
function ig(e) {
  return function() {
    Ju(this, e);
  };
}
function sg(e, t) {
  return function() {
    (t.apply(this, arguments) ? Uu : Ju)(this, e);
  };
}
function ag(e, t) {
  var n = Wu(e + "");
  if (arguments.length < 2) {
    for (var r = na(this.node()), o = -1, i = n.length; ++o < i; ) if (!r.contains(n[o])) return !1;
    return !0;
  }
  return this.each((typeof t == "function" ? sg : t ? og : ig)(n, t));
}
function lg() {
  this.textContent = "";
}
function ug(e) {
  return function() {
    this.textContent = e;
  };
}
function cg(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.textContent = t ?? "";
  };
}
function dg(e) {
  return arguments.length ? this.each(e == null ? lg : (typeof e == "function" ? cg : ug)(e)) : this.node().textContent;
}
function fg() {
  this.innerHTML = "";
}
function pg(e) {
  return function() {
    this.innerHTML = e;
  };
}
function hg(e) {
  return function() {
    var t = e.apply(this, arguments);
    this.innerHTML = t ?? "";
  };
}
function gg(e) {
  return arguments.length ? this.each(e == null ? fg : (typeof e == "function" ? hg : pg)(e)) : this.node().innerHTML;
}
function vg() {
  this.nextSibling && this.parentNode.appendChild(this);
}
function mg() {
  return this.each(vg);
}
function yg() {
  this.previousSibling && this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function wg() {
  return this.each(yg);
}
function bg(e) {
  var t = typeof e == "function" ? e : Zu(e);
  return this.select(function() {
    return this.appendChild(t.apply(this, arguments));
  });
}
function xg() {
  return null;
}
function kg(e, t) {
  var n = typeof e == "function" ? e : Zu(e), r = t == null ? xg : typeof t == "function" ? t : ta(t);
  return this.select(function() {
    return this.insertBefore(n.apply(this, arguments), r.apply(this, arguments) || null);
  });
}
function _g() {
  var e = this.parentNode;
  e && e.removeChild(this);
}
function $g() {
  return this.each(_g);
}
function Cg() {
  var e = this.cloneNode(!1), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Sg() {
  var e = this.cloneNode(!0), t = this.parentNode;
  return t ? t.insertBefore(e, this.nextSibling) : e;
}
function Eg(e) {
  return this.select(e ? Sg : Cg);
}
function Pg(e) {
  return arguments.length ? this.property("__data__", e) : this.node().__data__;
}
function Ng(e) {
  return function(t) {
    e.call(this, t, this.__data__);
  };
}
function Dg(e) {
  return e.trim().split(/^|\s+/).map(function(t) {
    var n = "", r = t.indexOf(".");
    return r >= 0 && (n = t.slice(r + 1), t = t.slice(0, r)), { type: t, name: n };
  });
}
function Hg(e) {
  return function() {
    var t = this.__on;
    if (t) {
      for (var n = 0, r = -1, o = t.length, i; n < o; ++n)
        i = t[n], (!e.type || i.type === e.type) && i.name === e.name ? this.removeEventListener(i.type, i.listener, i.options) : t[++r] = i;
      ++r ? t.length = r : delete this.__on;
    }
  };
}
function Og(e, t, n) {
  return function() {
    var r = this.__on, o, i = Ng(t);
    if (r) {
      for (var s = 0, a = r.length; s < a; ++s)
        if ((o = r[s]).type === e.type && o.name === e.name) {
          this.removeEventListener(o.type, o.listener, o.options), this.addEventListener(o.type, o.listener = i, o.options = n), o.value = t;
          return;
        }
    }
    this.addEventListener(e.type, i, n), o = { type: e.type, name: e.name, value: t, listener: i, options: n }, r ? r.push(o) : this.__on = [o];
  };
}
function Mg(e, t, n) {
  var r = Dg(e + ""), o, i = r.length, s;
  if (arguments.length < 2) {
    var a = this.node().__on;
    if (a) {
      for (var l = 0, u = a.length, d; l < u; ++l)
        for (o = 0, d = a[l]; o < i; ++o)
          if ((s = r[o]).type === d.type && s.name === d.name)
            return d.value;
    }
    return;
  }
  for (a = t ? Og : Hg, o = 0; o < i; ++o) this.each(a(r[o], t, n));
  return this;
}
function Qu(e, t, n) {
  var r = Fu(e), o = r.CustomEvent;
  typeof o == "function" ? o = new o(t, n) : (o = r.document.createEvent("Event"), n ? (o.initEvent(t, n.bubbles, n.cancelable), o.detail = n.detail) : o.initEvent(t, !1, !1)), e.dispatchEvent(o);
}
function Ag(e, t) {
  return function() {
    return Qu(this, e, t);
  };
}
function Tg(e, t) {
  return function() {
    return Qu(this, e, t.apply(this, arguments));
  };
}
function zg(e, t) {
  return this.each((typeof t == "function" ? Tg : Ag)(e, t));
}
function* Vg() {
  for (var e = this._groups, t = 0, n = e.length; t < n; ++t)
    for (var r = e[t], o = 0, i = r.length, s; o < i; ++o)
      (s = r[o]) && (yield s);
}
var ec = [null];
function Rt(e, t) {
  this._groups = e, this._parents = t;
}
function No() {
  return new Rt([[document.documentElement]], ec);
}
function Lg() {
  return this;
}
Rt.prototype = No.prototype = {
  constructor: Rt,
  select: ch,
  selectAll: hh,
  selectChild: yh,
  selectChildren: kh,
  filter: _h,
  data: Nh,
  enter: $h,
  exit: Hh,
  join: Oh,
  merge: Mh,
  selection: Lg,
  order: Ah,
  sort: Th,
  call: Vh,
  nodes: Lh,
  node: Ih,
  size: jh,
  empty: Rh,
  each: Kh,
  attr: Wh,
  style: Qh,
  property: rg,
  classed: ag,
  text: dg,
  html: gg,
  raise: mg,
  lower: wg,
  append: bg,
  insert: kg,
  remove: $g,
  clone: Eg,
  datum: Pg,
  on: Mg,
  dispatch: zg,
  [Symbol.iterator]: Vg
};
function Yt(e) {
  return typeof e == "string" ? new Rt([[document.querySelector(e)]], [document.documentElement]) : new Rt([[e]], ec);
}
function Ig(e) {
  let t;
  for (; t = e.sourceEvent; ) e = t;
  return e;
}
function Jt(e, t) {
  if (e = Ig(e), t === void 0 && (t = e.currentTarget), t) {
    var n = t.ownerSVGElement || t;
    if (n.createSVGPoint) {
      var r = n.createSVGPoint();
      return r.x = e.clientX, r.y = e.clientY, r = r.matrixTransform(t.getScreenCTM().inverse()), [r.x, r.y];
    }
    if (t.getBoundingClientRect) {
      var o = t.getBoundingClientRect();
      return [e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }
  }
  return [e.pageX, e.pageY];
}
const jg = { passive: !1 }, co = { capture: !0, passive: !1 };
function Qi(e) {
  e.stopImmediatePropagation();
}
function Dr(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function tc(e) {
  var t = e.document.documentElement, n = Yt(e).on("dragstart.drag", Dr, co);
  "onselectstart" in t ? n.on("selectstart.drag", Dr, co) : (t.__noselect = t.style.MozUserSelect, t.style.MozUserSelect = "none");
}
function nc(e, t) {
  var n = e.document.documentElement, r = Yt(e).on("dragstart.drag", null);
  t && (r.on("click.drag", Dr, co), setTimeout(function() {
    r.on("click.drag", null);
  }, 0)), "onselectstart" in n ? r.on("selectstart.drag", null) : (n.style.MozUserSelect = n.__noselect, delete n.__noselect);
}
const Bo = (e) => () => e;
function _s(e, {
  sourceEvent: t,
  subject: n,
  target: r,
  identifier: o,
  active: i,
  x: s,
  y: a,
  dx: l,
  dy: u,
  dispatch: d
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    subject: { value: n, enumerable: !0, configurable: !0 },
    target: { value: r, enumerable: !0, configurable: !0 },
    identifier: { value: o, enumerable: !0, configurable: !0 },
    active: { value: i, enumerable: !0, configurable: !0 },
    x: { value: s, enumerable: !0, configurable: !0 },
    y: { value: a, enumerable: !0, configurable: !0 },
    dx: { value: l, enumerable: !0, configurable: !0 },
    dy: { value: u, enumerable: !0, configurable: !0 },
    _: { value: d }
  });
}
_s.prototype.on = function() {
  var e = this._.on.apply(this._, arguments);
  return e === this._ ? this : e;
};
function Rg(e) {
  return !e.ctrlKey && !e.button;
}
function Kg() {
  return this.parentNode;
}
function Zg(e, t) {
  return t ?? { x: e.x, y: e.y };
}
function Bg() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function Yg() {
  var e = Rg, t = Kg, n = Zg, r = Bg, o = {}, i = Vi("start", "drag", "end"), s = 0, a, l, u, d, f = 0;
  function p(x) {
    x.on("mousedown.drag", h).filter(r).on("touchstart.drag", w).on("touchmove.drag", b, jg).on("touchend.drag touchcancel.drag", _).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function h(x, C) {
    if (!(d || !e.call(this, x, C))) {
      var S = $(this, t.call(this, x, C), x, C, "mouse");
      S && (Yt(x.view).on("mousemove.drag", y, co).on("mouseup.drag", m, co), tc(x.view), Qi(x), u = !1, a = x.clientX, l = x.clientY, S("start", x));
    }
  }
  function y(x) {
    if (Dr(x), !u) {
      var C = x.clientX - a, S = x.clientY - l;
      u = C * C + S * S > f;
    }
    o.mouse("drag", x);
  }
  function m(x) {
    Yt(x.view).on("mousemove.drag mouseup.drag", null), nc(x.view, u), Dr(x), o.mouse("end", x);
  }
  function w(x, C) {
    if (e.call(this, x, C)) {
      var S = x.changedTouches, M = t.call(this, x, C), j = S.length, L, I;
      for (L = 0; L < j; ++L)
        (I = $(this, M, x, C, S[L].identifier, S[L])) && (Qi(x), I("start", x, S[L]));
    }
  }
  function b(x) {
    var C = x.changedTouches, S = C.length, M, j;
    for (M = 0; M < S; ++M)
      (j = o[C[M].identifier]) && (Dr(x), j("drag", x, C[M]));
  }
  function _(x) {
    var C = x.changedTouches, S = C.length, M, j;
    for (d && clearTimeout(d), d = setTimeout(function() {
      d = null;
    }, 500), M = 0; M < S; ++M)
      (j = o[C[M].identifier]) && (Qi(x), j("end", x, C[M]));
  }
  function $(x, C, S, M, j, L) {
    var I = i.copy(), T = Jt(L || S, C), N, H, k;
    if ((k = n.call(x, new _s("beforestart", {
      sourceEvent: S,
      target: p,
      identifier: j,
      active: s,
      x: T[0],
      y: T[1],
      dx: 0,
      dy: 0,
      dispatch: I
    }), M)) != null)
      return N = k.x - T[0] || 0, H = k.y - T[1] || 0, function P(O, B, V) {
        var F = T, K;
        switch (O) {
          case "start":
            o[j] = P, K = s++;
            break;
          case "end":
            delete o[j], --s;
          // falls through
          case "drag":
            T = Jt(V || B, C), K = s;
            break;
        }
        I.call(
          O,
          x,
          new _s(O, {
            sourceEvent: B,
            subject: k,
            target: p,
            identifier: j,
            active: K,
            x: T[0] + N,
            y: T[1] + H,
            dx: T[0] - F[0],
            dy: T[1] - F[1],
            dispatch: I
          }),
          M
        );
      };
  }
  return p.filter = function(x) {
    return arguments.length ? (e = typeof x == "function" ? x : Bo(!!x), p) : e;
  }, p.container = function(x) {
    return arguments.length ? (t = typeof x == "function" ? x : Bo(x), p) : t;
  }, p.subject = function(x) {
    return arguments.length ? (n = typeof x == "function" ? x : Bo(x), p) : n;
  }, p.touchable = function(x) {
    return arguments.length ? (r = typeof x == "function" ? x : Bo(!!x), p) : r;
  }, p.on = function() {
    var x = i.on.apply(i, arguments);
    return x === i ? p : x;
  }, p.clickDistance = function(x) {
    return arguments.length ? (f = (x = +x) * x, p) : Math.sqrt(f);
  }, p;
}
function ra(e, t, n) {
  e.prototype = t.prototype = n, n.constructor = e;
}
function rc(e, t) {
  var n = Object.create(e.prototype);
  for (var r in t) n[r] = t[r];
  return n;
}
function Do() {
}
var fo = 0.7, fi = 1 / fo, Hr = "\\s*([+-]?\\d+)\\s*", po = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", vn = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", qg = /^#([0-9a-f]{3,8})$/, Xg = new RegExp(`^rgb\\(${Hr},${Hr},${Hr}\\)$`), Fg = new RegExp(`^rgb\\(${vn},${vn},${vn}\\)$`), Wg = new RegExp(`^rgba\\(${Hr},${Hr},${Hr},${po}\\)$`), Gg = new RegExp(`^rgba\\(${vn},${vn},${vn},${po}\\)$`), Ug = new RegExp(`^hsl\\(${po},${vn},${vn}\\)$`), Jg = new RegExp(`^hsla\\(${po},${vn},${vn},${po}\\)$`), Za = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
ra(Do, vr, {
  copy(e) {
    return Object.assign(new this.constructor(), this, e);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: Ba,
  // Deprecated! Use color.formatHex.
  formatHex: Ba,
  formatHex8: Qg,
  formatHsl: ev,
  formatRgb: Ya,
  toString: Ya
});
function Ba() {
  return this.rgb().formatHex();
}
function Qg() {
  return this.rgb().formatHex8();
}
function ev() {
  return oc(this).formatHsl();
}
function Ya() {
  return this.rgb().formatRgb();
}
function vr(e) {
  var t, n;
  return e = (e + "").trim().toLowerCase(), (t = qg.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? qa(t) : n === 3 ? new Dt(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? Yo(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? Yo(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = Xg.exec(e)) ? new Dt(t[1], t[2], t[3], 1) : (t = Fg.exec(e)) ? new Dt(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = Wg.exec(e)) ? Yo(t[1], t[2], t[3], t[4]) : (t = Gg.exec(e)) ? Yo(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Ug.exec(e)) ? Wa(t[1], t[2] / 100, t[3] / 100, 1) : (t = Jg.exec(e)) ? Wa(t[1], t[2] / 100, t[3] / 100, t[4]) : Za.hasOwnProperty(e) ? qa(Za[e]) : e === "transparent" ? new Dt(NaN, NaN, NaN, 0) : null;
}
function qa(e) {
  return new Dt(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function Yo(e, t, n, r) {
  return r <= 0 && (e = t = n = NaN), new Dt(e, t, n, r);
}
function tv(e) {
  return e instanceof Do || (e = vr(e)), e ? (e = e.rgb(), new Dt(e.r, e.g, e.b, e.opacity)) : new Dt();
}
function $s(e, t, n, r) {
  return arguments.length === 1 ? tv(e) : new Dt(e, t, n, r ?? 1);
}
function Dt(e, t, n, r) {
  this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
ra(Dt, $s, rc(Do, {
  brighter(e) {
    return e = e == null ? fi : Math.pow(fi, e), new Dt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? fo : Math.pow(fo, e), new Dt(this.r * e, this.g * e, this.b * e, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Dt(fr(this.r), fr(this.g), fr(this.b), pi(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: Xa,
  // Deprecated! Use color.formatHex.
  formatHex: Xa,
  formatHex8: nv,
  formatRgb: Fa,
  toString: Fa
}));
function Xa() {
  return `#${ur(this.r)}${ur(this.g)}${ur(this.b)}`;
}
function nv() {
  return `#${ur(this.r)}${ur(this.g)}${ur(this.b)}${ur((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function Fa() {
  const e = pi(this.opacity);
  return `${e === 1 ? "rgb(" : "rgba("}${fr(this.r)}, ${fr(this.g)}, ${fr(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function pi(e) {
  return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function fr(e) {
  return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function ur(e) {
  return e = fr(e), (e < 16 ? "0" : "") + e.toString(16);
}
function Wa(e, t, n, r) {
  return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new Qt(e, t, n, r);
}
function oc(e) {
  if (e instanceof Qt) return new Qt(e.h, e.s, e.l, e.opacity);
  if (e instanceof Do || (e = vr(e)), !e) return new Qt();
  if (e instanceof Qt) return e;
  e = e.rgb();
  var t = e.r / 255, n = e.g / 255, r = e.b / 255, o = Math.min(t, n, r), i = Math.max(t, n, r), s = NaN, a = i - o, l = (i + o) / 2;
  return a ? (t === i ? s = (n - r) / a + (n < r) * 6 : n === i ? s = (r - t) / a + 2 : s = (t - n) / a + 4, a /= l < 0.5 ? i + o : 2 - i - o, s *= 60) : a = l > 0 && l < 1 ? 0 : s, new Qt(s, a, l, e.opacity);
}
function rv(e, t, n, r) {
  return arguments.length === 1 ? oc(e) : new Qt(e, t, n, r ?? 1);
}
function Qt(e, t, n, r) {
  this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
ra(Qt, rv, rc(Do, {
  brighter(e) {
    return e = e == null ? fi : Math.pow(fi, e), new Qt(this.h, this.s, this.l * e, this.opacity);
  },
  darker(e) {
    return e = e == null ? fo : Math.pow(fo, e), new Qt(this.h, this.s, this.l * e, this.opacity);
  },
  rgb() {
    var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < 0.5 ? n : 1 - n) * t, o = 2 * n - r;
    return new Dt(
      es(e >= 240 ? e - 240 : e + 120, o, r),
      es(e, o, r),
      es(e < 120 ? e + 240 : e - 120, o, r),
      this.opacity
    );
  },
  clamp() {
    return new Qt(Ga(this.h), qo(this.s), qo(this.l), pi(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const e = pi(this.opacity);
    return `${e === 1 ? "hsl(" : "hsla("}${Ga(this.h)}, ${qo(this.s) * 100}%, ${qo(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
  }
}));
function Ga(e) {
  return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function qo(e) {
  return Math.max(0, Math.min(1, e || 0));
}
function es(e, t, n) {
  return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
const oa = (e) => () => e;
function ov(e, t) {
  return function(n) {
    return e + n * t;
  };
}
function iv(e, t, n) {
  return e = Math.pow(e, n), t = Math.pow(t, n) - e, n = 1 / n, function(r) {
    return Math.pow(e + r * t, n);
  };
}
function sv(e) {
  return (e = +e) == 1 ? ic : function(t, n) {
    return n - t ? iv(t, n, e) : oa(isNaN(t) ? n : t);
  };
}
function ic(e, t) {
  var n = t - e;
  return n ? ov(e, n) : oa(isNaN(e) ? t : e);
}
const hi = function e(t) {
  var n = sv(t);
  function r(o, i) {
    var s = n((o = $s(o)).r, (i = $s(i)).r), a = n(o.g, i.g), l = n(o.b, i.b), u = ic(o.opacity, i.opacity);
    return function(d) {
      return o.r = s(d), o.g = a(d), o.b = l(d), o.opacity = u(d), o + "";
    };
  }
  return r.gamma = e, r;
}(1);
function av(e, t) {
  t || (t = []);
  var n = e ? Math.min(t.length, e.length) : 0, r = t.slice(), o;
  return function(i) {
    for (o = 0; o < n; ++o) r[o] = e[o] * (1 - i) + t[o] * i;
    return r;
  };
}
function lv(e) {
  return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function uv(e, t) {
  var n = t ? t.length : 0, r = e ? Math.min(n, e.length) : 0, o = new Array(r), i = new Array(n), s;
  for (s = 0; s < r; ++s) o[s] = io(e[s], t[s]);
  for (; s < n; ++s) i[s] = t[s];
  return function(a) {
    for (s = 0; s < r; ++s) i[s] = o[s](a);
    return i;
  };
}
function cv(e, t) {
  var n = /* @__PURE__ */ new Date();
  return e = +e, t = +t, function(r) {
    return n.setTime(e * (1 - r) + t * r), n;
  };
}
function fn(e, t) {
  return e = +e, t = +t, function(n) {
    return e * (1 - n) + t * n;
  };
}
function dv(e, t) {
  var n = {}, r = {}, o;
  (e === null || typeof e != "object") && (e = {}), (t === null || typeof t != "object") && (t = {});
  for (o in t)
    o in e ? n[o] = io(e[o], t[o]) : r[o] = t[o];
  return function(i) {
    for (o in n) r[o] = n[o](i);
    return r;
  };
}
var Cs = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, ts = new RegExp(Cs.source, "g");
function fv(e) {
  return function() {
    return e;
  };
}
function pv(e) {
  return function(t) {
    return e(t) + "";
  };
}
function sc(e, t) {
  var n = Cs.lastIndex = ts.lastIndex = 0, r, o, i, s = -1, a = [], l = [];
  for (e = e + "", t = t + ""; (r = Cs.exec(e)) && (o = ts.exec(t)); )
    (i = o.index) > n && (i = t.slice(n, i), a[s] ? a[s] += i : a[++s] = i), (r = r[0]) === (o = o[0]) ? a[s] ? a[s] += o : a[++s] = o : (a[++s] = null, l.push({ i: s, x: fn(r, o) })), n = ts.lastIndex;
  return n < t.length && (i = t.slice(n), a[s] ? a[s] += i : a[++s] = i), a.length < 2 ? l[0] ? pv(l[0].x) : fv(t) : (t = l.length, function(u) {
    for (var d = 0, f; d < t; ++d) a[(f = l[d]).i] = f.x(u);
    return a.join("");
  });
}
function io(e, t) {
  var n = typeof t, r;
  return t == null || n === "boolean" ? oa(t) : (n === "number" ? fn : n === "string" ? (r = vr(t)) ? (t = r, hi) : sc : t instanceof vr ? hi : t instanceof Date ? cv : lv(t) ? av : Array.isArray(t) ? uv : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? dv : fn)(e, t);
}
var Ua = 180 / Math.PI, ac = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function lc(e, t, n, r, o, i) {
  var s, a, l;
  return (s = Math.sqrt(e * e + t * t)) && (e /= s, t /= s), (l = e * n + t * r) && (n -= e * l, r -= t * l), (a = Math.sqrt(n * n + r * r)) && (n /= a, r /= a, l /= a), e * r < t * n && (e = -e, t = -t, l = -l, s = -s), {
    translateX: o,
    translateY: i,
    rotate: Math.atan2(t, e) * Ua,
    skewX: Math.atan(l) * Ua,
    scaleX: s,
    scaleY: a
  };
}
var Xo;
function hv(e) {
  const t = new (typeof DOMMatrix == "function" ? DOMMatrix : WebKitCSSMatrix)(e + "");
  return t.isIdentity ? ac : lc(t.a, t.b, t.c, t.d, t.e, t.f);
}
function gv(e) {
  return e == null || (Xo || (Xo = document.createElementNS("http://www.w3.org/2000/svg", "g")), Xo.setAttribute("transform", e), !(e = Xo.transform.baseVal.consolidate())) ? ac : (e = e.matrix, lc(e.a, e.b, e.c, e.d, e.e, e.f));
}
function uc(e, t, n, r) {
  function o(u) {
    return u.length ? u.pop() + " " : "";
  }
  function i(u, d, f, p, h, y) {
    if (u !== f || d !== p) {
      var m = h.push("translate(", null, t, null, n);
      y.push({ i: m - 4, x: fn(u, f) }, { i: m - 2, x: fn(d, p) });
    } else (f || p) && h.push("translate(" + f + t + p + n);
  }
  function s(u, d, f, p) {
    u !== d ? (u - d > 180 ? d += 360 : d - u > 180 && (u += 360), p.push({ i: f.push(o(f) + "rotate(", null, r) - 2, x: fn(u, d) })) : d && f.push(o(f) + "rotate(" + d + r);
  }
  function a(u, d, f, p) {
    u !== d ? p.push({ i: f.push(o(f) + "skewX(", null, r) - 2, x: fn(u, d) }) : d && f.push(o(f) + "skewX(" + d + r);
  }
  function l(u, d, f, p, h, y) {
    if (u !== f || d !== p) {
      var m = h.push(o(h) + "scale(", null, ",", null, ")");
      y.push({ i: m - 4, x: fn(u, f) }, { i: m - 2, x: fn(d, p) });
    } else (f !== 1 || p !== 1) && h.push(o(h) + "scale(" + f + "," + p + ")");
  }
  return function(u, d) {
    var f = [], p = [];
    return u = e(u), d = e(d), i(u.translateX, u.translateY, d.translateX, d.translateY, f, p), s(u.rotate, d.rotate, f, p), a(u.skewX, d.skewX, f, p), l(u.scaleX, u.scaleY, d.scaleX, d.scaleY, f, p), u = d = null, function(h) {
      for (var y = -1, m = p.length, w; ++y < m; ) f[(w = p[y]).i] = w.x(h);
      return f.join("");
    };
  };
}
var vv = uc(hv, "px, ", "px)", "deg)"), mv = uc(gv, ", ", ")", ")"), yv = 1e-12;
function Ja(e) {
  return ((e = Math.exp(e)) + 1 / e) / 2;
}
function wv(e) {
  return ((e = Math.exp(e)) - 1 / e) / 2;
}
function bv(e) {
  return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
const ei = function e(t, n, r) {
  function o(i, s) {
    var a = i[0], l = i[1], u = i[2], d = s[0], f = s[1], p = s[2], h = d - a, y = f - l, m = h * h + y * y, w, b;
    if (m < yv)
      b = Math.log(p / u) / t, w = function(M) {
        return [
          a + M * h,
          l + M * y,
          u * Math.exp(t * M * b)
        ];
      };
    else {
      var _ = Math.sqrt(m), $ = (p * p - u * u + r * m) / (2 * u * n * _), x = (p * p - u * u - r * m) / (2 * p * n * _), C = Math.log(Math.sqrt($ * $ + 1) - $), S = Math.log(Math.sqrt(x * x + 1) - x);
      b = (S - C) / t, w = function(M) {
        var j = M * b, L = Ja(C), I = u / (n * _) * (L * bv(t * j + C) - wv(C));
        return [
          a + I * h,
          l + I * y,
          u * L / Ja(t * j + C)
        ];
      };
    }
    return w.duration = b * 1e3 * t / Math.SQRT2, w;
  }
  return o.rho = function(i) {
    var s = Math.max(1e-3, +i), a = s * s, l = a * a;
    return e(s, a, l);
  }, o;
}(Math.SQRT2, 2, 4);
var jr = 0, eo = 0, Ur = 0, cc = 1e3, gi, to, vi = 0, mr = 0, Ii = 0, ho = typeof performance == "object" && performance.now ? performance : Date, dc = typeof window == "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(e) {
  setTimeout(e, 17);
};
function ia() {
  return mr || (dc(xv), mr = ho.now() + Ii);
}
function xv() {
  mr = 0;
}
function mi() {
  this._call = this._time = this._next = null;
}
mi.prototype = fc.prototype = {
  constructor: mi,
  restart: function(e, t, n) {
    if (typeof e != "function") throw new TypeError("callback is not a function");
    n = (n == null ? ia() : +n) + (t == null ? 0 : +t), !this._next && to !== this && (to ? to._next = this : gi = this, to = this), this._call = e, this._time = n, Ss();
  },
  stop: function() {
    this._call && (this._call = null, this._time = 1 / 0, Ss());
  }
};
function fc(e, t, n) {
  var r = new mi();
  return r.restart(e, t, n), r;
}
function kv() {
  ia(), ++jr;
  for (var e = gi, t; e; )
    (t = mr - e._time) >= 0 && e._call.call(void 0, t), e = e._next;
  --jr;
}
function Qa() {
  mr = (vi = ho.now()) + Ii, jr = eo = 0;
  try {
    kv();
  } finally {
    jr = 0, $v(), mr = 0;
  }
}
function _v() {
  var e = ho.now(), t = e - vi;
  t > cc && (Ii -= t, vi = e);
}
function $v() {
  for (var e, t = gi, n, r = 1 / 0; t; )
    t._call ? (r > t._time && (r = t._time), e = t, t = t._next) : (n = t._next, t._next = null, t = e ? e._next = n : gi = n);
  to = e, Ss(r);
}
function Ss(e) {
  if (!jr) {
    eo && (eo = clearTimeout(eo));
    var t = e - mr;
    t > 24 ? (e < 1 / 0 && (eo = setTimeout(Qa, e - ho.now() - Ii)), Ur && (Ur = clearInterval(Ur))) : (Ur || (vi = ho.now(), Ur = setInterval(_v, cc)), jr = 1, dc(Qa));
  }
}
function el(e, t, n) {
  var r = new mi();
  return t = t == null ? 0 : +t, r.restart((o) => {
    r.stop(), e(o + t);
  }, t, n), r;
}
var Cv = Vi("start", "end", "cancel", "interrupt"), Sv = [], pc = 0, tl = 1, Es = 2, ti = 3, nl = 4, Ps = 5, ni = 6;
function ji(e, t, n, r, o, i) {
  var s = e.__transition;
  if (!s) e.__transition = {};
  else if (n in s) return;
  Ev(e, n, {
    name: t,
    index: r,
    // For context during callback.
    group: o,
    // For context during callback.
    on: Cv,
    tween: Sv,
    time: i.time,
    delay: i.delay,
    duration: i.duration,
    ease: i.ease,
    timer: null,
    state: pc
  });
}
function sa(e, t) {
  var n = an(e, t);
  if (n.state > pc) throw new Error("too late; already scheduled");
  return n;
}
function xn(e, t) {
  var n = an(e, t);
  if (n.state > ti) throw new Error("too late; already running");
  return n;
}
function an(e, t) {
  var n = e.__transition;
  if (!n || !(n = n[t])) throw new Error("transition not found");
  return n;
}
function Ev(e, t, n) {
  var r = e.__transition, o;
  r[t] = n, n.timer = fc(i, 0, n.time);
  function i(u) {
    n.state = tl, n.timer.restart(s, n.delay, n.time), n.delay <= u && s(u - n.delay);
  }
  function s(u) {
    var d, f, p, h;
    if (n.state !== tl) return l();
    for (d in r)
      if (h = r[d], h.name === n.name) {
        if (h.state === ti) return el(s);
        h.state === nl ? (h.state = ni, h.timer.stop(), h.on.call("interrupt", e, e.__data__, h.index, h.group), delete r[d]) : +d < t && (h.state = ni, h.timer.stop(), h.on.call("cancel", e, e.__data__, h.index, h.group), delete r[d]);
      }
    if (el(function() {
      n.state === ti && (n.state = nl, n.timer.restart(a, n.delay, n.time), a(u));
    }), n.state = Es, n.on.call("start", e, e.__data__, n.index, n.group), n.state === Es) {
      for (n.state = ti, o = new Array(p = n.tween.length), d = 0, f = -1; d < p; ++d)
        (h = n.tween[d].value.call(e, e.__data__, n.index, n.group)) && (o[++f] = h);
      o.length = f + 1;
    }
  }
  function a(u) {
    for (var d = u < n.duration ? n.ease.call(null, u / n.duration) : (n.timer.restart(l), n.state = Ps, 1), f = -1, p = o.length; ++f < p; )
      o[f].call(e, d);
    n.state === Ps && (n.on.call("end", e, e.__data__, n.index, n.group), l());
  }
  function l() {
    n.state = ni, n.timer.stop(), delete r[t];
    for (var u in r) return;
    delete e.__transition;
  }
}
function ri(e, t) {
  var n = e.__transition, r, o, i = !0, s;
  if (n) {
    t = t == null ? null : t + "";
    for (s in n) {
      if ((r = n[s]).name !== t) {
        i = !1;
        continue;
      }
      o = r.state > Es && r.state < Ps, r.state = ni, r.timer.stop(), r.on.call(o ? "interrupt" : "cancel", e, e.__data__, r.index, r.group), delete n[s];
    }
    i && delete e.__transition;
  }
}
function Pv(e) {
  return this.each(function() {
    ri(this, e);
  });
}
function Nv(e, t) {
  var n, r;
  return function() {
    var o = xn(this, e), i = o.tween;
    if (i !== n) {
      r = n = i;
      for (var s = 0, a = r.length; s < a; ++s)
        if (r[s].name === t) {
          r = r.slice(), r.splice(s, 1);
          break;
        }
    }
    o.tween = r;
  };
}
function Dv(e, t, n) {
  var r, o;
  if (typeof n != "function") throw new Error();
  return function() {
    var i = xn(this, e), s = i.tween;
    if (s !== r) {
      o = (r = s).slice();
      for (var a = { name: t, value: n }, l = 0, u = o.length; l < u; ++l)
        if (o[l].name === t) {
          o[l] = a;
          break;
        }
      l === u && o.push(a);
    }
    i.tween = o;
  };
}
function Hv(e, t) {
  var n = this._id;
  if (e += "", arguments.length < 2) {
    for (var r = an(this.node(), n).tween, o = 0, i = r.length, s; o < i; ++o)
      if ((s = r[o]).name === e)
        return s.value;
    return null;
  }
  return this.each((t == null ? Nv : Dv)(n, e, t));
}
function aa(e, t, n) {
  var r = e._id;
  return e.each(function() {
    var o = xn(this, r);
    (o.value || (o.value = {}))[t] = n.apply(this, arguments);
  }), function(o) {
    return an(o, r).value[t];
  };
}
function hc(e, t) {
  var n;
  return (typeof t == "number" ? fn : t instanceof vr ? hi : (n = vr(t)) ? (t = n, hi) : sc)(e, t);
}
function Ov(e) {
  return function() {
    this.removeAttribute(e);
  };
}
function Mv(e) {
  return function() {
    this.removeAttributeNS(e.space, e.local);
  };
}
function Av(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var s = this.getAttribute(e);
    return s === o ? null : s === r ? i : i = t(r = s, n);
  };
}
function Tv(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var s = this.getAttributeNS(e.space, e.local);
    return s === o ? null : s === r ? i : i = t(r = s, n);
  };
}
function zv(e, t, n) {
  var r, o, i;
  return function() {
    var s, a = n(this), l;
    return a == null ? void this.removeAttribute(e) : (s = this.getAttribute(e), l = a + "", s === l ? null : s === r && l === o ? i : (o = l, i = t(r = s, a)));
  };
}
function Vv(e, t, n) {
  var r, o, i;
  return function() {
    var s, a = n(this), l;
    return a == null ? void this.removeAttributeNS(e.space, e.local) : (s = this.getAttributeNS(e.space, e.local), l = a + "", s === l ? null : s === r && l === o ? i : (o = l, i = t(r = s, a)));
  };
}
function Lv(e, t) {
  var n = Li(e), r = n === "transform" ? mv : hc;
  return this.attrTween(e, typeof t == "function" ? (n.local ? Vv : zv)(n, r, aa(this, "attr." + e, t)) : t == null ? (n.local ? Mv : Ov)(n) : (n.local ? Tv : Av)(n, r, t));
}
function Iv(e, t) {
  return function(n) {
    this.setAttribute(e, t.call(this, n));
  };
}
function jv(e, t) {
  return function(n) {
    this.setAttributeNS(e.space, e.local, t.call(this, n));
  };
}
function Rv(e, t) {
  var n, r;
  function o() {
    var i = t.apply(this, arguments);
    return i !== r && (n = (r = i) && jv(e, i)), n;
  }
  return o._value = t, o;
}
function Kv(e, t) {
  var n, r;
  function o() {
    var i = t.apply(this, arguments);
    return i !== r && (n = (r = i) && Iv(e, i)), n;
  }
  return o._value = t, o;
}
function Zv(e, t) {
  var n = "attr." + e;
  if (arguments.length < 2) return (n = this.tween(n)) && n._value;
  if (t == null) return this.tween(n, null);
  if (typeof t != "function") throw new Error();
  var r = Li(e);
  return this.tween(n, (r.local ? Rv : Kv)(r, t));
}
function Bv(e, t) {
  return function() {
    sa(this, e).delay = +t.apply(this, arguments);
  };
}
function Yv(e, t) {
  return t = +t, function() {
    sa(this, e).delay = t;
  };
}
function qv(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? Bv : Yv)(t, e)) : an(this.node(), t).delay;
}
function Xv(e, t) {
  return function() {
    xn(this, e).duration = +t.apply(this, arguments);
  };
}
function Fv(e, t) {
  return t = +t, function() {
    xn(this, e).duration = t;
  };
}
function Wv(e) {
  var t = this._id;
  return arguments.length ? this.each((typeof e == "function" ? Xv : Fv)(t, e)) : an(this.node(), t).duration;
}
function Gv(e, t) {
  if (typeof t != "function") throw new Error();
  return function() {
    xn(this, e).ease = t;
  };
}
function Uv(e) {
  var t = this._id;
  return arguments.length ? this.each(Gv(t, e)) : an(this.node(), t).ease;
}
function Jv(e, t) {
  return function() {
    var n = t.apply(this, arguments);
    if (typeof n != "function") throw new Error();
    xn(this, e).ease = n;
  };
}
function Qv(e) {
  if (typeof e != "function") throw new Error();
  return this.each(Jv(this._id, e));
}
function e1(e) {
  typeof e != "function" && (e = Yu(e));
  for (var t = this._groups, n = t.length, r = new Array(n), o = 0; o < n; ++o)
    for (var i = t[o], s = i.length, a = r[o] = [], l, u = 0; u < s; ++u)
      (l = i[u]) && e.call(l, l.__data__, u, i) && a.push(l);
  return new Tn(r, this._parents, this._name, this._id);
}
function t1(e) {
  if (e._id !== this._id) throw new Error();
  for (var t = this._groups, n = e._groups, r = t.length, o = n.length, i = Math.min(r, o), s = new Array(r), a = 0; a < i; ++a)
    for (var l = t[a], u = n[a], d = l.length, f = s[a] = new Array(d), p, h = 0; h < d; ++h)
      (p = l[h] || u[h]) && (f[h] = p);
  for (; a < r; ++a)
    s[a] = t[a];
  return new Tn(s, this._parents, this._name, this._id);
}
function n1(e) {
  return (e + "").trim().split(/^|\s+/).every(function(t) {
    var n = t.indexOf(".");
    return n >= 0 && (t = t.slice(0, n)), !t || t === "start";
  });
}
function r1(e, t, n) {
  var r, o, i = n1(t) ? sa : xn;
  return function() {
    var s = i(this, e), a = s.on;
    a !== r && (o = (r = a).copy()).on(t, n), s.on = o;
  };
}
function o1(e, t) {
  var n = this._id;
  return arguments.length < 2 ? an(this.node(), n).on.on(e) : this.each(r1(n, e, t));
}
function i1(e) {
  return function() {
    var t = this.parentNode;
    for (var n in this.__transition) if (+n !== e) return;
    t && t.removeChild(this);
  };
}
function s1() {
  return this.on("end.remove", i1(this._id));
}
function a1(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = ta(e));
  for (var r = this._groups, o = r.length, i = new Array(o), s = 0; s < o; ++s)
    for (var a = r[s], l = a.length, u = i[s] = new Array(l), d, f, p = 0; p < l; ++p)
      (d = a[p]) && (f = e.call(d, d.__data__, p, a)) && ("__data__" in d && (f.__data__ = d.__data__), u[p] = f, ji(u[p], t, n, p, u, an(d, n)));
  return new Tn(i, this._parents, t, n);
}
function l1(e) {
  var t = this._name, n = this._id;
  typeof e != "function" && (e = Bu(e));
  for (var r = this._groups, o = r.length, i = [], s = [], a = 0; a < o; ++a)
    for (var l = r[a], u = l.length, d, f = 0; f < u; ++f)
      if (d = l[f]) {
        for (var p = e.call(d, d.__data__, f, l), h, y = an(d, n), m = 0, w = p.length; m < w; ++m)
          (h = p[m]) && ji(h, t, n, m, p, y);
        i.push(p), s.push(d);
      }
  return new Tn(i, s, t, n);
}
var u1 = No.prototype.constructor;
function c1() {
  return new u1(this._groups, this._parents);
}
function d1(e, t) {
  var n, r, o;
  return function() {
    var i = Ir(this, e), s = (this.style.removeProperty(e), Ir(this, e));
    return i === s ? null : i === n && s === r ? o : o = t(n = i, r = s);
  };
}
function gc(e) {
  return function() {
    this.style.removeProperty(e);
  };
}
function f1(e, t, n) {
  var r, o = n + "", i;
  return function() {
    var s = Ir(this, e);
    return s === o ? null : s === r ? i : i = t(r = s, n);
  };
}
function p1(e, t, n) {
  var r, o, i;
  return function() {
    var s = Ir(this, e), a = n(this), l = a + "";
    return a == null && (l = a = (this.style.removeProperty(e), Ir(this, e))), s === l ? null : s === r && l === o ? i : (o = l, i = t(r = s, a));
  };
}
function h1(e, t) {
  var n, r, o, i = "style." + t, s = "end." + i, a;
  return function() {
    var l = xn(this, e), u = l.on, d = l.value[i] == null ? a || (a = gc(t)) : void 0;
    (u !== n || o !== d) && (r = (n = u).copy()).on(s, o = d), l.on = r;
  };
}
function g1(e, t, n) {
  var r = (e += "") == "transform" ? vv : hc;
  return t == null ? this.styleTween(e, d1(e, r)).on("end.style." + e, gc(e)) : typeof t == "function" ? this.styleTween(e, p1(e, r, aa(this, "style." + e, t))).each(h1(this._id, e)) : this.styleTween(e, f1(e, r, t), n).on("end.style." + e, null);
}
function v1(e, t, n) {
  return function(r) {
    this.style.setProperty(e, t.call(this, r), n);
  };
}
function m1(e, t, n) {
  var r, o;
  function i() {
    var s = t.apply(this, arguments);
    return s !== o && (r = (o = s) && v1(e, s, n)), r;
  }
  return i._value = t, i;
}
function y1(e, t, n) {
  var r = "style." + (e += "");
  if (arguments.length < 2) return (r = this.tween(r)) && r._value;
  if (t == null) return this.tween(r, null);
  if (typeof t != "function") throw new Error();
  return this.tween(r, m1(e, t, n ?? ""));
}
function w1(e) {
  return function() {
    this.textContent = e;
  };
}
function b1(e) {
  return function() {
    var t = e(this);
    this.textContent = t ?? "";
  };
}
function x1(e) {
  return this.tween("text", typeof e == "function" ? b1(aa(this, "text", e)) : w1(e == null ? "" : e + ""));
}
function k1(e) {
  return function(t) {
    this.textContent = e.call(this, t);
  };
}
function _1(e) {
  var t, n;
  function r() {
    var o = e.apply(this, arguments);
    return o !== n && (t = (n = o) && k1(o)), t;
  }
  return r._value = e, r;
}
function $1(e) {
  var t = "text";
  if (arguments.length < 1) return (t = this.tween(t)) && t._value;
  if (e == null) return this.tween(t, null);
  if (typeof e != "function") throw new Error();
  return this.tween(t, _1(e));
}
function C1() {
  for (var e = this._name, t = this._id, n = vc(), r = this._groups, o = r.length, i = 0; i < o; ++i)
    for (var s = r[i], a = s.length, l, u = 0; u < a; ++u)
      if (l = s[u]) {
        var d = an(l, t);
        ji(l, e, n, u, s, {
          time: d.time + d.delay + d.duration,
          delay: 0,
          duration: d.duration,
          ease: d.ease
        });
      }
  return new Tn(r, this._parents, e, n);
}
function S1() {
  var e, t, n = this, r = n._id, o = n.size();
  return new Promise(function(i, s) {
    var a = { value: s }, l = { value: function() {
      --o === 0 && i();
    } };
    n.each(function() {
      var u = xn(this, r), d = u.on;
      d !== e && (t = (e = d).copy(), t._.cancel.push(a), t._.interrupt.push(a), t._.end.push(l)), u.on = t;
    }), o === 0 && i();
  });
}
var E1 = 0;
function Tn(e, t, n, r) {
  this._groups = e, this._parents = t, this._name = n, this._id = r;
}
function vc() {
  return ++E1;
}
var kn = No.prototype;
Tn.prototype = {
  constructor: Tn,
  select: a1,
  selectAll: l1,
  selectChild: kn.selectChild,
  selectChildren: kn.selectChildren,
  filter: e1,
  merge: t1,
  selection: c1,
  transition: C1,
  call: kn.call,
  nodes: kn.nodes,
  node: kn.node,
  size: kn.size,
  empty: kn.empty,
  each: kn.each,
  on: o1,
  attr: Lv,
  attrTween: Zv,
  style: g1,
  styleTween: y1,
  text: x1,
  textTween: $1,
  remove: s1,
  tween: Hv,
  delay: qv,
  duration: Wv,
  ease: Uv,
  easeVarying: Qv,
  end: S1,
  [Symbol.iterator]: kn[Symbol.iterator]
};
function P1(e) {
  return ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2;
}
var N1 = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: P1
};
function D1(e, t) {
  for (var n; !(n = e.__transition) || !(n = n[t]); )
    if (!(e = e.parentNode))
      throw new Error(`transition ${t} not found`);
  return n;
}
function H1(e) {
  var t, n;
  e instanceof Tn ? (t = e._id, e = e._name) : (t = vc(), (n = N1).time = ia(), e = e == null ? null : e + "");
  for (var r = this._groups, o = r.length, i = 0; i < o; ++i)
    for (var s = r[i], a = s.length, l, u = 0; u < a; ++u)
      (l = s[u]) && ji(l, e, t, u, s, n || D1(l, t));
  return new Tn(r, this._parents, e, t);
}
No.prototype.interrupt = Pv;
No.prototype.transition = H1;
const Fo = (e) => () => e;
function O1(e, {
  sourceEvent: t,
  target: n,
  transform: r,
  dispatch: o
}) {
  Object.defineProperties(this, {
    type: { value: e, enumerable: !0, configurable: !0 },
    sourceEvent: { value: t, enumerable: !0, configurable: !0 },
    target: { value: n, enumerable: !0, configurable: !0 },
    transform: { value: r, enumerable: !0, configurable: !0 },
    _: { value: o }
  });
}
function En(e, t, n) {
  this.k = e, this.x = t, this.y = n;
}
En.prototype = {
  constructor: En,
  scale: function(e) {
    return e === 1 ? this : new En(this.k * e, this.x, this.y);
  },
  translate: function(e, t) {
    return e === 0 & t === 0 ? this : new En(this.k, this.x + this.k * e, this.y + this.k * t);
  },
  apply: function(e) {
    return [e[0] * this.k + this.x, e[1] * this.k + this.y];
  },
  applyX: function(e) {
    return e * this.k + this.x;
  },
  applyY: function(e) {
    return e * this.k + this.y;
  },
  invert: function(e) {
    return [(e[0] - this.x) / this.k, (e[1] - this.y) / this.k];
  },
  invertX: function(e) {
    return (e - this.x) / this.k;
  },
  invertY: function(e) {
    return (e - this.y) / this.k;
  },
  rescaleX: function(e) {
    return e.copy().domain(e.range().map(this.invertX, this).map(e.invert, e));
  },
  rescaleY: function(e) {
    return e.copy().domain(e.range().map(this.invertY, this).map(e.invert, e));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var Ri = new En(1, 0, 0);
mc.prototype = En.prototype;
function mc(e) {
  for (; !e.__zoom; ) if (!(e = e.parentNode)) return Ri;
  return e.__zoom;
}
function ns(e) {
  e.stopImmediatePropagation();
}
function Jr(e) {
  e.preventDefault(), e.stopImmediatePropagation();
}
function M1(e) {
  return (!e.ctrlKey || e.type === "wheel") && !e.button;
}
function A1() {
  var e = this;
  return e instanceof SVGElement ? (e = e.ownerSVGElement || e, e.hasAttribute("viewBox") ? (e = e.viewBox.baseVal, [[e.x, e.y], [e.x + e.width, e.y + e.height]]) : [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]]) : [[0, 0], [e.clientWidth, e.clientHeight]];
}
function rl() {
  return this.__zoom || Ri;
}
function T1(e) {
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * (e.ctrlKey ? 10 : 1);
}
function z1() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function V1(e, t, n) {
  var r = e.invertX(t[0][0]) - n[0][0], o = e.invertX(t[1][0]) - n[1][0], i = e.invertY(t[0][1]) - n[0][1], s = e.invertY(t[1][1]) - n[1][1];
  return e.translate(
    o > r ? (r + o) / 2 : Math.min(0, r) || Math.max(0, o),
    s > i ? (i + s) / 2 : Math.min(0, i) || Math.max(0, s)
  );
}
function yc() {
  var e = M1, t = A1, n = V1, r = T1, o = z1, i = [0, 1 / 0], s = [[-1 / 0, -1 / 0], [1 / 0, 1 / 0]], a = 250, l = ei, u = Vi("start", "zoom", "end"), d, f, p, h = 500, y = 150, m = 0, w = 10;
  function b(k) {
    k.property("__zoom", rl).on("wheel.zoom", j, { passive: !1 }).on("mousedown.zoom", L).on("dblclick.zoom", I).filter(o).on("touchstart.zoom", T).on("touchmove.zoom", N).on("touchend.zoom touchcancel.zoom", H).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  b.transform = function(k, P, O, B) {
    var V = k.selection ? k.selection() : k;
    V.property("__zoom", rl), k !== V ? C(k, P, O, B) : V.interrupt().each(function() {
      S(this, arguments).event(B).start().zoom(null, typeof P == "function" ? P.apply(this, arguments) : P).end();
    });
  }, b.scaleBy = function(k, P, O, B) {
    b.scaleTo(k, function() {
      var V = this.__zoom.k, F = typeof P == "function" ? P.apply(this, arguments) : P;
      return V * F;
    }, O, B);
  }, b.scaleTo = function(k, P, O, B) {
    b.transform(k, function() {
      var V = t.apply(this, arguments), F = this.__zoom, K = O == null ? x(V) : typeof O == "function" ? O.apply(this, arguments) : O, G = F.invert(K), ne = typeof P == "function" ? P.apply(this, arguments) : P;
      return n($(_(F, ne), K, G), V, s);
    }, O, B);
  }, b.translateBy = function(k, P, O, B) {
    b.transform(k, function() {
      return n(this.__zoom.translate(
        typeof P == "function" ? P.apply(this, arguments) : P,
        typeof O == "function" ? O.apply(this, arguments) : O
      ), t.apply(this, arguments), s);
    }, null, B);
  }, b.translateTo = function(k, P, O, B, V) {
    b.transform(k, function() {
      var F = t.apply(this, arguments), K = this.__zoom, G = B == null ? x(F) : typeof B == "function" ? B.apply(this, arguments) : B;
      return n(Ri.translate(G[0], G[1]).scale(K.k).translate(
        typeof P == "function" ? -P.apply(this, arguments) : -P,
        typeof O == "function" ? -O.apply(this, arguments) : -O
      ), F, s);
    }, B, V);
  };
  function _(k, P) {
    return P = Math.max(i[0], Math.min(i[1], P)), P === k.k ? k : new En(P, k.x, k.y);
  }
  function $(k, P, O) {
    var B = P[0] - O[0] * k.k, V = P[1] - O[1] * k.k;
    return B === k.x && V === k.y ? k : new En(k.k, B, V);
  }
  function x(k) {
    return [(+k[0][0] + +k[1][0]) / 2, (+k[0][1] + +k[1][1]) / 2];
  }
  function C(k, P, O, B) {
    k.on("start.zoom", function() {
      S(this, arguments).event(B).start();
    }).on("interrupt.zoom end.zoom", function() {
      S(this, arguments).event(B).end();
    }).tween("zoom", function() {
      var V = this, F = arguments, K = S(V, F).event(B), G = t.apply(V, F), ne = O == null ? x(G) : typeof O == "function" ? O.apply(V, F) : O, q = Math.max(G[1][0] - G[0][0], G[1][1] - G[0][1]), z = V.__zoom, Y = typeof P == "function" ? P.apply(V, F) : P, W = l(z.invert(ne).concat(q / z.k), Y.invert(ne).concat(q / Y.k));
      return function(te) {
        if (te === 1) te = Y;
        else {
          var ee = W(te), U = q / ee[2];
          te = new En(U, ne[0] - ee[0] * U, ne[1] - ee[1] * U);
        }
        K.zoom(null, te);
      };
    });
  }
  function S(k, P, O) {
    return !O && k.__zooming || new M(k, P);
  }
  function M(k, P) {
    this.that = k, this.args = P, this.active = 0, this.sourceEvent = null, this.extent = t.apply(k, P), this.taps = 0;
  }
  M.prototype = {
    event: function(k) {
      return k && (this.sourceEvent = k), this;
    },
    start: function() {
      return ++this.active === 1 && (this.that.__zooming = this, this.emit("start")), this;
    },
    zoom: function(k, P) {
      return this.mouse && k !== "mouse" && (this.mouse[1] = P.invert(this.mouse[0])), this.touch0 && k !== "touch" && (this.touch0[1] = P.invert(this.touch0[0])), this.touch1 && k !== "touch" && (this.touch1[1] = P.invert(this.touch1[0])), this.that.__zoom = P, this.emit("zoom"), this;
    },
    end: function() {
      return --this.active === 0 && (delete this.that.__zooming, this.emit("end")), this;
    },
    emit: function(k) {
      var P = Yt(this.that).datum();
      u.call(
        k,
        this.that,
        new O1(k, {
          sourceEvent: this.sourceEvent,
          target: b,
          transform: this.that.__zoom,
          dispatch: u
        }),
        P
      );
    }
  };
  function j(k, ...P) {
    if (!e.apply(this, arguments)) return;
    var O = S(this, P).event(k), B = this.__zoom, V = Math.max(i[0], Math.min(i[1], B.k * Math.pow(2, r.apply(this, arguments)))), F = Jt(k);
    if (O.wheel)
      (O.mouse[0][0] !== F[0] || O.mouse[0][1] !== F[1]) && (O.mouse[1] = B.invert(O.mouse[0] = F)), clearTimeout(O.wheel);
    else {
      if (B.k === V) return;
      O.mouse = [F, B.invert(F)], ri(this), O.start();
    }
    Jr(k), O.wheel = setTimeout(K, y), O.zoom("mouse", n($(_(B, V), O.mouse[0], O.mouse[1]), O.extent, s));
    function K() {
      O.wheel = null, O.end();
    }
  }
  function L(k, ...P) {
    if (p || !e.apply(this, arguments)) return;
    var O = k.currentTarget, B = S(this, P, !0).event(k), V = Yt(k.view).on("mousemove.zoom", ne, !0).on("mouseup.zoom", q, !0), F = Jt(k, O), K = k.clientX, G = k.clientY;
    tc(k.view), ns(k), B.mouse = [F, this.__zoom.invert(F)], ri(this), B.start();
    function ne(z) {
      if (Jr(z), !B.moved) {
        var Y = z.clientX - K, W = z.clientY - G;
        B.moved = Y * Y + W * W > m;
      }
      B.event(z).zoom("mouse", n($(B.that.__zoom, B.mouse[0] = Jt(z, O), B.mouse[1]), B.extent, s));
    }
    function q(z) {
      V.on("mousemove.zoom mouseup.zoom", null), nc(z.view, B.moved), Jr(z), B.event(z).end();
    }
  }
  function I(k, ...P) {
    if (e.apply(this, arguments)) {
      var O = this.__zoom, B = Jt(k.changedTouches ? k.changedTouches[0] : k, this), V = O.invert(B), F = O.k * (k.shiftKey ? 0.5 : 2), K = n($(_(O, F), B, V), t.apply(this, P), s);
      Jr(k), a > 0 ? Yt(this).transition().duration(a).call(C, K, B, k) : Yt(this).call(b.transform, K, B, k);
    }
  }
  function T(k, ...P) {
    if (e.apply(this, arguments)) {
      var O = k.touches, B = O.length, V = S(this, P, k.changedTouches.length === B).event(k), F, K, G, ne;
      for (ns(k), K = 0; K < B; ++K)
        G = O[K], ne = Jt(G, this), ne = [ne, this.__zoom.invert(ne), G.identifier], V.touch0 ? !V.touch1 && V.touch0[2] !== ne[2] && (V.touch1 = ne, V.taps = 0) : (V.touch0 = ne, F = !0, V.taps = 1 + !!d);
      d && (d = clearTimeout(d)), F && (V.taps < 2 && (f = ne[0], d = setTimeout(function() {
        d = null;
      }, h)), ri(this), V.start());
    }
  }
  function N(k, ...P) {
    if (this.__zooming) {
      var O = S(this, P).event(k), B = k.changedTouches, V = B.length, F, K, G, ne;
      for (Jr(k), F = 0; F < V; ++F)
        K = B[F], G = Jt(K, this), O.touch0 && O.touch0[2] === K.identifier ? O.touch0[0] = G : O.touch1 && O.touch1[2] === K.identifier && (O.touch1[0] = G);
      if (K = O.that.__zoom, O.touch1) {
        var q = O.touch0[0], z = O.touch0[1], Y = O.touch1[0], W = O.touch1[1], te = (te = Y[0] - q[0]) * te + (te = Y[1] - q[1]) * te, ee = (ee = W[0] - z[0]) * ee + (ee = W[1] - z[1]) * ee;
        K = _(K, Math.sqrt(te / ee)), G = [(q[0] + Y[0]) / 2, (q[1] + Y[1]) / 2], ne = [(z[0] + W[0]) / 2, (z[1] + W[1]) / 2];
      } else if (O.touch0) G = O.touch0[0], ne = O.touch0[1];
      else return;
      O.zoom("touch", n($(K, G, ne), O.extent, s));
    }
  }
  function H(k, ...P) {
    if (this.__zooming) {
      var O = S(this, P).event(k), B = k.changedTouches, V = B.length, F, K;
      for (ns(k), p && clearTimeout(p), p = setTimeout(function() {
        p = null;
      }, h), F = 0; F < V; ++F)
        K = B[F], O.touch0 && O.touch0[2] === K.identifier ? delete O.touch0 : O.touch1 && O.touch1[2] === K.identifier && delete O.touch1;
      if (O.touch1 && !O.touch0 && (O.touch0 = O.touch1, delete O.touch1), O.touch0) O.touch0[1] = this.__zoom.invert(O.touch0[0]);
      else if (O.end(), O.taps === 2 && (K = Jt(K, this), Math.hypot(f[0] - K[0], f[1] - K[1]) < w)) {
        var G = Yt(this).on("dblclick.zoom");
        G && G.apply(this, arguments);
      }
    }
  }
  return b.wheelDelta = function(k) {
    return arguments.length ? (r = typeof k == "function" ? k : Fo(+k), b) : r;
  }, b.filter = function(k) {
    return arguments.length ? (e = typeof k == "function" ? k : Fo(!!k), b) : e;
  }, b.touchable = function(k) {
    return arguments.length ? (o = typeof k == "function" ? k : Fo(!!k), b) : o;
  }, b.extent = function(k) {
    return arguments.length ? (t = typeof k == "function" ? k : Fo([[+k[0][0], +k[0][1]], [+k[1][0], +k[1][1]]]), b) : t;
  }, b.scaleExtent = function(k) {
    return arguments.length ? (i[0] = +k[0], i[1] = +k[1], b) : [i[0], i[1]];
  }, b.translateExtent = function(k) {
    return arguments.length ? (s[0][0] = +k[0][0], s[1][0] = +k[1][0], s[0][1] = +k[0][1], s[1][1] = +k[1][1], b) : [[s[0][0], s[0][1]], [s[1][0], s[1][1]]];
  }, b.constrain = function(k) {
    return arguments.length ? (n = k, b) : n;
  }, b.duration = function(k) {
    return arguments.length ? (a = +k, b) : a;
  }, b.interpolate = function(k) {
    return arguments.length ? (l = k, b) : l;
  }, b.on = function() {
    var k = u.on.apply(u, arguments);
    return k === u ? b : k;
  }, b.clickDistance = function(k) {
    return arguments.length ? (m = (k = +k) * k, b) : Math.sqrt(m);
  }, b.tapDistance = function(k) {
    return arguments.length ? (w = +k, b) : w;
  }, b;
}
const go = {
  error001: () => "[React Flow]: Seems like you have not used zustand provider as an ancestor. Help: https://reactflow.dev/error#001",
  error002: () => "It looks like you've created a new nodeTypes or edgeTypes object. If this wasn't on purpose please define the nodeTypes/edgeTypes outside of the component or memoize them.",
  error003: (e) => `Node type "${e}" not found. Using fallback type "default".`,
  error004: () => "The React Flow parent container needs a width and a height to render the graph.",
  error005: () => "Only child nodes can use a parent extent.",
  error006: () => "Can't create edge. An edge needs a source and a target.",
  error007: (e) => `The old edge with id=${e} does not exist.`,
  error009: (e) => `Marker type "${e}" doesn't exist.`,
  error008: (e, { id: t, sourceHandle: n, targetHandle: r }) => `Couldn't create edge for ${e} handle id: "${e === "source" ? n : r}", edge id: ${t}.`,
  error010: () => "Handle: No node id found. Make sure to only use a Handle inside a custom Node.",
  error011: (e) => `Edge type "${e}" not found. Using fallback type "default".`,
  error012: (e) => `Node with id "${e}" does not exist, it may have been removed. This can happen when a node is deleted before the "onNodeClick" handler is called.`,
  error013: (e = "react") => `It seems that you haven't loaded the styles. Please import '@xyflow/${e}/dist/style.css' or base.css to make sure everything is working properly.`,
  error014: () => "useNodeConnections: No node ID found. Call useNodeConnections inside a custom Node or provide a node ID.",
  error015: () => "It seems that you are trying to drag a node that is not initialized. Please use onNodesChange as explained in the docs."
}, Ns = [
  [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
  [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
], wc = ["Enter", " ", "Escape"], L1 = {
  "node.a11yDescription.default": "Press enter or space to select a node. Press delete to remove it and escape to cancel.",
  "node.a11yDescription.keyboardDisabled": "Press enter or space to select a node. You can then use the arrow keys to move the node around. Press delete to remove it and escape to cancel.",
  "node.a11yDescription.ariaLiveMessage": ({ direction: e, x: t, y: n }) => `Moved selected node ${e}. New position, x: ${t}, y: ${n}`,
  "edge.a11yDescription.default": "Press enter or space to select an edge. You can then press delete to remove it or escape to cancel.",
  // Control elements
  "controls.ariaLabel": "Control Panel",
  "controls.zoomIn.ariaLabel": "Zoom In",
  "controls.zoomOut.ariaLabel": "Zoom Out",
  "controls.fitView.ariaLabel": "Fit View",
  "controls.interactive.ariaLabel": "Toggle Interactivity",
  // Mini map
  "minimap.ariaLabel": "Mini Map",
  // Handle
  "handle.ariaLabel": "Handle"
};
var Rr;
(function(e) {
  e.Strict = "strict", e.Loose = "loose";
})(Rr || (Rr = {}));
var pr;
(function(e) {
  e.Free = "free", e.Vertical = "vertical", e.Horizontal = "horizontal";
})(pr || (pr = {}));
var yi;
(function(e) {
  e.Partial = "partial", e.Full = "full";
})(yi || (yi = {}));
const Ds = {
  inProgress: !1,
  isValid: null,
  from: null,
  fromHandle: null,
  fromPosition: null,
  fromNode: null,
  to: null,
  toHandle: null,
  toPosition: null,
  toNode: null,
  pointer: null
};
var $n;
(function(e) {
  e.Bezier = "default", e.Straight = "straight", e.Step = "step", e.SmoothStep = "smoothstep", e.SimpleBezier = "simplebezier";
})($n || ($n = {}));
var vo;
(function(e) {
  e.Arrow = "arrow", e.ArrowClosed = "arrowclosed";
})(vo || (vo = {}));
var be;
(function(e) {
  e.Left = "left", e.Top = "top", e.Right = "right", e.Bottom = "bottom";
})(be || (be = {}));
const ol = {
  [be.Left]: be.Right,
  [be.Right]: be.Left,
  [be.Top]: be.Bottom,
  [be.Bottom]: be.Top
};
function I1(e, t) {
  if (!e && !t)
    return !0;
  if (!e || !t || e.size !== t.size)
    return !1;
  if (!e.size && !t.size)
    return !0;
  for (const n of e.keys())
    if (!t.has(n))
      return !1;
  return !0;
}
function il(e, t, n) {
  if (!n)
    return;
  const r = [];
  e.forEach((o, i) => {
    t?.has(i) || r.push(o);
  }), r.length && n(r);
}
function j1(e) {
  return e === null ? null : e ? "valid" : "invalid";
}
const bc = (e) => "id" in e && "source" in e && "target" in e, R1 = (e) => "id" in e && "position" in e && !("source" in e) && !("target" in e), la = (e) => "id" in e && "internals" in e && !("source" in e) && !("target" in e), Ho = (e, t = [0, 0]) => {
  const { width: n, height: r } = or(e), o = e.origin ?? t, i = n * o[0], s = r * o[1];
  return {
    x: e.position.x - i,
    y: e.position.y - s
  };
}, K1 = (e, t = { nodeOrigin: [0, 0] }) => {
  if (e.length === 0)
    return { x: 0, y: 0, width: 0, height: 0 };
  const n = e.reduce((r, o) => {
    const i = typeof o == "string";
    let s = !t.nodeLookup && !i ? o : void 0;
    t.nodeLookup && (s = i ? t.nodeLookup.get(o) : la(o) ? o : t.nodeLookup.get(o.id));
    const a = s ? wi(s, t.nodeOrigin) : { x: 0, y: 0, x2: 0, y2: 0 };
    return Ki(r, a);
  }, { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 });
  return Zi(n);
}, Oo = (e, t = {}) => {
  let n = { x: 1 / 0, y: 1 / 0, x2: -1 / 0, y2: -1 / 0 }, r = !1;
  return e.forEach((o) => {
    (t.filter === void 0 || t.filter(o)) && (n = Ki(n, wi(o)), r = !0);
  }), r ? Zi(n) : { x: 0, y: 0, width: 0, height: 0 };
}, ua = (e, t, [n, r, o] = [0, 0, 1], i = !1, s = !1) => {
  const a = {
    ...Ao(t, [n, r, o]),
    width: t.width / o,
    height: t.height / o
  }, l = [];
  for (const u of e.values()) {
    const { measured: d, selectable: f = !0, hidden: p = !1 } = u;
    if (s && !f || p)
      continue;
    const h = d.width ?? u.width ?? u.initialWidth ?? null, y = d.height ?? u.height ?? u.initialHeight ?? null, m = mo(a, Zr(u)), w = (h ?? 0) * (y ?? 0), b = i && m > 0;
    (!u.internals.handleBounds || b || m >= w || u.dragging) && l.push(u);
  }
  return l;
}, Z1 = (e, t) => {
  const n = /* @__PURE__ */ new Set();
  return e.forEach((r) => {
    n.add(r.id);
  }), t.filter((r) => n.has(r.source) || n.has(r.target));
};
function B1(e, t) {
  const n = /* @__PURE__ */ new Map(), r = t?.nodes ? new Set(t.nodes.map((o) => o.id)) : null;
  return e.forEach((o) => {
    o.measured.width && o.measured.height && (t?.includeHiddenNodes || !o.hidden) && (!r || r.has(o.id)) && n.set(o.id, o);
  }), n;
}
async function Y1({ nodes: e, width: t, height: n, panZoom: r, minZoom: o, maxZoom: i }, s) {
  if (e.size === 0)
    return Promise.resolve(!0);
  const a = B1(e, s), l = Oo(a), u = ca(l, t, n, s?.minZoom ?? o, s?.maxZoom ?? i, s?.padding ?? 0.1);
  return await r.setViewport(u, {
    duration: s?.duration,
    ease: s?.ease,
    interpolate: s?.interpolate
  }), Promise.resolve(!0);
}
function xc({ nodeId: e, nextPosition: t, nodeLookup: n, nodeOrigin: r = [0, 0], nodeExtent: o, onError: i }) {
  const s = n.get(e), a = s.parentId ? n.get(s.parentId) : void 0, { x: l, y: u } = a ? a.internals.positionAbsolute : { x: 0, y: 0 }, d = s.origin ?? r;
  let f = s.extent || o;
  if (s.extent === "parent" && !s.expandParent)
    if (!a)
      i?.("005", go.error005());
    else {
      const h = a.measured.width, y = a.measured.height;
      h && y && (f = [
        [l, u],
        [l + h, u + y]
      ]);
    }
  else a && Br(s.extent) && (f = [
    [s.extent[0][0] + l, s.extent[0][1] + u],
    [s.extent[1][0] + l, s.extent[1][1] + u]
  ]);
  const p = Br(f) ? yr(t, f, s.measured) : t;
  return (s.measured.width === void 0 || s.measured.height === void 0) && i?.("015", go.error015()), {
    position: {
      x: p.x - l + (s.measured.width ?? 0) * d[0],
      y: p.y - u + (s.measured.height ?? 0) * d[1]
    },
    positionAbsolute: p
  };
}
async function q1({ nodesToRemove: e = [], edgesToRemove: t = [], nodes: n, edges: r, onBeforeDelete: o }) {
  const i = new Set(e.map((f) => f.id)), s = [];
  for (const f of n) {
    if (f.deletable === !1)
      continue;
    const p = i.has(f.id), h = !p && f.parentId && s.find((y) => y.id === f.parentId);
    (p || h) && s.push(f);
  }
  const a = new Set(t.map((f) => f.id)), l = r.filter((f) => f.deletable !== !1), u = Z1(s, l);
  for (const f of l)
    a.has(f.id) && !u.find((p) => p.id === f.id) && u.push(f);
  if (!o)
    return {
      edges: u,
      nodes: s
    };
  const d = await o({
    nodes: s,
    edges: u
  });
  return typeof d == "boolean" ? d ? { edges: u, nodes: s } : { edges: [], nodes: [] } : d;
}
const Kr = (e, t = 0, n = 1) => Math.min(Math.max(e, t), n), yr = (e = { x: 0, y: 0 }, t, n) => ({
  x: Kr(e.x, t[0][0], t[1][0] - (n?.width ?? 0)),
  y: Kr(e.y, t[0][1], t[1][1] - (n?.height ?? 0))
});
function kc(e, t, n) {
  const { width: r, height: o } = or(n), { x: i, y: s } = n.internals.positionAbsolute;
  return yr(e, [
    [i, s],
    [i + r, s + o]
  ], t);
}
const sl = (e, t, n) => e < t ? Kr(Math.abs(e - t), 1, t) / t : e > n ? -Kr(Math.abs(e - n), 1, t) / t : 0, _c = (e, t, n = 15, r = 40) => {
  const o = sl(e.x, r, t.width - r) * n, i = sl(e.y, r, t.height - r) * n;
  return [o, i];
}, Ki = (e, t) => ({
  x: Math.min(e.x, t.x),
  y: Math.min(e.y, t.y),
  x2: Math.max(e.x2, t.x2),
  y2: Math.max(e.y2, t.y2)
}), Hs = ({ x: e, y: t, width: n, height: r }) => ({
  x: e,
  y: t,
  x2: e + n,
  y2: t + r
}), Zi = ({ x: e, y: t, x2: n, y2: r }) => ({
  x: e,
  y: t,
  width: n - e,
  height: r - t
}), Zr = (e, t = [0, 0]) => {
  const { x: n, y: r } = la(e) ? e.internals.positionAbsolute : Ho(e, t);
  return {
    x: n,
    y: r,
    width: e.measured?.width ?? e.width ?? e.initialWidth ?? 0,
    height: e.measured?.height ?? e.height ?? e.initialHeight ?? 0
  };
}, wi = (e, t = [0, 0]) => {
  const { x: n, y: r } = la(e) ? e.internals.positionAbsolute : Ho(e, t);
  return {
    x: n,
    y: r,
    x2: n + (e.measured?.width ?? e.width ?? e.initialWidth ?? 0),
    y2: r + (e.measured?.height ?? e.height ?? e.initialHeight ?? 0)
  };
}, $c = (e, t) => Zi(Ki(Hs(e), Hs(t))), mo = (e, t) => {
  const n = Math.max(0, Math.min(e.x + e.width, t.x + t.width) - Math.max(e.x, t.x)), r = Math.max(0, Math.min(e.y + e.height, t.y + t.height) - Math.max(e.y, t.y));
  return Math.ceil(n * r);
}, al = (e) => Pn(e.width) && Pn(e.height) && Pn(e.x) && Pn(e.y), Pn = (e) => !isNaN(e) && isFinite(e), X1 = (e, t) => {
}, Mo = (e, t = [1, 1]) => ({
  x: t[0] * Math.round(e.x / t[0]),
  y: t[1] * Math.round(e.y / t[1])
}), Ao = ({ x: e, y: t }, [n, r, o], i = !1, s = [1, 1]) => {
  const a = {
    x: (e - n) / o,
    y: (t - r) / o
  };
  return i ? Mo(a, s) : a;
}, bi = ({ x: e, y: t }, [n, r, o]) => ({
  x: e * o + n,
  y: t * o + r
});
function Sr(e, t) {
  if (typeof e == "number")
    return Math.floor((t - t / (1 + e)) * 0.5);
  if (typeof e == "string" && e.endsWith("px")) {
    const n = parseFloat(e);
    if (!Number.isNaN(n))
      return Math.floor(n);
  }
  if (typeof e == "string" && e.endsWith("%")) {
    const n = parseFloat(e);
    if (!Number.isNaN(n))
      return Math.floor(t * n * 0.01);
  }
  return console.error(`[React Flow] The padding value "${e}" is invalid. Please provide a number or a string with a valid unit (px or %).`), 0;
}
function F1(e, t, n) {
  if (typeof e == "string" || typeof e == "number") {
    const r = Sr(e, n), o = Sr(e, t);
    return {
      top: r,
      right: o,
      bottom: r,
      left: o,
      x: o * 2,
      y: r * 2
    };
  }
  if (typeof e == "object") {
    const r = Sr(e.top ?? e.y ?? 0, n), o = Sr(e.bottom ?? e.y ?? 0, n), i = Sr(e.left ?? e.x ?? 0, t), s = Sr(e.right ?? e.x ?? 0, t);
    return { top: r, right: s, bottom: o, left: i, x: i + s, y: r + o };
  }
  return { top: 0, right: 0, bottom: 0, left: 0, x: 0, y: 0 };
}
function W1(e, t, n, r, o, i) {
  const { x: s, y: a } = bi(e, [t, n, r]), { x: l, y: u } = bi({ x: e.x + e.width, y: e.y + e.height }, [t, n, r]), d = o - l, f = i - u;
  return {
    left: Math.floor(s),
    top: Math.floor(a),
    right: Math.floor(d),
    bottom: Math.floor(f)
  };
}
const ca = (e, t, n, r, o, i) => {
  const s = F1(i, t, n), a = (t - s.x) / e.width, l = (n - s.y) / e.height, u = Math.min(a, l), d = Kr(u, r, o), f = e.x + e.width / 2, p = e.y + e.height / 2, h = t / 2 - f * d, y = n / 2 - p * d, m = W1(e, h, y, d, t, n), w = {
    left: Math.min(m.left - s.left, 0),
    top: Math.min(m.top - s.top, 0),
    right: Math.min(m.right - s.right, 0),
    bottom: Math.min(m.bottom - s.bottom, 0)
  };
  return {
    x: h - w.left + w.right,
    y: y - w.top + w.bottom,
    zoom: d
  };
}, cr = () => typeof navigator < "u" && navigator?.userAgent?.indexOf("Mac") >= 0;
function Br(e) {
  return e != null && e !== "parent";
}
function or(e) {
  return {
    width: e.measured?.width ?? e.width ?? e.initialWidth ?? 0,
    height: e.measured?.height ?? e.height ?? e.initialHeight ?? 0
  };
}
function Cc(e) {
  return (e.measured?.width ?? e.width ?? e.initialWidth) !== void 0 && (e.measured?.height ?? e.height ?? e.initialHeight) !== void 0;
}
function G1(e, t = { width: 0, height: 0 }, n, r, o) {
  const i = { ...e }, s = r.get(n);
  if (s) {
    const a = s.origin || o;
    i.x += s.internals.positionAbsolute.x - (t.width ?? 0) * a[0], i.y += s.internals.positionAbsolute.y - (t.height ?? 0) * a[1];
  }
  return i;
}
function U1(e) {
  return { ...L1, ...e || {} };
}
function rs(e, { snapGrid: t = [0, 0], snapToGrid: n = !1, transform: r, containerBounds: o }) {
  const { x: i, y: s } = tn(e), a = Ao({ x: i - (o?.left ?? 0), y: s - (o?.top ?? 0) }, r), { x: l, y: u } = n ? Mo(a, t) : a;
  return {
    xSnapped: l,
    ySnapped: u,
    ...a
  };
}
const Sc = (e) => ({
  width: e.offsetWidth,
  height: e.offsetHeight
}), Ec = (e) => e?.getRootNode?.() || window?.document, J1 = ["INPUT", "SELECT", "TEXTAREA"];
function Pc(e) {
  const t = e.composedPath?.()?.[0] || e.target;
  return t?.nodeType !== 1 ? !1 : J1.includes(t.nodeName) || t.hasAttribute("contenteditable") || !!t.closest(".nokey");
}
const Nc = (e) => "clientX" in e, tn = (e, t) => {
  const n = Nc(e), r = n ? e.clientX : e.touches?.[0].clientX, o = n ? e.clientY : e.touches?.[0].clientY;
  return {
    x: r - (t?.left ?? 0),
    y: o - (t?.top ?? 0)
  };
}, ll = (e, t, n, r, o) => {
  const i = t.querySelectorAll(`.${e}`);
  return !i || !i.length ? null : Array.from(i).map((s) => {
    const a = s.getBoundingClientRect();
    return {
      id: s.getAttribute("data-handleid"),
      type: e,
      nodeId: o,
      position: s.getAttribute("data-handlepos"),
      x: (a.left - n.left) / r,
      y: (a.top - n.top) / r,
      ...Sc(s)
    };
  });
};
function Q1({ sourceX: e, sourceY: t, targetX: n, targetY: r, sourceControlX: o, sourceControlY: i, targetControlX: s, targetControlY: a }) {
  const l = e * 0.125 + o * 0.375 + s * 0.375 + n * 0.125, u = t * 0.125 + i * 0.375 + a * 0.375 + r * 0.125, d = Math.abs(l - e), f = Math.abs(u - t);
  return [l, u, d, f];
}
function Wo(e, t) {
  return e >= 0 ? 0.5 * e : t * 25 * Math.sqrt(-e);
}
function ul({ pos: e, x1: t, y1: n, x2: r, y2: o, c: i }) {
  switch (e) {
    case be.Left:
      return [t - Wo(t - r, i), n];
    case be.Right:
      return [t + Wo(r - t, i), n];
    case be.Top:
      return [t, n - Wo(n - o, i)];
    case be.Bottom:
      return [t, n + Wo(o - n, i)];
  }
}
function Dc({ sourceX: e, sourceY: t, sourcePosition: n = be.Bottom, targetX: r, targetY: o, targetPosition: i = be.Top, curvature: s = 0.25 }) {
  const [a, l] = ul({
    pos: n,
    x1: e,
    y1: t,
    x2: r,
    y2: o,
    c: s
  }), [u, d] = ul({
    pos: i,
    x1: r,
    y1: o,
    x2: e,
    y2: t,
    c: s
  }), [f, p, h, y] = Q1({
    sourceX: e,
    sourceY: t,
    targetX: r,
    targetY: o,
    sourceControlX: a,
    sourceControlY: l,
    targetControlX: u,
    targetControlY: d
  });
  return [
    `M${e},${t} C${a},${l} ${u},${d} ${r},${o}`,
    f,
    p,
    h,
    y
  ];
}
function Hc({ sourceX: e, sourceY: t, targetX: n, targetY: r }) {
  const o = Math.abs(n - e) / 2, i = n < e ? n + o : n - o, s = Math.abs(r - t) / 2, a = r < t ? r + s : r - s;
  return [i, a, o, s];
}
function em({ sourceNode: e, targetNode: t, selected: n = !1, zIndex: r, elevateOnSelect: o = !1 }) {
  if (r !== void 0)
    return r;
  const i = o && n ? 1e3 : 0, s = Math.max(e.parentId || o && e.selected ? e.internals.z : 0, t.parentId || o && t.selected ? t.internals.z : 0);
  return i + s;
}
function tm({ sourceNode: e, targetNode: t, width: n, height: r, transform: o }) {
  const i = Ki(wi(e), wi(t));
  i.x === i.x2 && (i.x2 += 1), i.y === i.y2 && (i.y2 += 1);
  const s = {
    x: -o[0] / o[2],
    y: -o[1] / o[2],
    width: n / o[2],
    height: r / o[2]
  };
  return mo(s, Zi(i)) > 0;
}
const nm = ({ source: e, sourceHandle: t, target: n, targetHandle: r }) => `xy-edge__${e}${t || ""}-${n}${r || ""}`, rm = (e, t) => t.some((n) => n.source === e.source && n.target === e.target && (n.sourceHandle === e.sourceHandle || !n.sourceHandle && !e.sourceHandle) && (n.targetHandle === e.targetHandle || !n.targetHandle && !e.targetHandle)), om = (e, t) => {
  if (!e.source || !e.target)
    return t;
  let n;
  return bc(e) ? n = { ...e } : n = {
    ...e,
    id: nm(e)
  }, rm(n, t) ? t : (n.sourceHandle === null && delete n.sourceHandle, n.targetHandle === null && delete n.targetHandle, t.concat(n));
};
function Oc({ sourceX: e, sourceY: t, targetX: n, targetY: r }) {
  const [o, i, s, a] = Hc({
    sourceX: e,
    sourceY: t,
    targetX: n,
    targetY: r
  });
  return [`M ${e},${t}L ${n},${r}`, o, i, s, a];
}
const cl = {
  [be.Left]: { x: -1, y: 0 },
  [be.Right]: { x: 1, y: 0 },
  [be.Top]: { x: 0, y: -1 },
  [be.Bottom]: { x: 0, y: 1 }
}, im = ({ source: e, sourcePosition: t = be.Bottom, target: n }) => t === be.Left || t === be.Right ? e.x < n.x ? { x: 1, y: 0 } : { x: -1, y: 0 } : e.y < n.y ? { x: 0, y: 1 } : { x: 0, y: -1 }, dl = (e, t) => Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2));
function sm({ source: e, sourcePosition: t = be.Bottom, target: n, targetPosition: r = be.Top, center: o, offset: i, stepPosition: s }) {
  const a = cl[t], l = cl[r], u = { x: e.x + a.x * i, y: e.y + a.y * i }, d = { x: n.x + l.x * i, y: n.y + l.y * i }, f = im({
    source: u,
    sourcePosition: t,
    target: d
  }), p = f.x !== 0 ? "x" : "y", h = f[p];
  let y = [], m, w;
  const b = { x: 0, y: 0 }, _ = { x: 0, y: 0 }, [, , $, x] = Hc({
    sourceX: e.x,
    sourceY: e.y,
    targetX: n.x,
    targetY: n.y
  });
  if (a[p] * l[p] === -1) {
    p === "x" ? (m = o.x ?? u.x + (d.x - u.x) * s, w = o.y ?? (u.y + d.y) / 2) : (m = o.x ?? (u.x + d.x) / 2, w = o.y ?? u.y + (d.y - u.y) * s);
    const C = [
      { x: m, y: u.y },
      { x: m, y: d.y }
    ], S = [
      { x: u.x, y: w },
      { x: d.x, y: w }
    ];
    a[p] === h ? y = p === "x" ? C : S : y = p === "x" ? S : C;
  } else {
    const C = [{ x: u.x, y: d.y }], S = [{ x: d.x, y: u.y }];
    if (p === "x" ? y = a.x === h ? S : C : y = a.y === h ? C : S, t === r) {
      const T = Math.abs(e[p] - n[p]);
      if (T <= i) {
        const N = Math.min(i - 1, i - T);
        a[p] === h ? b[p] = (u[p] > e[p] ? -1 : 1) * N : _[p] = (d[p] > n[p] ? -1 : 1) * N;
      }
    }
    if (t !== r) {
      const T = p === "x" ? "y" : "x", N = a[p] === l[T], H = u[T] > d[T], k = u[T] < d[T];
      (a[p] === 1 && (!N && H || N && k) || a[p] !== 1 && (!N && k || N && H)) && (y = p === "x" ? C : S);
    }
    const M = { x: u.x + b.x, y: u.y + b.y }, j = { x: d.x + _.x, y: d.y + _.y }, L = Math.max(Math.abs(M.x - y[0].x), Math.abs(j.x - y[0].x)), I = Math.max(Math.abs(M.y - y[0].y), Math.abs(j.y - y[0].y));
    L >= I ? (m = (M.x + j.x) / 2, w = y[0].y) : (m = y[0].x, w = (M.y + j.y) / 2);
  }
  return [[
    e,
    { x: u.x + b.x, y: u.y + b.y },
    ...y,
    { x: d.x + _.x, y: d.y + _.y },
    n
  ], m, w, $, x];
}
function am(e, t, n, r) {
  const o = Math.min(dl(e, t) / 2, dl(t, n) / 2, r), { x: i, y: s } = t;
  if (e.x === i && i === n.x || e.y === s && s === n.y)
    return `L${i} ${s}`;
  if (e.y === s) {
    const u = e.x < n.x ? -1 : 1, d = e.y < n.y ? 1 : -1;
    return `L ${i + o * u},${s}Q ${i},${s} ${i},${s + o * d}`;
  }
  const a = e.x < n.x ? 1 : -1, l = e.y < n.y ? -1 : 1;
  return `L ${i},${s + o * l}Q ${i},${s} ${i + o * a},${s}`;
}
function da({ sourceX: e, sourceY: t, sourcePosition: n = be.Bottom, targetX: r, targetY: o, targetPosition: i = be.Top, borderRadius: s = 5, centerX: a, centerY: l, offset: u = 20, stepPosition: d = 0.5 }) {
  const [f, p, h, y, m] = sm({
    source: { x: e, y: t },
    sourcePosition: n,
    target: { x: r, y: o },
    targetPosition: i,
    center: { x: a, y: l },
    offset: u,
    stepPosition: d
  });
  return [f.reduce((w, b, _) => {
    let $ = "";
    return _ > 0 && _ < f.length - 1 ? $ = am(f[_ - 1], b, f[_ + 1], s) : $ = `${_ === 0 ? "M" : "L"}${b.x} ${b.y}`, w += $, w;
  }, ""), p, h, y, m];
}
function fl(e) {
  return e && !!(e.internals.handleBounds || e.handles?.length) && !!(e.measured.width || e.width || e.initialWidth);
}
function lm(e) {
  const { sourceNode: t, targetNode: n } = e;
  if (!fl(t) || !fl(n))
    return null;
  const r = t.internals.handleBounds || pl(t.handles), o = n.internals.handleBounds || pl(n.handles), i = hl(r?.source ?? [], e.sourceHandle), s = hl(
    // when connection type is loose we can define all handles as sources and connect source -> source
    e.connectionMode === Rr.Strict ? o?.target ?? [] : (o?.target ?? []).concat(o?.source ?? []),
    e.targetHandle
  );
  if (!i || !s)
    return e.onError?.("008", go.error008(i ? "target" : "source", {
      id: e.id,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    })), null;
  const a = i?.position || be.Bottom, l = s?.position || be.Top, u = yo(t, i, a), d = yo(n, s, l);
  return {
    sourceX: u.x,
    sourceY: u.y,
    targetX: d.x,
    targetY: d.y,
    sourcePosition: a,
    targetPosition: l
  };
}
function pl(e) {
  if (!e)
    return null;
  const t = [], n = [];
  for (const r of e)
    r.width = r.width ?? 1, r.height = r.height ?? 1, r.type === "source" ? t.push(r) : r.type === "target" && n.push(r);
  return {
    source: t,
    target: n
  };
}
function yo(e, t, n = be.Left, r = !1) {
  const o = (t?.x ?? 0) + e.internals.positionAbsolute.x, i = (t?.y ?? 0) + e.internals.positionAbsolute.y, { width: s, height: a } = t ?? or(e);
  if (r)
    return { x: o + s / 2, y: i + a / 2 };
  switch (t?.position ?? n) {
    case be.Top:
      return { x: o + s / 2, y: i };
    case be.Right:
      return { x: o + s, y: i + a / 2 };
    case be.Bottom:
      return { x: o + s / 2, y: i + a };
    case be.Left:
      return { x: o, y: i + a / 2 };
  }
}
function hl(e, t) {
  return e && (t ? e.find((n) => n.id === t) : e[0]) || null;
}
function Os(e, t) {
  return e ? typeof e == "string" ? e : `${t ? `${t}__` : ""}${Object.keys(e).sort().map((n) => `${n}=${e[n]}`).join("&")}` : "";
}
function um(e, { id: t, defaultColor: n, defaultMarkerStart: r, defaultMarkerEnd: o }) {
  const i = /* @__PURE__ */ new Set();
  return e.reduce((s, a) => ([a.markerStart || r, a.markerEnd || o].forEach((l) => {
    if (l && typeof l == "object") {
      const u = Os(l, t);
      i.has(u) || (s.push({ id: u, color: l.color || n, ...l }), i.add(u));
    }
  }), s), []).sort((s, a) => s.id.localeCompare(a.id));
}
function cm(e, t, n, r, o) {
  let i = 0.5;
  o === "start" ? i = 0 : o === "end" && (i = 1);
  let s = [
    (e.x + e.width * i) * t.zoom + t.x,
    e.y * t.zoom + t.y - r
  ], a = [-100 * i, -100];
  switch (n) {
    case be.Right:
      s = [
        (e.x + e.width) * t.zoom + t.x + r,
        (e.y + e.height * i) * t.zoom + t.y
      ], a = [0, -100 * i];
      break;
    case be.Bottom:
      s[1] = (e.y + e.height) * t.zoom + t.y + r, a[1] = 0;
      break;
    case be.Left:
      s = [
        e.x * t.zoom + t.x - r,
        (e.y + e.height * i) * t.zoom + t.y
      ], a = [-100, -100 * i];
      break;
  }
  return `translate(${s[0]}px, ${s[1]}px) translate(${a[0]}%, ${a[1]}%)`;
}
const Mc = 1e3, dm = 10, fa = {
  nodeOrigin: [0, 0],
  nodeExtent: Ns,
  elevateNodesOnSelect: !0,
  defaults: {}
}, fm = {
  ...fa,
  checkEquality: !0
};
function pa(e, t) {
  const n = { ...e };
  for (const r in t)
    t[r] !== void 0 && (n[r] = t[r]);
  return n;
}
function pm(e, t, n) {
  const r = pa(fa, n);
  for (const o of e.values())
    if (o.parentId)
      ha(o, e, t, r);
    else {
      const i = Ho(o, r.nodeOrigin), s = Br(o.extent) ? o.extent : r.nodeExtent, a = yr(i, s, or(o));
      o.internals.positionAbsolute = a;
    }
}
function hm(e, t) {
  if (!e.handles)
    return e.measured ? t?.internals.handleBounds : void 0;
  const n = [], r = [];
  for (const o of e.handles) {
    const i = {
      id: o.id,
      width: o.width ?? 1,
      height: o.height ?? 1,
      nodeId: e.id,
      x: o.x,
      y: o.y,
      position: o.position,
      type: o.type
    };
    o.type === "source" ? n.push(i) : o.type === "target" && r.push(i);
  }
  return {
    source: n,
    target: r
  };
}
function gm(e, t, n, r) {
  const o = pa(fm, r);
  let i = { i: -1 }, s = e.length > 0;
  const a = new Map(t), l = o?.elevateNodesOnSelect ? Mc : 0;
  t.clear(), n.clear();
  for (const u of e) {
    let d = a.get(u.id);
    if (o.checkEquality && u === d?.internals.userNode)
      t.set(u.id, d);
    else {
      const f = Ho(u, o.nodeOrigin), p = Br(u.extent) ? u.extent : o.nodeExtent, h = yr(f, p, or(u));
      d = {
        ...o.defaults,
        ...u,
        measured: {
          width: u.measured?.width,
          height: u.measured?.height
        },
        internals: {
          positionAbsolute: h,
          // if user re-initializes the node or removes `measured` for whatever reason, we reset the handleBounds so that the node gets re-measured
          handleBounds: hm(u, d),
          z: Ac(u, l),
          userNode: u
        }
      }, t.set(u.id, d);
    }
    (d.measured === void 0 || d.measured.width === void 0 || d.measured.height === void 0) && !d.hidden && (s = !1), u.parentId && ha(d, t, n, r, i);
  }
  return s;
}
function vm(e, t) {
  if (!e.parentId)
    return;
  const n = t.get(e.parentId);
  n ? n.set(e.id, e) : t.set(e.parentId, /* @__PURE__ */ new Map([[e.id, e]]));
}
function ha(e, t, n, r, o) {
  const { elevateNodesOnSelect: i, nodeOrigin: s, nodeExtent: a } = pa(fa, r), l = e.parentId, u = t.get(l);
  if (!u) {
    console.warn(`Parent node ${l} not found. Please make sure that parent nodes are in front of their child nodes in the nodes array.`);
    return;
  }
  vm(e, n), o && !u.parentId && u.internals.rootParentIndex === void 0 && (u.internals.rootParentIndex = ++o.i, u.internals.z = u.internals.z + o.i * dm), o && u.internals.rootParentIndex !== void 0 && (o.i = u.internals.rootParentIndex);
  const d = i ? Mc : 0, { x: f, y: p, z: h } = mm(e, u, s, a, d), { positionAbsolute: y } = e.internals, m = f !== y.x || p !== y.y;
  (m || h !== e.internals.z) && t.set(e.id, {
    ...e,
    internals: {
      ...e.internals,
      positionAbsolute: m ? { x: f, y: p } : y,
      z: h
    }
  });
}
function Ac(e, t) {
  return (Pn(e.zIndex) ? e.zIndex : 0) + (e.selected ? t : 0);
}
function mm(e, t, n, r, o) {
  const { x: i, y: s } = t.internals.positionAbsolute, a = or(e), l = Ho(e, n), u = Br(e.extent) ? yr(l, e.extent, a) : l;
  let d = yr({ x: i + u.x, y: s + u.y }, r, a);
  e.extent === "parent" && (d = kc(d, a, t));
  const f = Ac(e, o), p = t.internals.z ?? 0;
  return {
    x: d.x,
    y: d.y,
    z: p >= f ? p + 1 : f
  };
}
function ym(e, t, n, r = [0, 0]) {
  const o = [], i = /* @__PURE__ */ new Map();
  for (const s of e) {
    const a = t.get(s.parentId);
    if (!a)
      continue;
    const l = i.get(s.parentId)?.expandedRect ?? Zr(a), u = $c(l, s.rect);
    i.set(s.parentId, { expandedRect: u, parent: a });
  }
  return i.size > 0 && i.forEach(({ expandedRect: s, parent: a }, l) => {
    const u = a.internals.positionAbsolute, d = or(a), f = a.origin ?? r, p = s.x < u.x ? Math.round(Math.abs(u.x - s.x)) : 0, h = s.y < u.y ? Math.round(Math.abs(u.y - s.y)) : 0, y = Math.max(d.width, Math.round(s.width)), m = Math.max(d.height, Math.round(s.height)), w = (y - d.width) * f[0], b = (m - d.height) * f[1];
    (p > 0 || h > 0 || w || b) && (o.push({
      id: l,
      type: "position",
      position: {
        x: a.position.x - p + w,
        y: a.position.y - h + b
      }
    }), n.get(l)?.forEach((_) => {
      e.some(($) => $.id === _.id) || o.push({
        id: _.id,
        type: "position",
        position: {
          x: _.position.x + p,
          y: _.position.y + h
        }
      });
    })), (d.width < s.width || d.height < s.height || p || h) && o.push({
      id: l,
      type: "dimensions",
      setAttributes: !0,
      dimensions: {
        width: y + (p ? f[0] * p - w : 0),
        height: m + (h ? f[1] * h - b : 0)
      }
    });
  }), o;
}
function wm(e, t, n, r, o, i) {
  const s = r?.querySelector(".xyflow__viewport");
  let a = !1;
  if (!s)
    return { changes: [], updatedInternals: a };
  const l = [], u = window.getComputedStyle(s), { m22: d } = new window.DOMMatrixReadOnly(u.transform), f = [];
  for (const p of e.values()) {
    const h = t.get(p.id);
    if (!h)
      continue;
    if (h.hidden) {
      t.set(h.id, {
        ...h,
        internals: {
          ...h.internals,
          handleBounds: void 0
        }
      }), a = !0;
      continue;
    }
    const y = Sc(p.nodeElement), m = h.measured.width !== y.width || h.measured.height !== y.height;
    if (y.width && y.height && (m || !h.internals.handleBounds || p.force)) {
      const w = p.nodeElement.getBoundingClientRect(), b = Br(h.extent) ? h.extent : i;
      let { positionAbsolute: _ } = h.internals;
      h.parentId && h.extent === "parent" ? _ = kc(_, y, t.get(h.parentId)) : b && (_ = yr(_, b, y));
      const $ = {
        ...h,
        measured: y,
        internals: {
          ...h.internals,
          positionAbsolute: _,
          handleBounds: {
            source: ll("source", p.nodeElement, w, d, h.id),
            target: ll("target", p.nodeElement, w, d, h.id)
          }
        }
      };
      t.set(h.id, $), h.parentId && ha($, t, n, { nodeOrigin: o }), a = !0, m && (l.push({
        id: h.id,
        type: "dimensions",
        dimensions: y
      }), h.expandParent && h.parentId && f.push({
        id: h.id,
        parentId: h.parentId,
        rect: Zr($, o)
      }));
    }
  }
  if (f.length > 0) {
    const p = ym(f, t, n, o);
    l.push(...p);
  }
  return { changes: l, updatedInternals: a };
}
async function bm({ delta: e, panZoom: t, transform: n, translateExtent: r, width: o, height: i }) {
  if (!t || !e.x && !e.y)
    return Promise.resolve(!1);
  const s = await t.setViewportConstrained({
    x: n[0] + e.x,
    y: n[1] + e.y,
    zoom: n[2]
  }, [
    [0, 0],
    [o, i]
  ], r), a = !!s && (s.x !== n[0] || s.y !== n[1] || s.k !== n[2]);
  return Promise.resolve(a);
}
function gl(e, t, n, r, o, i) {
  let s = o;
  const a = r.get(s) || /* @__PURE__ */ new Map();
  r.set(s, a.set(n, t)), s = `${o}-${e}`;
  const l = r.get(s) || /* @__PURE__ */ new Map();
  if (r.set(s, l.set(n, t)), i) {
    s = `${o}-${e}-${i}`;
    const u = r.get(s) || /* @__PURE__ */ new Map();
    r.set(s, u.set(n, t));
  }
}
function xm(e, t, n) {
  e.clear(), t.clear();
  for (const r of n) {
    const { source: o, target: i, sourceHandle: s = null, targetHandle: a = null } = r, l = { edgeId: r.id, source: o, target: i, sourceHandle: s, targetHandle: a }, u = `${o}-${s}--${i}-${a}`, d = `${i}-${a}--${o}-${s}`;
    gl("source", l, d, e, o, s), gl("target", l, u, e, i, a), t.set(r.id, r);
  }
}
function km(e, t) {
  if (e === null || t === null)
    return !1;
  const n = Array.isArray(e) ? e : [e], r = Array.isArray(t) ? t : [t];
  if (n.length !== r.length)
    return !1;
  for (let o = 0; o < n.length; o++)
    if (n[o].id !== r[o].id || n[o].type !== r[o].type || !Object.is(n[o].data, r[o].data))
      return !1;
  return !0;
}
function Tc(e, t) {
  if (!e.parentId)
    return !1;
  const n = t.get(e.parentId);
  return n ? n.selected ? !0 : Tc(n, t) : !1;
}
function vl(e, t, n) {
  let r = e;
  do {
    if (r?.matches?.(t))
      return !0;
    if (r === n)
      return !1;
    r = r?.parentElement;
  } while (r);
  return !1;
}
function _m(e, t, n, r) {
  const o = /* @__PURE__ */ new Map();
  for (const [i, s] of e)
    if ((s.selected || s.id === r) && (!s.parentId || !Tc(s, e)) && (s.draggable || t && typeof s.draggable > "u")) {
      const a = e.get(i);
      a && o.set(i, {
        id: i,
        position: a.position || { x: 0, y: 0 },
        distance: {
          x: n.x - a.internals.positionAbsolute.x,
          y: n.y - a.internals.positionAbsolute.y
        },
        extent: a.extent,
        parentId: a.parentId,
        origin: a.origin,
        expandParent: a.expandParent,
        internals: {
          positionAbsolute: a.internals.positionAbsolute || { x: 0, y: 0 }
        },
        measured: {
          width: a.measured.width ?? 0,
          height: a.measured.height ?? 0
        }
      });
    }
  return o;
}
function os({ nodeId: e, dragItems: t, nodeLookup: n, dragging: r = !0 }) {
  const o = [];
  for (const [s, a] of t) {
    const l = n.get(s)?.internals.userNode;
    l && o.push({
      ...l,
      position: a.position,
      dragging: r
    });
  }
  if (!e)
    return [o[0], o];
  const i = n.get(e)?.internals.userNode;
  return [
    i ? {
      ...i,
      position: t.get(e)?.position || i.position,
      dragging: r
    } : o[0],
    o
  ];
}
function $m({ dragItems: e, snapGrid: t, x: n, y: r }) {
  const o = e.values().next().value;
  if (!o)
    return null;
  const i = {
    x: n - o.distance.x,
    y: r - o.distance.y
  }, s = Mo(i, t);
  return {
    x: s.x - i.x,
    y: s.y - i.y
  };
}
function Cm({ onNodeMouseDown: e, getStoreItems: t, onDragStart: n, onDrag: r, onDragStop: o }) {
  let i = { x: null, y: null }, s = 0, a = /* @__PURE__ */ new Map(), l = !1, u = { x: 0, y: 0 }, d = null, f = !1, p = null, h = !1, y = !1, m = null;
  function w({ noDragClassName: _, handleSelector: $, domNode: x, isSelectable: C, nodeId: S, nodeClickDistance: M = 0 }) {
    p = Yt(x);
    function j({ x: N, y: H }) {
      const { nodeLookup: k, nodeExtent: P, snapGrid: O, snapToGrid: B, nodeOrigin: V, onNodeDrag: F, onSelectionDrag: K, onError: G, updateNodePositions: ne } = t();
      i = { x: N, y: H };
      let q = !1;
      const z = a.size > 1, Y = z && P ? Hs(Oo(a)) : null, W = z && B ? $m({
        dragItems: a,
        snapGrid: O,
        x: N,
        y: H
      }) : null;
      for (const [te, ee] of a) {
        if (!k.has(te))
          continue;
        let U = { x: N - ee.distance.x, y: H - ee.distance.y };
        B && (U = W ? {
          x: Math.round(U.x + W.x),
          y: Math.round(U.y + W.y)
        } : Mo(U, O));
        let ce = null;
        if (z && P && !ee.extent && Y) {
          const { positionAbsolute: ie } = ee.internals, pe = ie.x - Y.x + P[0][0], we = ie.x + ee.measured.width - Y.x2 + P[1][0], he = ie.y - Y.y + P[0][1], ue = ie.y + ee.measured.height - Y.y2 + P[1][1];
          ce = [
            [pe, he],
            [we, ue]
          ];
        }
        const { position: se, positionAbsolute: ae } = xc({
          nodeId: te,
          nextPosition: U,
          nodeLookup: k,
          nodeExtent: ce || P,
          nodeOrigin: V,
          onError: G
        });
        q = q || ee.position.x !== se.x || ee.position.y !== se.y, ee.position = se, ee.internals.positionAbsolute = ae;
      }
      if (y = y || q, !!q && (ne(a, !0), m && (r || F || !S && K))) {
        const [te, ee] = os({
          nodeId: S,
          dragItems: a,
          nodeLookup: k
        });
        r?.(m, a, te, ee), F?.(m, te, ee), S || K?.(m, ee);
      }
    }
    async function L() {
      if (!d)
        return;
      const { transform: N, panBy: H, autoPanSpeed: k, autoPanOnNodeDrag: P } = t();
      if (!P) {
        l = !1, cancelAnimationFrame(s);
        return;
      }
      const [O, B] = _c(u, d, k);
      (O !== 0 || B !== 0) && (i.x = (i.x ?? 0) - O / N[2], i.y = (i.y ?? 0) - B / N[2], await H({ x: O, y: B }) && j(i)), s = requestAnimationFrame(L);
    }
    function I(N) {
      const { nodeLookup: H, multiSelectionActive: k, nodesDraggable: P, transform: O, snapGrid: B, snapToGrid: V, selectNodesOnDrag: F, onNodeDragStart: K, onSelectionDragStart: G, unselectNodesAndEdges: ne } = t();
      f = !0, (!F || !C) && !k && S && (H.get(S)?.selected || ne()), C && F && S && e?.(S);
      const q = rs(N.sourceEvent, { transform: O, snapGrid: B, snapToGrid: V, containerBounds: d });
      if (i = q, a = _m(H, P, q, S), a.size > 0 && (n || K || !S && G)) {
        const [z, Y] = os({
          nodeId: S,
          dragItems: a,
          nodeLookup: H
        });
        n?.(N.sourceEvent, a, z, Y), K?.(N.sourceEvent, z, Y), S || G?.(N.sourceEvent, Y);
      }
    }
    const T = Yg().clickDistance(M).on("start", (N) => {
      const { domNode: H, nodeDragThreshold: k, transform: P, snapGrid: O, snapToGrid: B } = t();
      d = H?.getBoundingClientRect() || null, h = !1, y = !1, m = N.sourceEvent, k === 0 && I(N), i = rs(N.sourceEvent, { transform: P, snapGrid: O, snapToGrid: B, containerBounds: d }), u = tn(N.sourceEvent, d);
    }).on("drag", (N) => {
      const { autoPanOnNodeDrag: H, transform: k, snapGrid: P, snapToGrid: O, nodeDragThreshold: B, nodeLookup: V } = t(), F = rs(N.sourceEvent, { transform: k, snapGrid: P, snapToGrid: O, containerBounds: d });
      if (m = N.sourceEvent, (N.sourceEvent.type === "touchmove" && N.sourceEvent.touches.length > 1 || // if user deletes a node while dragging, we need to abort the drag to prevent errors
      S && !V.has(S)) && (h = !0), !h) {
        if (!l && H && f && (l = !0, L()), !f) {
          const K = tn(N.sourceEvent, d), G = K.x - u.x, ne = K.y - u.y;
          Math.sqrt(G * G + ne * ne) > B && I(N);
        }
        (i.x !== F.xSnapped || i.y !== F.ySnapped) && a && f && (u = tn(N.sourceEvent, d), j(F));
      }
    }).on("end", (N) => {
      if (!(!f || h) && (l = !1, f = !1, cancelAnimationFrame(s), a.size > 0)) {
        const { nodeLookup: H, updateNodePositions: k, onNodeDragStop: P, onSelectionDragStop: O } = t();
        if (y && (k(a, !1), y = !1), o || P || !S && O) {
          const [B, V] = os({
            nodeId: S,
            dragItems: a,
            nodeLookup: H,
            dragging: !1
          });
          o?.(N.sourceEvent, a, B, V), P?.(N.sourceEvent, B, V), S || O?.(N.sourceEvent, V);
        }
      }
    }).filter((N) => {
      const H = N.target;
      return !N.button && (!_ || !vl(H, `.${_}`, x)) && (!$ || vl(H, $, x));
    });
    p.call(T);
  }
  function b() {
    p?.on(".drag", null);
  }
  return {
    update: w,
    destroy: b
  };
}
function Sm(e, t, n) {
  const r = [], o = {
    x: e.x - n,
    y: e.y - n,
    width: n * 2,
    height: n * 2
  };
  for (const i of t.values())
    mo(o, Zr(i)) > 0 && r.push(i);
  return r;
}
const Em = 250;
function Pm(e, t, n, r) {
  let o = [], i = 1 / 0;
  const s = Sm(e, n, t + Em);
  for (const a of s) {
    const l = [...a.internals.handleBounds?.source ?? [], ...a.internals.handleBounds?.target ?? []];
    for (const u of l) {
      if (r.nodeId === u.nodeId && r.type === u.type && r.id === u.id)
        continue;
      const { x: d, y: f } = yo(a, u, u.position, !0), p = Math.sqrt(Math.pow(d - e.x, 2) + Math.pow(f - e.y, 2));
      p > t || (p < i ? (o = [{ ...u, x: d, y: f }], i = p) : p === i && o.push({ ...u, x: d, y: f }));
    }
  }
  if (!o.length)
    return null;
  if (o.length > 1) {
    const a = r.type === "source" ? "target" : "source";
    return o.find((l) => l.type === a) ?? o[0];
  }
  return o[0];
}
function zc(e, t, n, r, o, i = !1) {
  const s = r.get(e);
  if (!s)
    return null;
  const a = o === "strict" ? s.internals.handleBounds?.[t] : [...s.internals.handleBounds?.source ?? [], ...s.internals.handleBounds?.target ?? []], l = (n ? a?.find((u) => u.id === n) : a?.[0]) ?? null;
  return l && i ? { ...l, ...yo(s, l, l.position, !0) } : l;
}
function Vc(e, t) {
  return e || (t?.classList.contains("target") ? "target" : t?.classList.contains("source") ? "source" : null);
}
function Nm(e, t) {
  let n = null;
  return t ? n = !0 : e && !t && (n = !1), n;
}
const Lc = () => !0;
function Dm(e, { connectionMode: t, connectionRadius: n, handleId: r, nodeId: o, edgeUpdaterType: i, isTarget: s, domNode: a, nodeLookup: l, lib: u, autoPanOnConnect: d, flowId: f, panBy: p, cancelConnection: h, onConnectStart: y, onConnect: m, onConnectEnd: w, isValidConnection: b = Lc, onReconnectEnd: _, updateConnection: $, getTransform: x, getFromHandle: C, autoPanSpeed: S, dragThreshold: M = 1, handleDomNode: j }) {
  const L = Ec(e.target);
  let I = 0, T;
  const { x: N, y: H } = tn(e), k = Vc(i, j), P = a?.getBoundingClientRect();
  let O = !1;
  if (!P || !k)
    return;
  const B = zc(o, k, r, l, t);
  if (!B)
    return;
  let V = tn(e, P), F = !1, K = null, G = !1, ne = null;
  function q() {
    if (!d || !P)
      return;
    const [ce, se] = _c(V, P, S);
    p({ x: ce, y: se }), I = requestAnimationFrame(q);
  }
  const z = {
    ...B,
    nodeId: o,
    type: k,
    position: B.position
  }, Y = l.get(o);
  let W = {
    inProgress: !0,
    isValid: null,
    from: yo(Y, z, be.Left, !0),
    fromHandle: z,
    fromPosition: z.position,
    fromNode: Y,
    to: V,
    toHandle: null,
    toPosition: ol[z.position],
    toNode: null,
    pointer: V
  };
  function te() {
    O = !0, $(W), y?.(e, { nodeId: o, handleId: r, handleType: k });
  }
  M === 0 && te();
  function ee(ce) {
    if (!O) {
      const { x: pe, y: we } = tn(ce), he = pe - N, ue = we - H;
      if (!(he * he + ue * ue > M * M))
        return;
      te();
    }
    if (!C() || !z) {
      U(ce);
      return;
    }
    const se = x();
    V = tn(ce, P), T = Pm(Ao(V, se, !1, [1, 1]), n, l, z), F || (q(), F = !0);
    const ae = Ic(ce, {
      handle: T,
      connectionMode: t,
      fromNodeId: o,
      fromHandleId: r,
      fromType: s ? "target" : "source",
      isValidConnection: b,
      doc: L,
      lib: u,
      flowId: f,
      nodeLookup: l
    });
    ne = ae.handleDomNode, K = ae.connection, G = Nm(!!T, ae.isValid);
    const ie = {
      // from stays the same
      ...W,
      isValid: G,
      to: ae.toHandle && G ? bi({ x: ae.toHandle.x, y: ae.toHandle.y }, se) : V,
      toHandle: ae.toHandle,
      toPosition: G && ae.toHandle ? ae.toHandle.position : ol[z.position],
      toNode: ae.toHandle ? l.get(ae.toHandle.nodeId) : null,
      pointer: V
    };
    $(ie), W = ie;
  }
  function U(ce) {
    if (!("touches" in ce && ce.touches.length > 0)) {
      if (O) {
        (T || ne) && K && G && m?.(K);
        const { inProgress: se, ...ae } = W, ie = {
          ...ae,
          toPosition: W.toHandle ? W.toPosition : null
        };
        w?.(ce, ie), i && _?.(ce, ie);
      }
      h(), cancelAnimationFrame(I), F = !1, G = !1, K = null, ne = null, L.removeEventListener("mousemove", ee), L.removeEventListener("mouseup", U), L.removeEventListener("touchmove", ee), L.removeEventListener("touchend", U);
    }
  }
  L.addEventListener("mousemove", ee), L.addEventListener("mouseup", U), L.addEventListener("touchmove", ee), L.addEventListener("touchend", U);
}
function Ic(e, { handle: t, connectionMode: n, fromNodeId: r, fromHandleId: o, fromType: i, doc: s, lib: a, flowId: l, isValidConnection: u = Lc, nodeLookup: d }) {
  const f = i === "target", p = t ? s.querySelector(`.${a}-flow__handle[data-id="${l}-${t?.nodeId}-${t?.id}-${t?.type}"]`) : null, { x: h, y } = tn(e), m = s.elementFromPoint(h, y), w = m?.classList.contains(`${a}-flow__handle`) ? m : p, b = {
    handleDomNode: w,
    isValid: !1,
    connection: null,
    toHandle: null
  };
  if (w) {
    const _ = Vc(void 0, w), $ = w.getAttribute("data-nodeid"), x = w.getAttribute("data-handleid"), C = w.classList.contains("connectable"), S = w.classList.contains("connectableend");
    if (!$ || !_)
      return b;
    const M = {
      source: f ? $ : r,
      sourceHandle: f ? x : o,
      target: f ? r : $,
      targetHandle: f ? o : x
    };
    b.connection = M;
    const j = C && S && (n === Rr.Strict ? f && _ === "source" || !f && _ === "target" : $ !== r || x !== o);
    b.isValid = j && u(M), b.toHandle = zc($, _, x, d, n, !0);
  }
  return b;
}
const ml = {
  onPointerDown: Dm,
  isValid: Ic
};
function Hm({ domNode: e, panZoom: t, getTransform: n, getViewScale: r }) {
  const o = Yt(e);
  function i({ translateExtent: a, width: l, height: u, zoomStep: d = 1, pannable: f = !0, zoomable: p = !0, inversePan: h = !1 }) {
    const y = ($) => {
      if ($.sourceEvent.type !== "wheel" || !t)
        return;
      const x = n(), C = $.sourceEvent.ctrlKey && cr() ? 10 : 1, S = -$.sourceEvent.deltaY * ($.sourceEvent.deltaMode === 1 ? 0.05 : $.sourceEvent.deltaMode ? 1 : 2e-3) * d, M = x[2] * Math.pow(2, S * C);
      t.scaleTo(M);
    };
    let m = [0, 0];
    const w = ($) => {
      ($.sourceEvent.type === "mousedown" || $.sourceEvent.type === "touchstart") && (m = [
        $.sourceEvent.clientX ?? $.sourceEvent.touches[0].clientX,
        $.sourceEvent.clientY ?? $.sourceEvent.touches[0].clientY
      ]);
    }, b = ($) => {
      const x = n();
      if ($.sourceEvent.type !== "mousemove" && $.sourceEvent.type !== "touchmove" || !t)
        return;
      const C = [
        $.sourceEvent.clientX ?? $.sourceEvent.touches[0].clientX,
        $.sourceEvent.clientY ?? $.sourceEvent.touches[0].clientY
      ], S = [C[0] - m[0], C[1] - m[1]];
      m = C;
      const M = r() * Math.max(x[2], Math.log(x[2])) * (h ? -1 : 1), j = {
        x: x[0] - S[0] * M,
        y: x[1] - S[1] * M
      }, L = [
        [0, 0],
        [l, u]
      ];
      t.setViewportConstrained({
        x: j.x,
        y: j.y,
        zoom: x[2]
      }, L, a);
    }, _ = yc().on("start", w).on("zoom", f ? b : null).on("zoom.wheel", p ? y : null);
    o.call(_, {});
  }
  function s() {
    o.on("zoom", null);
  }
  return {
    update: i,
    destroy: s,
    pointer: Jt
  };
}
const Bi = (e) => ({
  x: e.x,
  y: e.y,
  zoom: e.k
}), is = ({ x: e, y: t, zoom: n }) => Ri.translate(e, t).scale(n), Pr = (e, t) => e.target.closest(`.${t}`), jc = (e, t) => t === 2 && Array.isArray(e) && e.includes(2), Om = (e) => ((e *= 2) <= 1 ? e * e * e : (e -= 2) * e * e + 2) / 2, ss = (e, t = 0, n = Om, r = () => {
}) => {
  const o = typeof t == "number" && t > 0;
  return o || r(), o ? e.transition().duration(t).ease(n).on("end", r) : e;
}, Rc = (e) => {
  const t = e.ctrlKey && cr() ? 10 : 1;
  return -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 2e-3) * t;
};
function Mm({ zoomPanValues: e, noWheelClassName: t, d3Selection: n, d3Zoom: r, panOnScrollMode: o, panOnScrollSpeed: i, zoomOnPinch: s, onPanZoomStart: a, onPanZoom: l, onPanZoomEnd: u }) {
  return (d) => {
    if (Pr(d, t))
      return d.ctrlKey && d.preventDefault(), !1;
    d.preventDefault(), d.stopImmediatePropagation();
    const f = n.property("__zoom").k || 1;
    if (d.ctrlKey && s) {
      const w = Jt(d), b = Rc(d), _ = f * Math.pow(2, b);
      r.scaleTo(n, _, w, d);
      return;
    }
    const p = d.deltaMode === 1 ? 20 : 1;
    let h = o === pr.Vertical ? 0 : d.deltaX * p, y = o === pr.Horizontal ? 0 : d.deltaY * p;
    !cr() && d.shiftKey && o !== pr.Vertical && (h = d.deltaY * p, y = 0), r.translateBy(
      n,
      -(h / f) * i,
      -(y / f) * i,
      // @ts-ignore
      { internal: !0 }
    );
    const m = Bi(n.property("__zoom"));
    clearTimeout(e.panScrollTimeout), e.isPanScrolling ? (l?.(d, m), e.panScrollTimeout = setTimeout(() => {
      u?.(d, m), e.isPanScrolling = !1;
    }, 150)) : (e.isPanScrolling = !0, a?.(d, m));
  };
}
function Am({ noWheelClassName: e, preventScrolling: t, d3ZoomHandler: n }) {
  return function(r, o) {
    const i = r.type === "wheel", s = !t && i && !r.ctrlKey, a = Pr(r, e);
    if (r.ctrlKey && i && a && r.preventDefault(), s || a)
      return null;
    r.preventDefault(), n.call(this, r, o);
  };
}
function Tm({ zoomPanValues: e, onDraggingChange: t, onPanZoomStart: n }) {
  return (r) => {
    if (r.sourceEvent?.internal)
      return;
    const o = Bi(r.transform);
    e.mouseButton = r.sourceEvent?.button || 0, e.isZoomingOrPanning = !0, e.prevViewport = o, r.sourceEvent?.type === "mousedown" && t(!0), n && n?.(r.sourceEvent, o);
  };
}
function zm({ zoomPanValues: e, panOnDrag: t, onPaneContextMenu: n, onTransformChange: r, onPanZoom: o }) {
  return (i) => {
    e.usedRightMouseButton = !!(n && jc(t, e.mouseButton ?? 0)), i.sourceEvent?.sync || r([i.transform.x, i.transform.y, i.transform.k]), o && !i.sourceEvent?.internal && o?.(i.sourceEvent, Bi(i.transform));
  };
}
function Vm({ zoomPanValues: e, panOnDrag: t, panOnScroll: n, onDraggingChange: r, onPanZoomEnd: o, onPaneContextMenu: i }) {
  return (s) => {
    if (!s.sourceEvent?.internal && (e.isZoomingOrPanning = !1, i && jc(t, e.mouseButton ?? 0) && !e.usedRightMouseButton && s.sourceEvent && i(s.sourceEvent), e.usedRightMouseButton = !1, r(!1), o)) {
      const a = Bi(s.transform);
      e.prevViewport = a, clearTimeout(e.timerId), e.timerId = setTimeout(
        () => {
          o?.(s.sourceEvent, a);
        },
        // we need a setTimeout for panOnScroll to supress multiple end events fired during scroll
        n ? 150 : 0
      );
    }
  };
}
function Lm({ zoomActivationKeyPressed: e, zoomOnScroll: t, zoomOnPinch: n, panOnDrag: r, panOnScroll: o, zoomOnDoubleClick: i, userSelectionActive: s, noWheelClassName: a, noPanClassName: l, lib: u, connectionInProgress: d }) {
  return (f) => {
    const p = e || t, h = n && f.ctrlKey, y = f.type === "wheel";
    if (f.button === 1 && f.type === "mousedown" && (Pr(f, `${u}-flow__node`) || Pr(f, `${u}-flow__edge`)))
      return !0;
    if (!r && !p && !o && !i && !n || s || d && !y || Pr(f, a) && y || Pr(f, l) && (!y || o && y && !e) || !n && f.ctrlKey && y)
      return !1;
    if (!n && f.type === "touchstart" && f.touches?.length > 1)
      return f.preventDefault(), !1;
    if (!p && !o && !h && y || !r && (f.type === "mousedown" || f.type === "touchstart") || Array.isArray(r) && !r.includes(f.button) && f.type === "mousedown")
      return !1;
    const m = Array.isArray(r) && r.includes(f.button) || !f.button || f.button <= 1;
    return (!f.ctrlKey || y) && m;
  };
}
function Im({ domNode: e, minZoom: t, maxZoom: n, translateExtent: r, viewport: o, onPanZoom: i, onPanZoomStart: s, onPanZoomEnd: a, onDraggingChange: l }) {
  const u = {
    isZoomingOrPanning: !1,
    usedRightMouseButton: !1,
    prevViewport: {},
    mouseButton: 0,
    timerId: void 0,
    panScrollTimeout: void 0,
    isPanScrolling: !1
  }, d = e.getBoundingClientRect(), f = yc().scaleExtent([t, n]).translateExtent(r), p = Yt(e).call(f);
  _({
    x: o.x,
    y: o.y,
    zoom: Kr(o.zoom, t, n)
  }, [
    [0, 0],
    [d.width, d.height]
  ], r);
  const h = p.on("wheel.zoom"), y = p.on("dblclick.zoom");
  f.wheelDelta(Rc);
  function m(T, N) {
    return p ? new Promise((H) => {
      f?.interpolate(N?.interpolate === "linear" ? io : ei).transform(ss(p, N?.duration, N?.ease, () => H(!0)), T);
    }) : Promise.resolve(!1);
  }
  function w({ noWheelClassName: T, noPanClassName: N, onPaneContextMenu: H, userSelectionActive: k, panOnScroll: P, panOnDrag: O, panOnScrollMode: B, panOnScrollSpeed: V, preventScrolling: F, zoomOnPinch: K, zoomOnScroll: G, zoomOnDoubleClick: ne, zoomActivationKeyPressed: q, lib: z, onTransformChange: Y, connectionInProgress: W, paneClickDistance: te, selectionOnDrag: ee }) {
    k && !u.isZoomingOrPanning && b();
    const U = P && !q && !k;
    f.clickDistance(ee ? 1 / 0 : !Pn(te) || te < 0 ? 0 : te);
    const ce = U ? Mm({
      zoomPanValues: u,
      noWheelClassName: T,
      d3Selection: p,
      d3Zoom: f,
      panOnScrollMode: B,
      panOnScrollSpeed: V,
      zoomOnPinch: K,
      onPanZoomStart: s,
      onPanZoom: i,
      onPanZoomEnd: a
    }) : Am({
      noWheelClassName: T,
      preventScrolling: F,
      d3ZoomHandler: h
    });
    if (p.on("wheel.zoom", ce, { passive: !1 }), !k) {
      const ae = Tm({
        zoomPanValues: u,
        onDraggingChange: l,
        onPanZoomStart: s
      });
      f.on("start", ae);
      const ie = zm({
        zoomPanValues: u,
        panOnDrag: O,
        onPaneContextMenu: !!H,
        onPanZoom: i,
        onTransformChange: Y
      });
      f.on("zoom", ie);
      const pe = Vm({
        zoomPanValues: u,
        panOnDrag: O,
        panOnScroll: P,
        onPaneContextMenu: H,
        onPanZoomEnd: a,
        onDraggingChange: l
      });
      f.on("end", pe);
    }
    const se = Lm({
      zoomActivationKeyPressed: q,
      panOnDrag: O,
      zoomOnScroll: G,
      panOnScroll: P,
      zoomOnDoubleClick: ne,
      zoomOnPinch: K,
      userSelectionActive: k,
      noPanClassName: N,
      noWheelClassName: T,
      lib: z,
      connectionInProgress: W
    });
    f.filter(se), ne ? p.on("dblclick.zoom", y) : p.on("dblclick.zoom", null);
  }
  function b() {
    f.on("zoom", null);
  }
  async function _(T, N, H) {
    const k = is(T), P = f?.constrain()(k, N, H);
    return P && await m(P), new Promise((O) => O(P));
  }
  async function $(T, N) {
    const H = is(T);
    return await m(H, N), new Promise((k) => k(H));
  }
  function x(T) {
    if (p) {
      const N = is(T), H = p.property("__zoom");
      (H.k !== T.zoom || H.x !== T.x || H.y !== T.y) && f?.transform(p, N, null, { sync: !0 });
    }
  }
  function C() {
    const T = p ? mc(p.node()) : { x: 0, y: 0, k: 1 };
    return { x: T.x, y: T.y, zoom: T.k };
  }
  function S(T, N) {
    return p ? new Promise((H) => {
      f?.interpolate(N?.interpolate === "linear" ? io : ei).scaleTo(ss(p, N?.duration, N?.ease, () => H(!0)), T);
    }) : Promise.resolve(!1);
  }
  function M(T, N) {
    return p ? new Promise((H) => {
      f?.interpolate(N?.interpolate === "linear" ? io : ei).scaleBy(ss(p, N?.duration, N?.ease, () => H(!0)), T);
    }) : Promise.resolve(!1);
  }
  function j(T) {
    f?.scaleExtent(T);
  }
  function L(T) {
    f?.translateExtent(T);
  }
  function I(T) {
    const N = !Pn(T) || T < 0 ? 0 : T;
    f?.clickDistance(N);
  }
  return {
    update: w,
    destroy: b,
    setViewport: $,
    setViewportConstrained: _,
    getViewport: C,
    scaleTo: S,
    scaleBy: M,
    setScaleExtent: j,
    setTranslateExtent: L,
    syncViewport: x,
    setClickDistance: I
  };
}
var yl;
(function(e) {
  e.Line = "line", e.Handle = "handle";
})(yl || (yl = {}));
var jm = /* @__PURE__ */ J("<div><!></div>");
function Qn(e, t) {
  de(t, !0);
  let n = v(t, "id", 7, null), r = v(t, "type", 7, "source"), o = v(t, "position", 23, () => be.Top), i = v(t, "style", 7), s = v(t, "class", 7), a = v(t, "isConnectable", 7), l = v(t, "isConnectableStart", 7, !0), u = v(t, "isConnectableEnd", 7, !0), d = v(t, "isValidConnection", 7), f = v(t, "onconnect", 7), p = v(t, "ondisconnect", 7), h = v(t, "children", 7), y = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "id",
    "type",
    "position",
    "style",
    "class",
    "isConnectable",
    "isConnectableStart",
    "isConnectableEnd",
    "isValidConnection",
    "onconnect",
    "ondisconnect",
    "children"
  ]);
  const m = Un("svelteflow__node_id"), w = Un("svelteflow__node_connectable");
  let b = /* @__PURE__ */ E(() => r() === "target"), _ = /* @__PURE__ */ E(() => a() !== void 0 ? a() : w.value), $ = ln(), x = /* @__PURE__ */ E(() => $.ariaLabelConfig), C = null;
  mu(() => {
    if (f() || p()) {
      $.edges;
      let K = $.connectionLookup.get(`${m}-${r()}${n() ? `-${n()}` : ""}`);
      if (C && !I1(K, C)) {
        const G = K ?? /* @__PURE__ */ new Map();
        il(C, G, p()), il(G, C, f());
      }
      C = new Map(K);
    }
  });
  let S = /* @__PURE__ */ E(() => {
    if (!$.connection.inProgress)
      return [!1, !1, !1, !1, null];
    const { fromHandle: K, toHandle: G, isValid: ne } = $.connection, q = K && K.nodeId === m && K.type === r() && K.id === n(), z = G && G.nodeId === m && G.type === r() && G.id === n(), Y = $.connectionMode === Rr.Strict ? K?.type !== r() : m !== K?.nodeId || n() !== K?.id;
    return [
      !0,
      q,
      z,
      Y,
      z && ne
    ];
  }), M = /* @__PURE__ */ E(() => ko(c(S), 5)), j = /* @__PURE__ */ E(() => c(M)[0]), L = /* @__PURE__ */ E(() => c(M)[1]), I = /* @__PURE__ */ E(() => c(M)[2]), T = /* @__PURE__ */ E(() => c(M)[3]), N = /* @__PURE__ */ E(() => c(M)[4]);
  function H(K) {
    const G = $.onbeforeconnect ? $.onbeforeconnect(K) : K;
    G && ($.addEdge(G), $.onconnect?.(K));
  }
  function k(K) {
    const G = Nc(K);
    K.currentTarget && (G && K.button === 0 || !G) && ml.onPointerDown(K, {
      handleId: n(),
      nodeId: m,
      isTarget: c(b),
      connectionRadius: $.connectionRadius,
      domNode: $.domNode,
      nodeLookup: $.nodeLookup,
      connectionMode: $.connectionMode,
      lib: "svelte",
      autoPanOnConnect: $.autoPanOnConnect,
      autoPanSpeed: $.autoPanSpeed,
      flowId: $.flowId,
      isValidConnection: d() ?? $.isValidConnection,
      updateConnection: $.updateConnection,
      cancelConnection: $.cancelConnection,
      panBy: $.panBy,
      onConnect: H,
      onConnectStart: (ne, q) => {
        $.onconnectstart?.(ne, {
          nodeId: q.nodeId,
          handleId: q.handleId,
          handleType: q.handleType
        });
      },
      onConnectEnd: (ne, q) => {
        $.onconnectend?.(ne, q);
      },
      getTransform: () => [$.viewport.x, $.viewport.y, $.viewport.zoom],
      getFromHandle: () => $.connection.fromHandle,
      dragThreshold: $.connectionDragThreshold,
      handleDomNode: K.currentTarget
    });
  }
  function P(K) {
    if (!m || !$.clickConnectStartHandle && !l())
      return;
    if (!$.clickConnectStartHandle) {
      $.onclickconnectstart?.(K, { nodeId: m, handleId: n(), handleType: r() }), $.clickConnectStartHandle = { nodeId: m, type: r(), id: n() };
      return;
    }
    const G = Ec(K.target), ne = d() ?? $.isValidConnection, { connectionMode: q, clickConnectStartHandle: z, flowId: Y, nodeLookup: W } = $, { connection: te, isValid: ee } = ml.isValid(K, {
      handle: { nodeId: m, id: n(), type: r() },
      connectionMode: q,
      fromNodeId: z.nodeId,
      fromHandleId: z.id ?? null,
      fromType: z.type,
      isValidConnection: ne,
      flowId: Y,
      doc: G,
      lib: "svelte",
      nodeLookup: W
    });
    ee && te && H(te);
    const U = structuredClone(Ul($.connection));
    delete U.inProgress, U.toPosition = U.toHandle ? U.toHandle.position : null, $.onclickconnectend?.(K, U), $.clickConnectStartHandle = null;
  }
  var O = {
    get id() {
      return n();
    },
    set id(K = null) {
      n(K), g();
    },
    get type() {
      return r();
    },
    set type(K = "source") {
      r(K), g();
    },
    get position() {
      return o();
    },
    set position(K = be.Top) {
      o(K), g();
    },
    get style() {
      return i();
    },
    set style(K) {
      i(K), g();
    },
    get class() {
      return s();
    },
    set class(K) {
      s(K), g();
    },
    get isConnectable() {
      return a();
    },
    set isConnectable(K) {
      a(K), g();
    },
    get isConnectableStart() {
      return l();
    },
    set isConnectableStart(K = !0) {
      l(K), g();
    },
    get isConnectableEnd() {
      return u();
    },
    set isConnectableEnd(K = !0) {
      u(K), g();
    },
    get isValidConnection() {
      return d();
    },
    set isValidConnection(K) {
      d(K), g();
    },
    get onconnect() {
      return f();
    },
    set onconnect(K) {
      f(K), g();
    },
    get ondisconnect() {
      return p();
    },
    set ondisconnect(K) {
      p(K), g();
    },
    get children() {
      return h();
    },
    set children(K) {
      h(K), g();
    }
  }, B = jm(), V = () => {
  };
  vt(B, () => ({
    "data-handleid": n(),
    "data-nodeid": m,
    "data-handlepos": o(),
    "data-id": `${$.flowId ?? ""}-${m ?? ""}-${n() ?? "null" ?? ""}-${r() ?? ""}`,
    class: [
      "svelte-flow__handle",
      `svelte-flow__handle-${o()}`,
      $.noDragClass,
      $.noPanClass,
      o(),
      s()
    ],
    onmousedown: k,
    ontouchstart: k,
    onclick: $.clickConnect ? P : void 0,
    onkeypress: V,
    style: i(),
    role: "button",
    "aria-label": c(x)["handle.ariaLabel"],
    tabindex: "-1",
    ...y,
    [Yn]: {
      valid: c(N),
      connectingto: c(I),
      connectingfrom: c(L),
      source: !c(b),
      target: c(b),
      connectablestart: l(),
      connectableend: u(),
      connectable: c(_),
      connectionindicator: c(_) && (!c(j) || c(T)) && (c(j) || $.clickConnectStartHandle ? u() : l())
    }
  }));
  var F = Z(B);
  return tt(F, () => h() ?? bt), R(B), D(e, B), fe(O);
}
le(
  Qn,
  {
    id: {},
    type: {},
    position: {},
    style: {},
    class: {},
    isConnectable: {},
    isConnectableStart: {},
    isConnectableEnd: {},
    isValidConnection: {},
    onconnect: {},
    ondisconnect: {},
    children: {}
  },
  [],
  [],
  !0
);
var Rm = /* @__PURE__ */ J("<!> <!>", 1);
function ga(e, t) {
  de(t, !0);
  let n = v(t, "data", 7), r = v(t, "targetPosition", 23, () => be.Top), o = v(t, "sourcePosition", 23, () => be.Bottom);
  var i = {
    get data() {
      return n();
    },
    set data(d) {
      n(d), g();
    },
    get targetPosition() {
      return r();
    },
    set targetPosition(d = be.Top) {
      r(d), g();
    },
    get sourcePosition() {
      return o();
    },
    set sourcePosition(d = be.Bottom) {
      o(d), g();
    }
  }, s = Rm(), a = re(s);
  Qn(a, {
    type: "target",
    get position() {
      return r();
    }
  });
  var l = A(a), u = A(l);
  return Qn(u, {
    type: "source",
    get position() {
      return o();
    }
  }), xe(() => Re(l, ` ${n()?.label ?? ""} `)), D(e, s), fe(i);
}
le(ga, { data: {}, targetPosition: {}, sourcePosition: {} }, [], [], !0);
var Km = /* @__PURE__ */ J(" <!>", 1);
function Kc(e, t) {
  de(t, !0);
  let n = v(t, "data", 23, () => ({ label: "Node" })), r = v(t, "sourcePosition", 23, () => be.Bottom);
  var o = {
    get data() {
      return n();
    },
    set data(l = { label: "Node" }) {
      n(l), g();
    },
    get sourcePosition() {
      return r();
    },
    set sourcePosition(l = be.Bottom) {
      r(l), g();
    }
  };
  me();
  var i = Km(), s = re(i), a = A(s);
  return Qn(a, {
    type: "source",
    get position() {
      return r();
    }
  }), xe(() => Re(s, `${n()?.label ?? ""} `)), D(e, i), fe(o);
}
le(Kc, { data: {}, sourcePosition: {} }, [], [], !0);
var Zm = /* @__PURE__ */ J(" <!>", 1);
function Zc(e, t) {
  de(t, !0);
  let n = v(t, "data", 23, () => ({ label: "Node" })), r = v(t, "targetPosition", 23, () => be.Top);
  var o = {
    get data() {
      return n();
    },
    set data(l = { label: "Node" }) {
      n(l), g();
    },
    get targetPosition() {
      return r();
    },
    set targetPosition(l = be.Top) {
      r(l), g();
    }
  };
  me();
  var i = Zm(), s = re(i), a = A(s);
  return Qn(a, {
    type: "target",
    get position() {
      return r();
    }
  }), xe(() => Re(s, `${n()?.label ?? ""} `)), D(e, i), fe(o);
}
le(Zc, { data: {}, targetPosition: {} }, [], [], !0);
function Bc(e, t) {
}
le(Bc, {}, [], [], !0);
function as(e, t, n) {
  if (!n || !t)
    return;
  const r = n === "root" ? t : t.querySelector(`.svelte-flow__${n}`);
  r && r.appendChild(e);
}
function Yc(e, t) {
  const n = /* @__PURE__ */ E(ln), r = /* @__PURE__ */ E(() => c(n).domNode);
  let o;
  return c(r) ? as(e, c(r), t) : o = Fs(() => {
    Je(() => {
      as(e, c(r), t), o?.();
    });
  }), {
    async update(i) {
      as(e, c(r), i);
    },
    destroy() {
      e.parentNode && e.parentNode.removeChild(e), o?.();
    }
  };
}
function qc() {
  let e = /* @__PURE__ */ Ne(typeof window > "u");
  if (c(e)) {
    const t = Fs(() => {
      Je(() => {
        Q(e, !1), t?.();
      });
    });
  }
  return {
    get value() {
      return c(e);
    }
  };
}
const wl = (e) => R1(e), Bm = (e) => bc(e);
function wn(e) {
  return e === void 0 ? void 0 : `${e}px`;
}
const xi = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }
};
var Ym = /* @__PURE__ */ J("<div><!></div>");
const qm = {
  hash: "svelte-15jygm8",
  code: ".transparent.svelte-15jygm8 {background:transparent;}"
};
function Xc(e, t) {
  de(t, !0), Ke(e, qm);
  let n = v(t, "x", 7, 0), r = v(t, "y", 7, 0), o = v(t, "width", 7), i = v(t, "height", 7), s = v(t, "selectEdgeOnClick", 7, !1), a = v(t, "transparent", 7, !1), l = v(t, "class", 7), u = v(t, "children", 7), d = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "x",
    "y",
    "width",
    "height",
    "selectEdgeOnClick",
    "transparent",
    "class",
    "children"
  ]);
  const f = ln(), p = Un("svelteflow__edge_id");
  if (!p)
    throw new Error("EdgeLabel must be used within an edge");
  let h = /* @__PURE__ */ E(() => f.visible.edges.get(p)?.zIndex);
  var y = {
    get x() {
      return n();
    },
    set x(_ = 0) {
      n(_), g();
    },
    get y() {
      return r();
    },
    set y(_ = 0) {
      r(_), g();
    },
    get width() {
      return o();
    },
    set width(_) {
      o(_), g();
    },
    get height() {
      return i();
    },
    set height(_) {
      i(_), g();
    },
    get selectEdgeOnClick() {
      return s();
    },
    set selectEdgeOnClick(_ = !1) {
      s(_), g();
    },
    get transparent() {
      return a();
    },
    set transparent(_ = !1) {
      a(_), g();
    },
    get class() {
      return l();
    },
    set class(_) {
      l(_), g();
    },
    get children() {
      return u();
    },
    set children(_) {
      u(_), g();
    }
  }, m = Ym(), w = () => {
    s() && f.handleEdgeSelection(p);
  };
  vt(
    m,
    (_) => ({
      class: [
        "svelte-flow__edge-label",
        { transparent: a() },
        l()
      ],
      tabindex: "-1",
      onclick: w,
      ...d,
      [pn]: _
    }),
    [
      () => ({
        display: qc().value ? "none" : void 0,
        cursor: s() ? "pointer" : void 0,
        transform: `translate(-50%, -50%) translate(${n() ?? ""}px,${r() ?? ""}px)`,
        "pointer-events": "all",
        width: wn(o()),
        height: wn(i()),
        "z-index": c(h)
      })
    ],
    void 0,
    void 0,
    "svelte-15jygm8"
  );
  var b = Z(m);
  return tt(b, () => u() ?? bt), R(m), mt(m, (_, $) => Yc?.(_, $), () => "edge-labels"), D(e, m), fe(y);
}
le(
  Xc,
  {
    x: {},
    y: {},
    width: {},
    height: {},
    selectEdgeOnClick: {},
    transparent: {},
    class: {},
    children: {}
  },
  [],
  [],
  !0
);
var Xm = /* @__PURE__ */ ye("<path></path>"), Fm = /* @__PURE__ */ ye('<path fill="none"></path><!><!>', 1);
function To(e, t) {
  de(t, !0);
  let n = v(t, "id", 7), r = v(t, "path", 7), o = v(t, "label", 7), i = v(t, "labelX", 7), s = v(t, "labelY", 7), a = v(t, "labelStyle", 7), l = v(t, "markerStart", 7), u = v(t, "markerEnd", 7), d = v(t, "style", 7), f = v(t, "interactionWidth", 7, 20), p = v(t, "class", 7), h = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "id",
    "path",
    "label",
    "labelX",
    "labelY",
    "labelStyle",
    "markerStart",
    "markerEnd",
    "style",
    "interactionWidth",
    "class"
  ]);
  var y = {
    get id() {
      return n();
    },
    set id(C) {
      n(C), g();
    },
    get path() {
      return r();
    },
    set path(C) {
      r(C), g();
    },
    get label() {
      return o();
    },
    set label(C) {
      o(C), g();
    },
    get labelX() {
      return i();
    },
    set labelX(C) {
      i(C), g();
    },
    get labelY() {
      return s();
    },
    set labelY(C) {
      s(C), g();
    },
    get labelStyle() {
      return a();
    },
    set labelStyle(C) {
      a(C), g();
    },
    get markerStart() {
      return l();
    },
    set markerStart(C) {
      l(C), g();
    },
    get markerEnd() {
      return u();
    },
    set markerEnd(C) {
      u(C), g();
    },
    get style() {
      return d();
    },
    set style(C) {
      d(C), g();
    },
    get interactionWidth() {
      return f();
    },
    set interactionWidth(C = 20) {
      f(C), g();
    },
    get class() {
      return p();
    },
    set class(C) {
      p(C), g();
    }
  }, m = Fm(), w = re(m), b = A(w);
  {
    var _ = (C) => {
      var S = Xm();
      vt(S, () => ({
        d: r(),
        "stroke-opacity": 0,
        "stroke-width": f(),
        fill: "none",
        class: "svelte-flow__edge-interaction",
        ...h
      })), D(C, S);
    };
    oe(b, (C) => {
      f() > 0 && C(_);
    });
  }
  var $ = A(b);
  {
    var x = (C) => {
      Xc(C, {
        get x() {
          return i();
        },
        get y() {
          return s();
        },
        get style() {
          return a();
        },
        selectEdgeOnClick: !0,
        children: (S, M) => {
          me();
          var j = Se();
          xe(() => Re(j, o())), D(S, j);
        },
        $$slots: { default: !0 }
      });
    };
    oe($, (C) => {
      o() && C(x);
    });
  }
  return xe(() => {
    _e(w, "id", n()), _e(w, "d", r()), ft(w, 0, Rn(["svelte-flow__edge-path", p()])), _e(w, "marker-start", l()), _e(w, "marker-end", u()), gt(w, d());
  }), D(e, m), fe(y);
}
le(
  To,
  {
    id: {},
    path: {},
    label: {},
    labelX: {},
    labelY: {},
    labelStyle: {},
    markerStart: {},
    markerEnd: {},
    style: {},
    interactionWidth: {},
    class: {}
  },
  [],
  [],
  !0
);
function va(e, t) {
  de(t, !0);
  let n = v(t, "id", 7), r = v(t, "interactionWidth", 7), o = v(t, "label", 7), i = v(t, "labelStyle", 7), s = v(t, "markerEnd", 7), a = v(t, "markerStart", 7), l = v(t, "pathOptions", 7), u = v(t, "sourcePosition", 7), d = v(t, "sourceX", 7), f = v(t, "sourceY", 7), p = v(t, "style", 7), h = v(t, "targetPosition", 7), y = v(t, "targetX", 7), m = v(t, "targetY", 7), w = /* @__PURE__ */ E(() => Dc({
    sourceX: d(),
    sourceY: f(),
    targetX: y(),
    targetY: m(),
    sourcePosition: u(),
    targetPosition: h(),
    curvature: l()?.curvature
  })), b = /* @__PURE__ */ E(() => ko(c(w), 3)), _ = /* @__PURE__ */ E(() => c(b)[0]), $ = /* @__PURE__ */ E(() => c(b)[1]), x = /* @__PURE__ */ E(() => c(b)[2]);
  var C = {
    get id() {
      return n();
    },
    set id(S) {
      n(S), g();
    },
    get interactionWidth() {
      return r();
    },
    set interactionWidth(S) {
      r(S), g();
    },
    get label() {
      return o();
    },
    set label(S) {
      o(S), g();
    },
    get labelStyle() {
      return i();
    },
    set labelStyle(S) {
      i(S), g();
    },
    get markerEnd() {
      return s();
    },
    set markerEnd(S) {
      s(S), g();
    },
    get markerStart() {
      return a();
    },
    set markerStart(S) {
      a(S), g();
    },
    get pathOptions() {
      return l();
    },
    set pathOptions(S) {
      l(S), g();
    },
    get sourcePosition() {
      return u();
    },
    set sourcePosition(S) {
      u(S), g();
    },
    get sourceX() {
      return d();
    },
    set sourceX(S) {
      d(S), g();
    },
    get sourceY() {
      return f();
    },
    set sourceY(S) {
      f(S), g();
    },
    get style() {
      return p();
    },
    set style(S) {
      p(S), g();
    },
    get targetPosition() {
      return h();
    },
    set targetPosition(S) {
      h(S), g();
    },
    get targetX() {
      return y();
    },
    set targetX(S) {
      y(S), g();
    },
    get targetY() {
      return m();
    },
    set targetY(S) {
      m(S), g();
    }
  };
  return To(e, {
    get id() {
      return n();
    },
    get path() {
      return c(_);
    },
    get labelX() {
      return c($);
    },
    get labelY() {
      return c(x);
    },
    get label() {
      return o();
    },
    get labelStyle() {
      return i();
    },
    get markerStart() {
      return a();
    },
    get markerEnd() {
      return s();
    },
    get interactionWidth() {
      return r();
    },
    get style() {
      return p();
    }
  }), fe(C);
}
le(
  va,
  {
    id: {},
    interactionWidth: {},
    label: {},
    labelStyle: {},
    markerEnd: {},
    markerStart: {},
    pathOptions: {},
    sourcePosition: {},
    sourceX: {},
    sourceY: {},
    style: {},
    targetPosition: {},
    targetX: {},
    targetY: {}
  },
  [],
  [],
  !0
);
function Fc(e, t) {
  de(t, !0);
  let n = v(t, "interactionWidth", 7), r = v(t, "label", 7), o = v(t, "labelStyle", 7), i = v(t, "style", 7), s = v(t, "markerEnd", 7), a = v(t, "markerStart", 7), l = v(t, "sourcePosition", 7), u = v(t, "sourceX", 7), d = v(t, "sourceY", 7), f = v(t, "targetPosition", 7), p = v(t, "targetX", 7), h = v(t, "targetY", 7), y = /* @__PURE__ */ E(() => da({
    sourceX: u(),
    sourceY: d(),
    targetX: p(),
    targetY: h(),
    sourcePosition: l(),
    targetPosition: f()
  })), m = /* @__PURE__ */ E(() => ko(c(y), 3)), w = /* @__PURE__ */ E(() => c(m)[0]), b = /* @__PURE__ */ E(() => c(m)[1]), _ = /* @__PURE__ */ E(() => c(m)[2]);
  var $ = {
    get interactionWidth() {
      return n();
    },
    set interactionWidth(x) {
      n(x), g();
    },
    get label() {
      return r();
    },
    set label(x) {
      r(x), g();
    },
    get labelStyle() {
      return o();
    },
    set labelStyle(x) {
      o(x), g();
    },
    get style() {
      return i();
    },
    set style(x) {
      i(x), g();
    },
    get markerEnd() {
      return s();
    },
    set markerEnd(x) {
      s(x), g();
    },
    get markerStart() {
      return a();
    },
    set markerStart(x) {
      a(x), g();
    },
    get sourcePosition() {
      return l();
    },
    set sourcePosition(x) {
      l(x), g();
    },
    get sourceX() {
      return u();
    },
    set sourceX(x) {
      u(x), g();
    },
    get sourceY() {
      return d();
    },
    set sourceY(x) {
      d(x), g();
    },
    get targetPosition() {
      return f();
    },
    set targetPosition(x) {
      f(x), g();
    },
    get targetX() {
      return p();
    },
    set targetX(x) {
      p(x), g();
    },
    get targetY() {
      return h();
    },
    set targetY(x) {
      h(x), g();
    }
  };
  return To(e, {
    get path() {
      return c(w);
    },
    get labelX() {
      return c(b);
    },
    get labelY() {
      return c(_);
    },
    get label() {
      return r();
    },
    get labelStyle() {
      return o();
    },
    get markerStart() {
      return a();
    },
    get markerEnd() {
      return s();
    },
    get interactionWidth() {
      return n();
    },
    get style() {
      return i();
    }
  }), fe($);
}
le(
  Fc,
  {
    interactionWidth: {},
    label: {},
    labelStyle: {},
    style: {},
    markerEnd: {},
    markerStart: {},
    sourcePosition: {},
    sourceX: {},
    sourceY: {},
    targetPosition: {},
    targetX: {},
    targetY: {}
  },
  [],
  [],
  !0
);
function Wc(e, t) {
  de(t, !0);
  let n = v(t, "sourceX", 7), r = v(t, "sourceY", 7), o = v(t, "targetX", 7), i = v(t, "targetY", 7), s = v(t, "label", 7), a = v(t, "labelStyle", 7), l = v(t, "markerStart", 7), u = v(t, "markerEnd", 7), d = v(t, "interactionWidth", 7), f = v(t, "style", 7), p = /* @__PURE__ */ E(() => Oc({
    sourceX: n(),
    sourceY: r(),
    targetX: o(),
    targetY: i()
  })), h = /* @__PURE__ */ E(() => ko(c(p), 3)), y = /* @__PURE__ */ E(() => c(h)[0]), m = /* @__PURE__ */ E(() => c(h)[1]), w = /* @__PURE__ */ E(() => c(h)[2]);
  var b = {
    get sourceX() {
      return n();
    },
    set sourceX(_) {
      n(_), g();
    },
    get sourceY() {
      return r();
    },
    set sourceY(_) {
      r(_), g();
    },
    get targetX() {
      return o();
    },
    set targetX(_) {
      o(_), g();
    },
    get targetY() {
      return i();
    },
    set targetY(_) {
      i(_), g();
    },
    get label() {
      return s();
    },
    set label(_) {
      s(_), g();
    },
    get labelStyle() {
      return a();
    },
    set labelStyle(_) {
      a(_), g();
    },
    get markerStart() {
      return l();
    },
    set markerStart(_) {
      l(_), g();
    },
    get markerEnd() {
      return u();
    },
    set markerEnd(_) {
      u(_), g();
    },
    get interactionWidth() {
      return d();
    },
    set interactionWidth(_) {
      d(_), g();
    },
    get style() {
      return f();
    },
    set style(_) {
      f(_), g();
    }
  };
  return To(e, {
    get path() {
      return c(y);
    },
    get labelX() {
      return c(m);
    },
    get labelY() {
      return c(w);
    },
    get label() {
      return s();
    },
    get labelStyle() {
      return a();
    },
    get markerStart() {
      return l();
    },
    get markerEnd() {
      return u();
    },
    get interactionWidth() {
      return d();
    },
    get style() {
      return f();
    }
  }), fe(b);
}
le(
  Wc,
  {
    sourceX: {},
    sourceY: {},
    targetX: {},
    targetY: {},
    label: {},
    labelStyle: {},
    markerStart: {},
    markerEnd: {},
    interactionWidth: {},
    style: {}
  },
  [],
  [],
  !0
);
function Gc(e, t) {
  de(t, !0);
  let n = v(t, "sourceX", 7), r = v(t, "sourceY", 7), o = v(t, "sourcePosition", 7), i = v(t, "targetX", 7), s = v(t, "targetY", 7), a = v(t, "targetPosition", 7), l = v(t, "label", 7), u = v(t, "labelStyle", 7), d = v(t, "markerStart", 7), f = v(t, "markerEnd", 7), p = v(t, "interactionWidth", 7), h = v(t, "style", 7), y = /* @__PURE__ */ E(() => da({
    sourceX: n(),
    sourceY: r(),
    targetX: i(),
    targetY: s(),
    sourcePosition: o(),
    targetPosition: a(),
    borderRadius: 0
  })), m = /* @__PURE__ */ E(() => ko(c(y), 3)), w = /* @__PURE__ */ E(() => c(m)[0]), b = /* @__PURE__ */ E(() => c(m)[1]), _ = /* @__PURE__ */ E(() => c(m)[2]);
  var $ = {
    get sourceX() {
      return n();
    },
    set sourceX(x) {
      n(x), g();
    },
    get sourceY() {
      return r();
    },
    set sourceY(x) {
      r(x), g();
    },
    get sourcePosition() {
      return o();
    },
    set sourcePosition(x) {
      o(x), g();
    },
    get targetX() {
      return i();
    },
    set targetX(x) {
      i(x), g();
    },
    get targetY() {
      return s();
    },
    set targetY(x) {
      s(x), g();
    },
    get targetPosition() {
      return a();
    },
    set targetPosition(x) {
      a(x), g();
    },
    get label() {
      return l();
    },
    set label(x) {
      l(x), g();
    },
    get labelStyle() {
      return u();
    },
    set labelStyle(x) {
      u(x), g();
    },
    get markerStart() {
      return d();
    },
    set markerStart(x) {
      d(x), g();
    },
    get markerEnd() {
      return f();
    },
    set markerEnd(x) {
      f(x), g();
    },
    get interactionWidth() {
      return p();
    },
    set interactionWidth(x) {
      p(x), g();
    },
    get style() {
      return h();
    },
    set style(x) {
      h(x), g();
    }
  };
  return To(e, {
    get path() {
      return c(w);
    },
    get labelX() {
      return c(b);
    },
    get labelY() {
      return c(_);
    },
    get label() {
      return l();
    },
    get labelStyle() {
      return u();
    },
    get markerStart() {
      return d();
    },
    get markerEnd() {
      return f();
    },
    get interactionWidth() {
      return p();
    },
    get style() {
      return h();
    }
  }), fe($);
}
le(
  Gc,
  {
    sourceX: {},
    sourceY: {},
    sourcePosition: {},
    targetX: {},
    targetY: {},
    targetPosition: {},
    label: {},
    labelStyle: {},
    markerStart: {},
    markerEnd: {},
    interactionWidth: {},
    style: {}
  },
  [],
  [],
  !0
);
class Wm {
  #e;
  #t;
  /**
   *
   * @param {() => T} fn
   * @param {(update: () => void) => void} onsubscribe
   */
  constructor(t, n) {
    this.#e = t, this.#t = ou(n);
  }
  get current() {
    return this.#t(), this.#e();
  }
}
const Gm = /\(.+\)/, Um = /* @__PURE__ */ new Set(["all", "print", "screen", "and", "or", "not", "only"]);
class Jm extends Wm {
  /**
   * @param {string} query A media query string
   * @param {boolean} [fallback] Fallback value for the server
   */
  constructor(t, n) {
    let r = Gm.test(t) || // we need to use `some` here because technically this `window.matchMedia('random,screen')` still returns true
    t.split(/[\s,]+/).some((i) => Um.has(i.trim())) ? t : `(${t})`;
    const o = window.matchMedia(r);
    super(
      () => o.matches,
      (i) => ws(o, "change", i)
    );
  }
}
function Qm(e, t, n, r) {
  const o = /* @__PURE__ */ new Map();
  return ua(e, { x: 0, y: 0, width: n, height: r }, t, !0).forEach((i) => {
    o.set(i.id, i);
  }), o;
}
function bl(e) {
  const { edges: t, defaultEdgeOptions: n, nodeLookup: r, previousEdges: o, connectionMode: i, onerror: s, onlyRenderVisible: a, elevateEdgesOnSelect: l } = e, u = /* @__PURE__ */ new Map();
  for (const d of t) {
    const f = r.get(d.source), p = r.get(d.target);
    if (!f || !p)
      continue;
    if (a) {
      const { visibleNodes: m, transform: w, width: b, height: _ } = e;
      if (tm({
        sourceNode: f,
        targetNode: p,
        width: b,
        height: _,
        transform: w
      }))
        m.set(f.id, f), m.set(p.id, p);
      else
        continue;
    }
    const h = o.get(d.id);
    if (h && d === h.edge && f == h.sourceNode && p == h.targetNode) {
      u.set(d.id, h);
      continue;
    }
    const y = lm({
      id: d.id,
      sourceNode: f,
      targetNode: p,
      sourceHandle: d.sourceHandle || null,
      targetHandle: d.targetHandle || null,
      connectionMode: i,
      onError: s
    });
    y && u.set(d.id, {
      ...n,
      ...d,
      ...y,
      zIndex: em({
        selected: d.selected,
        zIndex: d.zIndex ?? n.zIndex,
        sourceNode: f,
        targetNode: p,
        elevateOnSelect: l
      }),
      sourceNode: f,
      targetNode: p,
      edge: d
    });
  }
  return u;
}
const Uc = {
  input: Kc,
  output: Zc,
  default: ga,
  group: Bc
}, Jc = {
  straight: Wc,
  smoothstep: Fc,
  default: va,
  step: Gc
};
function e0(e, t, n, r, o, i) {
  if (t && !n && r && o) {
    const s = Oo(i, {
      filter: (a) => !!((a.width || a.initialWidth) && (a.height || a.initialHeight))
    });
    return ca(s, r, o, 0.5, 2, 0.1);
  } else
    return n ?? { x: 0, y: 0, zoom: 1 };
}
function t0(e) {
  class t {
    #e = /* @__PURE__ */ E(() => e.props.id ?? "1");
    get flowId() {
      return c(this.#e);
    }
    set flowId(r) {
      Q(this.#e, r);
    }
    #t = /* @__PURE__ */ Ne(null);
    get domNode() {
      return c(this.#t);
    }
    set domNode(r) {
      Q(this.#t, r);
    }
    #n = /* @__PURE__ */ Ne(null);
    get panZoom() {
      return c(this.#n);
    }
    set panZoom(r) {
      Q(this.#n, r);
    }
    #r = /* @__PURE__ */ Ne(e.width ?? 0);
    get width() {
      return c(this.#r);
    }
    set width(r) {
      Q(this.#r, r);
    }
    #l = /* @__PURE__ */ Ne(e.height ?? 0);
    get height() {
      return c(this.#l);
    }
    set height(r) {
      Q(this.#l, r);
    }
    #a = /* @__PURE__ */ E(() => {
      const r = gm(e.nodes, this.nodeLookup, this.parentLookup, {
        nodeExtent: this.nodeExtent,
        nodeOrigin: this.nodeOrigin,
        elevateNodesOnSelect: e.props.elevateNodesOnSelect ?? !0,
        checkEquality: !0
      });
      return this.fitViewQueued && r && (this.fitViewOptions?.duration ? this.resolveFitView() : queueMicrotask(() => {
        this.resolveFitView();
      })), r;
    });
    get nodesInitialized() {
      return c(this.#a);
    }
    set nodesInitialized(r) {
      Q(this.#a, r);
    }
    #o = /* @__PURE__ */ E(() => this.panZoom !== null);
    get viewportInitialized() {
      return c(this.#o);
    }
    set viewportInitialized(r) {
      Q(this.#o, r);
    }
    #i = /* @__PURE__ */ E(() => (xm(this.connectionLookup, this.edgeLookup, e.edges), e.edges));
    get _edges() {
      return c(this.#i);
    }
    set _edges(r) {
      Q(this.#i, r);
    }
    get nodes() {
      return this.nodesInitialized, e.nodes;
    }
    set nodes(r) {
      e.nodes = r;
    }
    get edges() {
      return this._edges;
    }
    set edges(r) {
      e.edges = r;
    }
    _prevSelectedNodes = [];
    _prevSelectedNodeIds = /* @__PURE__ */ new Set();
    #s = /* @__PURE__ */ E(() => {
      const r = this._prevSelectedNodeIds.size, o = /* @__PURE__ */ new Set(), i = this.nodes.filter((s) => (s.selected && (o.add(s.id), this._prevSelectedNodeIds.delete(s.id)), s.selected));
      return (r !== o.size || this._prevSelectedNodeIds.size > 0) && (this._prevSelectedNodes = i), this._prevSelectedNodeIds = o, this._prevSelectedNodes;
    });
    get selectedNodes() {
      return c(this.#s);
    }
    set selectedNodes(r) {
      Q(this.#s, r);
    }
    _prevSelectedEdges = [];
    _prevSelectedEdgeIds = /* @__PURE__ */ new Set();
    #u = /* @__PURE__ */ E(() => {
      const r = this._prevSelectedEdgeIds.size, o = /* @__PURE__ */ new Set(), i = this.edges.filter((s) => (s.selected && (o.add(s.id), this._prevSelectedEdgeIds.delete(s.id)), s.selected));
      return (r !== o.size || this._prevSelectedEdgeIds.size > 0) && (this._prevSelectedEdges = i), this._prevSelectedEdgeIds = o, this._prevSelectedEdges;
    });
    get selectedEdges() {
      return c(this.#u);
    }
    set selectedEdges(r) {
      Q(this.#u, r);
    }
    selectionChangeHandlers = /* @__PURE__ */ new Map();
    nodeLookup = /* @__PURE__ */ new Map();
    parentLookup = /* @__PURE__ */ new Map();
    connectionLookup = /* @__PURE__ */ new Map();
    edgeLookup = /* @__PURE__ */ new Map();
    _prevVisibleEdges = /* @__PURE__ */ new Map();
    #c = /* @__PURE__ */ E(() => {
      const {
        // We need to access this._nodes to trigger on changes
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        nodes: r,
        _edges: o,
        _prevVisibleEdges: i,
        nodeLookup: s,
        connectionMode: a,
        onerror: l,
        onlyRenderVisibleElements: u,
        defaultEdgeOptions: d
      } = this;
      let f, p;
      const h = {
        edges: o,
        defaultEdgeOptions: d,
        previousEdges: i,
        nodeLookup: s,
        connectionMode: a,
        elevateEdgesOnSelect: e.props.elevateEdgesOnSelect ?? !0,
        onerror: l
      };
      if (u) {
        const { viewport: y, width: m, height: w } = this, b = [y.x, y.y, y.zoom];
        f = Qm(s, b, m, w), p = bl({
          ...h,
          onlyRenderVisible: !0,
          visibleNodes: f,
          transform: b,
          width: m,
          height: w
        });
      } else
        f = this.nodeLookup, p = bl(h);
      return { nodes: f, edges: p };
    });
    get visible() {
      return c(this.#c);
    }
    set visible(r) {
      Q(this.#c, r);
    }
    #d = /* @__PURE__ */ E(() => e.props.nodesDraggable ?? !0);
    get nodesDraggable() {
      return c(this.#d);
    }
    set nodesDraggable(r) {
      Q(this.#d, r);
    }
    #f = /* @__PURE__ */ E(() => e.props.nodesConnectable ?? !0);
    get nodesConnectable() {
      return c(this.#f);
    }
    set nodesConnectable(r) {
      Q(this.#f, r);
    }
    #h = /* @__PURE__ */ E(() => e.props.elementsSelectable ?? !0);
    get elementsSelectable() {
      return c(this.#h);
    }
    set elementsSelectable(r) {
      Q(this.#h, r);
    }
    #p = /* @__PURE__ */ E(() => e.props.nodesFocusable ?? !0);
    get nodesFocusable() {
      return c(this.#p);
    }
    set nodesFocusable(r) {
      Q(this.#p, r);
    }
    #w = /* @__PURE__ */ E(() => e.props.edgesFocusable ?? !0);
    get edgesFocusable() {
      return c(this.#w);
    }
    set edgesFocusable(r) {
      Q(this.#w, r);
    }
    #b = /* @__PURE__ */ E(() => e.props.disableKeyboardA11y ?? !1);
    get disableKeyboardA11y() {
      return c(this.#b);
    }
    set disableKeyboardA11y(r) {
      Q(this.#b, r);
    }
    #x = /* @__PURE__ */ E(() => e.props.minZoom ?? 0.5);
    get minZoom() {
      return c(this.#x);
    }
    set minZoom(r) {
      Q(this.#x, r);
    }
    #m = /* @__PURE__ */ E(() => e.props.maxZoom ?? 2);
    get maxZoom() {
      return c(this.#m);
    }
    set maxZoom(r) {
      Q(this.#m, r);
    }
    #g = /* @__PURE__ */ E(() => e.props.nodeOrigin ?? [0, 0]);
    get nodeOrigin() {
      return c(this.#g);
    }
    set nodeOrigin(r) {
      Q(this.#g, r);
    }
    #v = /* @__PURE__ */ E(() => e.props.nodeExtent ?? Ns);
    get nodeExtent() {
      return c(this.#v);
    }
    set nodeExtent(r) {
      Q(this.#v, r);
    }
    #y = /* @__PURE__ */ E(() => e.props.translateExtent ?? Ns);
    get translateExtent() {
      return c(this.#y);
    }
    set translateExtent(r) {
      Q(this.#y, r);
    }
    #k = /* @__PURE__ */ E(() => e.props.defaultEdgeOptions ?? {});
    get defaultEdgeOptions() {
      return c(this.#k);
    }
    set defaultEdgeOptions(r) {
      Q(this.#k, r);
    }
    #_ = /* @__PURE__ */ E(() => e.props.nodeDragThreshold ?? 1);
    get nodeDragThreshold() {
      return c(this.#_);
    }
    set nodeDragThreshold(r) {
      Q(this.#_, r);
    }
    #$ = /* @__PURE__ */ E(() => e.props.autoPanOnNodeDrag ?? !0);
    get autoPanOnNodeDrag() {
      return c(this.#$);
    }
    set autoPanOnNodeDrag(r) {
      Q(this.#$, r);
    }
    #C = /* @__PURE__ */ E(() => e.props.autoPanOnConnect ?? !0);
    get autoPanOnConnect() {
      return c(this.#C);
    }
    set autoPanOnConnect(r) {
      Q(this.#C, r);
    }
    #S = /* @__PURE__ */ E(() => e.props.autoPanOnNodeFocus ?? !0);
    get autoPanOnNodeFocus() {
      return c(this.#S);
    }
    set autoPanOnNodeFocus(r) {
      Q(this.#S, r);
    }
    #E = /* @__PURE__ */ E(() => e.props.autoPanSpeed ?? 15);
    get autoPanSpeed() {
      return c(this.#E);
    }
    set autoPanSpeed(r) {
      Q(this.#E, r);
    }
    #P = /* @__PURE__ */ E(() => e.props.connectionDragThreshold ?? 1);
    get connectionDragThreshold() {
      return c(this.#P);
    }
    set connectionDragThreshold(r) {
      Q(this.#P, r);
    }
    fitViewQueued = e.props.fitView ?? !1;
    fitViewOptions = e.props.fitViewOptions;
    fitViewResolver = null;
    #N = /* @__PURE__ */ E(() => e.props.snapGrid ?? null);
    get snapGrid() {
      return c(this.#N);
    }
    set snapGrid(r) {
      Q(this.#N, r);
    }
    #D = /* @__PURE__ */ Ne(!1);
    get dragging() {
      return c(this.#D);
    }
    set dragging(r) {
      Q(this.#D, r);
    }
    #H = /* @__PURE__ */ Ne(null);
    get selectionRect() {
      return c(this.#H);
    }
    set selectionRect(r) {
      Q(this.#H, r);
    }
    #O = /* @__PURE__ */ Ne(!1);
    get selectionKeyPressed() {
      return c(this.#O);
    }
    set selectionKeyPressed(r) {
      Q(this.#O, r);
    }
    #M = /* @__PURE__ */ Ne(!1);
    get multiselectionKeyPressed() {
      return c(this.#M);
    }
    set multiselectionKeyPressed(r) {
      Q(this.#M, r);
    }
    #A = /* @__PURE__ */ Ne(!1);
    get deleteKeyPressed() {
      return c(this.#A);
    }
    set deleteKeyPressed(r) {
      Q(this.#A, r);
    }
    #T = /* @__PURE__ */ Ne(!1);
    get panActivationKeyPressed() {
      return c(this.#T);
    }
    set panActivationKeyPressed(r) {
      Q(this.#T, r);
    }
    #z = /* @__PURE__ */ Ne(!1);
    get zoomActivationKeyPressed() {
      return c(this.#z);
    }
    set zoomActivationKeyPressed(r) {
      Q(this.#z, r);
    }
    #V = /* @__PURE__ */ Ne(null);
    get selectionRectMode() {
      return c(this.#V);
    }
    set selectionRectMode(r) {
      Q(this.#V, r);
    }
    #L = /* @__PURE__ */ Ne("");
    get ariaLiveMessage() {
      return c(this.#L);
    }
    set ariaLiveMessage(r) {
      Q(this.#L, r);
    }
    #I = /* @__PURE__ */ E(() => e.props.selectionMode ?? yi.Partial);
    get selectionMode() {
      return c(this.#I);
    }
    set selectionMode(r) {
      Q(this.#I, r);
    }
    #j = /* @__PURE__ */ E(() => ({ ...Uc, ...e.props.nodeTypes }));
    get nodeTypes() {
      return c(this.#j);
    }
    set nodeTypes(r) {
      Q(this.#j, r);
    }
    #R = /* @__PURE__ */ E(() => ({ ...Jc, ...e.props.edgeTypes }));
    get edgeTypes() {
      return c(this.#R);
    }
    set edgeTypes(r) {
      Q(this.#R, r);
    }
    #K = /* @__PURE__ */ E(() => e.props.noPanClass ?? "nopan");
    get noPanClass() {
      return c(this.#K);
    }
    set noPanClass(r) {
      Q(this.#K, r);
    }
    #Z = /* @__PURE__ */ E(() => e.props.noDragClass ?? "nodrag");
    get noDragClass() {
      return c(this.#Z);
    }
    set noDragClass(r) {
      Q(this.#Z, r);
    }
    #B = /* @__PURE__ */ E(() => e.props.noWheelClass ?? "nowheel");
    get noWheelClass() {
      return c(this.#B);
    }
    set noWheelClass(r) {
      Q(this.#B, r);
    }
    #Y = /* @__PURE__ */ E(() => U1(e.props.ariaLabelConfig));
    get ariaLabelConfig() {
      return c(this.#Y);
    }
    set ariaLabelConfig(r) {
      Q(this.#Y, r);
    }
    #q = /* @__PURE__ */ Ne(e0(this.nodesInitialized, e.props.fitView, e.props.initialViewport, this.width, this.height, this.nodeLookup));
    get _viewport() {
      return c(this.#q);
    }
    set _viewport(r) {
      Q(this.#q, r);
    }
    get viewport() {
      return e.viewport ?? this._viewport;
    }
    set viewport(r) {
      e.viewport && (e.viewport = r), this._viewport = r;
    }
    #X = /* @__PURE__ */ Ne(
      // _connection is viewport independent and originating from XYHandle
      Ds
    );
    get _connection() {
      return c(this.#X);
    }
    set _connection(r) {
      Q(this.#X, r);
    }
    #F = /* @__PURE__ */ E(() => this._connection.inProgress ? {
      ...this._connection,
      to: Ao(this._connection.to, [this.viewport.x, this.viewport.y, this.viewport.zoom])
    } : this._connection);
    get connection() {
      return c(this.#F);
    }
    set connection(r) {
      Q(this.#F, r);
    }
    #W = /* @__PURE__ */ E(() => e.props.connectionMode ?? Rr.Strict);
    get connectionMode() {
      return c(this.#W);
    }
    set connectionMode(r) {
      Q(this.#W, r);
    }
    #G = /* @__PURE__ */ E(() => e.props.connectionRadius ?? 20);
    get connectionRadius() {
      return c(this.#G);
    }
    set connectionRadius(r) {
      Q(this.#G, r);
    }
    #U = /* @__PURE__ */ E(() => e.props.isValidConnection ?? (() => !0));
    get isValidConnection() {
      return c(this.#U);
    }
    set isValidConnection(r) {
      Q(this.#U, r);
    }
    #J = /* @__PURE__ */ E(() => e.props.selectNodesOnDrag ?? !0);
    get selectNodesOnDrag() {
      return c(this.#J);
    }
    set selectNodesOnDrag(r) {
      Q(this.#J, r);
    }
    #Q = /* @__PURE__ */ E(() => e.props.defaultMarkerColor === void 0 ? "#b1b1b7" : e.props.defaultMarkerColor);
    get defaultMarkerColor() {
      return c(this.#Q);
    }
    set defaultMarkerColor(r) {
      Q(this.#Q, r);
    }
    #ee = /* @__PURE__ */ E(() => um(e.edges, {
      defaultColor: this.defaultMarkerColor,
      id: this.flowId,
      defaultMarkerStart: this.defaultEdgeOptions.markerStart,
      defaultMarkerEnd: this.defaultEdgeOptions.markerEnd
    }));
    get markers() {
      return c(this.#ee);
    }
    set markers(r) {
      Q(this.#ee, r);
    }
    #te = /* @__PURE__ */ E(() => e.props.onlyRenderVisibleElements ?? !1);
    get onlyRenderVisibleElements() {
      return c(this.#te);
    }
    set onlyRenderVisibleElements(r) {
      Q(this.#te, r);
    }
    #ne = /* @__PURE__ */ E(() => e.props.onflowerror ?? X1);
    get onerror() {
      return c(this.#ne);
    }
    set onerror(r) {
      Q(this.#ne, r);
    }
    #re = /* @__PURE__ */ E(() => e.props.ondelete);
    get ondelete() {
      return c(this.#re);
    }
    set ondelete(r) {
      Q(this.#re, r);
    }
    #oe = /* @__PURE__ */ E(() => e.props.onbeforedelete);
    get onbeforedelete() {
      return c(this.#oe);
    }
    set onbeforedelete(r) {
      Q(this.#oe, r);
    }
    #ie = /* @__PURE__ */ E(() => e.props.onbeforeconnect);
    get onbeforeconnect() {
      return c(this.#ie);
    }
    set onbeforeconnect(r) {
      Q(this.#ie, r);
    }
    #se = /* @__PURE__ */ E(() => e.props.onconnect);
    get onconnect() {
      return c(this.#se);
    }
    set onconnect(r) {
      Q(this.#se, r);
    }
    #ae = /* @__PURE__ */ E(() => e.props.onconnectstart);
    get onconnectstart() {
      return c(this.#ae);
    }
    set onconnectstart(r) {
      Q(this.#ae, r);
    }
    #le = /* @__PURE__ */ E(() => e.props.onconnectend);
    get onconnectend() {
      return c(this.#le);
    }
    set onconnectend(r) {
      Q(this.#le, r);
    }
    #ue = /* @__PURE__ */ E(() => e.props.onbeforereconnect);
    get onbeforereconnect() {
      return c(this.#ue);
    }
    set onbeforereconnect(r) {
      Q(this.#ue, r);
    }
    #ce = /* @__PURE__ */ E(() => e.props.onreconnect);
    get onreconnect() {
      return c(this.#ce);
    }
    set onreconnect(r) {
      Q(this.#ce, r);
    }
    #de = /* @__PURE__ */ E(() => e.props.onreconnectstart);
    get onreconnectstart() {
      return c(this.#de);
    }
    set onreconnectstart(r) {
      Q(this.#de, r);
    }
    #fe = /* @__PURE__ */ E(() => e.props.onreconnectend);
    get onreconnectend() {
      return c(this.#fe);
    }
    set onreconnectend(r) {
      Q(this.#fe, r);
    }
    #pe = /* @__PURE__ */ E(() => e.props.clickConnect ?? !0);
    get clickConnect() {
      return c(this.#pe);
    }
    set clickConnect(r) {
      Q(this.#pe, r);
    }
    #he = /* @__PURE__ */ E(() => e.props.onclickconnectstart);
    get onclickconnectstart() {
      return c(this.#he);
    }
    set onclickconnectstart(r) {
      Q(this.#he, r);
    }
    #ge = /* @__PURE__ */ E(() => e.props.onclickconnectend);
    get onclickconnectend() {
      return c(this.#ge);
    }
    set onclickconnectend(r) {
      Q(this.#ge, r);
    }
    #ve = /* @__PURE__ */ Ne(null);
    get clickConnectStartHandle() {
      return c(this.#ve);
    }
    set clickConnectStartHandle(r) {
      Q(this.#ve, r);
    }
    #me = /* @__PURE__ */ E(() => e.props.onselectiondrag);
    get onselectiondrag() {
      return c(this.#me);
    }
    set onselectiondrag(r) {
      Q(this.#me, r);
    }
    #ye = /* @__PURE__ */ E(() => e.props.onselectiondragstart);
    get onselectiondragstart() {
      return c(this.#ye);
    }
    set onselectiondragstart(r) {
      Q(this.#ye, r);
    }
    #we = /* @__PURE__ */ E(() => e.props.onselectiondragstop);
    get onselectiondragstop() {
      return c(this.#we);
    }
    set onselectiondragstop(r) {
      Q(this.#we, r);
    }
    resolveFitView = async () => {
      this.panZoom && (await Y1(
        {
          nodes: this.nodeLookup,
          width: this.width,
          height: this.height,
          panZoom: this.panZoom,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom
        },
        this.fitViewOptions
      ), this.fitViewResolver?.resolve(!0), this.fitViewQueued = !1, this.fitViewOptions = void 0, this.fitViewResolver = null);
    };
    _prefersDark = new Jm("(prefers-color-scheme: dark)", e.props.colorModeSSR === "dark");
    #be = /* @__PURE__ */ E(() => e.props.colorMode === "system" ? this._prefersDark.current ? "dark" : "light" : e.props.colorMode ?? "light");
    get colorMode() {
      return c(this.#be);
    }
    set colorMode(r) {
      Q(this.#be, r);
    }
    constructor() {
    }
    resetStoreValues() {
      this.dragging = !1, this.selectionRect = null, this.selectionRectMode = null, this.selectionKeyPressed = !1, this.multiselectionKeyPressed = !1, this.deleteKeyPressed = !1, this.panActivationKeyPressed = !1, this.zoomActivationKeyPressed = !1, this._connection = Ds, this.clickConnectStartHandle = null, this.viewport = e.props.initialViewport ?? { x: 0, y: 0, zoom: 1 }, this.ariaLiveMessage = "";
    }
  }
  return new t();
}
function ln() {
  const e = Un(ki);
  if (!e)
    throw new Error("To call useStore outside of <SvelteFlow /> you need to wrap your component in a <SvelteFlowProvider />");
  return e.getStore();
}
const ki = Symbol();
function Qc(e) {
  const t = t0(e);
  function n(I) {
    t.nodeTypes = {
      ...Uc,
      ...I
    };
  }
  function r(I) {
    t.edgeTypes = {
      ...Jc,
      ...I
    };
  }
  function o(I) {
    t.edges = om(I, t.edges);
  }
  const i = (I, T = !1) => {
    t.nodes = t.nodes.map((N) => {
      const H = I.get(N.id);
      return H ? { ...N, position: H.position, dragging: T } : N;
    });
  };
  function s(I) {
    const { changes: T, updatedInternals: N } = wm(I, t.nodeLookup, t.parentLookup, t.domNode, t.nodeOrigin);
    if (!N)
      return;
    pm(t.nodeLookup, t.parentLookup, {
      nodeOrigin: t.nodeOrigin,
      nodeExtent: t.nodeExtent
    }), t.fitViewQueued && t.resolveFitView();
    const H = /* @__PURE__ */ new Map();
    for (const k of T) {
      const P = t.nodeLookup.get(k.id)?.internals.userNode;
      if (!P)
        continue;
      const O = { ...P };
      switch (k.type) {
        case "dimensions": {
          const B = { ...O.measured, ...k.dimensions };
          k.setAttributes && (O.width = k.dimensions?.width ?? O.width, O.height = k.dimensions?.height ?? O.height), O.measured = B;
          break;
        }
        case "position":
          O.position = k.position ?? O.position;
          break;
      }
      H.set(k.id, O);
    }
    t.nodes = t.nodes.map((k) => H.get(k.id) ?? k);
  }
  function a(I) {
    const T = t.fitViewResolver ?? Promise.withResolvers();
    return t.fitViewQueued = !0, t.fitViewOptions = I, t.fitViewResolver = T, t.nodes = [...t.nodes], T.promise;
  }
  async function l(I, T, N) {
    const H = typeof N?.zoom < "u" ? N.zoom : t.maxZoom, k = t.panZoom;
    return k ? (await k.setViewport({
      x: t.width / 2 - I * H,
      y: t.height / 2 - T * H,
      zoom: H
    }, { duration: N?.duration, ease: N?.ease, interpolate: N?.interpolate }), Promise.resolve(!0)) : Promise.resolve(!1);
  }
  function u(I, T) {
    const N = t.panZoom;
    return N ? N.scaleBy(I, T) : Promise.resolve(!1);
  }
  function d(I) {
    return u(1.2, I);
  }
  function f(I) {
    return u(1 / 1.2, I);
  }
  function p(I) {
    const T = t.panZoom;
    T && (T.setScaleExtent([I, t.maxZoom]), t.minZoom = I);
  }
  function h(I) {
    const T = t.panZoom;
    T && (T.setScaleExtent([t.minZoom, I]), t.maxZoom = I);
  }
  function y(I) {
    const T = t.panZoom;
    T && (T.setTranslateExtent(I), t.translateExtent = I);
  }
  function m(I, T = null) {
    let N = !1;
    const H = I.map((k) => (!T || T.has(k.id)) && k.selected ? (N = !0, { ...k, selected: !1 }) : k);
    return [N, H];
  }
  function w(I) {
    const T = I?.nodes ? new Set(I.nodes.map((B) => B.id)) : null, [N, H] = m(t.nodes, T);
    N && (t.nodes = H);
    const k = I?.edges ? new Set(I.edges.map((B) => B.id)) : null, [P, O] = m(t.edges, k);
    P && (t.edges = O);
  }
  function b(I) {
    const T = t.multiselectionKeyPressed;
    t.nodes = t.nodes.map((N) => {
      const H = I.includes(N.id), k = T && N.selected || H;
      return !!N.selected !== k ? { ...N, selected: k } : N;
    }), T || w({ nodes: [] });
  }
  function _(I) {
    const T = t.multiselectionKeyPressed;
    t.edges = t.edges.map((N) => {
      const H = I.includes(N.id), k = T && N.selected || H;
      return !!N.selected !== k ? { ...N, selected: k } : N;
    }), T || w({ edges: [] });
  }
  function $(I, T, N) {
    const H = t.nodeLookup.get(I);
    if (!H) {
      console.warn("012", go.error012(I));
      return;
    }
    t.selectionRect = null, t.selectionRectMode = null, H.selected ? (T || H.selected && t.multiselectionKeyPressed) && (w({ nodes: [H], edges: [] }), requestAnimationFrame(() => N?.blur())) : b([I]);
  }
  function x(I) {
    const T = t.edgeLookup.get(I);
    if (!T) {
      console.warn("012", go.error012(I));
      return;
    }
    (T.selectable || t.elementsSelectable && typeof T.selectable > "u") && (t.selectionRect = null, t.selectionRectMode = null, T.selected ? T.selected && t.multiselectionKeyPressed && w({ nodes: [], edges: [T] }) : _([I]));
  }
  function C(I, T) {
    const { nodeExtent: N, snapGrid: H, nodeOrigin: k, nodeLookup: P, nodesDraggable: O, onerror: B } = t, V = /* @__PURE__ */ new Map(), F = H?.[0] ?? 5, K = H?.[1] ?? 5, G = I.x * F * T, ne = I.y * K * T;
    for (const q of P.values()) {
      if (!(q.selected && (q.draggable || O && typeof q.draggable > "u")))
        continue;
      let z = {
        x: q.internals.positionAbsolute.x + G,
        y: q.internals.positionAbsolute.y + ne
      };
      H && (z = Mo(z, H));
      const { position: Y, positionAbsolute: W } = xc({
        nodeId: q.id,
        nextPosition: z,
        nodeLookup: P,
        nodeExtent: N,
        nodeOrigin: k,
        onError: B
      });
      q.position = Y, q.internals.positionAbsolute = W, V.set(q.id, q);
    }
    i(V);
  }
  function S(I) {
    return bm({
      delta: I,
      panZoom: t.panZoom,
      transform: [t.viewport.x, t.viewport.y, t.viewport.zoom],
      translateExtent: t.translateExtent,
      width: t.width,
      height: t.height
    });
  }
  const M = (I) => {
    t._connection = { ...I };
  };
  function j() {
    t._connection = Ds;
  }
  function L() {
    t.resetStoreValues(), w();
  }
  return Object.assign(t, {
    setNodeTypes: n,
    setEdgeTypes: r,
    addEdge: o,
    updateNodePositions: i,
    updateNodeInternals: s,
    zoomIn: d,
    zoomOut: f,
    fitView: a,
    setCenter: l,
    setMinZoom: p,
    setMaxZoom: h,
    setTranslateExtent: y,
    unselectNodesAndEdges: w,
    addSelectedNodes: b,
    addSelectedEdges: _,
    handleNodeSelection: $,
    handleEdgeSelection: x,
    moveSelectedNodes: C,
    panBy: S,
    updateConnection: M,
    cancelConnection: j,
    reset: L
  });
}
function n0(e, t) {
  const { minZoom: n, maxZoom: r, initialViewport: o, onPanZoomStart: i, onPanZoom: s, onPanZoomEnd: a, translateExtent: l, setPanZoomInstance: u, onDraggingChange: d, onTransformChange: f } = t, p = Im({
    domNode: e,
    minZoom: n,
    maxZoom: r,
    translateExtent: l,
    viewport: o,
    onPanZoom: s,
    onPanZoomStart: i,
    onPanZoomEnd: a,
    onDraggingChange: d
  }), h = p.getViewport();
  return (o.x !== h.x || o.y !== h.y || o.zoom !== h.zoom) && f([h.x, h.y, h.zoom]), u(p), p.update(t), {
    update(y) {
      p.update(y);
    }
  };
}
var r0 = /* @__PURE__ */ J('<div class="svelte-flow__zoom svelte-flow__container"><!></div>');
function ed(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "panOnScrollMode", 7), o = v(t, "preventScrolling", 7), i = v(t, "zoomOnScroll", 7), s = v(t, "zoomOnDoubleClick", 7), a = v(t, "zoomOnPinch", 7), l = v(t, "panOnDrag", 7), u = v(t, "panOnScroll", 7), d = v(t, "panOnScrollSpeed", 7), f = v(t, "paneClickDistance", 7), p = v(t, "selectionOnDrag", 7), h = v(t, "onmovestart", 7), y = v(t, "onmove", 7), m = v(t, "onmoveend", 7), w = v(t, "oninit", 7), b = v(t, "children", 7), _ = /* @__PURE__ */ E(() => n().panActivationKeyPressed || l()), $ = /* @__PURE__ */ E(() => n().panActivationKeyPressed || u());
  const { viewport: x } = n();
  let C = !1;
  Je(() => {
    !C && n().viewportInitialized && (w()?.(), C = !0);
  });
  var S = {
    get store() {
      return n();
    },
    set store(L) {
      n(L), g();
    },
    get panOnScrollMode() {
      return r();
    },
    set panOnScrollMode(L) {
      r(L), g();
    },
    get preventScrolling() {
      return o();
    },
    set preventScrolling(L) {
      o(L), g();
    },
    get zoomOnScroll() {
      return i();
    },
    set zoomOnScroll(L) {
      i(L), g();
    },
    get zoomOnDoubleClick() {
      return s();
    },
    set zoomOnDoubleClick(L) {
      s(L), g();
    },
    get zoomOnPinch() {
      return a();
    },
    set zoomOnPinch(L) {
      a(L), g();
    },
    get panOnDrag() {
      return l();
    },
    set panOnDrag(L) {
      l(L), g();
    },
    get panOnScroll() {
      return u();
    },
    set panOnScroll(L) {
      u(L), g();
    },
    get panOnScrollSpeed() {
      return d();
    },
    set panOnScrollSpeed(L) {
      d(L), g();
    },
    get paneClickDistance() {
      return f();
    },
    set paneClickDistance(L) {
      f(L), g();
    },
    get selectionOnDrag() {
      return p();
    },
    set selectionOnDrag(L) {
      p(L), g();
    },
    get onmovestart() {
      return h();
    },
    set onmovestart(L) {
      h(L), g();
    },
    get onmove() {
      return y();
    },
    set onmove(L) {
      y(L), g();
    },
    get onmoveend() {
      return m();
    },
    set onmoveend(L) {
      m(L), g();
    },
    get oninit() {
      return w();
    },
    set oninit(L) {
      w(L), g();
    },
    get children() {
      return b();
    },
    set children(L) {
      b(L), g();
    }
  }, M = r0(), j = Z(M);
  return tt(j, b), R(M), mt(M, (L, I) => n0?.(L, I), () => ({
    viewport: n().viewport,
    minZoom: n().minZoom,
    maxZoom: n().maxZoom,
    initialViewport: x,
    onDraggingChange: (L) => {
      n(n().dragging = L, !0);
    },
    setPanZoomInstance: (L) => {
      n(n().panZoom = L, !0);
    },
    onPanZoomStart: h(),
    onPanZoom: y(),
    onPanZoomEnd: m(),
    zoomOnScroll: i(),
    zoomOnDoubleClick: s(),
    zoomOnPinch: a(),
    panOnScroll: c($),
    panOnDrag: c(_),
    panOnScrollSpeed: d(),
    panOnScrollMode: r(),
    zoomActivationKeyPressed: n().zoomActivationKeyPressed,
    preventScrolling: typeof o() == "boolean" ? o() : !0,
    noPanClassName: n().noPanClass,
    noWheelClassName: n().noWheelClass,
    userSelectionActive: !!n().selectionRect,
    translateExtent: n().translateExtent,
    lib: "svelte",
    paneClickDistance: f(),
    selectionOnDrag: p(),
    onTransformChange: (L) => {
      n(n().viewport = { x: L[0], y: L[1], zoom: L[2] }, !0);
    },
    connectionInProgress: n().connection.inProgress
  })), D(e, M), fe(S);
}
le(
  ed,
  {
    store: {},
    panOnScrollMode: {},
    preventScrolling: {},
    zoomOnScroll: {},
    zoomOnDoubleClick: {},
    zoomOnPinch: {},
    panOnDrag: {},
    panOnScroll: {},
    panOnScrollSpeed: {},
    paneClickDistance: {},
    selectionOnDrag: {},
    onmovestart: {},
    onmove: {},
    onmoveend: {},
    oninit: {},
    children: {}
  },
  [],
  [],
  !0
);
function xl(e, t) {
  return (n) => {
    n.target === t && e?.(n);
  };
}
function kl(e) {
  return (t) => {
    const n = e.has(t.id);
    return !!t.selected !== n ? { ...t, selected: n } : t;
  };
}
function _l(e, t) {
  if (e.size !== t.size)
    return !1;
  for (const n of e)
    if (!t.has(n))
      return !1;
  return !0;
}
var o0 = /* @__PURE__ */ J("<div><!></div>");
function td(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "panOnDrag", 7, !0), o = v(t, "paneClickDistance", 7, 1), i = v(t, "selectionOnDrag", 7), s = v(t, "onpaneclick", 7), a = v(t, "onpanecontextmenu", 7), l = v(t, "onselectionstart", 7), u = v(t, "onselectionend", 7), d = v(t, "children", 7), f, p = null, h = /* @__PURE__ */ new Set(), y = /* @__PURE__ */ new Set(), m = /* @__PURE__ */ E(() => n().panActivationKeyPressed || r()), w = /* @__PURE__ */ E(() => n().selectionKeyPressed || !!n().selectionRect || i() && c(m) !== !0), b = /* @__PURE__ */ E(() => n().elementsSelectable && (c(w) || n().selectionRectMode === "user")), _ = !1;
  function $(P) {
    if (p = f?.getBoundingClientRect(), !p) return;
    const O = P.target === f, B = !O && !!P.target.closest(".nokey"), V = i() && O || n().selectionKeyPressed;
    if (B || !c(w) || !V || P.button !== 0 || !P.isPrimary)
      return;
    P.target?.setPointerCapture?.(P.pointerId), _ = !1;
    const { x: F, y: K } = tn(P, p);
    n(n().selectionRect = { width: 0, height: 0, startX: F, startY: K, x: F, y: K }, !0), O || (P.stopPropagation(), P.preventDefault());
  }
  function x(P) {
    if (!c(w) || !p || !n().selectionRect)
      return;
    const O = tn(P, p), { startX: B = 0, startY: V = 0 } = n().selectionRect;
    if (!_) {
      const q = n().selectionKeyPressed ? 0 : o();
      if (Math.hypot(O.x - B, O.y - V) <= q)
        return;
      n().unselectNodesAndEdges(), l()?.(P);
    }
    _ = !0;
    const F = {
      ...n().selectionRect,
      x: O.x < B ? O.x : B,
      y: O.y < V ? O.y : V,
      width: Math.abs(O.x - B),
      height: Math.abs(O.y - V)
    }, K = h, G = y;
    h = new Set(ua(
      n().nodeLookup,
      F,
      [
        n().viewport.x,
        n().viewport.y,
        n().viewport.zoom
      ],
      n().selectionMode === yi.Partial,
      !0
    ).map((q) => q.id));
    const ne = n().defaultEdgeOptions.selectable ?? !0;
    y = /* @__PURE__ */ new Set();
    for (const q of h) {
      const z = n().connectionLookup.get(q);
      if (z)
        for (const { edgeId: Y } of z.values()) {
          const W = n().edgeLookup.get(Y);
          W && (W.selectable ?? ne) && y.add(Y);
        }
    }
    _l(K, h) || n(n().nodes = n().nodes.map(kl(h)), !0), _l(G, y) || n(n().edges = n().edges.map(kl(y)), !0), n(n().selectionRectMode = "user", !0), n(n().selectionRect = F, !0);
  }
  function C(P) {
    P.button === 0 && (P.target?.releasePointerCapture?.(P.pointerId), !_ && P.target === f && j?.(P), n(n().selectionRect = null, !0), _ && n(n().selectionRectMode = h.size > 0 ? "nodes" : null, !0), _ && u()?.(P));
  }
  const S = (P) => {
    if (Array.isArray(c(m)) && c(m).includes(2)) {
      P.preventDefault();
      return;
    }
    a()?.({ event: P });
  }, M = (P) => {
    _ && (P.stopPropagation(), _ = !1);
  };
  function j(P) {
    if (_ || n().connection.inProgress) {
      _ = !1;
      return;
    }
    s()?.({ event: P }), n().unselectNodesAndEdges(), n(n().selectionRectMode = null, !0), n(n().selectionRect = null, !0);
  }
  var L = {
    get store() {
      return n();
    },
    set store(P) {
      n(P), g();
    },
    get panOnDrag() {
      return r();
    },
    set panOnDrag(P = !0) {
      r(P), g();
    },
    get paneClickDistance() {
      return o();
    },
    set paneClickDistance(P = 1) {
      o(P), g();
    },
    get selectionOnDrag() {
      return i();
    },
    set selectionOnDrag(P) {
      i(P), g();
    },
    get onpaneclick() {
      return s();
    },
    set onpaneclick(P) {
      s(P), g();
    },
    get onpanecontextmenu() {
      return a();
    },
    set onpanecontextmenu(P) {
      a(P), g();
    },
    get onselectionstart() {
      return l();
    },
    set onselectionstart(P) {
      l(P), g();
    },
    get onselectionend() {
      return u();
    },
    set onselectionend(P) {
      u(P), g();
    },
    get children() {
      return d();
    },
    set children(P) {
      d(P), g();
    }
  }, I = o0();
  let T;
  var N = /* @__PURE__ */ E(() => c(b) ? void 0 : xl(j, f));
  I.__click = function(...P) {
    c(N)?.apply(this, P);
  }, I.__pointermove = function(...P) {
    (c(b) ? x : void 0)?.apply(this, P);
  }, I.__pointerup = function(...P) {
    (c(b) ? C : void 0)?.apply(this, P);
  };
  var H = /* @__PURE__ */ E(() => xl(S, f));
  I.__contextmenu = function(...P) {
    c(H)?.apply(this, P);
  };
  var k = Z(I);
  return tt(k, d), R(I), At(I, (P) => f = P, () => f), xe((P) => T = ft(I, 1, "svelte-flow__pane svelte-flow__container", null, T, P), [
    () => ({
      draggable: r() === !0 || Array.isArray(r()) && r().includes(0),
      dragging: n().dragging,
      selection: c(w)
    })
  ]), Lr(
    "pointerdown",
    I,
    function(...P) {
      (c(b) ? $ : void 0)?.apply(this, P);
    },
    !0
  ), Lr(
    "click",
    I,
    function(...P) {
      (c(b) ? M : void 0)?.apply(this, P);
    },
    !0
  ), D(e, I), fe(L);
}
rr(["click", "pointermove", "pointerup", "contextmenu"]);
le(
  td,
  {
    store: {},
    panOnDrag: {},
    paneClickDistance: {},
    selectionOnDrag: {},
    onpaneclick: {},
    onpanecontextmenu: {},
    onselectionstart: {},
    onselectionend: {},
    children: {}
  },
  [],
  [],
  !0
);
var i0 = /* @__PURE__ */ J('<div class="svelte-flow__viewport xyflow__viewport svelte-flow__container"><!></div>');
function nd(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "children", 7);
  var o = {
    get store() {
      return n();
    },
    set store(l) {
      n(l), g();
    },
    get children() {
      return r();
    },
    set children(l) {
      r(l), g();
    }
  }, i = i0();
  let s;
  var a = Z(i);
  return tt(a, r), R(i), xe(() => s = gt(i, "", s, {
    transform: `translate(${n().viewport.x ?? ""}px, ${n().viewport.y ?? ""}px) scale(${n().viewport.zoom ?? ""})`
  })), D(e, i), fe(o);
}
le(nd, { store: {}, children: {} }, [], [], !0);
function rd(e, t) {
  const { store: n, onDrag: r, onDragStart: o, onDragStop: i, onNodeMouseDown: s } = t, a = Cm({
    onDrag: r,
    onDragStart: o,
    onDragStop: i,
    onNodeMouseDown: s,
    getStoreItems: () => {
      const { snapGrid: u, viewport: d } = n;
      return {
        nodes: n.nodes,
        nodeLookup: n.nodeLookup,
        edges: n.edges,
        nodeExtent: n.nodeExtent,
        snapGrid: u || [0, 0],
        snapToGrid: !!u,
        nodeOrigin: n.nodeOrigin,
        multiSelectionActive: n.multiselectionKeyPressed,
        domNode: n.domNode,
        transform: [d.x, d.y, d.zoom],
        autoPanOnNodeDrag: n.autoPanOnNodeDrag,
        nodesDraggable: n.nodesDraggable,
        selectNodesOnDrag: n.selectNodesOnDrag,
        nodeDragThreshold: n.nodeDragThreshold,
        unselectNodesAndEdges: n.unselectNodesAndEdges,
        updateNodePositions: n.updateNodePositions,
        onSelectionDrag: n.onselectiondrag,
        onSelectionDragStart: n.onselectiondragstart,
        onSelectionDragStop: n.onselectiondragstop,
        panBy: n.panBy
      };
    }
  });
  function l(u, d) {
    if (d.disabled) {
      a.destroy();
      return;
    }
    a.update({
      domNode: u,
      noDragClassName: d.noDragClass,
      handleSelector: d.handleSelector,
      nodeId: d.nodeId,
      isSelectable: d.isSelectable,
      nodeClickDistance: d.nodeClickDistance
    });
  }
  return l(e, t), {
    update(u) {
      l(e, u);
    },
    destroy() {
      a.destroy();
    }
  };
}
var s0 = /* @__PURE__ */ J('<div aria-live="assertive" aria-atomic="true" class="a11y-live-msg svelte-aqgibg"> </div>'), a0 = /* @__PURE__ */ J('<div class="a11y-hidden svelte-aqgibg"> </div> <div class="a11y-hidden svelte-aqgibg"> </div> <!>', 1);
const l0 = {
  hash: "svelte-aqgibg",
  code: ".a11y-hidden.svelte-aqgibg {display:none;}.a11y-live-msg.svelte-aqgibg {position:absolute;width:1px;height:1px;margin:-1px;border:0;padding:0;overflow:hidden;clip:rect(0px, 0px, 0px, 0px);clip-path:inset(100%);}"
};
function od(e, t) {
  de(t, !0), Ke(e, l0);
  let n = v(t, "store", 7);
  var r = {
    get store() {
      return n();
    },
    set store(f) {
      n(f), g();
    }
  }, o = a0(), i = re(o), s = Z(i, !0);
  R(i);
  var a = A(i, 2), l = Z(a, !0);
  R(a);
  var u = A(a, 2);
  {
    var d = (f) => {
      var p = s0(), h = Z(p, !0);
      R(p), xe(() => {
        _e(p, "id", `${u0}-${n().flowId}`), Re(h, n().ariaLiveMessage);
      }), D(f, p);
    };
    oe(u, (f) => {
      n().disableKeyboardA11y || f(d);
    });
  }
  return xe(() => {
    _e(i, "id", `${id}-${n().flowId}`), Re(s, n().disableKeyboardA11y ? n().ariaLabelConfig["node.a11yDescription.default"] : n().ariaLabelConfig["node.a11yDescription.keyboardDisabled"]), _e(a, "id", `${sd}-${n().flowId}`), Re(l, n().ariaLabelConfig["edge.a11yDescription.default"]);
  }), D(e, o), fe(r);
}
le(od, { store: {} }, [], [], !0);
const id = "svelte-flow__node-desc", sd = "svelte-flow__edge-desc", u0 = "svelte-flow__aria-live";
var c0 = /* @__PURE__ */ J("<div><!></div>");
function ad(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "node", 7), o = v(t, "resizeObserver", 7), i = v(t, "nodeClickDistance", 7), s = v(t, "onnodeclick", 7), a = v(t, "onnodedrag", 7), l = v(t, "onnodedragstart", 7), u = v(t, "onnodedragstop", 7), d = v(t, "onnodepointerenter", 7), f = v(t, "onnodepointerleave", 7), p = v(t, "onnodepointermove", 7), h = v(t, "onnodecontextmenu", 7), y = /* @__PURE__ */ E(() => kt(r().data, () => ({}), !0)), m = /* @__PURE__ */ E(() => kt(r().selected, !1)), w = /* @__PURE__ */ E(() => r().draggable), b = /* @__PURE__ */ E(() => r().selectable), _ = /* @__PURE__ */ E(() => kt(r().deletable, !0)), $ = /* @__PURE__ */ E(() => r().connectable), x = /* @__PURE__ */ E(() => r().focusable), C = /* @__PURE__ */ E(() => kt(r().hidden, !1)), S = /* @__PURE__ */ E(() => kt(r().dragging, !1)), M = /* @__PURE__ */ E(() => kt(r().style, "")), j = /* @__PURE__ */ E(() => r().class), L = /* @__PURE__ */ E(() => kt(r().type, "default")), I = /* @__PURE__ */ E(() => r().parentId), T = /* @__PURE__ */ E(() => r().sourcePosition), N = /* @__PURE__ */ E(() => r().targetPosition), H = /* @__PURE__ */ E(() => kt(r().measured, () => ({ width: 0, height: 0 }), !0).width), k = /* @__PURE__ */ E(() => kt(r().measured, () => ({ width: 0, height: 0 }), !0).height), P = /* @__PURE__ */ E(() => r().initialWidth), O = /* @__PURE__ */ E(() => r().initialHeight), B = /* @__PURE__ */ E(() => r().width), V = /* @__PURE__ */ E(() => r().height), F = /* @__PURE__ */ E(() => r().dragHandle), K = /* @__PURE__ */ E(() => kt(r().internals.z, 0)), G = /* @__PURE__ */ E(() => r().internals.positionAbsolute.x), ne = /* @__PURE__ */ E(() => r().internals.positionAbsolute.y), q = /* @__PURE__ */ E(() => r().internals.userNode), { id: z } = r(), Y = /* @__PURE__ */ E(() => c(w) ?? n().nodesDraggable), W = /* @__PURE__ */ E(() => c(b) ?? n().elementsSelectable), te = /* @__PURE__ */ E(() => c($) ?? n().nodesConnectable), ee = /* @__PURE__ */ E(() => Cc(r())), U = /* @__PURE__ */ E(() => !!r().internals.handleBounds), ce = /* @__PURE__ */ E(() => c(ee) && c(U)), se = /* @__PURE__ */ E(() => c(x) ?? n().nodesFocusable);
  function ae(ve) {
    return n().parentLookup.has(ve);
  }
  let ie = /* @__PURE__ */ E(() => ae(z)), pe = /* @__PURE__ */ Ne(null), we = null, he = c(L), ue = c(T), ge = c(N), $e = /* @__PURE__ */ E(() => n().nodeTypes[c(L)] ?? ga), X = /* @__PURE__ */ E(() => n().ariaLabelConfig);
  Tr("svelteflow__node_connectable", {
    get value() {
      return c(te);
    }
  }), Tr("svelteflow__node_id", z);
  let Xe = /* @__PURE__ */ E(() => {
    const ve = c(H) === void 0 ? c(B) ?? c(P) : c(B), Le = c(k) === void 0 ? c(V) ?? c(O) : c(V);
    if (!(ve === void 0 && Le === void 0 && c(M) === void 0))
      return `${c(M)};${ve ? `width:${wn(ve)};` : ""}${Le ? `height:${wn(Le)};` : ""}`;
  });
  Je(() => {
    (c(L) !== he || c(T) !== ue || c(N) !== ge) && c(pe) !== null && requestAnimationFrame(() => {
      c(pe) !== null && n().updateNodeInternals(/* @__PURE__ */ new Map([[z, { id: z, nodeElement: c(pe), force: !0 }]]));
    }), he = c(L), ue = c(T), ge = c(N);
  }), Je(() => {
    o() && (!c(ce) || c(pe) !== we) && (we && o().unobserve(we), c(pe) && o().observe(c(pe)), we = c(pe));
  }), Po(() => {
    we && o()?.unobserve(we);
  });
  function je(ve) {
    c(W) && (!n().selectNodesOnDrag || !c(Y) || n().nodeDragThreshold > 0) && n().handleNodeSelection(z), s()?.({ node: c(q), event: ve });
  }
  function He(ve) {
    if (!(Pc(ve) || n().disableKeyboardA11y))
      if (wc.includes(ve.key) && c(W)) {
        const Le = ve.key === "Escape";
        n().handleNodeSelection(z, Le, c(pe));
      } else c(Y) && r().selected && Object.prototype.hasOwnProperty.call(xi, ve.key) && (ve.preventDefault(), n(
        n().ariaLiveMessage = c(X)["node.a11yDescription.ariaLiveMessage"]({
          direction: ve.key.replace("Arrow", "").toLowerCase(),
          x: ~~r().internals.positionAbsolute.x,
          y: ~~r().internals.positionAbsolute.y
        }),
        !0
      ), n().moveSelectedNodes(xi[ve.key], ve.shiftKey ? 4 : 1));
  }
  const Pe = () => {
    if (n().disableKeyboardA11y || !n().autoPanOnNodeFocus || !c(pe)?.matches(":focus-visible"))
      return;
    const { width: ve, height: Le, viewport: Ie } = n();
    ua(/* @__PURE__ */ new Map([[z, r()]]), { x: 0, y: 0, width: ve, height: Le }, [Ie.x, Ie.y, Ie.zoom], !0).length > 0 || n().setCenter(r().position.x + (r().measured.width ?? 0) / 2, r().position.y + (r().measured.height ?? 0) / 2, { zoom: Ie.zoom });
  };
  var Ze = {
    get store() {
      return n();
    },
    set store(ve) {
      n(ve), g();
    },
    get node() {
      return r();
    },
    set node(ve) {
      r(ve), g();
    },
    get resizeObserver() {
      return o();
    },
    set resizeObserver(ve) {
      o(ve), g();
    },
    get nodeClickDistance() {
      return i();
    },
    set nodeClickDistance(ve) {
      i(ve), g();
    },
    get onnodeclick() {
      return s();
    },
    set onnodeclick(ve) {
      s(ve), g();
    },
    get onnodedrag() {
      return a();
    },
    set onnodedrag(ve) {
      a(ve), g();
    },
    get onnodedragstart() {
      return l();
    },
    set onnodedragstart(ve) {
      l(ve), g();
    },
    get onnodedragstop() {
      return u();
    },
    set onnodedragstop(ve) {
      u(ve), g();
    },
    get onnodepointerenter() {
      return d();
    },
    set onnodepointerenter(ve) {
      d(ve), g();
    },
    get onnodepointerleave() {
      return f();
    },
    set onnodepointerleave(ve) {
      f(ve), g();
    },
    get onnodepointermove() {
      return p();
    },
    set onnodepointermove(ve) {
      p(ve), g();
    },
    get onnodecontextmenu() {
      return h();
    },
    set onnodecontextmenu(ve) {
      h(ve), g();
    }
  }, qe = Ce(), Qe = re(qe);
  {
    var Ue = (ve) => {
      var Le = c0();
      vt(Le, () => ({
        "data-id": z,
        class: [
          "svelte-flow__node",
          `svelte-flow__node-${c(L)}`,
          c(j)
        ],
        style: c(Xe),
        onclick: je,
        onpointerenter: d() ? (Ee) => d()({ node: c(q), event: Ee }) : void 0,
        onpointerleave: f() ? (Ee) => f()({ node: c(q), event: Ee }) : void 0,
        onpointermove: p() ? (Ee) => p()({ node: c(q), event: Ee }) : void 0,
        oncontextmenu: h() ? (Ee) => h()({ node: c(q), event: Ee }) : void 0,
        onkeydown: c(se) ? He : void 0,
        onfocus: c(se) ? Pe : void 0,
        tabIndex: c(se) ? 0 : void 0,
        role: r().ariaRole ?? (c(se) ? "group" : void 0),
        "aria-roledescription": "node",
        "aria-describedby": n().disableKeyboardA11y ? void 0 : `${id}-${n().flowId}`,
        ...r().domAttributes,
        [Yn]: {
          dragging: c(S),
          selected: c(m),
          draggable: c(Y),
          connectable: c(te),
          selectable: c(W),
          nopan: c(Y),
          parent: c(ie)
        },
        [pn]: {
          "z-index": c(K),
          transform: `translate(${c(G) ?? ""}px, ${c(ne) ?? ""}px)`,
          visibility: c(ee) ? "visible" : "hidden"
        }
      }));
      var Ie = Z(Le);
      Ti(Ie, () => c($e), (Ee, it) => {
        it(Ee, {
          get data() {
            return c(y);
          },
          get id() {
            return z;
          },
          get selected() {
            return c(m);
          },
          get selectable() {
            return c(W);
          },
          get deletable() {
            return c(_);
          },
          get sourcePosition() {
            return c(T);
          },
          get targetPosition() {
            return c(N);
          },
          get zIndex() {
            return c(K);
          },
          get dragging() {
            return c(S);
          },
          get draggable() {
            return c(Y);
          },
          get dragHandle() {
            return c(F);
          },
          get parentId() {
            return c(I);
          },
          get type() {
            return c(L);
          },
          get isConnectable() {
            return c(te);
          },
          get positionAbsoluteX() {
            return c(G);
          },
          get positionAbsoluteY() {
            return c(ne);
          },
          get width() {
            return c(B);
          },
          get height() {
            return c(V);
          }
        });
      }), R(Le), mt(Le, (Ee, it) => rd?.(Ee, it), () => ({
        nodeId: z,
        isSelectable: c(W),
        disabled: !c(Y),
        handleSelector: c(F),
        noDragClass: n().noDragClass,
        nodeClickDistance: i(),
        onNodeMouseDown: n().handleNodeSelection,
        onDrag: (Ee, it, xt, Me) => {
          a()?.({ event: Ee, targetNode: xt, nodes: Me });
        },
        onDragStart: (Ee, it, xt, Me) => {
          l()?.({ event: Ee, targetNode: xt, nodes: Me });
        },
        onDragStop: (Ee, it, xt, Me) => {
          u()?.({ event: Ee, targetNode: xt, nodes: Me });
        },
        store: n()
      })), At(Le, (Ee) => Q(pe, Ee), () => c(pe)), D(ve, Le);
    };
    oe(Qe, (ve) => {
      c(C) || ve(Ue);
    });
  }
  return D(e, qe), fe(Ze);
}
le(
  ad,
  {
    store: {},
    node: {},
    resizeObserver: {},
    nodeClickDistance: {},
    onnodeclick: {},
    onnodedrag: {},
    onnodedragstart: {},
    onnodedragstop: {},
    onnodepointerenter: {},
    onnodepointerleave: {},
    onnodepointermove: {},
    onnodecontextmenu: {}
  },
  [],
  [],
  !0
);
var d0 = /* @__PURE__ */ J('<div class="svelte-flow__nodes"></div>');
function ld(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "nodeClickDistance", 7), o = v(t, "onnodeclick", 7), i = v(t, "onnodecontextmenu", 7), s = v(t, "onnodepointerenter", 7), a = v(t, "onnodepointermove", 7), l = v(t, "onnodepointerleave", 7), u = v(t, "onnodedrag", 7), d = v(t, "onnodedragstart", 7), f = v(t, "onnodedragstop", 7);
  const p = typeof ResizeObserver > "u" ? null : new ResizeObserver((m) => {
    const w = /* @__PURE__ */ new Map();
    m.forEach((b) => {
      const _ = b.target.getAttribute("data-id");
      w.set(_, { id: _, nodeElement: b.target, force: !0 });
    }), n().updateNodeInternals(w);
  });
  Po(() => {
    p?.disconnect();
  });
  var h = {
    get store() {
      return n();
    },
    set store(m) {
      n(m), g();
    },
    get nodeClickDistance() {
      return r();
    },
    set nodeClickDistance(m) {
      r(m), g();
    },
    get onnodeclick() {
      return o();
    },
    set onnodeclick(m) {
      o(m), g();
    },
    get onnodecontextmenu() {
      return i();
    },
    set onnodecontextmenu(m) {
      i(m), g();
    },
    get onnodepointerenter() {
      return s();
    },
    set onnodepointerenter(m) {
      s(m), g();
    },
    get onnodepointermove() {
      return a();
    },
    set onnodepointermove(m) {
      a(m), g();
    },
    get onnodepointerleave() {
      return l();
    },
    set onnodepointerleave(m) {
      l(m), g();
    },
    get onnodedrag() {
      return u();
    },
    set onnodedrag(m) {
      u(m), g();
    },
    get onnodedragstart() {
      return d();
    },
    set onnodedragstart(m) {
      d(m), g();
    },
    get onnodedragstop() {
      return f();
    },
    set onnodedragstop(m) {
      f(m), g();
    }
  }, y = d0();
  return at(y, 21, () => n().visible.nodes.values(), (m) => m.id, (m, w) => {
    ad(m, {
      get node() {
        return c(w);
      },
      get resizeObserver() {
        return p;
      },
      get nodeClickDistance() {
        return r();
      },
      get onnodeclick() {
        return o();
      },
      get onnodepointerenter() {
        return s();
      },
      get onnodepointermove() {
        return a();
      },
      get onnodepointerleave() {
        return l();
      },
      get onnodedrag() {
        return u();
      },
      get onnodedragstart() {
        return d();
      },
      get onnodedragstop() {
        return f();
      },
      get onnodecontextmenu() {
        return i();
      },
      get store() {
        return n();
      },
      set store(b) {
        n(b);
      }
    });
  }), R(y), D(e, y), fe(h);
}
le(
  ld,
  {
    store: {},
    nodeClickDistance: {},
    onnodeclick: {},
    onnodecontextmenu: {},
    onnodepointerenter: {},
    onnodepointermove: {},
    onnodepointerleave: {},
    onnodedrag: {},
    onnodedragstart: {},
    onnodedragstop: {}
  },
  [],
  [],
  !0
);
var f0 = /* @__PURE__ */ ye('<svg class="svelte-flow__edge-wrapper"><g><!></g></svg>');
function ud(e, t) {
  de(t, !0);
  const n = v(t, "edge", 7), r = v(t, "store", 15), o = v(t, "onedgeclick", 7), i = v(t, "onedgecontextmenu", 7), s = v(t, "onedgepointerenter", 7), a = v(t, "onedgepointerleave", 7);
  let l = /* @__PURE__ */ E(() => n().source), u = /* @__PURE__ */ E(() => n().target), d = /* @__PURE__ */ E(() => n().sourceX), f = /* @__PURE__ */ E(() => n().sourceY), p = /* @__PURE__ */ E(() => n().targetX), h = /* @__PURE__ */ E(() => n().targetY), y = /* @__PURE__ */ E(() => n().sourcePosition), m = /* @__PURE__ */ E(() => n().targetPosition), w = /* @__PURE__ */ E(() => kt(n().animated, !1)), b = /* @__PURE__ */ E(() => kt(n().selected, !1)), _ = /* @__PURE__ */ E(() => n().label), $ = /* @__PURE__ */ E(() => n().labelStyle), x = /* @__PURE__ */ E(() => kt(n().data, () => ({}), !0)), C = /* @__PURE__ */ E(() => n().style), S = /* @__PURE__ */ E(() => n().interactionWidth), M = /* @__PURE__ */ E(() => kt(n().type, "default")), j = /* @__PURE__ */ E(() => n().sourceHandle), L = /* @__PURE__ */ E(() => n().targetHandle), I = /* @__PURE__ */ E(() => n().markerStart), T = /* @__PURE__ */ E(() => n().markerEnd), N = /* @__PURE__ */ E(() => n().selectable), H = /* @__PURE__ */ E(() => n().focusable), k = /* @__PURE__ */ E(() => kt(n().deletable, !0)), P = /* @__PURE__ */ E(() => n().hidden), O = /* @__PURE__ */ E(() => n().zIndex), B = /* @__PURE__ */ E(() => n().class), V = /* @__PURE__ */ E(() => n().ariaLabel), F = null;
  const { id: K } = n();
  Tr("svelteflow__edge_id", K);
  let G = /* @__PURE__ */ E(() => c(N) ?? r().elementsSelectable), ne = /* @__PURE__ */ E(() => c(H) ?? r().edgesFocusable), q = /* @__PURE__ */ E(() => r().edgeTypes[c(M)] ?? va), z = /* @__PURE__ */ E(() => c(I) ? `url('#${Os(c(I), r().flowId)}')` : void 0), Y = /* @__PURE__ */ E(() => c(T) ? `url('#${Os(c(T), r().flowId)}')` : void 0);
  function W(ie) {
    const pe = r().edgeLookup.get(K);
    pe && (c(G) && r().handleEdgeSelection(K), o()?.({ event: ie, edge: pe }));
  }
  function te(ie, pe) {
    const we = r().edgeLookup.get(K);
    we && pe({ event: ie, edge: we });
  }
  function ee(ie) {
    if (!r().disableKeyboardA11y && wc.includes(ie.key) && c(G)) {
      const { unselectNodesAndEdges: pe, addSelectedEdges: we } = r();
      ie.key === "Escape" ? (F?.blur(), pe({ edges: [n()] })) : we([K]);
    }
  }
  var U = {
    get edge() {
      return n();
    },
    set edge(ie) {
      n(ie), g();
    },
    get store() {
      return r();
    },
    set store(ie) {
      r(ie), g();
    },
    get onedgeclick() {
      return o();
    },
    set onedgeclick(ie) {
      o(ie), g();
    },
    get onedgecontextmenu() {
      return i();
    },
    set onedgecontextmenu(ie) {
      i(ie), g();
    },
    get onedgepointerenter() {
      return s();
    },
    set onedgepointerenter(ie) {
      s(ie), g();
    },
    get onedgepointerleave() {
      return a();
    },
    set onedgepointerleave(ie) {
      a(ie), g();
    }
  }, ce = Ce(), se = re(ce);
  {
    var ae = (ie) => {
      var pe = f0();
      let we;
      var he = Z(pe);
      vt(he, () => ({
        class: ["svelte-flow__edge", c(B)],
        "data-id": K,
        onclick: W,
        oncontextmenu: i() ? (ge) => {
          te(ge, i());
        } : void 0,
        onpointerenter: s() ? (ge) => {
          te(ge, s());
        } : void 0,
        onpointerleave: a() ? (ge) => {
          te(ge, a());
        } : void 0,
        "aria-label": c(V) === null ? void 0 : c(V) ? c(V) : `Edge from ${c(l)} to ${c(u)}`,
        "aria-describedby": c(ne) ? `${sd}-${r().flowId}` : void 0,
        role: n().ariaRole ?? (c(ne) ? "group" : "img"),
        "aria-roledescription": "edge",
        onkeydown: c(ne) ? ee : void 0,
        tabindex: c(ne) ? 0 : void 0,
        ...n().domAttributes,
        [Yn]: {
          animated: c(w),
          selected: c(b),
          selectable: c(G)
        }
      }));
      var ue = Z(he);
      Ti(ue, () => c(q), (ge, $e) => {
        $e(ge, {
          get id() {
            return K;
          },
          get source() {
            return c(l);
          },
          get target() {
            return c(u);
          },
          get sourceX() {
            return c(d);
          },
          get sourceY() {
            return c(f);
          },
          get targetX() {
            return c(p);
          },
          get targetY() {
            return c(h);
          },
          get sourcePosition() {
            return c(y);
          },
          get targetPosition() {
            return c(m);
          },
          get animated() {
            return c(w);
          },
          get selected() {
            return c(b);
          },
          get label() {
            return c(_);
          },
          get labelStyle() {
            return c($);
          },
          get data() {
            return c(x);
          },
          get style() {
            return c(C);
          },
          get interactionWidth() {
            return c(S);
          },
          get selectable() {
            return c(G);
          },
          get deletable() {
            return c(k);
          },
          get type() {
            return c(M);
          },
          get sourceHandleId() {
            return c(j);
          },
          get targetHandleId() {
            return c(L);
          },
          get markerStart() {
            return c(z);
          },
          get markerEnd() {
            return c(Y);
          }
        });
      }), R(he), At(he, (ge) => F = ge, () => F), R(pe), xe(() => we = gt(pe, "", we, { "z-index": c(O) })), D(ie, pe);
    };
    oe(se, (ie) => {
      c(P) || ie(ae);
    });
  }
  return D(e, ce), fe(U);
}
le(
  ud,
  {
    edge: {},
    store: {},
    onedgeclick: {},
    onedgecontextmenu: {},
    onedgepointerenter: {},
    onedgepointerleave: {}
  },
  [],
  [],
  !0
);
tp();
var p0 = /* @__PURE__ */ ye("<defs></defs>");
function cd(e, t) {
  de(t, !1);
  const n = ln();
  Ru();
  var r = p0();
  at(r, 5, () => n.markers, (o) => o.id, (o, i) => {
    dd(o, Ge(() => c(i)));
  }), R(r), D(e, r), fe();
}
le(cd, {}, [], [], !0);
var h0 = /* @__PURE__ */ ye('<polyline class="arrow" fill="none" stroke-linecap="round" stroke-linejoin="round" points="-5,-4 0,0 -5,4"></polyline>'), g0 = /* @__PURE__ */ ye('<polyline class="arrowclosed" stroke-linecap="round" stroke-linejoin="round" points="-5,-4 0,0 -5,4 -5,-4"></polyline>'), v0 = /* @__PURE__ */ ye('<marker class="svelte-flow__arrowhead" viewBox="-10 -10 20 20" refX="0" refY="0"><!></marker>');
function dd(e, t) {
  de(t, !0);
  let n = v(t, "id", 7), r = v(t, "type", 7), o = v(t, "width", 7, 12.5), i = v(t, "height", 7, 12.5), s = v(t, "markerUnits", 7, "strokeWidth"), a = v(t, "orient", 7, "auto-start-reverse"), l = v(t, "color", 7, "none"), u = v(t, "strokeWidth", 7);
  var d = {
    get id() {
      return n();
    },
    set id(m) {
      n(m), g();
    },
    get type() {
      return r();
    },
    set type(m) {
      r(m), g();
    },
    get width() {
      return o();
    },
    set width(m = 12.5) {
      o(m), g();
    },
    get height() {
      return i();
    },
    set height(m = 12.5) {
      i(m), g();
    },
    get markerUnits() {
      return s();
    },
    set markerUnits(m = "strokeWidth") {
      s(m), g();
    },
    get orient() {
      return a();
    },
    set orient(m = "auto-start-reverse") {
      a(m), g();
    },
    get color() {
      return l();
    },
    set color(m = "none") {
      l(m), g();
    },
    get strokeWidth() {
      return u();
    },
    set strokeWidth(m) {
      u(m), g();
    }
  }, f = v0(), p = Z(f);
  {
    var h = (m) => {
      var w = h0();
      let b;
      xe(() => {
        _e(w, "stroke-width", u()), b = gt(w, "", b, { stroke: l() });
      }), D(m, w);
    }, y = (m) => {
      var w = Ce(), b = re(w);
      {
        var _ = ($) => {
          var x = g0();
          let C;
          xe(() => {
            _e(x, "stroke-width", u()), C = gt(x, "", C, { stroke: l(), fill: l() });
          }), D($, x);
        };
        oe(
          b,
          ($) => {
            r() === vo.ArrowClosed && $(_);
          },
          !0
        );
      }
      D(m, w);
    };
    oe(p, (m) => {
      r() === vo.Arrow ? m(h) : m(y, !1);
    });
  }
  return R(f), xe(() => {
    _e(f, "id", n()), _e(f, "markerWidth", `${o()}`), _e(f, "markerHeight", `${i()}`), _e(f, "markerUnits", s()), _e(f, "orient", a());
  }), D(e, f), fe(d);
}
le(
  dd,
  {
    id: {},
    type: {},
    width: {},
    height: {},
    markerUnits: {},
    orient: {},
    color: {},
    strokeWidth: {}
  },
  [],
  [],
  !0
);
var m0 = /* @__PURE__ */ J('<div class="svelte-flow__edges"><svg class="svelte-flow__marker"><!></svg> <!></div>');
function fd(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "onedgeclick", 7), o = v(t, "onedgecontextmenu", 7), i = v(t, "onedgepointerenter", 7), s = v(t, "onedgepointerleave", 7);
  var a = {
    get store() {
      return n();
    },
    set store(p) {
      n(p), g();
    },
    get onedgeclick() {
      return r();
    },
    set onedgeclick(p) {
      r(p), g();
    },
    get onedgecontextmenu() {
      return o();
    },
    set onedgecontextmenu(p) {
      o(p), g();
    },
    get onedgepointerenter() {
      return i();
    },
    set onedgepointerenter(p) {
      i(p), g();
    },
    get onedgepointerleave() {
      return s();
    },
    set onedgepointerleave(p) {
      s(p), g();
    }
  }, l = m0(), u = Z(l), d = Z(u);
  cd(d, {}), R(u);
  var f = A(u, 2);
  return at(f, 17, () => n().visible.edges.values(), (p) => p.id, (p, h) => {
    ud(p, {
      get edge() {
        return c(h);
      },
      get onedgeclick() {
        return r();
      },
      get onedgecontextmenu() {
        return o();
      },
      get onedgepointerenter() {
        return i();
      },
      get onedgepointerleave() {
        return s();
      },
      get store() {
        return n();
      },
      set store(y) {
        n(y);
      }
    });
  }), R(l), D(e, l), fe(a);
}
le(
  fd,
  {
    store: {},
    onedgeclick: {},
    onedgecontextmenu: {},
    onedgepointerenter: {},
    onedgepointerleave: {}
  },
  [],
  [],
  !0
);
var y0 = /* @__PURE__ */ J('<div class="svelte-flow__selection svelte-t1t2hk"></div>');
const w0 = {
  hash: "svelte-t1t2hk",
  code: ".svelte-flow__selection.svelte-t1t2hk {position:absolute;top:0;left:0;}"
};
function ma(e, t) {
  de(t, !0), Ke(e, w0);
  let n = v(t, "x", 7, 0), r = v(t, "y", 7, 0), o = v(t, "width", 7, 0), i = v(t, "height", 7, 0), s = v(t, "isVisible", 7, !0);
  var a = {
    get x() {
      return n();
    },
    set x(f = 0) {
      n(f), g();
    },
    get y() {
      return r();
    },
    set y(f = 0) {
      r(f), g();
    },
    get width() {
      return o();
    },
    set width(f = 0) {
      o(f), g();
    },
    get height() {
      return i();
    },
    set height(f = 0) {
      i(f), g();
    },
    get isVisible() {
      return s();
    },
    set isVisible(f = !0) {
      s(f), g();
    }
  }, l = Ce(), u = re(l);
  {
    var d = (f) => {
      var p = y0();
      let h;
      xe((y) => h = gt(p, "", h, y), [
        () => ({
          width: typeof o() == "string" ? o() : wn(o()),
          height: typeof i() == "string" ? i() : wn(i()),
          transform: `translate(${n()}px, ${r()}px)`
        })
      ]), D(f, p);
    };
    oe(u, (f) => {
      s() && f(d);
    });
  }
  return D(e, l), fe(a);
}
le(ma, { x: {}, y: {}, width: {}, height: {}, isVisible: {} }, [], [], !0);
var b0 = /* @__PURE__ */ J("<div><!></div>");
const x0 = {
  hash: "svelte-bnpnsc",
  code: `.svelte-flow__selection-wrapper.svelte-bnpnsc {position:absolute;top:0;left:0;z-index:2000;pointer-events:all;}.svelte-flow__selection-wrapper.svelte-bnpnsc:focus,
  .svelte-flow__selection-wrapper.svelte-bnpnsc:focus-visible {outline:none;}`
};
function pd(e, t) {
  de(t, !0), Ke(e, x0);
  let n = v(t, "store", 15), r = v(t, "onnodedrag", 7), o = v(t, "onnodedragstart", 7), i = v(t, "onnodedragstop", 7), s = v(t, "onselectionclick", 7), a = v(t, "onselectioncontextmenu", 7), l = /* @__PURE__ */ Ne(void 0);
  Je(() => {
    n().disableKeyboardA11y || c(l)?.focus({ preventScroll: !0 });
  });
  let u = /* @__PURE__ */ E(() => {
    if (n().selectionRectMode === "nodes") {
      n().nodes;
      const b = Oo(n().nodeLookup, { filter: (_) => !!_.selected });
      if (b.width > 0 && b.height > 0)
        return b;
    }
    return null;
  });
  function d(b) {
    const _ = n().nodes.filter(($) => $.selected);
    a()?.({ nodes: _, event: b });
  }
  function f(b) {
    const _ = n().nodes.filter(($) => $.selected);
    s()?.({ nodes: _, event: b });
  }
  function p(b) {
    Object.prototype.hasOwnProperty.call(xi, b.key) && (b.preventDefault(), n().moveSelectedNodes(xi[b.key], b.shiftKey ? 4 : 1));
  }
  var h = {
    get store() {
      return n();
    },
    set store(b) {
      n(b), g();
    },
    get onnodedrag() {
      return r();
    },
    set onnodedrag(b) {
      r(b), g();
    },
    get onnodedragstart() {
      return o();
    },
    set onnodedragstart(b) {
      o(b), g();
    },
    get onnodedragstop() {
      return i();
    },
    set onnodedragstop(b) {
      i(b), g();
    },
    get onselectionclick() {
      return s();
    },
    set onselectionclick(b) {
      s(b), g();
    },
    get onselectioncontextmenu() {
      return a();
    },
    set onselectioncontextmenu(b) {
      a(b), g();
    }
  }, y = Ce(), m = re(y);
  {
    var w = (b) => {
      var _ = b0();
      _.__contextmenu = d, _.__click = f, _.__keydown = function(...C) {
        (n().disableKeyboardA11y ? void 0 : p)?.apply(this, C);
      };
      let $;
      var x = Z(_);
      ma(x, { width: "100%", height: "100%", x: 0, y: 0 }), R(_), mt(_, (C, S) => rd?.(C, S), () => ({
        disabled: !1,
        store: n(),
        onDrag: (C, S, M, j) => {
          r()?.({ event: C, targetNode: null, nodes: j });
        },
        onDragStart: (C, S, M, j) => {
          o()?.({ event: C, targetNode: null, nodes: j });
        },
        onDragStop: (C, S, M, j) => {
          i()?.({ event: C, targetNode: null, nodes: j });
        }
      })), At(_, (C) => Q(l, C), () => c(l)), xe(
        (C) => {
          ft(_, 1, Rn(["svelte-flow__selection-wrapper", n().noPanClass]), "svelte-bnpnsc"), _e(_, "role", n().disableKeyboardA11y ? void 0 : "button"), _e(_, "tabindex", n().disableKeyboardA11y ? void 0 : -1), $ = gt(_, "", $, C);
        },
        [
          () => ({
            width: wn(c(u).width),
            height: wn(c(u).height),
            transform: `translate(${c(u).x ?? ""}px, ${c(u).y ?? ""}px)`
          })
        ]
      ), D(b, _);
    };
    oe(m, (b) => {
      n().selectionRectMode === "nodes" && c(u) && Pn(c(u).x) && Pn(c(u).y) && b(w);
    });
  }
  return D(e, y), fe(h);
}
rr(["contextmenu", "click", "keydown"]);
le(
  pd,
  {
    store: {},
    onnodedrag: {},
    onnodedragstart: {},
    onnodedragstop: {},
    onselectionclick: {},
    onselectioncontextmenu: {}
  },
  [],
  [],
  !0
);
function k0(e) {
  switch (e) {
    case "ctrl":
      return 8;
    case "shift":
      return 4;
    case "alt":
      return 2;
    case "meta":
      return 1;
  }
}
function dn(e, t) {
  let { enabled: n = !0, trigger: r, type: o = "keydown" } = t;
  function i(a) {
    const l = Array.isArray(r) ? r : [r], u = [a.metaKey, a.altKey, a.shiftKey, a.ctrlKey].reduce(
      (d, f, p) => f ? d | 1 << p : d,
      0
    );
    for (const d of l) {
      const f = {
        preventDefault: !1,
        enabled: !0,
        ...d
      }, { modifier: p, key: h, callback: y, preventDefault: m, enabled: w } = f;
      if (w) {
        if (a.key !== h) continue;
        if (p === null || p === !1) {
          if (u !== 0) continue;
        } else if (p !== void 0 && p?.[0]?.length > 0) {
          const _ = Array.isArray(p) ? p : [p];
          let $ = !1;
          for (const x of _)
            if ((Array.isArray(x) ? x : [x]).reduce(
              (C, S) => C | k0(S),
              0
            ) === u) {
              $ = !0;
              break;
            }
          if (!$) continue;
        }
        m && a.preventDefault();
        const b = {
          node: e,
          trigger: f,
          originalEvent: a
        };
        e.dispatchEvent(new CustomEvent("shortcut", { detail: b })), y?.(b);
      }
    }
  }
  let s;
  return n && (s = ws(e, o, i)), {
    update: (a) => {
      const { enabled: l = !0, type: u = "keydown" } = a;
      n && (!l || o !== u) ? s?.() : !n && l && (s = ws(e, u, i)), n = l, o = u, r = a.trigger;
    },
    destroy: () => {
      s?.();
    }
  };
}
function ut() {
  const e = /* @__PURE__ */ E(ln), t = (i) => {
    const s = wl(i) ? i : c(e).nodeLookup.get(i.id), a = s.parentId ? G1(s.position, s.measured, s.parentId, c(e).nodeLookup, c(e).nodeOrigin) : s.position, l = {
      ...s,
      position: a,
      width: s.measured?.width ?? s.width,
      height: s.measured?.height ?? s.height
    };
    return Zr(l);
  };
  function n(i, s, a = { replace: !1 }) {
    c(e).nodes = dt(() => c(e).nodes).map((l) => {
      if (l.id === i) {
        const u = typeof s == "function" ? s(l) : s;
        return a?.replace && wl(u) ? u : { ...l, ...u };
      }
      return l;
    });
  }
  function r(i, s, a = { replace: !1 }) {
    c(e).edges = dt(() => c(e).edges).map((l) => {
      if (l.id === i) {
        const u = typeof s == "function" ? s(l) : s;
        return a.replace && Bm(u) ? u : { ...l, ...u };
      }
      return l;
    });
  }
  const o = (i) => c(e).nodeLookup.get(i);
  return {
    zoomIn: c(e).zoomIn,
    zoomOut: c(e).zoomOut,
    getInternalNode: o,
    getNode: (i) => o(i)?.internals.userNode,
    getNodes: (i) => i === void 0 ? c(e).nodes : $l(c(e).nodeLookup, i),
    getEdge: (i) => c(e).edgeLookup.get(i),
    getEdges: (i) => i === void 0 ? c(e).edges : $l(c(e).edgeLookup, i),
    setZoom: (i, s) => {
      const a = c(e).panZoom;
      return a ? a.scaleTo(i, { duration: s?.duration }) : Promise.resolve(!1);
    },
    getZoom: () => c(e).viewport.zoom,
    setViewport: async (i, s) => {
      const a = c(e).viewport;
      return c(e).panZoom ? (await c(e).panZoom.setViewport(
        {
          x: i.x ?? a.x,
          y: i.y ?? a.y,
          zoom: i.zoom ?? a.zoom
        },
        s
      ), Promise.resolve(!0)) : Promise.resolve(!1);
    },
    getViewport: () => Ul(c(e).viewport),
    setCenter: async (i, s, a) => c(e).setCenter(i, s, a),
    fitView: (i) => c(e).fitView(i),
    fitBounds: async (i, s) => {
      if (!c(e).panZoom)
        return Promise.resolve(!1);
      const a = ca(i, c(e).width, c(e).height, c(e).minZoom, c(e).maxZoom, s?.padding ?? 0.1);
      return await c(e).panZoom.setViewport(a, {
        duration: s?.duration,
        ease: s?.ease,
        interpolate: s?.interpolate
      }), Promise.resolve(!0);
    },
    /**
     * Partial is defined as "the 2 nodes/areas are intersecting partially".
     * If a is contained in b or b is contained in a, they are both
     * considered fully intersecting.
     */
    getIntersectingNodes: (i, s = !0, a) => {
      const l = al(i), u = l ? i : t(i);
      return u ? (a || c(e).nodes).filter((d) => {
        const f = c(e).nodeLookup.get(d.id);
        if (!f || !l && d.id === i.id)
          return !1;
        const p = Zr(f), h = mo(p, u);
        return s && h > 0 || h >= p.width * p.height || h >= u.width * u.height;
      }) : [];
    },
    isNodeIntersecting: (i, s, a = !0) => {
      const l = al(i) ? i : t(i);
      if (!l)
        return !1;
      const u = mo(l, s);
      return a && u > 0 || u >= s.width * s.height || u >= l.width * l.height;
    },
    deleteElements: async ({ nodes: i = [], edges: s = [] }) => {
      const { nodes: a, edges: l } = await q1({
        nodesToRemove: i,
        edgesToRemove: s,
        nodes: c(e).nodes,
        edges: c(e).edges,
        onBeforeDelete: c(e).onbeforedelete
      });
      return a && (c(e).nodes = dt(() => c(e).nodes).filter((u) => !a.some(({ id: d }) => d === u.id))), l && (c(e).edges = dt(() => c(e).edges).filter((u) => !l.some(({ id: d }) => d === u.id))), (a.length > 0 || l.length > 0) && c(e).ondelete?.({ nodes: a, edges: l }), { deletedNodes: a, deletedEdges: l };
    },
    screenToFlowPosition: (i, s = { snapToGrid: !0 }) => {
      if (!c(e).domNode)
        return i;
      const a = s.snapToGrid ? c(e).snapGrid : !1, { x: l, y: u, zoom: d } = c(e).viewport, { x: f, y: p } = c(e).domNode.getBoundingClientRect(), h = { x: i.x - f, y: i.y - p };
      return Ao(h, [l, u, d], a !== null, a || [1, 1]);
    },
    /**
     *
     * @param position
     * @returns
     */
    flowToScreenPosition: (i) => {
      if (!c(e).domNode)
        return i;
      const { x: s, y: a, zoom: l } = c(e).viewport, { x: u, y: d } = c(e).domNode.getBoundingClientRect(), f = bi(i, [s, a, l]);
      return { x: f.x + u, y: f.y + d };
    },
    toObject: () => structuredClone({
      nodes: [...c(e).nodes],
      edges: [...c(e).edges],
      viewport: { ...c(e).viewport }
    }),
    updateNode: n,
    updateNodeData: (i, s, a) => {
      const l = c(e).nodeLookup.get(i)?.internals.userNode;
      if (!l)
        return;
      const u = typeof s == "function" ? s(l) : s;
      n(i, (d) => ({
        ...d,
        data: a?.replace ? u : { ...d.data, ...u }
      }));
    },
    updateEdge: r,
    getNodesBounds: (i) => K1(i, {
      nodeLookup: c(e).nodeLookup,
      nodeOrigin: c(e).nodeOrigin
    }),
    getHandleConnections: ({ type: i, id: s, nodeId: a }) => Array.from(c(e).connectionLookup.get(`${a}-${i}-${s ?? null}`)?.values() ?? [])
  };
}
function $l(e, t) {
  const n = [];
  for (const r of t) {
    const o = e.get(r);
    if (o) {
      const i = "internals" in o ? o.internals?.userNode : o;
      n.push(i);
    }
  }
  return n;
}
function hd(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "selectionKey", 7, "Shift"), o = v(t, "multiSelectionKey", 23, () => cr() ? "Meta" : "Control"), i = v(t, "deleteKey", 7, "Backspace"), s = v(t, "panActivationKey", 7, " "), a = v(t, "zoomActivationKey", 23, () => cr() ? "Meta" : "Control"), { deleteElements: l } = ut();
  function u(w) {
    return w !== null && typeof w == "object";
  }
  function d(w) {
    return u(w) ? w.modifier || [] : [];
  }
  function f(w) {
    return w == null ? "" : u(w) ? w.key : w;
  }
  function p(w, b) {
    return (Array.isArray(w) ? w : [w]).map((_) => {
      const $ = f(_);
      return {
        key: $,
        modifier: d(_),
        enabled: $ !== null,
        callback: b
      };
    });
  }
  function h() {
    n(n().selectionRect = null, !0), n(n().selectionKeyPressed = !1, !0), n(n().multiselectionKeyPressed = !1, !0), n(n().deleteKeyPressed = !1, !0), n(n().panActivationKeyPressed = !1, !0), n(n().zoomActivationKeyPressed = !1, !0);
  }
  function y() {
    const w = n().nodes.filter((_) => _.selected), b = n().edges.filter((_) => _.selected);
    l({ nodes: w, edges: b });
  }
  var m = {
    get store() {
      return n();
    },
    set store(w) {
      n(w), g();
    },
    get selectionKey() {
      return r();
    },
    set selectionKey(w = "Shift") {
      r(w), g();
    },
    get multiSelectionKey() {
      return o();
    },
    set multiSelectionKey(w = cr() ? "Meta" : "Control") {
      o(w), g();
    },
    get deleteKey() {
      return i();
    },
    set deleteKey(w = "Backspace") {
      i(w), g();
    },
    get panActivationKey() {
      return s();
    },
    set panActivationKey(w = " ") {
      s(w), g();
    },
    get zoomActivationKey() {
      return a();
    },
    set zoomActivationKey(w = cr() ? "Meta" : "Control") {
      a(w), g();
    }
  };
  return Lr("blur", Et, h), Lr("contextmenu", Et, h), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(r(), () => n(n().selectionKeyPressed = !0, !0)),
    type: "keydown"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(r(), () => n(n().selectionKeyPressed = !1, !0)),
    type: "keyup"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(o(), () => {
      n(n().multiselectionKeyPressed = !0, !0);
    }),
    type: "keydown"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(o(), () => n(n().multiselectionKeyPressed = !1, !0)),
    type: "keyup"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(i(), (w) => {
      !(w.originalEvent.ctrlKey || w.originalEvent.metaKey || w.originalEvent.shiftKey) && !Pc(w.originalEvent) && (n(n().deleteKeyPressed = !0, !0), y());
    }),
    type: "keydown"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(i(), () => n(n().deleteKeyPressed = !1, !0)),
    type: "keyup"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(s(), () => n(n().panActivationKeyPressed = !0, !0)),
    type: "keydown"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(s(), () => n(n().panActivationKeyPressed = !1, !0)),
    type: "keyup"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(a(), () => n(n().zoomActivationKeyPressed = !0, !0)),
    type: "keydown"
  })), mt(Et, (w, b) => dn?.(w, b), () => ({
    trigger: p(a(), () => n(n().zoomActivationKeyPressed = !1, !0)),
    type: "keyup"
  })), fe(m);
}
le(
  hd,
  {
    store: {},
    selectionKey: {},
    multiSelectionKey: {},
    deleteKey: {},
    panActivationKey: {},
    zoomActivationKey: {}
  },
  [],
  [],
  !0
);
var _0 = /* @__PURE__ */ ye('<path fill="none" class="svelte-flow__connection-path"></path>'), $0 = /* @__PURE__ */ ye('<svg class="svelte-flow__connectionline"><g><!></g></svg>');
function gd(e, t) {
  de(t, !0);
  let n = v(t, "store", 15), r = v(t, "type", 7), o = v(t, "containerStyle", 7), i = v(t, "style", 7), s = v(t, "LineComponent", 7), a = /* @__PURE__ */ E(() => {
    if (!n().connection.inProgress)
      return "";
    const p = {
      sourceX: n().connection.from.x,
      sourceY: n().connection.from.y,
      sourcePosition: n().connection.fromPosition,
      targetX: n().connection.to.x,
      targetY: n().connection.to.y,
      targetPosition: n().connection.toPosition
    };
    switch (r()) {
      case $n.Bezier: {
        const [h] = Dc(p);
        return h;
      }
      case $n.Straight: {
        const [h] = Oc(p);
        return h;
      }
      case $n.Step:
      case $n.SmoothStep: {
        const [h] = da({
          ...p,
          borderRadius: r() === $n.Step ? 0 : void 0
        });
        return h;
      }
    }
  });
  var l = {
    get store() {
      return n();
    },
    set store(p) {
      n(p), g();
    },
    get type() {
      return r();
    },
    set type(p) {
      r(p), g();
    },
    get containerStyle() {
      return o();
    },
    set containerStyle(p) {
      o(p), g();
    },
    get style() {
      return i();
    },
    set style(p) {
      i(p), g();
    },
    get LineComponent() {
      return s();
    },
    set LineComponent(p) {
      s(p), g();
    }
  }, u = Ce(), d = re(u);
  {
    var f = (p) => {
      var h = $0(), y = Z(h), m = Z(y);
      {
        var w = (_) => {
          var $ = Ce(), x = re($);
          Ti(x, s, (C, S) => {
            S(C, {});
          }), D(_, $);
        }, b = (_) => {
          var $ = _0();
          xe(() => {
            _e($, "d", c(a)), gt($, i());
          }), D(_, $);
        };
        oe(m, (_) => {
          s() ? _(w) : _(b, !1);
        });
      }
      R(y), R(h), xe(
        (_) => {
          _e(h, "width", n().width), _e(h, "height", n().height), gt(h, o()), ft(y, 0, _);
        },
        [
          () => Rn([
            "svelte-flow__connection",
            j1(n().connection.isValid)
          ])
        ]
      ), D(p, h);
    };
    oe(d, (p) => {
      n().connection.inProgress && p(f);
    });
  }
  return D(e, u), fe(l);
}
le(
  gd,
  {
    store: {},
    type: {},
    containerStyle: {},
    style: {},
    LineComponent: {}
  },
  [],
  [],
  !0
);
var C0 = /* @__PURE__ */ J("<div><!></div>");
function zo(e, t) {
  de(t, !0);
  let n = v(t, "position", 7, "top-right"), r = v(t, "style", 7), o = v(t, "class", 7), i = v(t, "children", 7), s = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "position",
    "style",
    "class",
    "children"
  ]), a = /* @__PURE__ */ E(() => `${n()}`.split("-"));
  var l = {
    get position() {
      return n();
    },
    set position(f = "top-right") {
      n(f), g();
    },
    get style() {
      return r();
    },
    set style(f) {
      r(f), g();
    },
    get class() {
      return o();
    },
    set class(f) {
      o(f), g();
    },
    get children() {
      return i();
    },
    set children(f) {
      i(f), g();
    }
  }, u = C0();
  vt(u, (f) => ({ class: f, style: r(), ...s }), [
    () => ["svelte-flow__panel", o(), ...c(a)]
  ]);
  var d = Z(u);
  return tt(d, () => i() ?? bt), R(u), D(e, u), fe(l);
}
le(zo, { position: {}, style: {}, class: {}, children: {} }, [], [], !0);
var S0 = /* @__PURE__ */ J('<a href="https://svelteflow.dev" target="_blank" rel="noopener noreferrer" aria-label="Svelte Flow attribution">Svelte Flow</a>');
function vd(e, t) {
  de(t, !0);
  let n = v(t, "proOptions", 7), r = v(t, "position", 7, "bottom-right");
  var o = {
    get proOptions() {
      return n();
    },
    set proOptions(l) {
      n(l), g();
    },
    get position() {
      return r();
    },
    set position(l = "bottom-right") {
      r(l), g();
    }
  }, i = Ce(), s = re(i);
  {
    var a = (l) => {
      zo(l, {
        get position() {
          return r();
        },
        class: "svelte-flow__attribution",
        "data-message": "Feel free to remove the attribution or check out how you could support us: https://svelteflow.dev/support-us",
        children: (u, d) => {
          var f = S0();
          D(u, f);
        },
        $$slots: { default: !0 }
      });
    };
    oe(s, (l) => {
      n()?.hideAttribution || l(a);
    });
  }
  return D(e, i), fe(o);
}
le(vd, { proOptions: {}, position: {} }, [], [], !0);
var E0 = /* @__PURE__ */ J("<div><!></div>");
const P0 = {
  hash: "svelte-17yr5bf",
  code: ".svelte-flow.svelte-17yr5bf {width:100%;height:100%;overflow:hidden;position:relative;z-index:0;background-color:var(--background-color, var(--background-color-default));}:root {--background-color-default: #fff;--background-pattern-color-default: #ddd;--minimap-mask-color-default: rgb(240, 240, 240, 0.6);--minimap-mask-stroke-color-default: none;--minimap-mask-stroke-width-default: 1;--controls-button-background-color-default: #fefefe;--controls-button-background-color-hover-default: #f4f4f4;--controls-button-color-default: inherit;--controls-button-color-hover-default: inherit;--controls-button-border-color-default: #eee;}"
};
function md(e, t) {
  de(t, !0), Ke(e, P0);
  let n = v(t, "width", 7), r = v(t, "height", 7), o = v(t, "colorMode", 7), i = v(t, "domNode", 15), s = v(t, "clientWidth", 15), a = v(t, "clientHeight", 15), l = v(t, "children", 7), u = v(t, "rest", 7), d = /* @__PURE__ */ E(() => u().class), f = /* @__PURE__ */ E(() => Ep(u(), [
    "id",
    "class",
    "nodeTypes",
    "edgeTypes",
    "colorMode",
    "isValidConnection",
    "onmove",
    "onmovestart",
    "onmoveend",
    "onflowerror",
    "ondelete",
    "onbeforedelete",
    "onbeforeconnect",
    "onconnect",
    "onconnectstart",
    "onconnectend",
    "onbeforereconnect",
    "onreconnect",
    "onreconnectstart",
    "onreconnectend",
    "onclickconnectstart",
    "onclickconnectend",
    "oninit",
    "onselectionchange",
    "onselectiondragstart",
    "onselectiondrag",
    "onselectiondragstop",
    "onselectionstart",
    "onselectionend",
    "clickConnect",
    "fitView",
    "fitViewOptions",
    "nodeOrigin",
    "nodeDragThreshold",
    "connectionDragThreshold",
    "minZoom",
    "maxZoom",
    "initialViewport",
    "connectionRadius",
    "connectionMode",
    "selectionMode",
    "selectNodesOnDrag",
    "snapGrid",
    "defaultMarkerColor",
    "translateExtent",
    "nodeExtent",
    "onlyRenderVisibleElements",
    "autoPanOnConnect",
    "autoPanOnNodeDrag",
    "colorModeSSR",
    "defaultEdgeOptions",
    "elevateNodesOnSelect",
    "elevateEdgesOnSelect",
    "nodesDraggable",
    "autoPanOnNodeFocus",
    "nodesConnectable",
    "elementsSelectable",
    "nodesFocusable",
    "edgesFocusable",
    "disableKeyboardA11y",
    "noDragClass",
    "noPanClass",
    "noWheelClass",
    "ariaLabelConfig",
    "autoPanSpeed",
    "panOnScrollSpeed"
  ]));
  function p(w) {
    w.currentTarget.scrollTo({ top: 0, left: 0, behavior: "auto" }), u().onscroll && u().onscroll(w);
  }
  var h = {
    get width() {
      return n();
    },
    set width(w) {
      n(w), g();
    },
    get height() {
      return r();
    },
    set height(w) {
      r(w), g();
    },
    get colorMode() {
      return o();
    },
    set colorMode(w) {
      o(w), g();
    },
    get domNode() {
      return i();
    },
    set domNode(w) {
      i(w), g();
    },
    get clientWidth() {
      return s();
    },
    set clientWidth(w) {
      s(w), g();
    },
    get clientHeight() {
      return a();
    },
    set clientHeight(w) {
      a(w), g();
    },
    get children() {
      return l();
    },
    set children(w) {
      l(w), g();
    },
    get rest() {
      return u();
    },
    set rest(w) {
      u(w), g();
    }
  }, y = E0();
  vt(
    y,
    (w) => ({
      class: [
        "svelte-flow",
        "svelte-flow__container",
        c(d),
        o()
      ],
      "data-testid": "svelte-flow__wrapper",
      role: "application",
      onscroll: p,
      ...c(f),
      [pn]: w
    }),
    [
      () => ({ width: wn(n()), height: wn(r()) })
    ],
    void 0,
    void 0,
    "svelte-17yr5bf"
  );
  var m = Z(y);
  return tt(m, () => l() ?? bt), R(y), At(y, (w) => i(w), () => i()), Va(y, "clientHeight", a), Va(y, "clientWidth", s), D(e, y), fe(h);
}
le(
  md,
  {
    width: {},
    height: {},
    colorMode: {},
    domNode: {},
    clientWidth: {},
    clientHeight: {},
    children: {},
    rest: {}
  },
  [],
  [],
  !0
);
var N0 = /* @__PURE__ */ J('<div class="svelte-flow__viewport-back svelte-flow__container"></div> <!> <div class="svelte-flow__edge-labels svelte-flow__container"></div> <!> <!> <!> <div class="svelte-flow__viewport-front svelte-flow__container"></div>', 1), D0 = /* @__PURE__ */ J("<!> <!>", 1), H0 = /* @__PURE__ */ J("<!> <!> <!> <!> <!>", 1);
function yd(e, t) {
  de(t, !0);
  let n = v(t, "width", 7), r = v(t, "height", 7), o = v(t, "proOptions", 7), i = v(t, "selectionKey", 7), s = v(t, "deleteKey", 7), a = v(t, "panActivationKey", 7), l = v(t, "multiSelectionKey", 7), u = v(t, "zoomActivationKey", 7), d = v(t, "paneClickDistance", 7, 1), f = v(t, "nodeClickDistance", 7, 1), p = v(t, "onmovestart", 7), h = v(t, "onmoveend", 7), y = v(t, "onmove", 7), m = v(t, "oninit", 7), w = v(t, "onnodeclick", 7), b = v(t, "onnodecontextmenu", 7), _ = v(t, "onnodedrag", 7), $ = v(t, "onnodedragstart", 7), x = v(t, "onnodedragstop", 7), C = v(t, "onnodepointerenter", 7), S = v(t, "onnodepointermove", 7), M = v(t, "onnodepointerleave", 7), j = v(t, "onselectionclick", 7), L = v(t, "onselectioncontextmenu", 7), I = v(t, "onselectionstart", 7), T = v(t, "onselectionend", 7), N = v(t, "onedgeclick", 7), H = v(t, "onedgecontextmenu", 7), k = v(t, "onedgepointerenter", 7), P = v(t, "onedgepointerleave", 7), O = v(t, "onpaneclick", 7), B = v(t, "onpanecontextmenu", 7), V = v(t, "panOnScrollMode", 23, () => pr.Free), F = v(t, "preventScrolling", 7, !0), K = v(t, "zoomOnScroll", 7, !0), G = v(t, "zoomOnDoubleClick", 7, !0), ne = v(t, "zoomOnPinch", 7, !0), q = v(t, "panOnScroll", 7, !1), z = v(t, "panOnScrollSpeed", 7, 0.5), Y = v(t, "panOnDrag", 7, !0), W = v(t, "selectionOnDrag", 7, !1), te = v(t, "connectionLineComponent", 7), ee = v(t, "connectionLineStyle", 7), U = v(t, "connectionLineContainerStyle", 7), ce = v(t, "connectionLineType", 23, () => $n.Bezier), se = v(t, "attributionPosition", 7), ae = v(t, "children", 7), ie = v(t, "nodes", 31, () => Pt([])), pe = v(t, "edges", 31, () => Pt([])), we = v(t, "viewport", 31, () => {
  }), he = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "width",
    "height",
    "proOptions",
    "selectionKey",
    "deleteKey",
    "panActivationKey",
    "multiSelectionKey",
    "zoomActivationKey",
    "paneClickDistance",
    "nodeClickDistance",
    "onmovestart",
    "onmoveend",
    "onmove",
    "oninit",
    "onnodeclick",
    "onnodecontextmenu",
    "onnodedrag",
    "onnodedragstart",
    "onnodedragstop",
    "onnodepointerenter",
    "onnodepointermove",
    "onnodepointerleave",
    "onselectionclick",
    "onselectioncontextmenu",
    "onselectionstart",
    "onselectionend",
    "onedgeclick",
    "onedgecontextmenu",
    "onedgepointerenter",
    "onedgepointerleave",
    "onpaneclick",
    "onpanecontextmenu",
    "panOnScrollMode",
    "preventScrolling",
    "zoomOnScroll",
    "zoomOnDoubleClick",
    "zoomOnPinch",
    "panOnScroll",
    "panOnScrollSpeed",
    "panOnDrag",
    "selectionOnDrag",
    "connectionLineComponent",
    "connectionLineStyle",
    "connectionLineContainerStyle",
    "connectionLineType",
    "attributionPosition",
    "children",
    "nodes",
    "edges",
    "viewport"
  ]), ue = Qc({
    props: he,
    width: n(),
    height: r(),
    get nodes() {
      return ie();
    },
    set nodes(X) {
      ie(X);
    },
    get edges() {
      return pe();
    },
    set edges(X) {
      pe(X);
    },
    get viewport() {
      return we();
    },
    set viewport(X) {
      we(X);
    }
  });
  const ge = Un(ki);
  ge && ge.setStore && ge.setStore(ue), Tr(ki, {
    provider: !1,
    getStore() {
      return ue;
    }
  }), Je(() => {
    const X = { nodes: ue.selectedNodes, edges: ue.selectedEdges };
    dt(() => t.onselectionchange)?.(X);
    for (const Xe of ue.selectionChangeHandlers.values())
      Xe(X);
  }), Po(() => {
    ue.reset();
  });
  var $e = {
    get width() {
      return n();
    },
    set width(X) {
      n(X), g();
    },
    get height() {
      return r();
    },
    set height(X) {
      r(X), g();
    },
    get proOptions() {
      return o();
    },
    set proOptions(X) {
      o(X), g();
    },
    get selectionKey() {
      return i();
    },
    set selectionKey(X) {
      i(X), g();
    },
    get deleteKey() {
      return s();
    },
    set deleteKey(X) {
      s(X), g();
    },
    get panActivationKey() {
      return a();
    },
    set panActivationKey(X) {
      a(X), g();
    },
    get multiSelectionKey() {
      return l();
    },
    set multiSelectionKey(X) {
      l(X), g();
    },
    get zoomActivationKey() {
      return u();
    },
    set zoomActivationKey(X) {
      u(X), g();
    },
    get paneClickDistance() {
      return d();
    },
    set paneClickDistance(X = 1) {
      d(X), g();
    },
    get nodeClickDistance() {
      return f();
    },
    set nodeClickDistance(X = 1) {
      f(X), g();
    },
    get onmovestart() {
      return p();
    },
    set onmovestart(X) {
      p(X), g();
    },
    get onmoveend() {
      return h();
    },
    set onmoveend(X) {
      h(X), g();
    },
    get onmove() {
      return y();
    },
    set onmove(X) {
      y(X), g();
    },
    get oninit() {
      return m();
    },
    set oninit(X) {
      m(X), g();
    },
    get onnodeclick() {
      return w();
    },
    set onnodeclick(X) {
      w(X), g();
    },
    get onnodecontextmenu() {
      return b();
    },
    set onnodecontextmenu(X) {
      b(X), g();
    },
    get onnodedrag() {
      return _();
    },
    set onnodedrag(X) {
      _(X), g();
    },
    get onnodedragstart() {
      return $();
    },
    set onnodedragstart(X) {
      $(X), g();
    },
    get onnodedragstop() {
      return x();
    },
    set onnodedragstop(X) {
      x(X), g();
    },
    get onnodepointerenter() {
      return C();
    },
    set onnodepointerenter(X) {
      C(X), g();
    },
    get onnodepointermove() {
      return S();
    },
    set onnodepointermove(X) {
      S(X), g();
    },
    get onnodepointerleave() {
      return M();
    },
    set onnodepointerleave(X) {
      M(X), g();
    },
    get onselectionclick() {
      return j();
    },
    set onselectionclick(X) {
      j(X), g();
    },
    get onselectioncontextmenu() {
      return L();
    },
    set onselectioncontextmenu(X) {
      L(X), g();
    },
    get onselectionstart() {
      return I();
    },
    set onselectionstart(X) {
      I(X), g();
    },
    get onselectionend() {
      return T();
    },
    set onselectionend(X) {
      T(X), g();
    },
    get onedgeclick() {
      return N();
    },
    set onedgeclick(X) {
      N(X), g();
    },
    get onedgecontextmenu() {
      return H();
    },
    set onedgecontextmenu(X) {
      H(X), g();
    },
    get onedgepointerenter() {
      return k();
    },
    set onedgepointerenter(X) {
      k(X), g();
    },
    get onedgepointerleave() {
      return P();
    },
    set onedgepointerleave(X) {
      P(X), g();
    },
    get onpaneclick() {
      return O();
    },
    set onpaneclick(X) {
      O(X), g();
    },
    get onpanecontextmenu() {
      return B();
    },
    set onpanecontextmenu(X) {
      B(X), g();
    },
    get panOnScrollMode() {
      return V();
    },
    set panOnScrollMode(X = pr.Free) {
      V(X), g();
    },
    get preventScrolling() {
      return F();
    },
    set preventScrolling(X = !0) {
      F(X), g();
    },
    get zoomOnScroll() {
      return K();
    },
    set zoomOnScroll(X = !0) {
      K(X), g();
    },
    get zoomOnDoubleClick() {
      return G();
    },
    set zoomOnDoubleClick(X = !0) {
      G(X), g();
    },
    get zoomOnPinch() {
      return ne();
    },
    set zoomOnPinch(X = !0) {
      ne(X), g();
    },
    get panOnScroll() {
      return q();
    },
    set panOnScroll(X = !1) {
      q(X), g();
    },
    get panOnScrollSpeed() {
      return z();
    },
    set panOnScrollSpeed(X = 0.5) {
      z(X), g();
    },
    get panOnDrag() {
      return Y();
    },
    set panOnDrag(X = !0) {
      Y(X), g();
    },
    get selectionOnDrag() {
      return W();
    },
    set selectionOnDrag(X = !1) {
      W(X), g();
    },
    get connectionLineComponent() {
      return te();
    },
    set connectionLineComponent(X) {
      te(X), g();
    },
    get connectionLineStyle() {
      return ee();
    },
    set connectionLineStyle(X) {
      ee(X), g();
    },
    get connectionLineContainerStyle() {
      return U();
    },
    set connectionLineContainerStyle(X) {
      U(X), g();
    },
    get connectionLineType() {
      return ce();
    },
    set connectionLineType(X = $n.Bezier) {
      ce(X), g();
    },
    get attributionPosition() {
      return se();
    },
    set attributionPosition(X) {
      se(X), g();
    },
    get children() {
      return ae();
    },
    set children(X) {
      ae(X), g();
    },
    get nodes() {
      return ie();
    },
    set nodes(X = []) {
      ie(X), g();
    },
    get edges() {
      return pe();
    },
    set edges(X = []) {
      pe(X), g();
    },
    get viewport() {
      return we();
    },
    set viewport(X = void 0) {
      we(X), g();
    }
  };
  return md(e, {
    get colorMode() {
      return ue.colorMode;
    },
    get width() {
      return n();
    },
    get height() {
      return r();
    },
    get rest() {
      return he;
    },
    get domNode() {
      return ue.domNode;
    },
    set domNode(X) {
      ue.domNode = X;
    },
    get clientWidth() {
      return ue.width;
    },
    set clientWidth(X) {
      ue.width = X;
    },
    get clientHeight() {
      return ue.height;
    },
    set clientHeight(X) {
      ue.height = X;
    },
    children: (X, Xe) => {
      var je = H0(), He = re(je);
      hd(He, {
        get selectionKey() {
          return i();
        },
        get deleteKey() {
          return s();
        },
        get panActivationKey() {
          return a();
        },
        get multiSelectionKey() {
          return l();
        },
        get zoomActivationKey() {
          return u();
        },
        get store() {
          return ue;
        },
        set store(Ue) {
          ue = Ue;
        }
      });
      var Pe = A(He, 2);
      ed(Pe, {
        get panOnScrollMode() {
          return V();
        },
        get preventScrolling() {
          return F();
        },
        get zoomOnScroll() {
          return K();
        },
        get zoomOnDoubleClick() {
          return G();
        },
        get zoomOnPinch() {
          return ne();
        },
        get panOnScroll() {
          return q();
        },
        get panOnScrollSpeed() {
          return z();
        },
        get panOnDrag() {
          return Y();
        },
        get paneClickDistance() {
          return d();
        },
        get selectionOnDrag() {
          return W();
        },
        get onmovestart() {
          return p();
        },
        get onmove() {
          return y();
        },
        get onmoveend() {
          return h();
        },
        get oninit() {
          return m();
        },
        get store() {
          return ue;
        },
        set store(Ue) {
          ue = Ue;
        },
        children: (Ue, ve) => {
          td(Ue, {
            get onpaneclick() {
              return O();
            },
            get onpanecontextmenu() {
              return B();
            },
            get onselectionstart() {
              return I();
            },
            get onselectionend() {
              return T();
            },
            get panOnDrag() {
              return Y();
            },
            get paneClickDistance() {
              return d();
            },
            get selectionOnDrag() {
              return W();
            },
            get store() {
              return ue;
            },
            set store(Le) {
              ue = Le;
            },
            children: (Le, Ie) => {
              var Ee = D0(), it = re(Ee);
              nd(it, {
                get store() {
                  return ue;
                },
                set store(Me) {
                  ue = Me;
                },
                children: (Me, et) => {
                  var Ct = N0(), cn = A(re(Ct), 2);
                  fd(cn, {
                    get onedgeclick() {
                      return N();
                    },
                    get onedgecontextmenu() {
                      return H();
                    },
                    get onedgepointerenter() {
                      return k();
                    },
                    get onedgepointerleave() {
                      return P();
                    },
                    get store() {
                      return ue;
                    },
                    set store(Tt) {
                      ue = Tt;
                    }
                  });
                  var St = A(cn, 4);
                  gd(St, {
                    get type() {
                      return ce();
                    },
                    get LineComponent() {
                      return te();
                    },
                    get containerStyle() {
                      return U();
                    },
                    get style() {
                      return ee();
                    },
                    get store() {
                      return ue;
                    },
                    set store(Tt) {
                      ue = Tt;
                    }
                  });
                  var $r = A(St, 2);
                  ld($r, {
                    get nodeClickDistance() {
                      return f();
                    },
                    get onnodeclick() {
                      return w();
                    },
                    get onnodecontextmenu() {
                      return b();
                    },
                    get onnodepointerenter() {
                      return C();
                    },
                    get onnodepointermove() {
                      return S();
                    },
                    get onnodepointerleave() {
                      return M();
                    },
                    get onnodedrag() {
                      return _();
                    },
                    get onnodedragstart() {
                      return $();
                    },
                    get onnodedragstop() {
                      return x();
                    },
                    get store() {
                      return ue;
                    },
                    set store(Tt) {
                      ue = Tt;
                    }
                  });
                  var sr = A($r, 2);
                  pd(sr, {
                    get onselectionclick() {
                      return j();
                    },
                    get onselectioncontextmenu() {
                      return L();
                    },
                    get onnodedrag() {
                      return _();
                    },
                    get onnodedragstart() {
                      return $();
                    },
                    get onnodedragstop() {
                      return x();
                    },
                    get store() {
                      return ue;
                    },
                    set store(Tt) {
                      ue = Tt;
                    }
                  }), me(2), D(Me, Ct);
                },
                $$slots: { default: !0 }
              });
              var xt = A(it, 2);
              {
                let Me = /* @__PURE__ */ E(() => !!(ue.selectionRect && ue.selectionRectMode === "user")), et = /* @__PURE__ */ E(() => ue.selectionRect?.width), Ct = /* @__PURE__ */ E(() => ue.selectionRect?.height), cn = /* @__PURE__ */ E(() => ue.selectionRect?.x), St = /* @__PURE__ */ E(() => ue.selectionRect?.y);
                ma(xt, {
                  get isVisible() {
                    return c(Me);
                  },
                  get width() {
                    return c(et);
                  },
                  get height() {
                    return c(Ct);
                  },
                  get x() {
                    return c(cn);
                  },
                  get y() {
                    return c(St);
                  }
                });
              }
              D(Le, Ee);
            },
            $$slots: { default: !0 }
          });
        },
        $$slots: { default: !0 }
      });
      var Ze = A(Pe, 2);
      vd(Ze, {
        get proOptions() {
          return o();
        },
        get position() {
          return se();
        }
      });
      var qe = A(Ze, 2);
      od(qe, {
        get store() {
          return ue;
        }
      });
      var Qe = A(qe, 2);
      tt(Qe, () => ae() ?? bt), D(X, je);
    },
    $$slots: { default: !0 }
  }), fe($e);
}
le(
  yd,
  {
    width: {},
    height: {},
    proOptions: {},
    selectionKey: {},
    deleteKey: {},
    panActivationKey: {},
    multiSelectionKey: {},
    zoomActivationKey: {},
    paneClickDistance: {},
    nodeClickDistance: {},
    onmovestart: {},
    onmoveend: {},
    onmove: {},
    oninit: {},
    onnodeclick: {},
    onnodecontextmenu: {},
    onnodedrag: {},
    onnodedragstart: {},
    onnodedragstop: {},
    onnodepointerenter: {},
    onnodepointermove: {},
    onnodepointerleave: {},
    onselectionclick: {},
    onselectioncontextmenu: {},
    onselectionstart: {},
    onselectionend: {},
    onedgeclick: {},
    onedgecontextmenu: {},
    onedgepointerenter: {},
    onedgepointerleave: {},
    onpaneclick: {},
    onpanecontextmenu: {},
    panOnScrollMode: {},
    preventScrolling: {},
    zoomOnScroll: {},
    zoomOnDoubleClick: {},
    zoomOnPinch: {},
    panOnScroll: {},
    panOnScrollSpeed: {},
    panOnDrag: {},
    selectionOnDrag: {},
    connectionLineComponent: {},
    connectionLineStyle: {},
    connectionLineContainerStyle: {},
    connectionLineType: {},
    attributionPosition: {},
    children: {},
    nodes: {},
    edges: {},
    viewport: {}
  },
  [],
  [],
  !0
);
function wd(e, t) {
  de(t, !0);
  let n = v(t, "children", 7), r = /* @__PURE__ */ Ne(Qc({ props: {}, nodes: [], edges: [] }));
  Tr(ki, {
    provider: !0,
    getStore() {
      return c(r);
    },
    setStore: (a) => {
      Q(r, a);
    }
  }), Po(() => {
    c(r).reset();
  });
  var o = {
    get children() {
      return n();
    },
    set children(a) {
      n(a), g();
    }
  }, i = Ce(), s = re(i);
  return tt(s, () => n() ?? bt), D(e, i), fe(o);
}
le(wd, { children: {} }, [], [], !0);
var O0 = /* @__PURE__ */ J("<button><!></button>");
function no(e, t) {
  de(t, !0);
  let n = v(t, "class", 7), r = v(t, "bgColor", 7), o = v(t, "bgColorHover", 7), i = v(t, "color", 7), s = v(t, "colorHover", 7), a = v(t, "borderColor", 7), l = v(t, "onclick", 7), u = v(t, "children", 7), d = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "class",
    "bgColor",
    "bgColorHover",
    "color",
    "colorHover",
    "borderColor",
    "onclick",
    "children"
  ]);
  var f = {
    get class() {
      return n();
    },
    set class(y) {
      n(y), g();
    },
    get bgColor() {
      return r();
    },
    set bgColor(y) {
      r(y), g();
    },
    get bgColorHover() {
      return o();
    },
    set bgColorHover(y) {
      o(y), g();
    },
    get color() {
      return i();
    },
    set color(y) {
      i(y), g();
    },
    get colorHover() {
      return s();
    },
    set colorHover(y) {
      s(y), g();
    },
    get borderColor() {
      return a();
    },
    set borderColor(y) {
      a(y), g();
    },
    get onclick() {
      return l();
    },
    set onclick(y) {
      l(y), g();
    },
    get children() {
      return u();
    },
    set children(y) {
      u(y), g();
    }
  }, p = O0();
  vt(p, () => ({
    type: "button",
    onclick: l(),
    class: ["svelte-flow__controls-button", n()],
    ...d,
    [pn]: {
      "--xy-controls-button-background-color-props": r(),
      "--xy-controls-button-background-color-hover-props": o(),
      "--xy-controls-button-color-props": i(),
      "--xy-controls-button-color-hover-props": s(),
      "--xy-controls-button-border-color-props": a()
    }
  }));
  var h = Z(p);
  return tt(h, () => u() ?? bt), R(p), D(e, p), fe(f);
}
le(
  no,
  {
    class: {},
    bgColor: {},
    bgColorHover: {},
    color: {},
    colorHover: {},
    borderColor: {},
    onclick: {},
    children: {}
  },
  [],
  [],
  !0
);
var M0 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z"></path></svg>');
function bd(e) {
  var t = M0();
  D(e, t);
}
le(bd, {}, [], [], !0);
var A0 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5"><path d="M0 0h32v4.2H0z"></path></svg>');
function xd(e) {
  var t = A0();
  D(e, t);
}
le(xd, {}, [], [], !0);
var T0 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30"><path d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z"></path></svg>');
function kd(e) {
  var t = T0();
  D(e, t);
}
le(kd, {}, [], [], !0);
var z0 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z"></path></svg>');
function _d(e) {
  var t = z0();
  D(e, t);
}
le(_d, {}, [], [], !0);
var V0 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32"><path d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z"></path></svg>');
function $d(e) {
  var t = V0();
  D(e, t);
}
le($d, {}, [], [], !0);
var L0 = /* @__PURE__ */ J("<!> <!>", 1), I0 = /* @__PURE__ */ J("<!> <!> <!> <!> <!> <!>", 1);
function Cd(e, t) {
  de(t, !0);
  let n = v(t, "position", 7, "bottom-left"), r = v(t, "orientation", 7, "vertical"), o = v(t, "showZoom", 7, !0), i = v(t, "showFitView", 7, !0), s = v(t, "showLock", 7, !0), a = v(t, "style", 7), l = v(t, "class", 7), u = v(t, "buttonBgColor", 7), d = v(t, "buttonBgColorHover", 7), f = v(t, "buttonColor", 7), p = v(t, "buttonColorHover", 7), h = v(t, "buttonBorderColor", 7), y = v(t, "fitViewOptions", 7), m = v(t, "children", 7), w = v(t, "before", 7), b = v(t, "after", 7), _ = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "position",
    "orientation",
    "showZoom",
    "showFitView",
    "showLock",
    "style",
    "class",
    "buttonBgColor",
    "buttonBgColorHover",
    "buttonColor",
    "buttonColorHover",
    "buttonBorderColor",
    "fitViewOptions",
    "children",
    "before",
    "after"
  ]), $ = /* @__PURE__ */ E(ln);
  const x = {
    bgColor: u(),
    bgColorHover: d(),
    color: f(),
    colorHover: p(),
    borderColor: h()
  };
  let C = /* @__PURE__ */ E(() => c($).nodesDraggable || c($).nodesConnectable || c($).elementsSelectable), S = /* @__PURE__ */ E(() => c($).viewport.zoom <= c($).minZoom), M = /* @__PURE__ */ E(() => c($).viewport.zoom >= c($).maxZoom), j = /* @__PURE__ */ E(() => c($).ariaLabelConfig), L = /* @__PURE__ */ E(() => r() === "horizontal" ? "horizontal" : "vertical");
  const I = () => {
    c($).zoomIn();
  }, T = () => {
    c($).zoomOut();
  }, N = () => {
    c($).fitView(y());
  }, H = () => {
    let P = !c(C);
    c($).nodesDraggable = P, c($).nodesConnectable = P, c($).elementsSelectable = P;
  };
  var k = {
    get position() {
      return n();
    },
    set position(P = "bottom-left") {
      n(P), g();
    },
    get orientation() {
      return r();
    },
    set orientation(P = "vertical") {
      r(P), g();
    },
    get showZoom() {
      return o();
    },
    set showZoom(P = !0) {
      o(P), g();
    },
    get showFitView() {
      return i();
    },
    set showFitView(P = !0) {
      i(P), g();
    },
    get showLock() {
      return s();
    },
    set showLock(P = !0) {
      s(P), g();
    },
    get style() {
      return a();
    },
    set style(P) {
      a(P), g();
    },
    get class() {
      return l();
    },
    set class(P) {
      l(P), g();
    },
    get buttonBgColor() {
      return u();
    },
    set buttonBgColor(P) {
      u(P), g();
    },
    get buttonBgColorHover() {
      return d();
    },
    set buttonBgColorHover(P) {
      d(P), g();
    },
    get buttonColor() {
      return f();
    },
    set buttonColor(P) {
      f(P), g();
    },
    get buttonColorHover() {
      return p();
    },
    set buttonColorHover(P) {
      p(P), g();
    },
    get buttonBorderColor() {
      return h();
    },
    set buttonBorderColor(P) {
      h(P), g();
    },
    get fitViewOptions() {
      return y();
    },
    set fitViewOptions(P) {
      y(P), g();
    },
    get children() {
      return m();
    },
    set children(P) {
      m(P), g();
    },
    get before() {
      return w();
    },
    set before(P) {
      w(P), g();
    },
    get after() {
      return b();
    },
    set after(P) {
      b(P), g();
    }
  };
  {
    let P = /* @__PURE__ */ E(() => [
      "svelte-flow__controls",
      c(L),
      l()
    ]);
    zo(e, Ge(
      {
        get class() {
          return c(P);
        },
        get position() {
          return n();
        },
        "data-testid": "svelte-flow__controls",
        get "aria-label"() {
          return c(j)["controls.ariaLabel"];
        },
        get style() {
          return a();
        }
      },
      () => _,
      {
        children: (O, B) => {
          var V = I0(), F = re(V);
          {
            var K = (se) => {
              var ae = Ce(), ie = re(ae);
              tt(ie, w), D(se, ae);
            };
            oe(F, (se) => {
              w() && se(K);
            });
          }
          var G = A(F, 2);
          {
            var ne = (se) => {
              var ae = L0(), ie = re(ae);
              no(ie, Ge(
                {
                  onclick: I,
                  class: "svelte-flow__controls-zoomin",
                  get title() {
                    return c(j)["controls.zoomIn.ariaLabel"];
                  },
                  get "aria-label"() {
                    return c(j)["controls.zoomIn.ariaLabel"];
                  },
                  get disabled() {
                    return c(M);
                  }
                },
                () => x,
                {
                  children: (we, he) => {
                    bd(we);
                  },
                  $$slots: { default: !0 }
                }
              ));
              var pe = A(ie, 2);
              no(pe, Ge(
                {
                  onclick: T,
                  class: "svelte-flow__controls-zoomout",
                  get title() {
                    return c(j)["controls.zoomOut.ariaLabel"];
                  },
                  get "aria-label"() {
                    return c(j)["controls.zoomOut.ariaLabel"];
                  },
                  get disabled() {
                    return c(S);
                  }
                },
                () => x,
                {
                  children: (we, he) => {
                    xd(we);
                  },
                  $$slots: { default: !0 }
                }
              )), D(se, ae);
            };
            oe(G, (se) => {
              o() && se(ne);
            });
          }
          var q = A(G, 2);
          {
            var z = (se) => {
              no(se, Ge(
                {
                  class: "svelte-flow__controls-fitview",
                  onclick: N,
                  get title() {
                    return c(j)["controls.fitView.ariaLabel"];
                  },
                  get "aria-label"() {
                    return c(j)["controls.fitView.ariaLabel"];
                  }
                },
                () => x,
                {
                  children: (ae, ie) => {
                    kd(ae);
                  },
                  $$slots: { default: !0 }
                }
              ));
            };
            oe(q, (se) => {
              i() && se(z);
            });
          }
          var Y = A(q, 2);
          {
            var W = (se) => {
              no(se, Ge(
                {
                  class: "svelte-flow__controls-interactive",
                  onclick: H,
                  get title() {
                    return c(j)["controls.interactive.ariaLabel"];
                  },
                  get "aria-label"() {
                    return c(j)["controls.interactive.ariaLabel"];
                  }
                },
                () => x,
                {
                  children: (ae, ie) => {
                    var pe = Ce(), we = re(pe);
                    {
                      var he = (ge) => {
                        $d(ge);
                      }, ue = (ge) => {
                        _d(ge);
                      };
                      oe(we, (ge) => {
                        c(C) ? ge(he) : ge(ue, !1);
                      });
                    }
                    D(ae, pe);
                  },
                  $$slots: { default: !0 }
                }
              ));
            };
            oe(Y, (se) => {
              s() && se(W);
            });
          }
          var te = A(Y, 2);
          {
            var ee = (se) => {
              var ae = Ce(), ie = re(ae);
              tt(ie, m), D(se, ae);
            };
            oe(te, (se) => {
              m() && se(ee);
            });
          }
          var U = A(te, 2);
          {
            var ce = (se) => {
              var ae = Ce(), ie = re(ae);
              tt(ie, b), D(se, ae);
            };
            oe(U, (se) => {
              b() && se(ce);
            });
          }
          D(O, V);
        },
        $$slots: { default: !0 }
      }
    ));
  }
  return fe(k);
}
le(
  Cd,
  {
    position: {},
    orientation: {},
    showZoom: {},
    showFitView: {},
    showLock: {},
    style: {},
    class: {},
    buttonBgColor: {},
    buttonBgColorHover: {},
    buttonColor: {},
    buttonColorHover: {},
    buttonBorderColor: {},
    fitViewOptions: {},
    children: {},
    before: {},
    after: {}
  },
  [],
  [],
  !0
);
var Nn;
(function(e) {
  e.Lines = "lines", e.Dots = "dots", e.Cross = "cross";
})(Nn || (Nn = {}));
var j0 = /* @__PURE__ */ ye("<circle></circle>");
function Sd(e, t) {
  de(t, !0);
  let n = v(t, "radius", 7), r = v(t, "class", 7);
  var o = {
    get radius() {
      return n();
    },
    set radius(s) {
      n(s), g();
    },
    get class() {
      return r();
    },
    set class(s) {
      r(s), g();
    }
  }, i = j0();
  return xe(() => {
    _e(i, "cx", n()), _e(i, "cy", n()), _e(i, "r", n()), ft(i, 0, Rn(["svelte-flow__background-pattern", "dots", r()]));
  }), D(e, i), fe(o);
}
le(Sd, { radius: {}, class: {} }, [], [], !0);
var R0 = /* @__PURE__ */ ye("<path></path>");
function Ed(e, t) {
  de(t, !0);
  let n = v(t, "lineWidth", 7), r = v(t, "dimensions", 7), o = v(t, "variant", 7), i = v(t, "class", 7);
  var s = {
    get lineWidth() {
      return n();
    },
    set lineWidth(l) {
      n(l), g();
    },
    get dimensions() {
      return r();
    },
    set dimensions(l) {
      r(l), g();
    },
    get variant() {
      return o();
    },
    set variant(l) {
      o(l), g();
    },
    get class() {
      return i();
    },
    set class(l) {
      i(l), g();
    }
  }, a = R0();
  return xe(() => {
    _e(a, "stroke-width", n()), _e(a, "d", `M${r()[0] / 2} 0 V${r()[1]} M0 ${r()[1] / 2} H${r()[0]}`), ft(a, 0, Rn(["svelte-flow__background-pattern", o(), i()]));
  }), D(e, a), fe(s);
}
le(Ed, { lineWidth: {}, dimensions: {}, variant: {}, class: {} }, [], [], !0);
const K0 = {
  [Nn.Dots]: 1,
  [Nn.Lines]: 1,
  [Nn.Cross]: 6
};
var Z0 = /* @__PURE__ */ ye('<svg data-testid="svelte-flow__background"><pattern patternUnits="userSpaceOnUse"><!></pattern><rect x="0" y="0" width="100%" height="100%"></rect></svg>');
function Pd(e, t) {
  de(t, !0);
  let n = v(t, "id", 7), r = v(t, "variant", 23, () => Nn.Dots), o = v(t, "gap", 7, 20), i = v(t, "size", 7), s = v(t, "lineWidth", 7, 1), a = v(t, "bgColor", 7), l = v(t, "patternColor", 7), u = v(t, "patternClass", 7), d = v(t, "class", 7), f = /* @__PURE__ */ E(ln), p = /* @__PURE__ */ E(() => r() === Nn.Dots), h = /* @__PURE__ */ E(() => r() === Nn.Cross), y = /* @__PURE__ */ E(() => Array.isArray(o()) ? o() : [o(), o()]), m = /* @__PURE__ */ E(() => `background-pattern-${c(f).flowId}-${n() ?? ""}`), w = /* @__PURE__ */ E(() => [
    c(y)[0] * c(f).viewport.zoom || 1,
    c(y)[1] * c(f).viewport.zoom || 1
  ]), b = /* @__PURE__ */ E(() => (i() ?? K0[r()]) * c(f).viewport.zoom), _ = /* @__PURE__ */ E(() => c(h) ? [c(b), c(b)] : c(w)), $ = /* @__PURE__ */ E(() => c(p) ? [c(b) / 2, c(b) / 2] : [
    c(_)[0] / 2,
    c(_)[1] / 2
  ]);
  var x = {
    get id() {
      return n();
    },
    set id(N) {
      n(N), g();
    },
    get variant() {
      return r();
    },
    set variant(N = Nn.Dots) {
      r(N), g();
    },
    get gap() {
      return o();
    },
    set gap(N = 20) {
      o(N), g();
    },
    get size() {
      return i();
    },
    set size(N) {
      i(N), g();
    },
    get lineWidth() {
      return s();
    },
    set lineWidth(N = 1) {
      s(N), g();
    },
    get bgColor() {
      return a();
    },
    set bgColor(N) {
      a(N), g();
    },
    get patternColor() {
      return l();
    },
    set patternColor(N) {
      l(N), g();
    },
    get patternClass() {
      return u();
    },
    set patternClass(N) {
      u(N), g();
    },
    get class() {
      return d();
    },
    set class(N) {
      d(N), g();
    }
  }, C = Z0();
  let S;
  var M = Z(C), j = Z(M);
  {
    var L = (N) => {
      {
        let H = /* @__PURE__ */ E(() => c(b) / 2);
        Sd(N, {
          get radius() {
            return c(H);
          },
          get class() {
            return u();
          }
        });
      }
    }, I = (N) => {
      Ed(N, {
        get dimensions() {
          return c(_);
        },
        get variant() {
          return r();
        },
        get lineWidth() {
          return s();
        },
        get class() {
          return u();
        }
      });
    };
    oe(j, (N) => {
      c(p) ? N(L) : N(I, !1);
    });
  }
  R(M);
  var T = A(M);
  return R(C), xe(() => {
    ft(C, 0, Rn([
      "svelte-flow__background",
      "svelte-flow__container",
      d()
    ])), S = gt(C, "", S, {
      "--xy-background-color-props": a(),
      "--xy-background-pattern-color-props": l()
    }), _e(M, "id", c(m)), _e(M, "x", c(f).viewport.x % c(w)[0]), _e(M, "y", c(f).viewport.y % c(w)[1]), _e(M, "width", c(w)[0]), _e(M, "height", c(w)[1]), _e(M, "patternTransform", `translate(-${c($)[0]},-${c($)[1]})`), _e(T, "fill", `url(#${c(m)})`);
  }), D(e, C), fe(x);
}
le(
  Pd,
  {
    id: {},
    variant: {},
    gap: {},
    size: {},
    lineWidth: {},
    bgColor: {},
    patternColor: {},
    patternClass: {},
    class: {}
  },
  [],
  [],
  !0
);
var B0 = /* @__PURE__ */ ye("<rect></rect>");
function Nd(e, t) {
  de(t, !0);
  let n = v(t, "id", 7), r = v(t, "x", 7), o = v(t, "y", 7), i = v(t, "width", 7), s = v(t, "height", 7), a = v(t, "borderRadius", 7, 5), l = v(t, "color", 7), u = v(t, "shapeRendering", 7), d = v(t, "strokeColor", 7), f = v(t, "strokeWidth", 7, 2), p = v(t, "selected", 7), h = v(t, "class", 7), y = v(t, "nodeComponent", 7);
  var m = {
    get id() {
      return n();
    },
    set id(x) {
      n(x), g();
    },
    get x() {
      return r();
    },
    set x(x) {
      r(x), g();
    },
    get y() {
      return o();
    },
    set y(x) {
      o(x), g();
    },
    get width() {
      return i();
    },
    set width(x) {
      i(x), g();
    },
    get height() {
      return s();
    },
    set height(x) {
      s(x), g();
    },
    get borderRadius() {
      return a();
    },
    set borderRadius(x = 5) {
      a(x), g();
    },
    get color() {
      return l();
    },
    set color(x) {
      l(x), g();
    },
    get shapeRendering() {
      return u();
    },
    set shapeRendering(x) {
      u(x), g();
    },
    get strokeColor() {
      return d();
    },
    set strokeColor(x) {
      d(x), g();
    },
    get strokeWidth() {
      return f();
    },
    set strokeWidth(x = 2) {
      f(x), g();
    },
    get selected() {
      return p();
    },
    set selected(x) {
      p(x), g();
    },
    get class() {
      return h();
    },
    set class(x) {
      h(x), g();
    },
    get nodeComponent() {
      return y();
    },
    set nodeComponent(x) {
      y(x), g();
    }
  }, w = Ce(), b = re(w);
  {
    var _ = (x) => {
      const C = /* @__PURE__ */ E(y);
      var S = Ce(), M = re(S);
      Ti(M, () => c(C), (j, L) => {
        L(j, {
          get id() {
            return n();
          },
          get x() {
            return r();
          },
          get y() {
            return o();
          },
          get width() {
            return i();
          },
          get height() {
            return s();
          },
          get borderRadius() {
            return a();
          },
          get class() {
            return h();
          },
          get color() {
            return l();
          },
          get shapeRendering() {
            return u();
          },
          get strokeColor() {
            return d();
          },
          get strokeWidth() {
            return f();
          },
          get selected() {
            return p();
          }
        });
      }), D(x, S);
    }, $ = (x) => {
      var C = B0();
      let S, M;
      xe(() => {
        S = ft(C, 0, Rn(["svelte-flow__minimap-node", h()]), null, S, { selected: p() }), _e(C, "x", r()), _e(C, "y", o()), _e(C, "rx", a()), _e(C, "ry", a()), _e(C, "width", i()), _e(C, "height", s()), _e(C, "shape-rendering", u()), M = gt(C, "", M, {
          fill: l(),
          stroke: d(),
          "stroke-width": f()
        });
      }), D(x, C);
    };
    oe(b, (x) => {
      y() ? x(_) : x($, !1);
    });
  }
  return D(e, w), fe(m);
}
le(
  Nd,
  {
    id: {},
    x: {},
    y: {},
    width: {},
    height: {},
    borderRadius: {},
    color: {},
    shapeRendering: {},
    strokeColor: {},
    strokeWidth: {},
    selected: {},
    class: {},
    nodeComponent: {}
  },
  [],
  [],
  !0
);
function Y0(e, t) {
  const n = Hm({
    domNode: e,
    panZoom: t.panZoom,
    getTransform: () => {
      const { viewport: o } = t.store;
      return [o.x, o.y, o.zoom];
    },
    getViewScale: t.getViewScale
  });
  n.update({
    translateExtent: t.translateExtent,
    width: t.width,
    height: t.height,
    inversePan: t.inversePan,
    zoomStep: t.zoomStep,
    pannable: t.pannable,
    zoomable: t.zoomable
  });
  function r(o) {
    n.update({
      translateExtent: o.translateExtent,
      width: o.width,
      height: o.height,
      inversePan: o.inversePan,
      zoomStep: o.zoomStep,
      pannable: o.pannable,
      zoomable: o.zoomable
    });
  }
  return {
    update: r,
    destroy() {
      n.destroy();
    }
  };
}
const ls = (e) => e instanceof Function ? e : () => e;
var q0 = /* @__PURE__ */ ye("<title> </title>"), X0 = /* @__PURE__ */ ye('<svg class="svelte-flow__minimap-svg" role="img"><!><!><path class="svelte-flow__minimap-mask" fill-rule="evenodd" pointer-events="none"></path></svg>'), F0 = /* @__PURE__ */ J('<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>', 1);
function Dd(e, t) {
  de(t, !0);
  let n = v(t, "position", 7, "bottom-right"), r = v(t, "ariaLabel", 7), o = v(t, "nodeStrokeColor", 7, "transparent"), i = v(t, "nodeColor", 7), s = v(t, "nodeClass", 7, ""), a = v(t, "nodeBorderRadius", 7, 5), l = v(t, "nodeStrokeWidth", 7, 2), u = v(t, "nodeComponent", 7), d = v(t, "bgColor", 7), f = v(t, "maskColor", 7), p = v(t, "maskStrokeColor", 7), h = v(t, "maskStrokeWidth", 7), y = v(t, "width", 7, 200), m = v(t, "height", 7, 150), w = v(t, "pannable", 7, !0), b = v(t, "zoomable", 7, !0), _ = v(t, "inversePan", 7), $ = v(t, "zoomStep", 7), x = v(t, "class", 7), C = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "position",
    "ariaLabel",
    "nodeStrokeColor",
    "nodeColor",
    "nodeClass",
    "nodeBorderRadius",
    "nodeStrokeWidth",
    "nodeComponent",
    "bgColor",
    "maskColor",
    "maskStrokeColor",
    "maskStrokeWidth",
    "width",
    "height",
    "pannable",
    "zoomable",
    "inversePan",
    "zoomStep",
    "class"
  ]), S = /* @__PURE__ */ E(ln), M = /* @__PURE__ */ E(() => c(S).ariaLabelConfig);
  const j = i() === void 0 ? void 0 : ls(i()), L = ls(o()), I = ls(s()), T = (
    // @ts-expect-error - TS doesn't know about chrome
    typeof window > "u" || window.chrome ? "crispEdges" : "geometricPrecision"
  );
  let N = /* @__PURE__ */ E(() => `svelte-flow__minimap-desc-${c(S).flowId}`), H = /* @__PURE__ */ E(() => ({
    x: -c(S).viewport.x / c(S).viewport.zoom,
    y: -c(S).viewport.y / c(S).viewport.zoom,
    width: c(S).width / c(S).viewport.zoom,
    height: c(S).height / c(S).viewport.zoom
  })), k = /* @__PURE__ */ E(() => $c(Oo(c(S).nodeLookup, { filter: (U) => !U.hidden }), c(H))), P = /* @__PURE__ */ E(() => c(k).width / y()), O = /* @__PURE__ */ E(() => c(k).height / m()), B = /* @__PURE__ */ E(() => Math.max(c(P), c(O))), V = /* @__PURE__ */ E(() => c(B) * y()), F = /* @__PURE__ */ E(() => c(B) * m()), K = /* @__PURE__ */ E(() => 5 * c(B)), G = /* @__PURE__ */ E(() => c(k).x - (c(V) - c(k).width) / 2 - c(K)), ne = /* @__PURE__ */ E(() => c(k).y - (c(F) - c(k).height) / 2 - c(K)), q = /* @__PURE__ */ E(() => c(V) + c(K) * 2), z = /* @__PURE__ */ E(() => c(F) + c(K) * 2);
  const Y = () => c(B);
  var W = {
    get position() {
      return n();
    },
    set position(U = "bottom-right") {
      n(U), g();
    },
    get ariaLabel() {
      return r();
    },
    set ariaLabel(U) {
      r(U), g();
    },
    get nodeStrokeColor() {
      return o();
    },
    set nodeStrokeColor(U = "transparent") {
      o(U), g();
    },
    get nodeColor() {
      return i();
    },
    set nodeColor(U) {
      i(U), g();
    },
    get nodeClass() {
      return s();
    },
    set nodeClass(U = "") {
      s(U), g();
    },
    get nodeBorderRadius() {
      return a();
    },
    set nodeBorderRadius(U = 5) {
      a(U), g();
    },
    get nodeStrokeWidth() {
      return l();
    },
    set nodeStrokeWidth(U = 2) {
      l(U), g();
    },
    get nodeComponent() {
      return u();
    },
    set nodeComponent(U) {
      u(U), g();
    },
    get bgColor() {
      return d();
    },
    set bgColor(U) {
      d(U), g();
    },
    get maskColor() {
      return f();
    },
    set maskColor(U) {
      f(U), g();
    },
    get maskStrokeColor() {
      return p();
    },
    set maskStrokeColor(U) {
      p(U), g();
    },
    get maskStrokeWidth() {
      return h();
    },
    set maskStrokeWidth(U) {
      h(U), g();
    },
    get width() {
      return y();
    },
    set width(U = 200) {
      y(U), g();
    },
    get height() {
      return m();
    },
    set height(U = 150) {
      m(U), g();
    },
    get pannable() {
      return w();
    },
    set pannable(U = !0) {
      w(U), g();
    },
    get zoomable() {
      return b();
    },
    set zoomable(U = !0) {
      b(U), g();
    },
    get inversePan() {
      return _();
    },
    set inversePan(U) {
      _(U), g();
    },
    get zoomStep() {
      return $();
    },
    set zoomStep(U) {
      $(U), g();
    },
    get class() {
      return x();
    },
    set class(U) {
      x(U), g();
    }
  }, te = F0(), ee = re(te);
  {
    let U = /* @__PURE__ */ E(() => ["svelte-flow__minimap", x()]);
    Rp(ee, () => ({ "--xy-minimap-background-color-props": d() })), zo(ee.lastChild, Ge(
      {
        get position() {
          return n();
        },
        get class() {
          return c(U);
        },
        "data-testid": "svelte-flow__minimap"
      },
      () => C,
      {
        children: (ce, se) => {
          var ae = Ce(), ie = re(ae);
          {
            var pe = (we) => {
              var he = X0();
              let ue;
              var ge = Z(he);
              {
                var $e = (je) => {
                  var He = q0(), Pe = Z(He, !0);
                  R(He), xe(() => {
                    _e(He, "id", c(N)), Re(Pe, r() ?? c(M)["minimap.ariaLabel"]);
                  }), D(je, He);
                };
                oe(ge, (je) => {
                  (r() ?? c(M)["minimap.ariaLabel"]) && je($e);
                });
              }
              var X = A(ge);
              at(X, 17, () => c(S).nodes, (je) => je.id, (je, He) => {
                const Pe = /* @__PURE__ */ E(() => c(S).nodeLookup.get(c(He).id));
                var Ze = Ce(), qe = re(Ze);
                {
                  var Qe = (Ue) => {
                    const ve = /* @__PURE__ */ E(() => or(c(Pe)));
                    {
                      let Le = /* @__PURE__ */ E(() => j?.(c(Pe))), Ie = /* @__PURE__ */ E(() => L(c(Pe))), Ee = /* @__PURE__ */ E(() => I(c(Pe)));
                      Nd(Ue, Ge(
                        {
                          get id() {
                            return c(Pe).id;
                          },
                          get x() {
                            return c(Pe).internals.positionAbsolute.x;
                          },
                          get y() {
                            return c(Pe).internals.positionAbsolute.y;
                          }
                        },
                        () => c(ve),
                        {
                          get selected() {
                            return c(Pe).selected;
                          },
                          get nodeComponent() {
                            return u();
                          },
                          get color() {
                            return c(Le);
                          },
                          get borderRadius() {
                            return a();
                          },
                          get strokeColor() {
                            return c(Ie);
                          },
                          get strokeWidth() {
                            return l();
                          },
                          get shapeRendering() {
                            return T;
                          },
                          get class() {
                            return c(Ee);
                          }
                        }
                      ));
                    }
                  };
                  oe(qe, (Ue) => {
                    c(Pe) && Cc(c(Pe)) && !c(Pe).hidden && Ue(Qe);
                  });
                }
                D(je, Ze);
              });
              var Xe = A(X);
              R(he), mt(he, (je, He) => Y0?.(je, He), () => ({
                store: c(S),
                panZoom: c(S).panZoom,
                getViewScale: Y,
                translateExtent: c(S).translateExtent,
                width: c(S).width,
                height: c(S).height,
                inversePan: _(),
                zoomStep: $(),
                pannable: w(),
                zoomable: b()
              })), xe(() => {
                _e(he, "width", y()), _e(he, "height", m()), _e(he, "viewBox", `${c(G) ?? ""} ${c(ne) ?? ""} ${c(q) ?? ""} ${c(z) ?? ""}`), _e(he, "aria-labelledby", c(N)), ue = gt(he, "", ue, {
                  "--xy-minimap-mask-background-color-props": f(),
                  "--xy-minimap-mask-stroke-color-props": p(),
                  "--xy-minimap-mask-stroke-width-props": h() ? h() * c(B) : void 0
                }), _e(Xe, "d", `M${c(G) - c(K)},${c(ne) - c(K)}h${c(q) + c(K) * 2}v${c(z) + c(K) * 2}h${-c(q) - c(K) * 2}z
      M${c(H).x ?? ""},${c(H).y ?? ""}h${c(H).width ?? ""}v${c(H).height ?? ""}h${-c(H).width}z`);
              }), D(we, he);
            };
            oe(ie, (we) => {
              c(S).panZoom && we(pe);
            });
          }
          D(ce, ae);
        },
        $$slots: { default: !0 }
      }
    )), R(ee);
  }
  return D(e, te), fe(W);
}
le(
  Dd,
  {
    position: {},
    ariaLabel: {},
    nodeStrokeColor: {},
    nodeColor: {},
    nodeClass: {},
    nodeBorderRadius: {},
    nodeStrokeWidth: {},
    nodeComponent: {},
    bgColor: {},
    maskColor: {},
    maskStrokeColor: {},
    maskStrokeWidth: {},
    width: {},
    height: {},
    pannable: {},
    zoomable: {},
    inversePan: {},
    zoomStep: {},
    class: {}
  },
  [],
  [],
  !0
);
var W0 = /* @__PURE__ */ J("<div><!></div>");
function Hd(e, t) {
  de(t, !0);
  let n = v(t, "nodeId", 7), r = v(t, "position", 23, () => be.Top), o = v(t, "align", 7, "center"), i = v(t, "offset", 7, 10), s = v(t, "isVisible", 7), a = v(t, "children", 7), l = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "nodeId",
    "position",
    "align",
    "offset",
    "isVisible",
    "children"
  ]);
  const u = ln(), { getNodesBounds: d } = ut(), f = Un("svelteflow__node_id");
  let p = /* @__PURE__ */ E(() => (u.nodes, (Array.isArray(n()) ? n() : [n() ?? f]).reduce(
    (C, S) => {
      const M = u.nodeLookup.get(S);
      return M && C.push(M), C;
    },
    []
  ))), h = /* @__PURE__ */ E(() => {
    const C = d(c(p));
    return C ? cm(C, u.viewport, r(), i(), o()) : "";
  }), y = /* @__PURE__ */ E(() => c(p).length === 0 ? 1 : Math.max(...c(p).map((C) => (C.internals.z || 5) + 1))), m = /* @__PURE__ */ E(() => u.nodes.filter((C) => C.selected).length), w = /* @__PURE__ */ E(() => typeof s() == "boolean" ? s() : c(p).length === 1 && c(p)[0].selected && c(m) === 1);
  var b = {
    get nodeId() {
      return n();
    },
    set nodeId(C) {
      n(C), g();
    },
    get position() {
      return r();
    },
    set position(C = be.Top) {
      r(C), g();
    },
    get align() {
      return o();
    },
    set align(C = "center") {
      o(C), g();
    },
    get offset() {
      return i();
    },
    set offset(C = 10) {
      i(C), g();
    },
    get isVisible() {
      return s();
    },
    set isVisible(C) {
      s(C), g();
    },
    get children() {
      return a();
    },
    set children(C) {
      a(C), g();
    }
  }, _ = Ce(), $ = re(_);
  {
    var x = (C) => {
      var S = W0();
      vt(
        S,
        (j, L) => ({
          class: "svelte-flow__node-toolbar",
          "data-id": j,
          ...l,
          [pn]: L
        }),
        [
          () => c(p).reduce((j, L) => `${j}${L.id} `, "").trim(),
          () => ({
            display: qc().value ? "none" : void 0,
            position: "absolute",
            transform: c(h),
            "z-index": c(y)
          })
        ]
      );
      var M = Z(S);
      tt(M, () => a() ?? bt), R(S), mt(S, (j, L) => Yc?.(j, L), () => "root"), D(C, S);
    };
    oe($, (C) => {
      u.domNode && c(w) && c(p) && C(x);
    });
  }
  return D(e, _), fe(b);
}
le(
  Hd,
  {
    nodeId: {},
    position: {},
    align: {},
    offset: {},
    isVisible: {},
    children: {}
  },
  [],
  [],
  !0
);
function Kn(e) {
  const t = /* @__PURE__ */ E(ln), n = /* @__PURE__ */ E(() => c(t).nodes), r = /* @__PURE__ */ E(() => c(t).nodeLookup);
  let o = [], i = !0;
  const s = /* @__PURE__ */ E(() => {
    c(n);
    const a = [], l = Array.isArray(e), u = l ? e : [e];
    for (const d of u) {
      const f = c(r).get(d)?.internals.userNode;
      f && a.push({ id: f.id, type: f.type, data: f.data });
    }
    return (!km(a, o) || i) && (o = a, i = !1), l ? o : o[0] ?? null;
  });
  return {
    get current() {
      return c(s);
    }
  };
}
const Cl = "tinyflow-component", G0 = [
  {
    value: "String",
    label: "String"
  },
  {
    value: "Number",
    label: "Number"
  },
  {
    value: "Boolean",
    label: "Boolean"
  },
  {
    value: "File",
    label: "File"
  },
  {
    value: "Object",
    label: "Object"
  },
  {
    value: "Array",
    label: "Array"
  }
], U0 = [
  {
    value: "ref",
    label: "引用"
  },
  {
    value: "fixed",
    label: "固定值"
  }
  // {
  //     value: 'input',
  //     label: '输入'
  // }
], ya = [
  { label: "文字", value: "text" },
  { label: "图片", value: "image" },
  { label: "视频", value: "video" },
  { label: "音频", value: "audio" },
  { label: "文件", value: "file" },
  { label: "其他", value: "other" }
], J0 = [
  { label: "单行输入框", value: "input" },
  { label: "多行输入框", value: "textarea" },
  { label: "下拉菜单", value: "select" },
  { label: "单选", value: "radio" },
  { label: "多选", value: "checkbox" }
], Q0 = [
  { label: "单选", value: "radio" },
  { label: "多选", value: "checkbox" }
], ey = () => {
  let e = /* @__PURE__ */ Ne([]), t = /* @__PURE__ */ Ne([]), n = /* @__PURE__ */ Ne({ x: 250, y: 100, zoom: 1 });
  return {
    // nodes: nodesInternal,
    // edges: edgesInternal,
    // viewport,
    init: (r, o) => {
      Q(e, r), Q(t, o);
    },
    getNodes: () => c(e),
    setNodes: (r) => {
      Q(e, r);
    },
    getEdges: () => c(t),
    setEdges: (r) => {
      Q(t, r);
    },
    getViewport: () => c(n),
    setViewport: (r) => {
      Q(n, r);
    },
    getNode: (r) => c(e).find((o) => o.id === r),
    addNode: (r) => {
      Q(e, [...c(e), r]);
    },
    removeNode: (r) => {
      Q(e, c(e).filter((o) => o.id !== r));
    },
    updateNode: (r, o) => {
      Q(e, c(e).map((i) => i.id === r ? { ...i, ...o } : i));
    },
    updateNodes: (r) => {
      Q(e, r(c(e)));
    },
    updateNodeData: (r, o) => {
      Q(e, c(e).map((i) => i.id === r ? {
        ...i,
        data: typeof o == "function" ? { ...i.data, ...o(i.data) } : { ...i.data, ...o }
      } : i));
    },
    selectNodeOnly: (r) => {
      Q(e, c(e).map((o) => o.id === r ? { ...o, selected: !0 } : { ...o, selected: !1 }));
    },
    getEdge: (r) => c(t).find((o) => o.id === r),
    addEdge: (r) => {
      Q(t, [...c(t), r]);
    },
    removeEdge: (r) => {
      Q(t, c(t).filter((o) => o.id !== r));
    },
    updateEdge: (r, o) => {
      Q(t, c(t).map((i) => i.id === r ? { ...i, ...o } : i));
    },
    updateEdges: (r) => {
      Q(t, r(c(t)));
    },
    updateEdgeData: (r, o) => {
      Q(t, c(t).map((i) => i.id === r ? { ...i, data: { ...i.data, ...o } } : i));
    }
  };
}, Ae = ey();
class ty {
  options;
  rootEl;
  svelteFlowInstance;
  constructor(t) {
    if (typeof t.element != "string" && !(t.element instanceof Element))
      throw new Error("element must be a string or Element");
    this._setOptions(t), this._init();
  }
  _init() {
    if (typeof this.options.element == "string") {
      if (this.rootEl = document.querySelector(this.options.element), !this.rootEl)
        throw new Error(
          `element not found by document.querySelector('${this.options.element}')`
        );
    } else if (this.options.element instanceof Element)
      this.rootEl = this.options.element;
    else
      throw new Error("element must be a string or Element");
    const t = document.createElement(Cl);
    t.style.display = "block", t.style.width = "100%", t.style.height = "100%", t.classList.add("tf-theme-light"), t.options = this.options, t.onInit = (n) => {
      this.svelteFlowInstance = n;
    }, this.rootEl.appendChild(t);
  }
  _setOptions(t) {
    this.options = {
      ...t
    };
  }
  getOptions() {
    return this.options;
  }
  getData() {
    const t = this.svelteFlowInstance.getNodes(), n = this.svelteFlowInstance.getEdges(), r = this.svelteFlowInstance.getViewport();
    return {
      nodes: t.map((o) => {
        const i = { ...o.data };
        return i.forms && Array.isArray(i.forms) && (i.forms = i.forms.map((s) => {
          const a = { ...s };
          for (const l in a)
            typeof a[l] == "function" && delete a[l];
          return a;
        })), {
          ...o,
          data: i
        };
      }),
      edges: n,
      viewport: r
    };
  }
  setData(t) {
    this.options.data = t;
    const n = document.createElement(Cl);
    n.style.display = "block", n.style.width = "100%", n.style.height = "100%", n.classList.add("tf-theme-light"), n.options = this.options, n.onInit = (r) => {
      this.svelteFlowInstance = r;
    }, this.destroy(), this.rootEl.appendChild(n);
  }
  destroy() {
    for (; this.rootEl.firstChild; )
      this.rootEl.removeChild(this.rootEl.firstChild);
  }
  /**
   * 更新单个节点的数据
   * @param id 节点ID
   * @param data 要更新的数据或更新函数
   */
  updateNodeData(t, n) {
    Ae.updateNodeData(t, n);
  }
  /**
   * 验证所有节点的表单必填字段
   * @returns 验证结果，包含成功状态和错误信息
   */
  validate() {
    if (!this.svelteFlowInstance)
      return {
        success: !1,
        errors: [{ message: "Tinyflow instance not initialized" }]
      };
    const t = this.svelteFlowInstance.getNodes(), n = [];
    return t.forEach((r) => {
      r.data.forms && Array.isArray(r.data.forms) && r.data.forms.forEach((o) => {
        if (o.required) {
          const i = o.name, s = o.label, a = r.data[i];
          (a == null || a === "") && n.push({
            nodeId: r.id,
            nodeTitle: r.data.title,
            fieldName: i,
            fieldLabel: s,
            message: `${s}是必填字段，请填写`
          });
        }
      });
    }), {
      success: n.length === 0,
      errors: n
    };
  }
}
var ny = /* @__PURE__ */ J("<button><!></button>");
function Te(e, t) {
  de(t, !0);
  const n = v(t, "children", 7), r = v(t, "primary", 7), o = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "children",
    "primary"
  ]);
  var i = {
    get children() {
      return n();
    },
    set children(l) {
      n(l), g();
    },
    get primary() {
      return r();
    },
    set primary(l) {
      r(l), g();
    }
  }, s = ny();
  vt(s, () => ({
    type: "button",
    ...o,
    class: `tf-btn ${r() ? "tf-btn-primary" : ""} nopan nodrag ${t.class ?? ""}`
  }));
  var a = Z(s);
  return tt(a, () => n() ?? bt), R(s), D(e, s), fe(i);
}
le(Te, { children: {}, primary: {} }, [], [], !0);
var ry = /* @__PURE__ */ J("<input/>");
function Od(e, t) {
  de(t, !0);
  const n = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host"]);
  var r = ry();
  vt(
    r,
    () => ({
      type: "checkbox",
      ...n,
      class: `tf-checkbox nopan nodrag ${t.class ?? ""}`
    }),
    void 0,
    void 0,
    void 0,
    void 0,
    !0
  ), D(e, r), fe();
}
le(Od, {}, [], [], !0);
var oy = /* @__PURE__ */ J('<div><input type="hidden"/> <!> <!></div>');
const iy = {
  hash: "svelte-1o3a23c",
  code: ".tf-chosen.svelte-1o3a23c {display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:5px;}"
};
function Md(e, t) {
  de(t, !0), Ke(e, iy);
  const n = v(t, "placeholder", 7), r = v(t, "label", 7), o = v(t, "value", 7), i = v(t, "buttonText", 7, "选择..."), s = v(t, "onChosen", 7), a = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "placeholder",
    "label",
    "value",
    "buttonText",
    "onChosen"
  ]);
  var l = {
    get placeholder() {
      return n();
    },
    set placeholder(h) {
      n(h), g();
    },
    get label() {
      return r();
    },
    set label(h) {
      r(h), g();
    },
    get value() {
      return o();
    },
    set value(h) {
      o(h), g();
    },
    get buttonText() {
      return i();
    },
    set buttonText(h = "选择...") {
      i(h), g();
    },
    get onChosen() {
      return s();
    },
    set onChosen(h) {
      s(h), g();
    }
  }, u = oy();
  vt(
    u,
    () => ({
      ...a,
      class: `tf-chosen nopan nodrag ${t.class ?? ""}`
    }),
    void 0,
    void 0,
    void 0,
    "svelte-1o3a23c"
  );
  var d = Z(u);
  Sn(d);
  var f = A(d, 2);
  rt(f, {
    get value() {
      return r();
    },
    get placeholder() {
      return n();
    },
    style: "flex-grow: 1;",
    disabled: !0
  });
  var p = A(f, 2);
  return Te(p, {
    onclick: (h) => {
      s()?.(o(), r(), h);
    },
    style: "padding: 3px",
    children: (h, y) => {
      me();
      var m = Se();
      xe(() => Re(m, i())), D(h, m);
    },
    $$slots: { default: !0 }
  }), R(u), xe(() => Uo(d, o())), D(e, u), fe(l);
}
le(
  Md,
  {
    placeholder: {},
    label: {},
    value: {},
    buttonText: {},
    onChosen: {}
  },
  [],
  [],
  !0
);
var sy = /* @__PURE__ */ J("<input/>");
function rt(e, t) {
  de(t, !0);
  const n = v(t, "type", 7, "text"), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "type"]);
  var o = {
    get type() {
      return n();
    },
    set type(s = "text") {
      n(s), g();
    }
  }, i = sy();
  return vt(
    i,
    () => ({
      type: n(),
      spellcheck: "false",
      ...r,
      class: `tf-input  nopan nodrag ${t.class ?? ""}`
    }),
    void 0,
    void 0,
    void 0,
    void 0,
    !0
  ), D(e, i), fe(o);
}
le(rt, { type: {} }, [], [], !0);
var ay = /* @__PURE__ */ J("<textarea></textarea>");
function Ye(e, t) {
  de(t, !0);
  const n = v(t, "value", 7), r = v(t, "height", 7), o = v(t, "autoHeight", 7, !0), i = v(t, "maxHeight", 7), s = v(t, "onHeightChange", 7), a = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "value",
    "height",
    "autoHeight",
    "maxHeight",
    "onHeightChange"
  ]);
  let l, u;
  function d() {
    if (l && o()) {
      if (r() !== void 0) {
        const w = typeof r() == "number" ? `${r()}px` : r();
        l.style.height = w, l.style.overflowY = "hidden", s()?.(w);
        return;
      }
      l.style.height = "auto", l.style.overflowY = "hidden";
      let m = l.scrollHeight;
      if (!u) {
        const w = t.rows || 1, b = getComputedStyle(l);
        u = parseFloat(b.fontSize) * 1.2 * w + parseFloat(b.paddingTop) + parseFloat(b.paddingBottom) + parseFloat(b.borderTopWidth);
      }
      if (m < u && (m = u), i()) {
        const w = typeof i() == "number" ? `${i()}px` : i();
        m > parseInt(w) ? (l.style.height = w, l.style.overflowY = "auto") : l.style.height = `${m}px`;
      } else
        l.style.height = `${m}px`;
      s()?.(l.style.height);
    }
  }
  Je(() => {
    d();
  });
  var f = {
    get value() {
      return n();
    },
    set value(m) {
      n(m), g();
    },
    get height() {
      return r();
    },
    set height(m) {
      r(m), g();
    },
    get autoHeight() {
      return o();
    },
    set autoHeight(m = !0) {
      o(m), g();
    },
    get maxHeight() {
      return i();
    },
    set maxHeight(m) {
      i(m), g();
    },
    get onHeightChange() {
      return s();
    },
    set onHeightChange(m) {
      s(m), g();
    }
  }, p = ay();
  yp(p);
  var h = (m) => {
    d(), t.oninput?.(m);
  }, y = (m) => {
    d(), t.onchange?.(m);
  };
  return vt(p, () => ({
    spellcheck: "false",
    ...a,
    oninput: h,
    onchange: y,
    class: `tf-textarea nodrag nowheel ${t.class ?? ""}`,
    value: n() || ""
  })), At(p, (m) => l = m, () => l), D(e, p), fe(f);
}
le(
  Ye,
  {
    value: {},
    height: {},
    autoHeight: {},
    maxHeight: {},
    onHeightChange: {}
  },
  [],
  [],
  !0
);
var ly = /* @__PURE__ */ J('<div role="button"><!></div>'), uy = /* @__PURE__ */ J("<div></div>");
function cy(e, t) {
  const n = ja(t, ["children", "$$slots", "$$events", "$$legacy", "$$host"]), r = ja(n, ["items", "onChange", "activeIndex"]);
  de(t, !1);
  let o = v(t, "items", 28, () => []), i = v(t, "onChange", 12, () => {
  }), s = v(t, "activeIndex", 12, 0);
  function a(d, f) {
    s(f), i()?.(d, f);
  }
  var l = {
    get items() {
      return o();
    },
    set items(d) {
      o(d), g();
    },
    get onChange() {
      return i();
    },
    set onChange(d) {
      i(d), g();
    },
    get activeIndex() {
      return s();
    },
    set activeIndex(d) {
      s(d), g();
    }
  };
  Ru();
  var u = uy();
  return vt(u, () => ({
    ...r,
    class: `tf-tabs ${Us(r), dt(() => r.class) ?? ""}`
  })), at(u, 5, o, Cn, (d, f, p) => {
    var h = ly();
    _e(h, "tabindex", p), h.__click = () => a(c(f), p), h.__keydown = (b) => {
      (b.key === "Enter" || b.key === " ") && (b.preventDefault(), a(c(f), p));
    };
    var y = Z(h);
    {
      var m = (b) => {
        var _ = Se();
        xe(() => Re(_, (c(f), dt(() => c(f).label)))), D(b, _);
      }, w = (b) => {
        var _ = Ce(), $ = re(_);
        tt($, () => (c(f), dt(() => c(f).label) ?? bt)), D(b, _);
      };
      oe(y, (b) => {
        c(f), dt(() => typeof c(f).label == "string") ? b(m) : b(w, !1);
      });
    }
    R(h), xe(() => ft(h, 1, `tf-tabs-item ${p === s() ? "active" : ""}`)), D(d, h);
  }), R(u), D(e, u), fe(l);
}
rr(["click", "keydown"]);
le(cy, { items: {}, onChange: {}, activeIndex: {} }, [], [], !0);
var dy = /* @__PURE__ */ J('<span class="tf-collapse-item-title-icon"><!></span>'), fy = /* @__PURE__ */ J('<div class="tf-collapse-item-description"><!></div>'), py = /* @__PURE__ */ J('<div class="tf-collapse-item-content svelte-ynwjxt"><!></div>'), hy = /* @__PURE__ */ J('<div class="tf-collapse-item"><div class="tf-collapse-item-title" role="button"><!> <!> <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg></span></div> <!> <!></div>'), gy = /* @__PURE__ */ J("<div></div>");
const vy = {
  hash: "svelte-ynwjxt",
  code: `
    /* 定义旋转的 CSS 类 */.rotate-90.svelte-ynwjxt {transform:rotate(90deg);transition:transform 0.3s ease;}
    
    /* 添加滚动条样式 */.tf-collapse-item-content.svelte-ynwjxt {padding:10px;transition:all 0.3s ease;}
    
    /* 自定义滚动条样式 - 完全隐藏滚动条 */.tf-collapse-item-content.svelte-ynwjxt {
        /* Firefox 隐藏滚动条 */scrollbar-width:none;}
    
    /* WebKit 浏览器完全隐藏滚动条 */.tf-collapse-item-content.svelte-ynwjxt::-webkit-scrollbar {
        /* 完全隐藏滚动条 */display:none;}.tf-collapse-item-content.svelte-ynwjxt::-webkit-scrollbar-track {display:none;}.tf-collapse-item-content.svelte-ynwjxt::-webkit-scrollbar-thumb {display:none;}`
};
function Ad(e, t) {
  de(t, !0), Ke(e, vy);
  let n = v(t, "items", 7), r = v(t, "onChange", 7), o = v(t, "activeKeys", 31, () => Pt([])), i = v(t, "maxHeight", 7, "500px");
  function s(u) {
    o().includes(u.key) ? o(o().filter((d) => d !== u.key)) : (o().push(u.key), o(o())), r()?.(u, o());
  }
  var a = {
    get items() {
      return n();
    },
    set items(u) {
      n(u), g();
    },
    get onChange() {
      return r();
    },
    set onChange(u) {
      r(u), g();
    },
    get activeKeys() {
      return o();
    },
    set activeKeys(u = []) {
      o(u), g();
    },
    get maxHeight() {
      return i();
    },
    set maxHeight(u = "500px") {
      i(u), g();
    }
  }, l = gy();
  return at(l, 21, n, Cn, (u, d, f) => {
    var p = hy(), h = Z(p);
    _e(h, "tabindex", f), h.__click = () => s(c(d)), h.__keydown = (S) => {
      (S.key === "Enter" || S.key === " ") && (S.preventDefault(), s(c(d)));
    };
    var y = Z(h);
    {
      var m = (S) => {
        var M = dy(), j = Z(M);
        qn(j, {
          get target() {
            return c(d).icon;
          }
        }), R(M), D(S, M);
      };
      oe(y, (S) => {
        c(d).icon && S(m);
      });
    }
    var w = A(y, 2);
    qn(w, {
      get target() {
        return c(d).title;
      }
    });
    var b = A(w, 2);
    R(h);
    var _ = A(h, 2);
    {
      var $ = (S) => {
        var M = fy(), j = Z(M);
        qn(j, {
          get target() {
            return c(d).description;
          }
        }), R(M), D(S, M);
      };
      oe(_, (S) => {
        c(d).description && S($);
      });
    }
    var x = A(_, 2);
    {
      var C = (S) => {
        var M = py(), j = Z(M);
        qn(j, {
          get target() {
            return c(d).content;
          }
        }), R(M), xe(() => gt(M, `max-height: ${i()}; overflow-y: overlay; overflow-x: hidden;`)), D(S, M);
      };
      oe(x, (S) => {
        o().includes(c(d).key) && S(C);
      });
    }
    R(p), xe((S) => ft(b, 1, `tf-collapse-item-title-arrow ${S ?? ""}`, "svelte-ynwjxt"), [
      () => o().includes(c(d).key) ? "rotate-90" : ""
    ]), D(u, p);
  }), R(l), xe(() => {
    gt(l, t.style), ft(l, 1, `tf-collapse ${t.class ?? ""}`, "svelte-ynwjxt");
  }), D(e, l), fe(a);
}
rr(["click", "keydown"]);
le(Ad, { items: {}, onChange: {}, activeKeys: {}, maxHeight: {} }, [], [], !0);
function qn(e, t) {
  de(t, !0);
  let n = v(t, "target", 7);
  typeof n() > "u" && n("undefined");
  var r = {
    get target() {
      return n();
    },
    set target(l) {
      n(l), g();
    }
  }, o = Ce(), i = re(o);
  {
    var s = (l) => {
      var u = Ce(), d = re(u);
      tt(d, () => n() ?? bt), D(l, u);
    }, a = (l) => {
      var u = Ce(), d = re(u);
      zu(d, n), D(l, u);
    };
    oe(i, (l) => {
      typeof n() == "function" ? l(s) : l(a, !1);
    });
  }
  return D(e, o), fe(r);
}
le(qn, { target: {} }, [], [], !0);
var my = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14L8 10H16L12 14Z"></path></svg>'), yy = /* @__PURE__ */ J('<div class="tf-select-content-children"><!></div>'), wy = /* @__PURE__ */ J('<button class="tf-select-content-item"><span><!></span> <!></button> <!>', 1), by = /* @__PURE__ */ J('<div class="tf-select-content nopan nodrag nowheel "><!></div>'), xy = /* @__PURE__ */ J("<!> <!>", 1), ky = /* @__PURE__ */ J('<div class="tf-select-input-placeholder"> </div>'), _y = /* @__PURE__ */ J('<button class="tf-select-input nopan nodrag"><div class="tf-select-input-value"></div> <div class="tf-select-input-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.9999 13.1714L16.9497 8.22168L18.3639 9.63589L11.9999 15.9999L5.63599 9.63589L7.0502 8.22168L11.9999 13.1714Z"></path></svg></div></button>'), $y = /* @__PURE__ */ J("<div><!></div>");
function pt(e, t) {
  de(t, !0);
  const n = (_, $ = bt) => {
    var x = Ce(), C = re(x);
    at(C, 19, $, (S, M) => `${M}_${S.value}`, (S, M) => {
      var j = wy(), L = re(j);
      L.__click = () => y(c(M));
      var I = Z(L), T = Z(I);
      {
        var N = (O) => {
          var B = my();
          D(O, B);
        };
        oe(T, (O) => {
          c(M).children && c(M).children.length > 0 && O(N);
        });
      }
      R(I);
      var H = A(I, 2);
      qn(H, {
        get target() {
          return c(M).label;
        }
      }), R(L);
      var k = A(L, 2);
      {
        var P = (O) => {
          var B = yy(), V = Z(B);
          n(V, () => c(M).children), R(B), D(O, B);
        };
        oe(k, (O) => {
          c(M).children && c(M).children.length > 0 && (a() || u().includes(c(M).value)) && O(P);
        });
      }
      D(S, j);
    }), D(_, x);
  };
  let r = v(t, "items", 7), o = v(t, "onSelect", 7), i = v(t, "value", 23, () => []), s = v(t, "defaultValue", 23, () => []), a = v(t, "expandAll", 7, !0), l = v(t, "multiple", 7, !1), u = v(t, "expandValue", 23, () => []), d = v(t, "placeholder", 7), f = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "items",
    "onSelect",
    "value",
    "defaultValue",
    "expandAll",
    "multiple",
    "expandValue",
    "placeholder"
  ]), p = /* @__PURE__ */ E(() => {
    const _ = [], $ = (x) => {
      for (let C of x)
        i().length > 0 ? i().includes(C.value) && _.push(C) : s().includes(C.value) && _.push(C), C.children && C.children.length > 0 && $(C.children);
    };
    return $(r()), _;
  }), h;
  function y(_) {
    h?.hide(), o()?.(_);
  }
  var m = {
    get items() {
      return r();
    },
    set items(_) {
      r(_), g();
    },
    get onSelect() {
      return o();
    },
    set onSelect(_) {
      o(_), g();
    },
    get value() {
      return i();
    },
    set value(_ = []) {
      i(_), g();
    },
    get defaultValue() {
      return s();
    },
    set defaultValue(_ = []) {
      s(_), g();
    },
    get expandAll() {
      return a();
    },
    set expandAll(_ = !0) {
      a(_), g();
    },
    get multiple() {
      return l();
    },
    set multiple(_ = !1) {
      l(_), g();
    },
    get expandValue() {
      return u();
    },
    set expandValue(_ = []) {
      u(_), g();
    },
    get placeholder() {
      return d();
    },
    set placeholder(_) {
      d(_), g();
    }
  }, w = $y(), b = Z(w);
  return At(
    ir(b, {
      floating: (_) => {
        var $ = by(), x = Z($);
        n(x, r), R($), D(_, $);
      },
      children: (_, $) => {
        var x = _y(), C = Z(x);
        at(
          C,
          23,
          () => c(p),
          (S, M) => `${M}_${S.value}`,
          (S, M, j) => {
            var L = Ce(), I = re(L);
            {
              var T = (H) => {
                var k = Ce(), P = re(k);
                {
                  var O = (B) => {
                    qn(B, {
                      get target() {
                        return c(M).label;
                      }
                    });
                  };
                  oe(P, (B) => {
                    c(j) === 0 && B(O);
                  });
                }
                D(H, k);
              }, N = (H) => {
                var k = xy(), P = re(k);
                qn(P, {
                  get target() {
                    return c(M).label;
                  }
                });
                var O = A(P, 2);
                {
                  var B = (V) => {
                    var F = Se(",");
                    D(V, F);
                  };
                  oe(O, (V) => {
                    c(j) < c(p).length - 1 && V(B);
                  });
                }
                D(H, k);
              };
              oe(I, (H) => {
                l() ? H(N, !1) : H(T);
              });
            }
            D(S, L);
          },
          (S) => {
            var M = ky(), j = Z(M, !0);
            R(M), xe(() => Re(j, d())), D(S, M);
          }
        ), R(C), me(2), R(x), D(_, x);
      },
      $$slots: { floating: !0, default: !0 }
    }),
    (_) => h = _,
    () => h
  ), R(w), xe(() => {
    ft(w, 1, `tf-select ${f.class ?? ""}`), gt(w, t.style);
  }), D(e, w), fe(m);
}
rr(["click"]);
le(
  pt,
  {
    items: {},
    onSelect: {},
    value: {},
    defaultValue: {},
    expandAll: {},
    multiple: {},
    expandValue: {},
    placeholder: {}
  },
  [],
  [],
  !0
);
const wo = Math.min, Or = Math.max, _i = Math.round, mn = (e) => ({
  x: e,
  y: e
}), Cy = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, Sy = {
  start: "end",
  end: "start"
};
function Ms(e, t, n) {
  return Or(e, wo(t, n));
}
function Vo(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function wr(e) {
  return e.split("-")[0];
}
function Lo(e) {
  return e.split("-")[1];
}
function Td(e) {
  return e === "x" ? "y" : "x";
}
function wa(e) {
  return e === "y" ? "height" : "width";
}
const Ey = /* @__PURE__ */ new Set(["top", "bottom"]);
function Xn(e) {
  return Ey.has(wr(e)) ? "y" : "x";
}
function ba(e) {
  return Td(Xn(e));
}
function Py(e, t, n) {
  n === void 0 && (n = !1);
  const r = Lo(e), o = ba(e), i = wa(o);
  let s = o === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[i] > t.floating[i] && (s = $i(s)), [s, $i(s)];
}
function Ny(e) {
  const t = $i(e);
  return [As(e), t, As(t)];
}
function As(e) {
  return e.replace(/start|end/g, (t) => Sy[t]);
}
const Sl = ["left", "right"], El = ["right", "left"], Dy = ["top", "bottom"], Hy = ["bottom", "top"];
function Oy(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? El : Sl : t ? Sl : El;
    case "left":
    case "right":
      return t ? Dy : Hy;
    default:
      return [];
  }
}
function My(e, t, n, r) {
  const o = Lo(e);
  let i = Oy(wr(e), n === "start", r);
  return o && (i = i.map((s) => s + "-" + o), t && (i = i.concat(i.map(As)))), i;
}
function $i(e) {
  return e.replace(/left|right|bottom|top/g, (t) => Cy[t]);
}
function Ay(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function zd(e) {
  return typeof e != "number" ? Ay(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Ci(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: o
  } = e;
  return {
    width: r,
    height: o,
    top: n,
    left: t,
    right: t + r,
    bottom: n + o,
    x: t,
    y: n
  };
}
function Pl(e, t, n) {
  let {
    reference: r,
    floating: o
  } = e;
  const i = Xn(t), s = ba(t), a = wa(s), l = wr(t), u = i === "y", d = r.x + r.width / 2 - o.width / 2, f = r.y + r.height / 2 - o.height / 2, p = r[a] / 2 - o[a] / 2;
  let h;
  switch (l) {
    case "top":
      h = {
        x: d,
        y: r.y - o.height
      };
      break;
    case "bottom":
      h = {
        x: d,
        y: r.y + r.height
      };
      break;
    case "right":
      h = {
        x: r.x + r.width,
        y: f
      };
      break;
    case "left":
      h = {
        x: r.x - o.width,
        y: f
      };
      break;
    default:
      h = {
        x: r.x,
        y: r.y
      };
  }
  switch (Lo(t)) {
    case "start":
      h[s] -= p * (n && u ? -1 : 1);
      break;
    case "end":
      h[s] += p * (n && u ? -1 : 1);
      break;
  }
  return h;
}
const Ty = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: o = "absolute",
    middleware: i = [],
    platform: s
  } = n, a = i.filter(Boolean), l = await (s.isRTL == null ? void 0 : s.isRTL(t));
  let u = await s.getElementRects({
    reference: e,
    floating: t,
    strategy: o
  }), {
    x: d,
    y: f
  } = Pl(u, r, l), p = r, h = {}, y = 0;
  for (let m = 0; m < a.length; m++) {
    const {
      name: w,
      fn: b
    } = a[m], {
      x: _,
      y: $,
      data: x,
      reset: C
    } = await b({
      x: d,
      y: f,
      initialPlacement: r,
      placement: p,
      strategy: o,
      middlewareData: h,
      rects: u,
      platform: s,
      elements: {
        reference: e,
        floating: t
      }
    });
    d = _ ?? d, f = $ ?? f, h = {
      ...h,
      [w]: {
        ...h[w],
        ...x
      }
    }, C && y <= 50 && (y++, typeof C == "object" && (C.placement && (p = C.placement), C.rects && (u = C.rects === !0 ? await s.getElementRects({
      reference: e,
      floating: t,
      strategy: o
    }) : C.rects), {
      x: d,
      y: f
    } = Pl(u, p, l)), m = -1);
  }
  return {
    x: d,
    y: f,
    placement: p,
    strategy: o,
    middlewareData: h
  };
};
async function Vd(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: o,
    platform: i,
    rects: s,
    elements: a,
    strategy: l
  } = e, {
    boundary: u = "clippingAncestors",
    rootBoundary: d = "viewport",
    elementContext: f = "floating",
    altBoundary: p = !1,
    padding: h = 0
  } = Vo(t, e), y = zd(h), m = a[p ? f === "floating" ? "reference" : "floating" : f], w = Ci(await i.getClippingRect({
    element: (n = await (i.isElement == null ? void 0 : i.isElement(m))) == null || n ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(a.floating)),
    boundary: u,
    rootBoundary: d,
    strategy: l
  })), b = f === "floating" ? {
    x: r,
    y: o,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(a.floating)), $ = await (i.isElement == null ? void 0 : i.isElement(_)) ? await (i.getScale == null ? void 0 : i.getScale(_)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, x = Ci(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: a,
    rect: b,
    offsetParent: _,
    strategy: l
  }) : b);
  return {
    top: (w.top - x.top + y.top) / $.y,
    bottom: (x.bottom - w.bottom + y.bottom) / $.y,
    left: (w.left - x.left + y.left) / $.x,
    right: (x.right - w.right + y.right) / $.x
  };
}
const zy = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: o,
      rects: i,
      platform: s,
      elements: a,
      middlewareData: l
    } = t, {
      element: u,
      padding: d = 0
    } = Vo(e, t) || {};
    if (u == null)
      return {};
    const f = zd(d), p = {
      x: n,
      y: r
    }, h = ba(o), y = wa(h), m = await s.getDimensions(u), w = h === "y", b = w ? "top" : "left", _ = w ? "bottom" : "right", $ = w ? "clientHeight" : "clientWidth", x = i.reference[y] + i.reference[h] - p[h] - i.floating[y], C = p[h] - i.reference[h], S = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(u));
    let M = S ? S[$] : 0;
    (!M || !await (s.isElement == null ? void 0 : s.isElement(S))) && (M = a.floating[$] || i.floating[y]);
    const j = x / 2 - C / 2, L = M / 2 - m[y] / 2 - 1, I = wo(f[b], L), T = wo(f[_], L), N = I, H = M - m[y] - T, k = M / 2 - m[y] / 2 + j, P = Ms(N, k, H), O = !l.arrow && Lo(o) != null && k !== P && i.reference[y] / 2 - (k < N ? I : T) - m[y] / 2 < 0, B = O ? k < N ? k - N : k - H : 0;
    return {
      [h]: p[h] + B,
      data: {
        [h]: P,
        centerOffset: k - P - B,
        ...O && {
          alignmentOffset: B
        }
      },
      reset: O
    };
  }
}), Vy = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: o,
        middlewareData: i,
        rects: s,
        initialPlacement: a,
        platform: l,
        elements: u
      } = t, {
        mainAxis: d = !0,
        crossAxis: f = !0,
        fallbackPlacements: p,
        fallbackStrategy: h = "bestFit",
        fallbackAxisSideDirection: y = "none",
        flipAlignment: m = !0,
        ...w
      } = Vo(e, t);
      if ((n = i.arrow) != null && n.alignmentOffset)
        return {};
      const b = wr(o), _ = Xn(a), $ = wr(a) === a, x = await (l.isRTL == null ? void 0 : l.isRTL(u.floating)), C = p || ($ || !m ? [$i(a)] : Ny(a)), S = y !== "none";
      !p && S && C.push(...My(a, m, y, x));
      const M = [a, ...C], j = await Vd(t, w), L = [];
      let I = ((r = i.flip) == null ? void 0 : r.overflows) || [];
      if (d && L.push(j[b]), f) {
        const k = Py(o, s, x);
        L.push(j[k[0]], j[k[1]]);
      }
      if (I = [...I, {
        placement: o,
        overflows: L
      }], !L.every((k) => k <= 0)) {
        var T, N;
        const k = (((T = i.flip) == null ? void 0 : T.index) || 0) + 1, P = M[k];
        if (P && (!(f === "alignment" && _ !== Xn(P)) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        I.every((B) => Xn(B.placement) === _ ? B.overflows[0] > 0 : !0)))
          return {
            data: {
              index: k,
              overflows: I
            },
            reset: {
              placement: P
            }
          };
        let O = (N = I.filter((B) => B.overflows[0] <= 0).sort((B, V) => B.overflows[1] - V.overflows[1])[0]) == null ? void 0 : N.placement;
        if (!O)
          switch (h) {
            case "bestFit": {
              var H;
              const B = (H = I.filter((V) => {
                if (S) {
                  const F = Xn(V.placement);
                  return F === _ || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  F === "y";
                }
                return !0;
              }).map((V) => [V.placement, V.overflows.filter((F) => F > 0).reduce((F, K) => F + K, 0)]).sort((V, F) => V[1] - F[1])[0]) == null ? void 0 : H[0];
              B && (O = B);
              break;
            }
            case "initialPlacement":
              O = a;
              break;
          }
        if (o !== O)
          return {
            reset: {
              placement: O
            }
          };
      }
      return {};
    }
  };
}, Ly = /* @__PURE__ */ new Set(["left", "top"]);
async function Iy(e, t) {
  const {
    placement: n,
    platform: r,
    elements: o
  } = e, i = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)), s = wr(n), a = Lo(n), l = Xn(n) === "y", u = Ly.has(s) ? -1 : 1, d = i && l ? -1 : 1, f = Vo(t, e);
  let {
    mainAxis: p,
    crossAxis: h,
    alignmentAxis: y
  } = typeof f == "number" ? {
    mainAxis: f,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: f.mainAxis || 0,
    crossAxis: f.crossAxis || 0,
    alignmentAxis: f.alignmentAxis
  };
  return a && typeof y == "number" && (h = a === "end" ? y * -1 : y), l ? {
    x: h * d,
    y: p * u
  } : {
    x: p * u,
    y: h * d
  };
}
const jy = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: o,
        y: i,
        placement: s,
        middlewareData: a
      } = t, l = await Iy(t, e);
      return s === ((n = a.offset) == null ? void 0 : n.placement) && (r = a.arrow) != null && r.alignmentOffset ? {} : {
        x: o + l.x,
        y: i + l.y,
        data: {
          ...l,
          placement: s
        }
      };
    }
  };
}, Ry = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: r,
        placement: o
      } = t, {
        mainAxis: i = !0,
        crossAxis: s = !1,
        limiter: a = {
          fn: (w) => {
            let {
              x: b,
              y: _
            } = w;
            return {
              x: b,
              y: _
            };
          }
        },
        ...l
      } = Vo(e, t), u = {
        x: n,
        y: r
      }, d = await Vd(t, l), f = Xn(wr(o)), p = Td(f);
      let h = u[p], y = u[f];
      if (i) {
        const w = p === "y" ? "top" : "left", b = p === "y" ? "bottom" : "right", _ = h + d[w], $ = h - d[b];
        h = Ms(_, h, $);
      }
      if (s) {
        const w = f === "y" ? "top" : "left", b = f === "y" ? "bottom" : "right", _ = y + d[w], $ = y - d[b];
        y = Ms(_, y, $);
      }
      const m = a.fn({
        ...t,
        [p]: h,
        [f]: y
      });
      return {
        ...m,
        data: {
          x: m.x - n,
          y: m.y - r,
          enabled: {
            [p]: i,
            [f]: s
          }
        }
      };
    }
  };
};
function Yi() {
  return typeof window < "u";
}
function Wr(e) {
  return Ld(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function jt(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Zn(e) {
  var t;
  return (t = (Ld(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Ld(e) {
  return Yi() ? e instanceof Node || e instanceof jt(e).Node : !1;
}
function rn(e) {
  return Yi() ? e instanceof Element || e instanceof jt(e).Element : !1;
}
function bn(e) {
  return Yi() ? e instanceof HTMLElement || e instanceof jt(e).HTMLElement : !1;
}
function Nl(e) {
  return !Yi() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof jt(e).ShadowRoot;
}
const Ky = /* @__PURE__ */ new Set(["inline", "contents"]);
function Io(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: o
  } = on(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && !Ky.has(o);
}
const Zy = /* @__PURE__ */ new Set(["table", "td", "th"]);
function By(e) {
  return Zy.has(Wr(e));
}
const Yy = [":popover-open", ":modal"];
function qi(e) {
  return Yy.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
const qy = ["transform", "translate", "scale", "rotate", "perspective"], Xy = ["transform", "translate", "scale", "rotate", "perspective", "filter"], Fy = ["paint", "layout", "strict", "content"];
function xa(e) {
  const t = ka(), n = rn(e) ? on(e) : e;
  return qy.some((r) => n[r] ? n[r] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || Xy.some((r) => (n.willChange || "").includes(r)) || Fy.some((r) => (n.contain || "").includes(r));
}
function Wy(e) {
  let t = er(e);
  for (; bn(t) && !Yr(t); ) {
    if (xa(t))
      return t;
    if (qi(t))
      return null;
    t = er(t);
  }
  return null;
}
function ka() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
const Gy = /* @__PURE__ */ new Set(["html", "body", "#document"]);
function Yr(e) {
  return Gy.has(Wr(e));
}
function on(e) {
  return jt(e).getComputedStyle(e);
}
function Xi(e) {
  return rn(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function er(e) {
  if (Wr(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Nl(e) && e.host || // Fallback.
    Zn(e)
  );
  return Nl(t) ? t.host : t;
}
function Id(e) {
  const t = er(e);
  return Yr(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : bn(t) && Io(t) ? t : Id(t);
}
function jd(e, t, n) {
  var r;
  t === void 0 && (t = []);
  const o = Id(e), i = o === ((r = e.ownerDocument) == null ? void 0 : r.body), s = jt(o);
  return i ? (Ts(s), t.concat(s, s.visualViewport || [], Io(o) ? o : [], [])) : t.concat(o, jd(o, []));
}
function Ts(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function Rd(e) {
  const t = on(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const o = bn(e), i = o ? e.offsetWidth : n, s = o ? e.offsetHeight : r, a = _i(n) !== i || _i(r) !== s;
  return a && (n = i, r = s), {
    width: n,
    height: r,
    $: a
  };
}
function Kd(e) {
  return rn(e) ? e : e.contextElement;
}
function Mr(e) {
  const t = Kd(e);
  if (!bn(t))
    return mn(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: o,
    $: i
  } = Rd(t);
  let s = (i ? _i(n.width) : n.width) / r, a = (i ? _i(n.height) : n.height) / o;
  return (!s || !Number.isFinite(s)) && (s = 1), (!a || !Number.isFinite(a)) && (a = 1), {
    x: s,
    y: a
  };
}
const Uy = /* @__PURE__ */ mn(0);
function Zd(e) {
  const t = jt(e);
  return !ka() || !t.visualViewport ? Uy : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Jy(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== jt(e) ? !1 : t;
}
function bo(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(), i = Kd(e);
  let s = mn(1);
  t && (r ? rn(r) && (s = Mr(r)) : s = Mr(e));
  const a = Jy(i, n, r) ? Zd(i) : mn(0);
  let l = (o.left + a.x) / s.x, u = (o.top + a.y) / s.y, d = o.width / s.x, f = o.height / s.y;
  if (i) {
    const p = jt(i), h = r && rn(r) ? jt(r) : r;
    let y = p, m = Ts(y);
    for (; m && r && h !== y; ) {
      const w = Mr(m), b = m.getBoundingClientRect(), _ = on(m), $ = b.left + (m.clientLeft + parseFloat(_.paddingLeft)) * w.x, x = b.top + (m.clientTop + parseFloat(_.paddingTop)) * w.y;
      l *= w.x, u *= w.y, d *= w.x, f *= w.y, l += $, u += x, y = jt(m), m = Ts(y);
    }
  }
  return Ci({
    width: d,
    height: f,
    x: l,
    y: u
  });
}
function Fi(e, t) {
  const n = Xi(e).scrollLeft;
  return t ? t.left + n : bo(Zn(e)).left + n;
}
function Bd(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - Fi(e, n), o = n.top + t.scrollTop;
  return {
    x: r,
    y: o
  };
}
function Qy(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: o
  } = e;
  const i = o === "fixed", s = Zn(r), a = t ? qi(t.floating) : !1;
  if (r === s || a && i)
    return n;
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  }, u = mn(1);
  const d = mn(0), f = bn(r);
  if ((f || !f && !i) && ((Wr(r) !== "body" || Io(s)) && (l = Xi(r)), bn(r))) {
    const h = bo(r);
    u = Mr(r), d.x = h.x + r.clientLeft, d.y = h.y + r.clientTop;
  }
  const p = s && !f && !i ? Bd(s, l) : mn(0);
  return {
    width: n.width * u.x,
    height: n.height * u.y,
    x: n.x * u.x - l.scrollLeft * u.x + d.x + p.x,
    y: n.y * u.y - l.scrollTop * u.y + d.y + p.y
  };
}
function ew(e) {
  return Array.from(e.getClientRects());
}
function tw(e) {
  const t = Zn(e), n = Xi(e), r = e.ownerDocument.body, o = Or(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth), i = Or(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let s = -n.scrollLeft + Fi(e);
  const a = -n.scrollTop;
  return on(r).direction === "rtl" && (s += Or(t.clientWidth, r.clientWidth) - o), {
    width: o,
    height: i,
    x: s,
    y: a
  };
}
const Dl = 25;
function nw(e, t) {
  const n = jt(e), r = Zn(e), o = n.visualViewport;
  let i = r.clientWidth, s = r.clientHeight, a = 0, l = 0;
  if (o) {
    i = o.width, s = o.height;
    const d = ka();
    (!d || d && t === "fixed") && (a = o.offsetLeft, l = o.offsetTop);
  }
  const u = Fi(r);
  if (u <= 0) {
    const d = r.ownerDocument, f = d.body, p = getComputedStyle(f), h = d.compatMode === "CSS1Compat" && parseFloat(p.marginLeft) + parseFloat(p.marginRight) || 0, y = Math.abs(r.clientWidth - f.clientWidth - h);
    y <= Dl && (i -= y);
  } else u <= Dl && (i += u);
  return {
    width: i,
    height: s,
    x: a,
    y: l
  };
}
const rw = /* @__PURE__ */ new Set(["absolute", "fixed"]);
function ow(e, t) {
  const n = bo(e, !0, t === "fixed"), r = n.top + e.clientTop, o = n.left + e.clientLeft, i = bn(e) ? Mr(e) : mn(1), s = e.clientWidth * i.x, a = e.clientHeight * i.y, l = o * i.x, u = r * i.y;
  return {
    width: s,
    height: a,
    x: l,
    y: u
  };
}
function Hl(e, t, n) {
  let r;
  if (t === "viewport")
    r = nw(e, n);
  else if (t === "document")
    r = tw(Zn(e));
  else if (rn(t))
    r = ow(t, n);
  else {
    const o = Zd(e);
    r = {
      x: t.x - o.x,
      y: t.y - o.y,
      width: t.width,
      height: t.height
    };
  }
  return Ci(r);
}
function Yd(e, t) {
  const n = er(e);
  return n === t || !rn(n) || Yr(n) ? !1 : on(n).position === "fixed" || Yd(n, t);
}
function iw(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = jd(e, []).filter((a) => rn(a) && Wr(a) !== "body"), o = null;
  const i = on(e).position === "fixed";
  let s = i ? er(e) : e;
  for (; rn(s) && !Yr(s); ) {
    const a = on(s), l = xa(s);
    !l && a.position === "fixed" && (o = null), (i ? !l && !o : !l && a.position === "static" && o && rw.has(o.position) || Io(s) && !l && Yd(e, s)) ? r = r.filter((u) => u !== s) : o = a, s = er(s);
  }
  return t.set(e, r), r;
}
function sw(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: o
  } = e;
  const i = [...n === "clippingAncestors" ? qi(t) ? [] : iw(t, this._c) : [].concat(n), r], s = i[0], a = i.reduce((l, u) => {
    const d = Hl(t, u, o);
    return l.top = Or(d.top, l.top), l.right = wo(d.right, l.right), l.bottom = wo(d.bottom, l.bottom), l.left = Or(d.left, l.left), l;
  }, Hl(t, s, o));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top
  };
}
function aw(e) {
  const {
    width: t,
    height: n
  } = Rd(e);
  return {
    width: t,
    height: n
  };
}
function lw(e, t, n) {
  const r = bn(t), o = Zn(t), i = n === "fixed", s = bo(e, !0, i, t);
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const l = mn(0);
  function u() {
    l.x = Fi(o);
  }
  if (r || !r && !i)
    if ((Wr(t) !== "body" || Io(o)) && (a = Xi(t)), r) {
      const h = bo(t, !0, i, t);
      l.x = h.x + t.clientLeft, l.y = h.y + t.clientTop;
    } else o && u();
  i && !r && o && u();
  const d = o && !r && !i ? Bd(o, a) : mn(0), f = s.left + a.scrollLeft - l.x - d.x, p = s.top + a.scrollTop - l.y - d.y;
  return {
    x: f,
    y: p,
    width: s.width,
    height: s.height
  };
}
function us(e) {
  return on(e).position === "static";
}
function Ol(e, t) {
  if (!bn(e) || on(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return Zn(e) === n && (n = n.ownerDocument.body), n;
}
function qd(e, t) {
  const n = jt(e);
  if (qi(e))
    return n;
  if (!bn(e)) {
    let o = er(e);
    for (; o && !Yr(o); ) {
      if (rn(o) && !us(o))
        return o;
      o = er(o);
    }
    return n;
  }
  let r = Ol(e, t);
  for (; r && By(r) && us(r); )
    r = Ol(r, t);
  return r && Yr(r) && us(r) && !xa(r) ? n : r || Wy(e) || n;
}
const uw = async function(e) {
  const t = this.getOffsetParent || qd, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: lw(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function cw(e) {
  return on(e).direction === "rtl";
}
const dw = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Qy,
  getDocumentElement: Zn,
  getClippingRect: sw,
  getOffsetParent: qd,
  getElementRects: uw,
  getClientRects: ew,
  getDimensions: aw,
  getScale: Mr,
  isElement: rn,
  isRTL: cw
}, fw = jy, pw = Ry, hw = Vy, gw = zy, vw = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), o = {
    platform: dw,
    ...n
  }, i = {
    ...o.platform,
    _c: r
  };
  return Ty(e, t, {
    ...o,
    platform: i
  });
}, mw = ({
  trigger: e,
  triggerEvent: t,
  floatContent: n,
  placement: r = "bottom",
  offsetOptions: o,
  flipOptions: i,
  shiftOptions: s,
  interactive: a,
  showArrow: l
}) => {
  if (typeof e == "string") {
    const b = document.querySelector(e);
    if (b)
      e = b;
    else
      throw new Error("element not found by document.querySelector('" + e + "')");
  }
  let u;
  if (typeof n == "string") {
    const b = document.querySelector(n);
    if (b)
      u = b;
    else
      throw new Error("element not found by document.querySelector('" + n + "')");
  } else
    u = n;
  let d;
  l && (d = document.createElement("div"), d.style.position = "absolute", d.style.backgroundColor = "#222", d.style.width = "8px", d.style.height = "8px", d.style.transform = "rotate(45deg)", d.style.display = "none", u.firstElementChild.before(d));
  function f() {
    vw(e, u, {
      placement: r,
      middleware: [
        fw(o),
        // 手动偏移配置
        hw(i),
        //自动翻转
        pw(s),
        //自动偏移（使得浮动元素能够进入视野）
        ...l ? [gw({ element: d })] : []
      ]
    }).then(({ x: b, y: _, placement: $, middlewareData: x }) => {
      if (Object.assign(u.style, {
        left: `${b}px`,
        top: `${_}px`
      }), l) {
        const { x: C, y: S } = x.arrow, M = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right"
        }[$.split("-")[0]];
        Object.assign(d.style, {
          zIndex: -1,
          left: C != null ? `${C}px` : "",
          top: S != null ? `${S}px` : "",
          right: "",
          bottom: "",
          [M]: "2px"
        });
      }
    });
  }
  let p = !1;
  function h() {
    u.style.display = "block", u.style.visibility = "block", u.style.position = "absolute", l && (d.style.display = "block"), p = !0, f();
  }
  function y() {
    u.style.display = "none", l && (d.style.display = "none"), p = !1;
  }
  function m(b) {
    b.stopPropagation(), p ? y() : h();
  }
  function w(b) {
    u.contains(b.target) || y();
  }
  return (!t || t.length == 0) && (t = ["click"]), t.forEach((b) => {
    e.addEventListener(b, m);
  }), document.addEventListener("click", w), {
    destroy() {
      t.forEach((b) => {
        e.removeEventListener(b, m);
      }), document.removeEventListener("click", w);
    },
    hide() {
      y();
    },
    isVisible() {
      return p;
    }
  };
};
var yw = /* @__PURE__ */ J('<div style="position: relative"><div><!></div> <div style="display: none; width: 100%;z-index: 9999"><!></div></div>');
function ir(e, t) {
  de(t, !0);
  const n = v(t, "children", 7), r = v(t, "floating", 7), o = v(t, "placement", 7, "bottom");
  let i, s, a;
  jn(() => (a = mw({
    trigger: i,
    floatContent: s,
    interactive: !0,
    placement: o()
  }), () => {
    a.destroy();
  }));
  function l() {
    a.hide();
  }
  var u = {
    hide: l,
    get children() {
      return n();
    },
    set children(m) {
      n(m), g();
    },
    get floating() {
      return r();
    },
    set floating(m) {
      r(m), g();
    },
    get placement() {
      return o();
    },
    set placement(m = "bottom") {
      o(m), g();
    }
  }, d = yw(), f = Z(d), p = Z(f);
  tt(p, n), R(f), At(f, (m) => i = m, () => i);
  var h = A(f, 2), y = Z(h);
  return tt(y, r), R(h), At(h, (m) => s = m, () => s), R(d), D(e, d), fe(u);
}
le(ir, { children: {}, floating: {}, placement: {} }, [], ["hide"], !0);
function ze(e, t) {
  de(t, !0);
  const n = v(t, "children", 7), r = v(t, "level", 7, 1), o = v(t, "mt", 7), i = v(t, "mb", 7);
  var s = {
    get children() {
      return n();
    },
    set children(u) {
      n(u), g();
    },
    get level() {
      return r();
    },
    set level(u = 1) {
      r(u), g();
    },
    get mt() {
      return o();
    },
    set mt(u) {
      o(u), g();
    },
    get mb() {
      return i();
    },
    set mb(u) {
      i(u), g();
    }
  }, a = Ce(), l = re(a);
  return Kp(l, () => `h${r()}`, !1, (u, d) => {
    vt(u, () => ({
      class: "tf-heading",
      style: `margin-top:${o() || "0"};margin-bottom:${i() || "0"}`
    }));
    var f = Ce(), p = re(f);
    tt(p, () => n() ?? bt), D(d, f);
  }), D(e, a), fe(s);
}
le(ze, { children: {}, level: {}, mt: {}, mb: {} }, [], [], !0);
var ww = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="svelte-1q3h954"><path d="M4.5 10.5C3.675 10.5 3 11.175 3 12C3 12.825 3.675 13.5 4.5 13.5C5.325 13.5 6 12.825 6 12C6 11.175 5.325 10.5 4.5 10.5ZM19.5 10.5C18.675 10.5 18 11.175 18 12C18 12.825 18.675 13.5 19.5 13.5C20.325 13.5 21 12.825 21 12C21 11.175 20.325 10.5 19.5 10.5ZM12 10.5C11.175 10.5 10.5 11.175 10.5 12C10.5 12.825 11.175 13.5 12 13.5C12.825 13.5 13.5 12.825 13.5 12C13.5 11.175 12.825 10.5 12 10.5Z" class="svelte-1q3h954"></path></svg>');
const bw = {
  hash: "svelte-1q3h954",
  code: ".input-btn-more {border:1px solid transparent;padding:3px;&:hover {background:#eee;border:1px solid transparent;}}"
};
function jo(e, t) {
  de(t, !0), Ke(e, bw);
  const n = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host"]);
  Te(e, Ge(() => n, {
    get class() {
      return `input-btn-more ${t.class ?? ""}`;
    },
    children: (r, o) => {
      var i = ww();
      D(r, i);
    },
    $$slots: { default: !0 }
  })), fe();
}
le(jo, {}, [], [], !0);
const xw = () => ({ deleteNode: (e) => {
  Ae.removeNode(e), Ae.updateEdges((t) => t.filter((n) => n.source !== e && n.target !== e));
} }), zn = (e = 16) => {
  const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", n = new Uint8Array(e);
  return crypto.getRandomValues(n), Array.from(n, (r) => t[r % t.length]).join("");
}, kw = () => ({ copyNode: (e) => {
  const t = Ae.getNode(e);
  if (t) {
    const n = zn(), r = {
      ...t,
      id: n,
      position: { x: t.position.x + 50, y: t.position.y + 50 }
    };
    Ae.updateNodes((o) => [...o.map((i) => ({ ...i, selected: !1 })), r]);
  }
} }), nt = () => Un("svelteflow__node_id"), Mn = () => Un("tinyflow_options");
var _w = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>'), $w = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path></svg>'), Cw = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 18.3915V5.60846L18.2264 12L8 18.3915ZM6 3.80421V20.1957C6 20.9812 6.86395 21.46 7.53 21.0437L20.6432 12.848C21.2699 12.4563 21.2699 11.5436 20.6432 11.152L7.53 2.95621C6.86395 2.53993 6 3.01878 6 3.80421Z"></path></svg>'), Sw = /* @__PURE__ */ J('<div class="input-item svelte-ana6zl">执行条件： <!></div>'), Ew = /* @__PURE__ */ J('<div class="input-item svelte-ana6zl">循环间隔时间（单位：毫秒）： <!></div> <div class="input-item svelte-ana6zl">最大循环次数（0 表示不限制）： <!></div> <div class="input-item svelte-ana6zl">退出条件： <!></div>', 1), Pw = /* @__PURE__ */ J('<div class="input-item svelte-ana6zl">错误重试间隔时间（单位：毫秒）： <!></div> <div class="input-item svelte-ana6zl">最大重试次数： <!></div> <label class="input-item-inline svelte-ana6zl"><span>正常后重置重试次数记录：</span> <input type="checkbox"/></label>', 1), Nw = /* @__PURE__ */ J('<div class="settings svelte-ana6zl"><div class="input-item svelte-ana6zl">节点名称： <!></div> <div class="input-item svelte-ana6zl">参数描述： <!></div> <!> <label class="input-item-inline svelte-ana6zl"><span>异步执行：</span> <input type="checkbox"/></label> <label class="input-item-inline svelte-ana6zl"><span>循环执行：</span> <input type="checkbox"/></label> <!> <label class="input-item-inline svelte-ana6zl"><span>错误重试：</span> <input type="checkbox"/></label> <!></div>'), Dw = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.33946 17.0002C2.90721 16.2515 2.58277 15.4702 2.36133 14.6741C3.3338 14.1779 3.99972 13.1668 3.99972 12.0002C3.99972 10.8345 3.3348 9.824 2.36353 9.32741C2.81025 7.71651 3.65857 6.21627 4.86474 4.99001C5.7807 5.58416 6.98935 5.65534 7.99972 5.072C9.01009 4.48866 9.55277 3.40635 9.4962 2.31604C11.1613 1.8846 12.8847 1.90004 14.5031 2.31862C14.4475 3.40806 14.9901 4.48912 15.9997 5.072C17.0101 5.65532 18.2187 5.58416 19.1346 4.99007C19.7133 5.57986 20.2277 6.25151 20.66 7.00021C21.0922 7.7489 21.4167 8.53025 21.6381 9.32628C20.6656 9.82247 19.9997 10.8336 19.9997 12.0002C19.9997 13.166 20.6646 14.1764 21.6359 14.673C21.1892 16.2839 20.3409 17.7841 19.1347 19.0104C18.2187 18.4163 17.0101 18.3451 15.9997 18.9284C14.9893 19.5117 14.4467 20.5941 14.5032 21.6844C12.8382 22.1158 11.1148 22.1004 9.49633 21.6818C9.55191 20.5923 9.00929 19.5113 7.99972 18.9284C6.98938 18.3451 5.78079 18.4162 4.86484 19.0103C4.28617 18.4205 3.77172 17.7489 3.33946 17.0002ZM8.99972 17.1964C10.0911 17.8265 10.8749 18.8227 11.2503 19.9659C11.7486 20.0133 12.2502 20.014 12.7486 19.9675C13.1238 18.8237 13.9078 17.8268 14.9997 17.1964C16.0916 16.5659 17.347 16.3855 18.5252 16.6324C18.8146 16.224 19.0648 15.7892 19.2729 15.334C18.4706 14.4373 17.9997 13.2604 17.9997 12.0002C17.9997 10.74 18.4706 9.5632 19.2729 8.6665C19.1688 8.4405 19.0538 8.21822 18.9279 8.00021C18.802 7.78219 18.667 7.57148 18.5233 7.36842C17.3457 7.61476 16.0911 7.43414 14.9997 6.80405C13.9083 6.17395 13.1246 5.17768 12.7491 4.03455C12.2509 3.98714 11.7492 3.98646 11.2509 4.03292C10.8756 5.17671 10.0916 6.17364 8.99972 6.80405C7.9078 7.43447 6.65245 7.61494 5.47428 7.36803C5.18485 7.77641 4.93463 8.21117 4.72656 8.66637C5.52881 9.56311 5.99972 10.74 5.99972 12.0002C5.99972 13.2604 5.52883 14.4372 4.72656 15.3339C4.83067 15.5599 4.94564 15.7822 5.07152 16.0002C5.19739 16.2182 5.3324 16.4289 5.47612 16.632C6.65377 16.3857 7.90838 16.5663 8.99972 17.1964ZM11.9997 15.0002C10.3429 15.0002 8.99972 13.6571 8.99972 12.0002C8.99972 10.3434 10.3429 9.00021 11.9997 9.00021C13.6566 9.00021 14.9997 10.3434 14.9997 12.0002C14.9997 13.6571 13.6566 15.0002 11.9997 15.0002ZM11.9997 13.0002C12.552 13.0002 12.9997 12.5525 12.9997 12.0002C12.9997 11.4479 12.552 11.0002 11.9997 11.0002C11.4474 11.0002 10.9997 11.4479 10.9997 12.0002C10.9997 12.5525 11.4474 13.0002 11.9997 13.0002Z"></path></svg>'), Hw = /* @__PURE__ */ J('<div class="tf-node-toolbar svelte-ana6zl"><!> <!> <!> <!></div>'), Ow = /* @__PURE__ */ J('<span class="tf-node-breadcrumb-item svelte-ana6zl"> </span> <span class="tf-node-breadcrumb-separator svelte-ana6zl">-</span>', 1), Mw = /* @__PURE__ */ J('<span class="tf-node-breadcrumb-item svelte-ana6zl"> </span> <span class="tf-node-breadcrumb-separator svelte-ana6zl">-</span>', 1), Aw = /* @__PURE__ */ J('<div class="tf-node-breadcrumb svelte-ana6zl"><!> <!> <span class="tf-node-breadcrumb-item svelte-ana6zl"> </span></div>'), Tw = /* @__PURE__ */ J('<!> <div class="tf-node-wrapper"><div class="tf-node-wrapper-title svelte-ana6zl"><!></div> <div class="tf-node-wrapper-body"><!></div></div> <!> <!> <!>', 1);
const zw = {
  hash: "svelte-ana6zl",
  code: `.tf-node-toolbar.svelte-ana6zl {display:flex;gap:5px;padding:5px;border-radius:5px;background:#fff;border:1px solid #eee;box-shadow:0 0 5px rgba(0, 0, 0, 0.1);}.tf-node-toolbar-item {border:1px solid transparent;}.settings.svelte-ana6zl {display:flex;flex-direction:column;gap:10px;padding:10px;background:#fff;border:1px solid #ddd;border-radius:5px;width:200px;box-shadow:0 0 10px 2px rgba(0, 0, 0, 0.1);}.settings.svelte-ana6zl .input-item:where(.svelte-ana6zl) {display:flex;flex-direction:column;gap:3px;font-size:12px;color:#666;}.settings.svelte-ana6zl .input-item-inline:where(.svelte-ana6zl) {display:flex;align-items:center;font-size:12px;color:#666;}
/* 节点面包屑导航样式 */.tf-node-breadcrumb.svelte-ana6zl {display:flex;align-items:center;justify-content:flex-start;padding:4px 12px 8px 12px;font-size:12px;font-weight:500;}.tf-node-breadcrumb-item.svelte-ana6zl {white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.5;transition:all 0.2s ease;}
/* 分组名称样式 */.tf-node-breadcrumb-item.svelte-ana6zl:nth-child(1),
.tf-node-breadcrumb-item.svelte-ana6zl:nth-child(3) {color:#007bff;font-weight:600;}
/* 节点类型名称样式 */.tf-node-breadcrumb-item.svelte-ana6zl:last-child {color:#28a745;font-weight:600;font-size:12.5px;}.tf-node-breadcrumb-separator.svelte-ana6zl {margin:0 6px;color:#6c757d;font-weight:400;}
/* 悬停效果 */.tf-node-breadcrumb.svelte-ana6zl:hover .tf-node-breadcrumb-item:where(.svelte-ana6zl) {opacity:0.9;}
/* 优化节点标题栏高度和对齐 */.tf-node-wrapper-title.svelte-ana6zl {display:flex;align-items:center;}`
};
function Ft(e, t) {
  de(t, !0), Ke(e, zw);
  const n = v(t, "data", 7), r = v(t, "id", 7, ""), o = v(t, "icon", 7), i = v(t, "handle", 7), s = v(t, "children", 7), a = v(t, "allowExecute", 7, !0), l = v(t, "allowCopy", 7, !0), u = v(t, "allowDelete", 7, !0), d = v(t, "allowSetting", 7, !0), f = v(t, "allowSettingOfCondition", 7, !0), p = v(t, "showSourceHandle", 7, !0), h = v(t, "showTargetHandle", 7, !0), y = v(t, "onCollapse", 7), m = v(t, "maxHeight", 7, "500px");
  let w = n().expand ? ["key"] : [];
  const { updateNodeData: b, getNode: _ } = ut(), $ = /* @__PURE__ */ E(() => [
    {
      key: "key",
      icon: o(),
      title: n().title,
      description: n().description,
      content: s()
    }
  ]), { deleteNode: x } = xw(), { copyNode: C } = kw(), S = Mn(), M = () => {
    S.onNodeExecute?.(_(r()));
  };
  let j = nt();
  var L = {
    get data() {
      return n();
    },
    set data(z) {
      n(z), g();
    },
    get id() {
      return r();
    },
    set id(z = "") {
      r(z), g();
    },
    get icon() {
      return o();
    },
    set icon(z) {
      o(z), g();
    },
    get handle() {
      return i();
    },
    set handle(z) {
      i(z), g();
    },
    get children() {
      return s();
    },
    set children(z) {
      s(z), g();
    },
    get allowExecute() {
      return a();
    },
    set allowExecute(z = !0) {
      a(z), g();
    },
    get allowCopy() {
      return l();
    },
    set allowCopy(z = !0) {
      l(z), g();
    },
    get allowDelete() {
      return u();
    },
    set allowDelete(z = !0) {
      u(z), g();
    },
    get allowSetting() {
      return d();
    },
    set allowSetting(z = !0) {
      d(z), g();
    },
    get allowSettingOfCondition() {
      return f();
    },
    set allowSettingOfCondition(z = !0) {
      f(z), g();
    },
    get showSourceHandle() {
      return p();
    },
    set showSourceHandle(z = !0) {
      p(z), g();
    },
    get showTargetHandle() {
      return h();
    },
    set showTargetHandle(z = !0) {
      h(z), g();
    },
    get onCollapse() {
      return y();
    },
    set onCollapse(z) {
      y(z), g();
    },
    get maxHeight() {
      return m();
    },
    set maxHeight(z = "500px") {
      m(z), g();
    }
  }, I = Tw(), T = re(I);
  {
    var N = (z) => {
      Hd(z, {
        get position() {
          return be.Top;
        },
        align: "start",
        children: (Y, W) => {
          var te = Hw(), ee = Z(te);
          {
            var U = (he) => {
              Te(he, {
                class: "tf-node-toolbar-item",
                onclick: () => {
                  x(r());
                },
                children: (ue, ge) => {
                  var $e = _w();
                  D(ue, $e);
                },
                $$slots: { default: !0 }
              });
            };
            oe(ee, (he) => {
              u() && he(U);
            });
          }
          var ce = A(ee, 2);
          {
            var se = (he) => {
              Te(he, {
                class: "tf-node-toolbar-item",
                onclick: () => {
                  C(r());
                },
                children: (ue, ge) => {
                  var $e = $w();
                  D(ue, $e);
                },
                $$slots: { default: !0 }
              });
            };
            oe(ce, (he) => {
              l() && he(se);
            });
          }
          var ae = A(ce, 2);
          {
            var ie = (he) => {
              Te(he, {
                class: "tf-node-toolbar-item",
                onclick: M,
                children: (ue, ge) => {
                  var $e = Cw();
                  D(ue, $e);
                },
                $$slots: { default: !0 }
              });
            };
            oe(ae, (he) => {
              a() && he(ie);
            });
          }
          var pe = A(ae, 2);
          {
            var we = (he) => {
              ir(he, {
                placement: "bottom",
                floating: (ue) => {
                  var ge = Nw(), $e = Z(ge), X = A(Z($e));
                  rt(X, {
                    style: "width: 100%;",
                    onchange: (Me) => {
                      const et = Me.target.value;
                      b(j, { title: et });
                    },
                    get value() {
                      return n().title;
                    }
                  }), R($e);
                  var Xe = A($e, 2), je = A(Z(Xe));
                  Ye(je, {
                    rows: 3,
                    style: "width: 100%;",
                    onchange: (Me) => {
                      const et = Me.target.value;
                      b(j, { description: et });
                    },
                    get value() {
                      return n().description;
                    }
                  }), R(Xe);
                  var He = A(Xe, 2);
                  {
                    var Pe = (Me) => {
                      var et = Sw(), Ct = A(Z(et));
                      Ye(Ct, {
                        rows: 2,
                        style: "width: 100%;",
                        onchange: (cn) => {
                          const St = cn.target.value;
                          b(j, { condition: St });
                        },
                        get value() {
                          return n().condition;
                        }
                      }), R(et), D(Me, et);
                    };
                    oe(He, (Me) => {
                      f() && Me(Pe);
                    });
                  }
                  var Ze = A(He, 2), qe = A(Z(Ze), 2);
                  Sn(qe), qe.__change = (Me) => {
                    const et = Me.target.checked;
                    b(j, { async: et });
                  }, R(Ze);
                  var Qe = A(Ze, 2), Ue = A(Z(Qe), 2);
                  Sn(Ue), Ue.__change = (Me) => {
                    const et = Me.target.checked;
                    b(j, { loopEnable: et });
                  }, R(Qe);
                  var ve = A(Qe, 2);
                  {
                    var Le = (Me) => {
                      var et = Ew(), Ct = re(et), cn = A(Z(Ct));
                      {
                        let Wt = /* @__PURE__ */ E(() => n().loopIntervalMs || "1000");
                        Ye(cn, {
                          rows: 1,
                          style: "width: 100%;",
                          onchange: (Gt) => {
                            const ar = Gt.target.value;
                            b(j, { loopIntervalMs: ar });
                          },
                          get value() {
                            return c(Wt);
                          }
                        });
                      }
                      R(Ct);
                      var St = A(Ct, 2), $r = A(Z(St));
                      {
                        let Wt = /* @__PURE__ */ E(() => n().maxLoopCount || "0");
                        Ye($r, {
                          rows: 1,
                          style: "width: 100%;",
                          onchange: (Gt) => {
                            const ar = Gt.target.value;
                            b(j, { maxLoopCount: ar });
                          },
                          get value() {
                            return c(Wt);
                          }
                        });
                      }
                      R(St);
                      var sr = A(St, 2), Tt = A(Z(sr));
                      Ye(Tt, {
                        rows: 2,
                        style: "width: 100%;",
                        onchange: (Wt) => {
                          const Gt = Wt.target.value;
                          b(j, { loopBreakCondition: Gt });
                        },
                        get value() {
                          return n().loopBreakCondition;
                        }
                      }), R(sr), D(Me, et);
                    };
                    oe(ve, (Me) => {
                      n().loopEnable && Me(Le);
                    });
                  }
                  var Ie = A(ve, 2), Ee = A(Z(Ie), 2);
                  Sn(Ee), Ee.__change = (Me) => {
                    const et = Me.target.checked;
                    b(j, { retryEnable: et });
                  }, R(Ie);
                  var it = A(Ie, 2);
                  {
                    var xt = (Me) => {
                      var et = Pw(), Ct = re(et), cn = A(Z(Ct));
                      {
                        let Wt = /* @__PURE__ */ E(() => n().retryIntervalMs || "1000");
                        Ye(cn, {
                          rows: 1,
                          style: "width: 100%;",
                          onchange: (Gt) => {
                            const ar = Gt.target.value;
                            b(j, { retryIntervalMs: ar });
                          },
                          get value() {
                            return c(Wt);
                          }
                        });
                      }
                      R(Ct);
                      var St = A(Ct, 2), $r = A(Z(St));
                      {
                        let Wt = /* @__PURE__ */ E(() => n().maxRetryCount || "3");
                        Ye($r, {
                          rows: 1,
                          style: "width: 100%;",
                          onchange: (Gt) => {
                            const ar = Gt.target.value;
                            b(j, { maxRetryCount: ar });
                          },
                          get value() {
                            return c(Wt);
                          }
                        });
                      }
                      R(St);
                      var sr = A(St, 2), Tt = A(Z(sr), 2);
                      Sn(Tt), Tt.__change = (Wt) => {
                        const Gt = Wt.target.checked;
                        b(j, { resetRetryCountAfterNormal: Gt });
                      }, R(sr), xe(() => Ko(Tt, !!n().resetRetryCountAfterNormal)), D(Me, et);
                    };
                    oe(it, (Me) => {
                      n().retryEnable && Me(xt);
                    });
                  }
                  R(ge), xe(() => {
                    Ko(qe, !!n().async), Ko(Ue, !!n().loopEnable), Ko(Ee, !!n().retryEnable);
                  }), D(ue, ge);
                },
                children: (ue, ge) => {
                  Te(ue, {
                    class: "tf-node-toolbar-item",
                    children: ($e, X) => {
                      var Xe = Dw();
                      D($e, Xe);
                    },
                    $$slots: { default: !0 }
                  });
                },
                $$slots: { floating: !0, default: !0 }
              });
            };
            oe(pe, (he) => {
              d() && he(we);
            });
          }
          R(te), D(Y, te);
        },
        $$slots: { default: !0 }
      });
    };
    oe(T, (z) => {
      (a() || l() || u()) && z(N);
    });
  }
  var H = A(T, 2), k = Z(H), P = Z(k);
  {
    var O = (z) => {
      var Y = Ce(), W = re(Y);
      at(W, 16, () => [0], Cn, (te, ee) => {
        var U = Ce(), ce = re(U);
        Gi(ce, () => n().originalType, (se) => {
          var ae = Ce(), ie = re(ae);
          Gi(ie, () => n().title, (pe) => {
            var we = Ce(), he = re(we);
            Gi(he, () => S.customNodes, (ue) => {
              const ge = /* @__PURE__ */ E(() => n().originalType), $e = /* @__PURE__ */ E(() => S.customNodes), X = /* @__PURE__ */ E(() => (() => {
                if (Array.isArray(c($e)))
                  return c($e).find((Ie) => Ie.type === c(ge));
                if (c($e) && typeof c($e) == "object")
                  return c($e)[c(ge)];
              })()), Xe = /* @__PURE__ */ E(() => c(X)?.group || ""), je = /* @__PURE__ */ E(() => S.groupSeparator || "."), He = /* @__PURE__ */ E(() => {
                const [Ie, Ee] = c(Xe).split(c(je));
                return { rootGroup: Ie, subGroup: Ee };
              });
              var Pe = Aw(), Ze = Z(Pe);
              {
                var qe = (Ie) => {
                  var Ee = Ow(), it = re(Ee), xt = Z(it, !0);
                  R(it), me(2), xe(() => Re(xt, c(He).rootGroup)), D(Ie, Ee);
                };
                oe(Ze, (Ie) => {
                  c(He).rootGroup && Ie(qe);
                });
              }
              var Qe = A(Ze, 2);
              {
                var Ue = (Ie) => {
                  var Ee = Mw(), it = re(Ee), xt = Z(it, !0);
                  R(it), me(2), xe(() => Re(xt, c(He).subGroup)), D(Ie, Ee);
                };
                oe(Qe, (Ie) => {
                  c(He).subGroup && Ie(Ue);
                });
              }
              var ve = A(Qe, 2), Le = Z(ve, !0);
              R(ve), R(Pe), xe(() => Re(Le, c(X)?.title || n().title || "")), D(ue, Pe);
            }), D(pe, we);
          }), D(se, ae);
        }), D(te, U);
      }), D(z, Y);
    };
    oe(P, (z) => {
      n().originalType && z(O);
    });
  }
  R(k);
  var B = A(k, 2), V = Z(B);
  Ad(V, {
    get items() {
      return c($);
    },
    get maxHeight() {
      return m();
    },
    get activeKeys() {
      return w;
    },
    onChange: (z, Y) => {
      b(r(), { expand: Y?.includes("key") }), y()?.(Y?.includes("key") ? "key" : "");
    }
  }), R(B), R(H);
  var F = A(H, 2);
  {
    var K = (z) => {
      Qn(z, {
        type: "target",
        get position() {
          return be.Left;
        },
        style: " left: -12px;top: 20px"
      });
    };
    oe(F, (z) => {
      h() && z(K);
    });
  }
  var G = A(F, 2);
  {
    var ne = (z) => {
      Qn(z, {
        type: "source",
        get position() {
          return be.Right;
        },
        style: "right: -12px;top: 20px"
      });
    };
    oe(G, (z) => {
      p() && z(ne);
    });
  }
  var q = A(G, 2);
  return tt(q, () => i() ?? bt), D(e, I), fe(L);
}
rr(["change"]);
le(
  Ft,
  {
    data: {},
    id: {},
    icon: {},
    handle: {},
    children: {},
    allowExecute: {},
    allowCopy: {},
    allowDelete: {},
    allowSetting: {},
    allowSettingOfCondition: {},
    showSourceHandle: {},
    showTargetHandle: {},
    onCollapse: {},
    maxHeight: {}
  },
  [],
  [],
  !0
);
var Vw = /* @__PURE__ */ J('<div class="input-more-item svelte-n5iecj">数据选项： <!></div>'), Lw = /* @__PURE__ */ J('<div class="input-more-setting svelte-n5iecj"><div class="input-more-item svelte-n5iecj">数据内容： <!></div> <div class="input-more-item svelte-n5iecj">输入方式： <!></div> <!> <div class="input-more-item svelte-n5iecj">数据标题： <!></div> <div class="input-more-item svelte-n5iecj">数据描述： <!></div> <div class="input-more-item svelte-n5iecj">占位符： <!></div> <div class="input-more-item svelte-n5iecj"><!></div></div>'), Iw = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.5 10.5C3.675 10.5 3 11.175 3 12C3 12.825 3.675 13.5 4.5 13.5C5.325 13.5 6 12.825 6 12C6 11.175 5.325 10.5 4.5 10.5ZM19.5 10.5C18.675 10.5 18 11.175 18 12C18 12.825 18.675 13.5 19.5 13.5C20.325 13.5 21 12.825 21 12C21 11.175 20.325 10.5 19.5 10.5ZM12 10.5C11.175 10.5 10.5 11.175 10.5 12C10.5 12.825 11.175 13.5 12 13.5C12.825 13.5 13.5 12.825 13.5 12C13.5 11.175 12.825 10.5 12 10.5Z"></path></svg>'), jw = /* @__PURE__ */ J('<div class="input-item svelte-n5iecj"><!></div> <div class="input-item svelte-n5iecj"><!></div> <div class="input-item svelte-n5iecj"><!></div>', 1);
const Rw = {
  hash: "svelte-n5iecj",
  code: ".input-item.svelte-n5iecj {display:flex;align-items:center;}.input-more-setting.svelte-n5iecj {display:flex;flex-direction:column;gap:10px;padding:10px;background:#fff;border:1px solid #ddd;border-radius:5px;width:200px;box-shadow:0 0 10px 2px rgba(0, 0, 0, 0.1);}.input-more-setting.svelte-n5iecj .input-more-item:where(.svelte-n5iecj) {display:flex;flex-direction:column;gap:3px;font-size:12px;color:#666;}"
};
function Xd(e, t) {
  de(t, !0), Ke(e, Rw);
  const n = v(t, "parameter", 7), r = v(t, "index", 7);
  let o = nt(), i = Kn(o), s = /* @__PURE__ */ E(() => ({ ...n(), ...i?.current?.data?.parameters[r()] }));
  const { updateNodeData: a } = ut(), l = (j, L) => {
    a(o, (I) => {
      let T = I.data.parameters;
      return T[r()][j] = L, { parameters: T };
    });
  }, u = (j, L) => {
    const I = L.target.value;
    l(j, I);
  }, d = (j) => {
    const L = j.target.value;
    l("name", L);
  }, f = (j) => {
    const L = j.target.checked;
    l("required", L);
  }, p = (j) => {
    const L = j.value;
    l("formType", L);
  }, h = (j) => {
    const L = j.value;
    l("contentType", L);
  };
  let y;
  const m = () => {
    a(o, (j) => {
      let L = j.data.parameters;
      return L.splice(r(), 1), { parameters: [...L] };
    }), y?.hide();
  };
  var w = {
    get parameter() {
      return n();
    },
    set parameter(j) {
      n(j), g();
    },
    get index() {
      return r();
    },
    set index(j) {
      r(j), g();
    }
  }, b = jw(), _ = re(b), $ = Z(_);
  rt($, {
    style: "width: 100%;",
    get value() {
      return c(s).name;
    },
    placeholder: "请输入参数名称",
    oninput: d
  }), R(_);
  var x = A(_, 2), C = Z(x);
  Od(C, {
    get checked() {
      return c(s).required;
    },
    onchange: f
  }), R(x);
  var S = A(x, 2), M = Z(S);
  return At(
    ir(M, {
      placement: "bottom",
      floating: (j) => {
        var L = Lw(), I = Z(L), T = A(Z(I));
        {
          let z = /* @__PURE__ */ E(() => c(s).contentType ? [c(s).contentType] : []);
          pt(T, {
            get items() {
              return ya;
            },
            style: "width: 100%",
            defaultValue: ["text"],
            get value() {
              return c(z);
            },
            onSelect: h
          });
        }
        R(I);
        var N = A(I, 2), H = A(Z(N));
        {
          let z = /* @__PURE__ */ E(() => c(s).formType ? [c(s).formType] : []);
          pt(H, {
            get items() {
              return J0;
            },
            style: "width: 100%",
            defaultValue: ["input"],
            get value() {
              return c(z);
            },
            onSelect: p
          });
        }
        R(N);
        var k = A(N, 2);
        {
          var P = (z) => {
            var Y = Vw(), W = A(Z(Y));
            {
              let te = /* @__PURE__ */ E(() => c(s).enums?.join(`
`));
              Ye(W, {
                rows: 3,
                style: "width: 100%;",
                onchange: (ee) => {
                  l("enums", ee.target?.value.trim().split(`
`));
                },
                get value() {
                  return c(te);
                },
                placeholder: "一行一个选项"
              });
            }
            R(Y), D(z, Y);
          };
          oe(k, (z) => {
            (c(s).formType === "radio" || c(s).formType === "checkbox" || c(s).formType === "select") && z(P);
          });
        }
        var O = A(k, 2), B = A(Z(O));
        Ye(B, {
          rows: 1,
          style: "width: 100%;",
          onchange: (z) => {
            u("formLabel", z);
          },
          get value() {
            return c(s).formLabel;
          }
        }), R(O);
        var V = A(O, 2), F = A(Z(V));
        Ye(F, {
          rows: 2,
          style: "width: 100%;",
          onchange: (z) => {
            u("formDescription", z);
          },
          get value() {
            return c(s).formDescription;
          }
        }), R(V);
        var K = A(V, 2), G = A(Z(K));
        Ye(G, {
          rows: 2,
          style: "width: 100%;",
          onchange: (z) => {
            u("formPlaceholder", z);
          },
          get value() {
            return c(s).formPlaceholder;
          }
        }), R(K);
        var ne = A(K, 2), q = Z(ne);
        Te(q, {
          onclick: m,
          children: (z, Y) => {
            me();
            var W = Se("删除");
            D(z, W);
          },
          $$slots: { default: !0 }
        }), R(ne), R(L), D(j, L);
      },
      children: (j, L) => {
        Te(j, {
          class: "input-btn-more",
          children: (I, T) => {
            var N = Iw();
            D(I, N);
          },
          $$slots: { default: !0 }
        });
      },
      $$slots: { floating: !0, default: !0 }
    }),
    (j) => y = j,
    () => y
  ), R(S), D(e, b), fe(w);
}
le(Xd, { parameter: {}, index: {} }, [], [], !0);
var Kw = /* @__PURE__ */ J('<div class="input-header svelte-1yp5n1k">参数名称</div> <div class="input-header svelte-1yp5n1k">必填</div> <div class="input-header svelte-1yp5n1k"></div>', 1), Zw = /* @__PURE__ */ J('<div class="none-params svelte-1yp5n1k">无输入参数</div>'), Bw = /* @__PURE__ */ J('<div class="input-container svelte-1yp5n1k"><!> <!></div>');
const Yw = {
  hash: "svelte-1yp5n1k",
  code: `.input-container.svelte-1yp5n1k {display:grid;grid-template-columns:80% 10% 10%;row-gap:5px;column-gap:3px;}.input-container.svelte-1yp5n1k .none-params:where(.svelte-1yp5n1k) {font-size:12px;background:#f8f8f8;height:40px;display:flex;justify-content:center;align-items:center;border-radius:5px;width:calc(100% - 5px);grid-column:1 / -1;
  /* 从第一列开始到最后一列结束 */}.input-container.svelte-1yp5n1k .input-header:where(.svelte-1yp5n1k) {font-size:12px;color:#666;}`
};
function Fd(e, t) {
  de(t, !0), Ke(e, Yw);
  let n = nt(), r = Kn(n), o = /* @__PURE__ */ E(() => [...r?.current?.data?.parameters || []]);
  var i = Bw(), s = Z(i);
  {
    var a = (u) => {
      var d = Kw();
      me(4), D(u, d);
    };
    oe(s, (u) => {
      c(o).length !== 0 && u(a);
    });
  }
  var l = A(s, 2);
  at(
    l,
    19,
    () => c(o),
    (u) => u.id,
    (u, d, f) => {
      Xd(u, {
        get parameter() {
          return c(d);
        },
        get index() {
          return c(f);
        }
      });
    },
    (u) => {
      var d = Zw();
      D(u, d);
    }
  ), R(i), D(e, i), fe();
}
le(Fd, {}, [], [], !0);
const xo = (e) => (!e || e.length == 0 || e.forEach((t) => {
  t.id || (t.id = zn()), xo(t.children);
}), e), un = () => {
  const { updateNodeData: e } = ut();
  return {
    addParameter: (t, n = "parameters", r) => {
      Array.isArray(r) ? r.forEach((s) => xo(s?.children)) : xo(r?.children);
      function o(s) {
        return {
          name: "",
          dataType: "String",
          refType: "ref",
          ...s,
          id: zn()
        };
      }
      const i = [];
      Array.isArray(r) ? i.push(...r.map(o)) : i.push(o(r)), e(t, (s) => {
        let a = s.data[n];
        return a ? a.push(...i) : a = [...i], { [n]: [...a] };
      });
    }
  };
};
var qw = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15Z"></path></svg>'), Xw = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), Fw = /* @__PURE__ */ J('<div class="heading svelte-llt1qy"><!> <!></div> <!>', 1);
const Ww = {
  hash: "svelte-llt1qy",
  code: ".heading.svelte-llt1qy {display:flex;margin-bottom:10px;}.input-btn-more {border:1px solid transparent;padding:3px;}.input-btn-more:hover {background:#eee;border:1px solid transparent;}"
};
function Wd(e, t) {
  de(t, !0), Ke(e, Ww);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un();
  var s = {
    get data() {
      return n();
    },
    set data(a) {
      n(a), g();
    }
  };
  return Ft(e, Ge(() => r, {
    get data() {
      return n();
    },
    allowExecute: !1,
    showTargetHandle: !1,
    allowSettingOfCondition: !1,
    icon: (a) => {
      var l = qw();
      D(a, l);
    },
    children: (a, l) => {
      var u = Fw(), d = re(u), f = Z(d);
      ze(f, {
        level: 3,
        children: (y, m) => {
          me();
          var w = Se("输入参数");
          D(y, w);
        },
        $$slots: { default: !0 }
      });
      var p = A(f, 2);
      Te(p, {
        class: "input-btn-more",
        style: "margin-left: auto",
        onclick: () => {
          i(o, "parameters", { refType: "input", name: "newParam" });
        },
        children: (y, m) => {
          var w = Xw();
          D(y, w);
        },
        $$slots: { default: !0 }
      }), R(d);
      var h = A(d, 2);
      Fd(h, {}), D(a, u);
    },
    $$slots: { icon: !0, default: !0 }
  })), fe(s);
}
le(Wd, { data: {} }, [], [], !0);
const Gd = (e, t, n) => {
  for (const r of n)
    r.target === t && r.source && (e.push(r.source), Gd(e, r.source, n));
}, Ud = (e, t, n) => !e || e.length === 0 ? [] : e.map((r) => ({
  label: r.name + (n ? ` (Array<${r.dataType || "String"}>)` : ` (${r.dataType || "String"})`),
  value: t + "." + r.name,
  children: Ud(r.children, t + "." + r.name, n)
})), Ml = (e, t, n) => {
  if (e.type === "startNode") {
    const r = e.data.parameters, o = [];
    if (r) for (const i of r)
      o.push({
        label: i.name + (t ? ` (Array<${i.dataType || "String"}>)` : ` (${i.dataType || "String"})`),
        value: e.id + "." + i.name
      });
    return { label: e.data.title, value: e.id, children: o };
  } else {
    if (e.type === "loopNode" && n.parentId)
      return {
        label: e.data.title,
        value: e.id,
        children: [
          { label: "loopItem", value: e.id + ".loopItem" },
          { label: "index (Number)", value: e.id + ".index" }
        ]
      };
    {
      const r = e.data.outputDefs;
      if (r)
        return {
          label: e.data.title,
          value: e.id,
          children: Ud(r, e.id, t)
        };
    }
  }
}, Jd = (e = !1) => {
  const t = nt(), n = Kn(t), r = /* @__PURE__ */ E(ln), o = /* @__PURE__ */ E(() => c(r).nodes), i = /* @__PURE__ */ E(() => c(r).edges), s = /* @__PURE__ */ E(() => c(r).nodeLookup);
  let a = /* @__PURE__ */ E(() => {
    const l = [];
    if (!n.current)
      return [];
    const u = c(s).get(t);
    if (e)
      for (const d of c(o)) {
        const f = d.parentId === n.current.id;
        if (f) {
          const p = Ml(d, f, u);
          p && l.push(p);
        }
      }
    else {
      const d = [];
      Gd(d, t, c(i));
      for (const f of c(o))
        if (d.includes(f.id)) {
          const p = f.parentId === n.current.id, h = Ml(f, p, u);
          h && l.push(h);
        }
    }
    return l;
  });
  return {
    get current() {
      return c(a);
    }
  };
};
var Gw = /* @__PURE__ */ J('<div class="input-more-item svelte-jmeys3">数据内容： <!></div>'), Uw = /* @__PURE__ */ J('<div class="input-more-setting svelte-jmeys3"><div class="input-more-item svelte-jmeys3">数据来源： <!></div> <!> <div class="input-more-item svelte-jmeys3">默认值： <!></div> <div class="input-more-item svelte-jmeys3">参数描述： <!></div> <div class="input-more-item svelte-jmeys3"><!></div></div>'), Jw = /* @__PURE__ */ J('<div class="input-item svelte-jmeys3"><!></div> <div class="input-item svelte-jmeys3"><!></div> <div class="input-item svelte-jmeys3"><!></div>', 1);
const Qw = {
  hash: "svelte-jmeys3",
  code: ".input-item.svelte-jmeys3 {display:flex;align-items:center;}.input-more-setting.svelte-jmeys3 {display:flex;flex-direction:column;gap:10px;padding:10px;background:#fff;border:1px solid #ddd;border-radius:5px;width:200px;box-shadow:0 0 10px 2px rgba(0, 0, 0, 0.1);}.input-more-setting.svelte-jmeys3 .input-more-item:where(.svelte-jmeys3) {display:flex;flex-direction:column;gap:3px;font-size:12px;color:#666;}"
};
function Qd(e, t) {
  de(t, !0), Ke(e, Qw), jn(() => {
    c(u).refType || y({ value: "ref" });
  });
  const n = v(t, "parameter", 7), r = v(t, "index", 7), o = v(t, "dataKeyName", 7), i = v(t, "useChildrenOnly", 7), s = v(t, "showContentType", 7, !1);
  let a = nt(), l = Kn(a), u = /* @__PURE__ */ E(() => ({
    ...n(),
    ...l?.current?.data?.[o()][r()]
  }));
  const { updateNodeData: d } = ut(), f = (H, k) => {
    d(a, (P) => {
      let O = P.data?.[o()];
      return O[r()] = { ...O[r()], [H]: k }, { [o()]: O };
    });
  }, p = (H, k) => {
    const P = k.target.value;
    f(H, P);
  }, h = (H) => {
    const k = H.value;
    f("ref", k);
  }, y = (H) => {
    const k = H.value;
    f("refType", k);
  }, m = (H) => {
    const k = H.value;
    f("contentType", k);
  };
  let w;
  const b = () => {
    d(a, (H) => {
      let k = H.data?.[o()];
      return k.splice(r(), 1), { [o()]: [...k] };
    }), w?.hide();
  };
  let _ = Jd(i());
  var $ = {
    get parameter() {
      return n();
    },
    set parameter(H) {
      n(H), g();
    },
    get index() {
      return r();
    },
    set index(H) {
      r(H), g();
    },
    get dataKeyName() {
      return o();
    },
    set dataKeyName(H) {
      o(H), g();
    },
    get useChildrenOnly() {
      return i();
    },
    set useChildrenOnly(H) {
      i(H), g();
    },
    get showContentType() {
      return s();
    },
    set showContentType(H = !1) {
      s(H), g();
    }
  }, x = Jw(), C = re(x), S = Z(C);
  {
    let H = /* @__PURE__ */ E(() => c(u).nameDisabled === !0);
    rt(S, {
      style: "width: 100%;",
      get value() {
        return c(u).name;
      },
      placeholder: "请输入参数名称",
      get disabled() {
        return c(H);
      },
      oninput: (k) => p("name", k)
    });
  }
  R(C);
  var M = A(C, 2), j = Z(M);
  {
    var L = (H) => {
      rt(H, {
        get value() {
          return c(u).value;
        },
        placeholder: "请输入参数值",
        oninput: (k) => p("value", k)
      });
    }, I = (H) => {
      var k = Ce(), P = re(k);
      {
        var O = (B) => {
          {
            let V = /* @__PURE__ */ E(() => [c(u).ref]);
            pt(B, {
              get items() {
                return _.current;
              },
              style: "width: 100%",
              defaultValue: ["ref"],
              get value() {
                return c(V);
              },
              expandAll: !0,
              onSelect: h
            });
          }
        };
        oe(
          P,
          (B) => {
            c(u).refType !== "input" && B(O);
          },
          !0
        );
      }
      D(H, k);
    };
    oe(j, (H) => {
      c(u).refType === "fixed" ? H(L) : H(I, !1);
    });
  }
  R(M);
  var T = A(M, 2), N = Z(T);
  return At(
    ir(N, {
      placement: "bottom",
      floating: (H) => {
        var k = Uw(), P = Z(k), O = A(Z(P));
        {
          let Y = /* @__PURE__ */ E(() => c(u).refType ? [c(u).refType] : []);
          pt(O, {
            get items() {
              return U0;
            },
            style: "width: 100%",
            defaultValue: ["ref"],
            get value() {
              return c(Y);
            },
            onSelect: y
          });
        }
        R(P);
        var B = A(P, 2);
        {
          var V = (Y) => {
            var W = Gw(), te = A(Z(W));
            {
              let ee = /* @__PURE__ */ E(() => c(u).contentType ? [c(u).contentType] : []);
              pt(te, {
                get items() {
                  return ya;
                },
                style: "width: 100%",
                defaultValue: ["text"],
                get value() {
                  return c(ee);
                },
                onSelect: m
              });
            }
            R(W), D(Y, W);
          };
          oe(B, (Y) => {
            s() && Y(V);
          });
        }
        var F = A(B, 2), K = A(Z(F));
        Ye(K, {
          rows: 1,
          style: "width: 100%;",
          onchange: (Y) => {
            p("defaultValue", Y);
          },
          get value() {
            return c(u).defaultValue;
          },
          placeholder: "请输入参数默认值"
        }), R(F);
        var G = A(F, 2), ne = A(Z(G));
        Ye(ne, {
          rows: 3,
          style: "width: 100%;",
          onchange: (Y) => {
            p("description", Y);
          },
          get value() {
            return c(u).description;
          },
          placeholder: "请输入参数描述"
        }), R(G);
        var q = A(G, 2), z = Z(q);
        Te(z, {
          onclick: b,
          children: (Y, W) => {
            me();
            var te = Se("删除");
            D(Y, te);
          },
          $$slots: { default: !0 }
        }), R(q), R(k), D(H, k);
      },
      children: (H, k) => {
        jo(H, {});
      },
      $$slots: { floating: !0, default: !0 }
    }),
    (H) => w = H,
    () => w
  ), R(T), D(e, x), fe($);
}
le(
  Qd,
  {
    parameter: {},
    index: {},
    dataKeyName: {},
    useChildrenOnly: {},
    showContentType: {}
  },
  [],
  [],
  !0
);
var e2 = /* @__PURE__ */ J('<div class="input-header svelte-32f1pk">参数名称</div> <div class="input-header svelte-32f1pk">参数值</div> <div class="input-header svelte-32f1pk"></div>', 1), t2 = /* @__PURE__ */ J('<div class="none-params svelte-32f1pk"> </div>'), n2 = /* @__PURE__ */ J('<div class="input-container svelte-32f1pk"><!> <!></div>');
const r2 = {
  hash: "svelte-32f1pk",
  code: `.input-container.svelte-32f1pk {display:grid;grid-template-columns:40% 50% 10%;row-gap:5px;column-gap:3px;}.input-container.svelte-32f1pk .none-params:where(.svelte-32f1pk) {font-size:12px;background:#f8f8f8;height:40px;display:flex;justify-content:center;align-items:center;border-radius:5px;width:calc(100% - 5px);grid-column:1 / -1;
  /* 从第一列开始到最后一列结束 */}.input-container.svelte-32f1pk .input-header:where(.svelte-32f1pk) {font-size:12px;color:#666;}`
};
function $t(e, t) {
  de(t, !0), Ke(e, r2);
  const n = v(t, "noneParameterText", 7, "无输入参数"), r = v(t, "dataKeyName", 7, "parameters"), o = v(t, "useChildrenOnly", 7), i = v(t, "showContentType", 7, !1);
  let s = nt(), a = Kn(s), l = /* @__PURE__ */ E(() => [...a?.current?.data?.[r()] || []]);
  var u = {
    get noneParameterText() {
      return n();
    },
    set noneParameterText(y = "无输入参数") {
      n(y), g();
    },
    get dataKeyName() {
      return r();
    },
    set dataKeyName(y = "parameters") {
      r(y), g();
    },
    get useChildrenOnly() {
      return o();
    },
    set useChildrenOnly(y) {
      o(y), g();
    },
    get showContentType() {
      return i();
    },
    set showContentType(y = !1) {
      i(y), g();
    }
  }, d = n2(), f = Z(d);
  {
    var p = (y) => {
      var m = e2();
      me(4), D(y, m);
    };
    oe(f, (y) => {
      c(l).length !== 0 && y(p);
    });
  }
  var h = A(f, 2);
  return at(
    h,
    19,
    () => c(l),
    (y) => y.id,
    (y, m, w) => {
      Qd(y, {
        get parameter() {
          return c(m);
        },
        get index() {
          return c(w);
        },
        get dataKeyName() {
          return r();
        },
        get useChildrenOnly() {
          return o();
        },
        get showContentType() {
          return i();
        }
      });
    },
    (y) => {
      var m = t2(), w = Z(m, !0);
      R(m), xe(() => Re(w, n())), D(y, m);
    }
  ), R(d), D(e, d), fe(u);
}
le(
  $t,
  {
    noneParameterText: {},
    dataKeyName: {},
    useChildrenOnly: {},
    showContentType: {}
  },
  [],
  [],
  !0
);
var o2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5.1438V16.0002H18.3391L6 5.1438ZM4 2.932C4 2.07155 5.01456 1.61285 5.66056 2.18123L21.6501 16.2494C22.3423 16.8584 21.9116 18.0002 20.9896 18.0002H6V22H4V2.932Z"></path></svg>'), i2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), s2 = /* @__PURE__ */ J('<div class="heading svelte-1fiuxu3"><!> <!></div> <!>', 1);
const a2 = {
  hash: "svelte-1fiuxu3",
  code: ".heading.svelte-1fiuxu3 {display:flex;margin-bottom:10px;}"
};
function ef(e, t) {
  de(t, !0), Ke(e, a2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un();
  var s = {
    get data() {
      return n();
    },
    set data(a) {
      n(a), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      showSourceHandle: !1,
      icon: (a) => {
        var l = o2();
        D(a, l);
      },
      children: (a, l) => {
        var u = s2(), d = re(u), f = Z(d);
        ze(f, {
          level: 3,
          children: (y, m) => {
            me();
            var w = Se("输出参数");
            D(y, w);
          },
          $$slots: { default: !0 }
        });
        var p = A(f, 2);
        Te(p, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o, "outputDefs", { name: "output" });
          },
          children: (y, m) => {
            var w = i2();
            D(y, w);
          },
          $$slots: { default: !0 }
        }), R(d);
        var h = A(d, 2);
        $t(h, {
          noneParameterText: "无输出参数",
          dataKeyName: "outputDefs",
          showContentType: !0
        }), D(a, u);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(s);
}
le(ef, { data: {} }, [], [], !0);
const cs = (e) => JSON.parse(JSON.stringify(e));
var l2 = /* @__PURE__ */ ye('<svg style="transform: scaleY(-1)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 8V16C13 17.6569 11.6569 19 10 19H7.82929C7.41746 20.1652 6.30622 21 5 21C3.34315 21 2 19.6569 2 18C2 16.3431 3.34315 15 5 15C6.30622 15 7.41746 15.8348 7.82929 17H10C10.5523 17 11 16.5523 11 16V8C11 6.34315 12.3431 5 14 5H17V2L22 6L17 10V7H14C13.4477 7 13 7.44772 13 8ZM5 19C5.55228 19 6 18.5523 6 18C6 17.4477 5.55228 17 5 17C4.44772 17 4 17.4477 4 18C4 18.5523 4.44772 19 5 19Z"></path></svg>'), u2 = /* @__PURE__ */ J('<div class="input-more-item svelte-hwmib9"><!></div>'), c2 = /* @__PURE__ */ J('<div class="input-more-setting svelte-hwmib9"><div class="input-more-item svelte-hwmib9">默认值： <!></div> <div class="input-more-item svelte-hwmib9">参数描述： <!></div> <!></div>'), d2 = /* @__PURE__ */ J('<div class="input-item svelte-hwmib9"><!> <!></div> <div class="input-item svelte-hwmib9"><!> <!></div> <div class="input-item svelte-hwmib9"><!></div>', 1);
const f2 = {
  hash: "svelte-hwmib9",
  code: ".input-item.svelte-hwmib9 {display:flex;align-items:center;gap:2px;}.input-more-setting.svelte-hwmib9 {display:flex;flex-direction:column;gap:10px;padding:10px;background:#fff;border:1px solid #ddd;border-radius:5px;width:200px;box-shadow:0 0 10px 2px rgba(0, 0, 0, 0.1);}.input-more-setting.svelte-hwmib9 .input-more-item:where(.svelte-hwmib9) {display:flex;flex-direction:column;gap:3px;font-size:12px;color:#666;}"
};
function tf(e, t) {
  de(t, !0), Ke(e, f2);
  const n = v(t, "parameter", 7), r = v(t, "position", 7), o = v(t, "dataKeyName", 7), i = v(t, "placeholder", 7, "请输入参数值");
  let s = nt(), a = Kn(s), l = /* @__PURE__ */ E(() => {
    let N = a?.current?.data?.[o()], H;
    if (N && r().length > 0) {
      let k = N;
      for (let P = 0; P < r().length; P++) {
        const O = r()[P];
        P == r().length - 1 ? H = k[O] : k = k[O].children;
      }
    }
    return { ...n(), ...H };
  });
  const { updateNodeData: u } = ut(), d = (N, H) => {
    u(s, (k) => {
      const P = k.data?.[o()];
      if (P && r().length > 0) {
        let O = P;
        for (let B = 0; B < r().length; B++) {
          const V = r()[B];
          B == r().length - 1 ? O[V] = { ...O[V], [N]: H } : O = O[V].children;
        }
      }
      return { [o()]: [...cs(P)] };
    });
  }, f = (N, H) => {
    const k = H.target.value;
    d(N, k);
  }, p = (N) => {
    const H = N.value;
    d("dataType", H);
  };
  let h;
  const y = () => {
    u(s, (N) => {
      let H = N.data?.[o()];
      if (H && r().length > 0) {
        let k = H;
        for (let P = 0; P < r().length; P++) {
          const O = r()[P];
          P == r().length - 1 ? k.splice(O, 1) : k = k[O].children;
        }
      }
      return { [o()]: [...cs(H)] };
    }), h?.hide();
  }, m = () => {
    u(s, (N) => {
      let H = N.data?.[o()];
      if (H && r().length > 0) {
        let k = H;
        for (let P = 0; P < r().length; P++) {
          const O = r()[P];
          P == r().length - 1 ? k[O].children ? k[O].children.push({ id: zn(), name: "newParam", dataType: "String" }) : k[O].children = [{ id: zn(), name: "newParam", dataType: "String" }] : k = k[O].children;
        }
      }
      return { [o()]: [...cs(H)] };
    });
  };
  var w = {
    get parameter() {
      return n();
    },
    set parameter(N) {
      n(N), g();
    },
    get position() {
      return r();
    },
    set position(N) {
      r(N), g();
    },
    get dataKeyName() {
      return o();
    },
    set dataKeyName(N) {
      o(N), g();
    },
    get placeholder() {
      return i();
    },
    set placeholder(N = "请输入参数值") {
      i(N), g();
    }
  }, b = d2(), _ = re(b), $ = Z(_);
  {
    var x = (N) => {
      var H = Ce(), k = re(H);
      at(k, 17, r, Cn, (P, O) => {
        me();
        var B = Se(" ");
        D(P, B);
      }), D(N, H);
    };
    oe($, (N) => {
      r().length > 1 && N(x);
    });
  }
  var C = A($, 2);
  {
    let N = /* @__PURE__ */ E(() => c(l).nameDisabled === !0);
    rt(C, {
      style: "width: 100%;",
      get value() {
        return c(l).name;
      },
      get placeholder() {
        return i();
      },
      oninput: (H) => {
        f("name", H);
      },
      get disabled() {
        return c(N);
      }
    });
  }
  R(_);
  var S = A(_, 2), M = Z(S);
  {
    let N = /* @__PURE__ */ E(() => c(l).dataTypeItems || G0), H = /* @__PURE__ */ E(() => c(l).dataType ? [c(l).dataType] : []), k = /* @__PURE__ */ E(() => c(l).dataTypeDisabled === !0);
    pt(M, {
      get items() {
        return c(N);
      },
      style: "width: 100%",
      defaultValue: ["String"],
      get value() {
        return c(H);
      },
      get disabled() {
        return c(k);
      },
      onSelect: p
    });
  }
  var j = A(M, 2);
  {
    var L = (N) => {
      Te(N, {
        class: "input-btn-more",
        style: "margin-left: auto",
        onclick: m,
        children: (H, k) => {
          var P = l2();
          D(H, P);
        },
        $$slots: { default: !0 }
      });
    };
    oe(j, (N) => {
      (c(l).dataType === "Object" || c(l).dataType === "Array") && c(l).addChildDisabled !== !0 && N(L);
    });
  }
  R(S);
  var I = A(S, 2), T = Z(I);
  return At(
    ir(T, {
      placement: "bottom",
      floating: (N) => {
        var H = c2(), k = Z(H), P = A(Z(k));
        {
          let K = /* @__PURE__ */ E(() => c(l).defaultValue || "");
          Ye(P, {
            rows: 1,
            style: "width: 100%;",
            get value() {
              return c(K);
            },
            onchange: (G) => {
              f("defaultValue", G);
            }
          });
        }
        R(k);
        var O = A(k, 2), B = A(Z(O));
        {
          let K = /* @__PURE__ */ E(() => c(l).description || "");
          Ye(B, {
            rows: 3,
            style: "width: 100%;",
            get value() {
              return c(K);
            },
            onchange: (G) => {
              f("description", G);
            }
          });
        }
        R(O);
        var V = A(O, 2);
        {
          var F = (K) => {
            var G = u2(), ne = Z(G);
            Te(ne, {
              onclick: y,
              children: (q, z) => {
                me();
                var Y = Se("删除");
                D(q, Y);
              },
              $$slots: { default: !0 }
            }), R(G), D(K, G);
          };
          oe(V, (K) => {
            c(l).deleteDisabled !== !0 && K(F);
          });
        }
        R(H), D(N, H);
      },
      children: (N, H) => {
        jo(N, {});
      },
      $$slots: { floating: !0, default: !0 }
    }),
    (N) => h = N,
    () => h
  ), R(I), D(e, b), fe(w);
}
le(
  tf,
  {
    parameter: {},
    position: {},
    dataKeyName: {},
    placeholder: {}
  },
  [],
  [],
  !0
);
var p2 = /* @__PURE__ */ J("<!> <!>", 1), h2 = /* @__PURE__ */ J('<div class="none-params svelte-1oz5kx0"> </div>'), g2 = /* @__PURE__ */ J('<div class="input-header svelte-1oz5kx0">参数名称</div> <div class="input-header svelte-1oz5kx0">参数类型</div> <div class="input-header svelte-1oz5kx0"></div>', 1), v2 = /* @__PURE__ */ J('<div class="input-container svelte-1oz5kx0"><!> <!></div>');
const m2 = {
  hash: "svelte-1oz5kx0",
  code: `.input-container.svelte-1oz5kx0 {display:grid;grid-template-columns:40% 50% 10%;row-gap:5px;column-gap:3px;}.input-container.svelte-1oz5kx0 .none-params:where(.svelte-1oz5kx0) {font-size:12px;background:#f8f8f8;height:40px;display:flex;justify-content:center;align-items:center;border-radius:5px;width:calc(100% - 5px);grid-column:1 / -1;
  /* 从第一列开始到最后一列结束 */}.input-container.svelte-1oz5kx0 .input-header:where(.svelte-1oz5kx0) {font-size:12px;color:#666;}`
};
function Bn(e, t) {
  de(t, !0), Ke(e, m2);
  const n = (y, m = bt, w = bt) => {
    var b = Ce(), _ = re(b);
    at(
      _,
      19,
      m,
      ($) => `${$.id}_${$.children ? $.children.length : 0}`,
      ($, x, C) => {
        var S = p2(), M = re(S);
        {
          let I = /* @__PURE__ */ E(() => [...w(), c(C)]);
          tf(M, {
            get parameter() {
              return c(x);
            },
            get position() {
              return c(I);
            },
            get dataKeyName() {
              return o();
            },
            get placeholder() {
              return i();
            }
          });
        }
        var j = A(M, 2);
        {
          var L = (I) => {
            {
              let T = /* @__PURE__ */ E(() => [...w(), c(C)]);
              n(I, () => c(x).children, () => c(T));
            }
          };
          oe(j, (I) => {
            c(x).children && I(L);
          });
        }
        D($, S);
      },
      ($) => {
        var x = Ce(), C = re(x);
        {
          var S = (M) => {
            var j = h2(), L = Z(j, !0);
            R(j), xe(() => Re(L, r())), D(M, j);
          };
          oe(C, (M) => {
            w().length === 0 && M(S);
          });
        }
        D($, x);
      }
    ), D(y, b);
  }, r = v(t, "noneParameterText", 7, "无输出参数"), o = v(t, "dataKeyName", 7, "outputDefs"), i = v(t, "placeholder", 7, "请输入参数名称");
  let s = nt(), a = Kn(s), l = /* @__PURE__ */ E(() => [...a?.current?.data?.[o()] || []]);
  var u = {
    get noneParameterText() {
      return r();
    },
    set noneParameterText(y = "无输出参数") {
      r(y), g();
    },
    get dataKeyName() {
      return o();
    },
    set dataKeyName(y = "outputDefs") {
      o(y), g();
    },
    get placeholder() {
      return i();
    },
    set placeholder(y = "请输入参数名称") {
      i(y), g();
    }
  }, d = v2(), f = Z(d);
  {
    var p = (y) => {
      var m = g2();
      me(4), D(y, m);
    };
    oe(f, (y) => {
      c(l).length !== 0 && y(p);
    });
  }
  var h = A(f, 2);
  return n(h, () => c(l) || [], () => []), R(d), D(e, d), fe(u);
}
le(Bn, { noneParameterText: {}, dataKeyName: {}, placeholder: {} }, [], [], !0);
var y2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.7134 7.12811L20.4668 7.69379C20.2864 8.10792 19.7136 8.10792 19.5331 7.69379L19.2866 7.12811C18.8471 6.11947 18.0555 5.31641 17.0677 4.87708L16.308 4.53922C15.8973 4.35653 15.8973 3.75881 16.308 3.57612L17.0252 3.25714C18.0384 2.80651 18.8442 1.97373 19.2761 0.930828L19.5293 0.319534C19.7058 -0.106511 20.2942 -0.106511 20.4706 0.319534L20.7238 0.930828C21.1558 1.97373 21.9616 2.80651 22.9748 3.25714L23.6919 3.57612C24.1027 3.75881 24.1027 4.35653 23.6919 4.53922L22.9323 4.87708C21.9445 5.31641 21.1529 6.11947 20.7134 7.12811ZM9 2C13.0675 2 16.426 5.03562 16.9337 8.96494L19.1842 12.5037C19.3324 12.7367 19.3025 13.0847 18.9593 13.2317L17 14.071V17C17 18.1046 16.1046 19 15 19H13.001L13 22H4L4.00025 18.3061C4.00033 17.1252 3.56351 16.0087 2.7555 15.0011C1.65707 13.6313 1 11.8924 1 10C1 5.58172 4.58172 2 9 2ZM9 4C5.68629 4 3 6.68629 3 10C3 11.3849 3.46818 12.6929 4.31578 13.7499C5.40965 15.114 6.00036 16.6672 6.00025 18.3063L6.00013 20H11.0007L11.0017 17H15V12.7519L16.5497 12.0881L15.0072 9.66262L14.9501 9.22118C14.5665 6.25141 12.0243 4 9 4ZM19.4893 16.9929L21.1535 18.1024C22.32 16.3562 23 14.2576 23 12.0001C23 11.317 22.9378 10.6486 22.8186 10L20.8756 10.5C20.9574 10.9878 21 11.489 21 12.0001C21 13.8471 20.4436 15.5642 19.4893 16.9929Z"></path></svg>'), w2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), b2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), x2 = /* @__PURE__ */ J('<div class="llm-setting svelte-j81vcl"><div class="setting-title svelte-j81vcl">采样参数</div> <div class="setting-item svelte-j81vcl"><div class="slider-container svelte-j81vcl"><span class="svelte-j81vcl"> </span> <input class="nodrag svelte-j81vcl" type="range" min="0" max="1" step="0.1"/></div></div> <div class="setting-item svelte-j81vcl"><div class="slider-container svelte-j81vcl"><span class="svelte-j81vcl"> </span> <input class="nodrag svelte-j81vcl" type="range" min="0" max="1" step="0.1"/></div></div> <div class="setting-item svelte-j81vcl"><div class="slider-container svelte-j81vcl"><span class="svelte-j81vcl"> </span> <input class="nodrag svelte-j81vcl" type="range" min="0" max="100" step="1"/></div></div></div>'), k2 = /* @__PURE__ */ J('<div class="heading svelte-j81vcl"><!> <!></div> <!> <div class="heading svelte-j81vcl" style="padding-top: 10px"><!> <!></div> <!> <!> <div class="setting-title svelte-j81vcl">模型</div> <div class="setting-item svelte-j81vcl"><!> <!></div> <div class="setting-title svelte-j81vcl">系统提示词</div> <div class="setting-item svelte-j81vcl"><!></div> <div class="setting-title svelte-j81vcl">用户提示词</div> <div class="setting-item svelte-j81vcl"><!></div> <div class="heading svelte-j81vcl"><!> <!></div> <!>', 1);
const _2 = {
  hash: "svelte-j81vcl",
  code: `.heading.svelte-j81vcl {display:flex;align-items:center;margin-bottom:10px;}.setting-title.svelte-j81vcl {font-size:12px;color:#999;margin-bottom:4px;margin-top:10px;}.setting-item.svelte-j81vcl {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}\r
\r
    /* 新增样式 */.slider-container.svelte-j81vcl {width:100%;display:flex;flex-direction:column;gap:4px;}.slider-container.svelte-j81vcl span:where(.svelte-j81vcl) {font-size:12px;color:#666;display:flex;justify-content:space-between;align-items:center;}.llm-setting.svelte-j81vcl {width:200px;background:#fff;padding:10px;border-radius:5px;box-shadow:0 0 10px rgba(0, 0, 0, 0.1);border:1px solid #ddd;}input[type="range"].svelte-j81vcl {width:100%;height:4px;background:#ddd;border-radius:2px;outline:none;-webkit-appearance:none;}input[type="range"].svelte-j81vcl::-webkit-slider-thumb {-webkit-appearance:none;width:14px;height:14px;background:#007bff;border-radius:50%;cursor:pointer;}`
};
function nf(e, t) {
  de(t, !0), Ke(e, _2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un(), s = Mn();
  let a = /* @__PURE__ */ Ne(Pt([]));
  jn(async () => {
    const f = await s.provider?.llm?.();
    c(a).push(...f || []);
  });
  const { updateNodeData: l } = ut(), u = (f) => {
    l(o, () => ({ outType: f })), f === "text" ? l(o, {
      outputDefs: [
        {
          name: "output",
          dataType: "String",
          dataTypeDisabled: !0,
          deleteDisabled: !0
        }
      ]
    }) : l(o, {
      outputDefs: [
        {
          name: "root",
          dataType: "Object",
          dataTypeItems: [
            { value: "Object", label: "Object" },
            { value: "Array", label: "Array" }
          ],
          deleteDisabled: !0
        }
      ]
    });
  };
  Je(() => {
    n().outType || u("text");
  });
  var d = {
    get data() {
      return n();
    },
    set data(f) {
      n(f), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (f) => {
        var p = y2();
        D(f, p);
      },
      children: (f, p) => {
        var h = k2(), y = re(h), m = Z(y);
        ze(m, {
          level: 3,
          children: (V, F) => {
            me();
            var K = Se("输入参数");
            D(V, K);
          },
          $$slots: { default: !0 }
        });
        var w = A(m, 2);
        Te(w, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o);
          },
          children: (V, F) => {
            var K = w2();
            D(V, K);
          },
          $$slots: { default: !0 }
        }), R(y);
        var b = A(y, 2);
        $t(b, {});
        var _ = A(b, 2), $ = Z(_);
        ze($, {
          level: 3,
          children: (V, F) => {
            me();
            var K = Se("图片识别");
            D(V, K);
          },
          $$slots: { default: !0 }
        });
        var x = A($, 2);
        Te(x, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o, "images");
          },
          children: (V, F) => {
            var K = b2();
            D(V, K);
          },
          $$slots: { default: !0 }
        }), R(_);
        var C = A(_, 2);
        $t(C, { dataKeyName: "images", noneParameterText: "无图片参数" });
        var S = A(C, 2);
        ze(S, {
          level: 3,
          mt: "10px",
          children: (V, F) => {
            me();
            var K = Se("模型设置");
            D(V, K);
          },
          $$slots: { default: !0 }
        });
        var M = A(S, 4), j = Z(M);
        {
          let V = /* @__PURE__ */ E(() => n().llmId ? [n().llmId] : []);
          pt(j, {
            get items() {
              return c(a);
            },
            style: "width: 100%",
            placeholder: "请选择模型",
            onSelect: (F) => {
              const K = F.value;
              l(o, () => ({ llmId: K }));
            },
            get value() {
              return c(V);
            }
          });
        }
        var L = A(j, 2);
        ir(L, {
          placement: "bottom",
          floating: (V) => {
            var F = x2(), K = A(Z(F), 2), G = Z(K), ne = Z(G), q = Z(ne);
            R(ne);
            var z = A(ne, 2);
            Sn(z), z.__input = (we) => l(o, { temperature: parseFloat(we.target.value) }), R(G), R(K);
            var Y = A(K, 2), W = Z(Y), te = Z(W), ee = Z(te);
            R(te);
            var U = A(te, 2);
            Sn(U), U.__input = (we) => l(o, { topP: parseFloat(we.target.value) }), R(W), R(Y);
            var ce = A(Y, 2), se = Z(ce), ae = Z(se), ie = Z(ae);
            R(ae);
            var pe = A(ae, 2);
            Sn(pe), pe.__input = (we) => l(o, { topK: parseInt(we.target.value) }), R(se), R(ce), R(F), xe(() => {
              Re(q, `Temperature: ${n().temperature ?? 0.7 ?? ""}`), Uo(z, n().temperature ?? 0.7), Re(ee, `Top P: ${n().topP ?? 0.9 ?? ""}`), Uo(U, n().topP ?? 0.9), Re(ie, `Top K: ${n().topK ?? 50 ?? ""}`), Uo(pe, n().topK ?? 50);
            }), D(V, F);
          },
          children: (V, F) => {
            jo(V, {});
          },
          $$slots: { floating: !0, default: !0 }
        }), R(M);
        var I = A(M, 4), T = Z(I);
        {
          let V = /* @__PURE__ */ E(() => n().systemPrompt || "");
          Ye(T, {
            rows: 5,
            placeholder: "请输入系统提示词",
            style: "width: 100%",
            get value() {
              return c(V);
            },
            oninput: (F) => {
              l(o, { systemPrompt: F.target.value });
            }
          });
        }
        R(I);
        var N = A(I, 4), H = Z(N);
        {
          let V = /* @__PURE__ */ E(() => n().userPrompt || "");
          Ye(H, {
            rows: 5,
            placeholder: "请输入用户提示词",
            style: "width: 100%",
            get value() {
              return c(V);
            },
            oninput: (F) => {
              l(o, { userPrompt: F.target.value });
            }
          });
        }
        R(N);
        var k = A(N, 2), P = Z(k);
        ze(P, {
          level: 3,
          children: (V, F) => {
            me();
            var K = Se("输出参数");
            D(V, K);
          },
          $$slots: { default: !0 }
        });
        var O = A(P, 2);
        {
          let V = /* @__PURE__ */ E(() => n().outType ? [n().outType] : []);
          pt(O, {
            items: [
              { label: "文本", value: "text" },
              { label: "JSON", value: "json" }
            ],
            style: "width: 100px;margin-left: auto",
            onSelect: (F) => {
              u(F.value);
            },
            get value() {
              return c(V);
            }
          });
        }
        R(k);
        var B = A(k, 2);
        Bn(B, {}), D(f, h);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(d);
}
rr(["input"]);
le(nf, { data: {} }, [], [], !0);
var $2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12L15.9289 19.0711L14.5147 17.6569L20.1716 12L14.5147 6.34317L15.9289 4.92896L23 12ZM3.82843 12L9.48528 17.6569L8.07107 19.0711L1 12L8.07107 4.92896L9.48528 6.34317L3.82843 12Z"></path></svg>'), C2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), S2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), E2 = /* @__PURE__ */ J('<div class="heading svelte-1wcsayx"><!> <!></div> <!> <!> <div class="setting-title svelte-1wcsayx">执行引擎</div> <div class="setting-item svelte-1wcsayx"><!></div> <div class="setting-title svelte-1wcsayx">执行代码</div> <div class="setting-item svelte-1wcsayx"><!></div> <div class="heading svelte-1wcsayx"><!> <!></div> <!>', 1);
const P2 = {
  hash: "svelte-1wcsayx",
  code: ".heading.svelte-1wcsayx {display:flex;margin-bottom:10px;}.setting-title.svelte-1wcsayx {font-size:12px;color:#999;margin-bottom:4px;margin-top:10px;}.setting-item.svelte-1wcsayx {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}"
};
function rf(e, t) {
  de(t, !0), Ke(e, P2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]);
  jn(() => {
    n().engine || s(o, () => ({ engine: "qlexpress" }));
  });
  const o = nt(), { addParameter: i } = un(), { updateNodeData: s } = ut(), a = [
    { label: "JavaScript", value: "js" },
    { label: "Groovy", value: "groovy" },
    { label: "QLExpress", value: "qlexpress" }
  ];
  var l = {
    get data() {
      return n();
    },
    set data(u) {
      n(u), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (u) => {
        var d = $2();
        D(u, d);
      },
      children: (u, d) => {
        var f = E2(), p = re(f), h = Z(p);
        ze(h, {
          level: 3,
          children: (L, I) => {
            me();
            var T = Se("输入参数");
            D(L, T);
          },
          $$slots: { default: !0 }
        });
        var y = A(h, 2);
        Te(y, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o);
          },
          children: (L, I) => {
            var T = C2();
            D(L, T);
          },
          $$slots: { default: !0 }
        }), R(p);
        var m = A(p, 2);
        $t(m, {});
        var w = A(m, 2);
        ze(w, {
          level: 3,
          mt: "10px",
          children: (L, I) => {
            me();
            var T = Se("代码");
            D(L, T);
          },
          $$slots: { default: !0 }
        });
        var b = A(w, 4), _ = Z(b);
        {
          let L = /* @__PURE__ */ E(() => n().engine ? [n().engine] : ["qlexpress"]);
          pt(_, {
            get items() {
              return a;
            },
            style: "width: 100%",
            placeholder: "请选择执行引擎",
            onSelect: (I) => {
              const T = I.value;
              s(o, () => ({ engine: T }));
            },
            get value() {
              return c(L);
            }
          });
        }
        R(b);
        var $ = A(b, 4), x = Z($);
        {
          let L = /* @__PURE__ */ E(() => n().code || "");
          Ye(x, {
            rows: 10,
            placeholder: "请输入执行代码，注：输出内容需添加到_result中，如：_result['key'] = value 或者 _result.key = value",
            style: "width: 100%",
            onchange: (I) => {
              s(o, () => ({ code: I.target.value }));
            },
            get value() {
              return c(L);
            }
          });
        }
        R($);
        var C = A($, 2), S = Z(C);
        ze(S, {
          level: 3,
          mt: "10px",
          children: (L, I) => {
            me();
            var T = Se("输出参数");
            D(L, T);
          },
          $$slots: { default: !0 }
        });
        var M = A(S, 2);
        Te(M, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o, "outputDefs");
          },
          children: (L, I) => {
            var T = S2();
            D(L, T);
          },
          $$slots: { default: !0 }
        }), R(C);
        var j = A(C, 2);
        Bn(j, {}), D(u, f);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(l);
}
le(rf, { data: {} }, [], [], !0);
var N2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4ZM4 5V19H20V5H4ZM7 8H17V11H15V10H13V14H14.5V16H9.5V14H11V10H9V11H7V8Z"></path></svg>'), D2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), H2 = /* @__PURE__ */ J('<div class="heading svelte-1lcrzpc"><!> <!></div> <!> <!> <div class="setting-item svelte-1lcrzpc"><!></div> <div class="heading svelte-1lcrzpc"><!></div> <!>', 1);
const O2 = {
  hash: "svelte-1lcrzpc",
  code: ".heading.svelte-1lcrzpc {display:flex;margin-bottom:10px;}.setting-item.svelte-1lcrzpc {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}"
};
function of(e, t) {
  de(t, !0), Ke(e, O2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un(), { updateNodeData: s } = ut();
  Je(() => {
    (!n().outputDefs || n().outputDefs.length === 0) && i(o, "outputDefs", {
      name: "output",
      dataType: "String",
      dataTypeDisabled: !0,
      deleteDisabled: !0
    });
  });
  var a = {
    get data() {
      return n();
    },
    set data(l) {
      n(l), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (l) => {
        var u = N2();
        D(l, u);
      },
      children: (l, u) => {
        var d = H2(), f = re(d), p = Z(f);
        ze(p, {
          level: 3,
          children: (C, S) => {
            me();
            var M = Se("输入参数");
            D(C, M);
          },
          $$slots: { default: !0 }
        });
        var h = A(p, 2);
        Te(h, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o);
          },
          children: (C, S) => {
            var M = D2();
            D(C, M);
          },
          $$slots: { default: !0 }
        }), R(f);
        var y = A(f, 2);
        $t(y, {});
        var m = A(y, 2);
        ze(m, {
          level: 3,
          mt: "10px",
          mb: "10px",
          children: (C, S) => {
            me();
            var M = Se("模板内容");
            D(C, M);
          },
          $$slots: { default: !0 }
        });
        var w = A(m, 2), b = Z(w);
        {
          let C = /* @__PURE__ */ E(() => n().template || "");
          Ye(b, {
            rows: 10,
            placeholder: "请输入模板内容",
            style: "width: 100%",
            onchange: (S) => {
              s(o, () => ({ template: S.target.value }));
            },
            get value() {
              return c(C);
            }
          });
        }
        R(w);
        var _ = A(w, 2), $ = Z(_);
        ze($, {
          level: 3,
          mt: "10px",
          children: (C, S) => {
            me();
            var M = Se("输出参数");
            D(C, M);
          },
          $$slots: { default: !0 }
        }), R(_);
        var x = A(_, 2);
        Bn(x, {}), D(l, d);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(a);
}
le(of, { data: {} }, [], [], !0);
var M2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.23509 6.45329C4.85101 7.89148 4 9.84636 4 12C4 16.4183 7.58172 20 12 20C13.0808 20 14.1116 19.7857 15.0521 19.3972C15.1671 18.6467 14.9148 17.9266 14.8116 17.6746C14.582 17.115 13.8241 16.1582 12.5589 14.8308C12.2212 14.4758 12.2429 14.2035 12.3636 13.3943L12.3775 13.3029C12.4595 12.7486 12.5971 12.4209 14.4622 12.1248C15.4097 11.9746 15.6589 12.3533 16.0043 12.8777C16.0425 12.9358 16.0807 12.9928 16.1198 13.0499C16.4479 13.5297 16.691 13.6394 17.0582 13.8064C17.2227 13.881 17.428 13.9751 17.7031 14.1314C18.3551 14.504 18.3551 14.9247 18.3551 15.8472V15.9518C18.3551 16.3434 18.3168 16.6872 18.2566 16.9859C19.3478 15.6185 20 13.8854 20 12C20 8.70089 18.003 5.8682 15.1519 4.64482C14.5987 5.01813 13.8398 5.54726 13.575 5.91C13.4396 6.09538 13.2482 7.04166 12.6257 7.11976C12.4626 7.14023 12.2438 7.12589 12.012 7.11097C11.3905 7.07058 10.5402 7.01606 10.268 7.75495C10.0952 8.2232 10.0648 9.49445 10.6239 10.1543C10.7134 10.2597 10.7307 10.4547 10.6699 10.6735C10.59 10.9608 10.4286 11.1356 10.3783 11.1717C10.2819 11.1163 10.0896 10.8931 9.95938 10.7412C9.64554 10.3765 9.25405 9.92233 8.74797 9.78176C8.56395 9.73083 8.36166 9.68867 8.16548 9.64736C7.6164 9.53227 6.99443 9.40134 6.84992 9.09302C6.74442 8.8672 6.74488 8.55621 6.74529 8.22764C6.74529 7.8112 6.74529 7.34029 6.54129 6.88256C6.46246 6.70541 6.35689 6.56446 6.23509 6.45329ZM12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22Z"></path></svg>'), A2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), T2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), z2 = /* @__PURE__ */ J('<!> <div class="radio-group svelte-19uflw6"><label class="svelte-19uflw6"><!>none</label> <label class="svelte-19uflw6"><!>form-data</label> <label class="svelte-19uflw6"><!>x-www-form-urlencoded</label> <label class="svelte-19uflw6"><!>json</label> <label class="svelte-19uflw6"><!>raw</label></div>', 1), V2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), L2 = /* @__PURE__ */ J('<div class="heading svelte-19uflw6" style="padding-top: 10px"><!> <!></div> <!>', 1), I2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), j2 = /* @__PURE__ */ J('<div class="heading svelte-19uflw6" style="padding-top: 10px"><!> <!></div> <!>', 1), R2 = /* @__PURE__ */ J('<div style="width: 100%"><!></div>'), K2 = /* @__PURE__ */ J('<div style="width: 100%"><!></div>'), Z2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), B2 = /* @__PURE__ */ J('<div class="heading svelte-19uflw6"><!> <!></div> <!> <!> <div style="display: flex;gap: 2px;width: 100%;padding: 10px 0"><div><!></div> <div style="width: 100%"><!></div></div> <div class="heading svelte-19uflw6"><!> <!></div> <!> <!> <!> <!> <!> <!> <div class="heading svelte-19uflw6"><!> <!></div> <!>', 1);
const Y2 = {
  hash: "svelte-19uflw6",
  code: ".heading.svelte-19uflw6 {display:flex;margin-bottom:10px;}.radio-group.svelte-19uflw6 {display:flex;margin:10px 0;flex-wrap:wrap;}.radio-group.svelte-19uflw6 label:where(.svelte-19uflw6) {display:flex;font-size:14px;box-sizing:border-box;}"
};
function sf(e, t) {
  de(t, !0), Ke(e, Y2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]);
  jn(() => {
    n().method || a(i, () => ({ method: "get" })), n().outputDefs || s(i, "outputDefs", [
      {
        name: "headers",
        nameDisabled: !0,
        dataType: "Object",
        dataTypeDisabled: !0,
        deleteDisabled: !0
      },
      {
        name: "body",
        nameDisabled: !0,
        dataType: "String",
        deleteDisabled: !0
      },
      {
        name: "statusCode",
        nameDisabled: !0,
        dataType: "Number",
        dataTypeDisabled: !0,
        deleteDisabled: !0
      }
    ]);
  });
  const o = [
    { value: "get", label: "GET" },
    { value: "post", label: "POST" },
    { value: "put", label: "PUT" },
    { value: "delete", label: "DELETE" },
    { value: "head", label: "HEAD" },
    { value: "patch", label: "PATCH" }
  ], i = nt(), { addParameter: s } = un(), { updateNodeData: a } = ut();
  var l = {
    get data() {
      return n();
    },
    set data(u) {
      n(u), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (u) => {
        var d = M2();
        D(u, d);
      },
      children: (u, d) => {
        var f = B2(), p = re(f), h = Z(p);
        ze(h, {
          level: 3,
          children: (z, Y) => {
            me();
            var W = Se("输入参数");
            D(z, W);
          },
          $$slots: { default: !0 }
        });
        var y = A(h, 2);
        Te(y, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            s(i);
          },
          children: (z, Y) => {
            var W = A2();
            D(z, W);
          },
          $$slots: { default: !0 }
        }), R(p);
        var m = A(p, 2);
        $t(m, {});
        var w = A(m, 2);
        ze(w, {
          level: 3,
          mt: "10px",
          children: (z, Y) => {
            me();
            var W = Se("URL 地址");
            D(z, W);
          },
          $$slots: { default: !0 }
        });
        var b = A(w, 2), _ = Z(b), $ = Z(_);
        {
          let z = /* @__PURE__ */ E(() => n().method ? [n().method] : ["get"]);
          pt($, {
            get items() {
              return o;
            },
            style: "width: 100%",
            placeholder: "请选择请求方式",
            onSelect: (Y) => {
              const W = Y.value;
              a(i, () => ({ method: W }));
            },
            get value() {
              return c(z);
            }
          });
        }
        R(_);
        var x = A(_, 2), C = Z(x);
        {
          let z = /* @__PURE__ */ E(() => n().url || "");
          rt(C, {
            placeholder: "请输入url",
            style: "width: 100%",
            onchange: (Y) => {
              a(i, () => ({ url: Y.target.value }));
            },
            get value() {
              return c(z);
            }
          });
        }
        R(x), R(b);
        var S = A(b, 2), M = Z(S);
        ze(M, {
          level: 3,
          children: (z, Y) => {
            me();
            var W = Se("Http 头信息");
            D(z, W);
          },
          $$slots: { default: !0 }
        });
        var j = A(M, 2);
        Te(j, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            s(i, "headers");
          },
          children: (z, Y) => {
            var W = T2();
            D(z, W);
          },
          $$slots: { default: !0 }
        }), R(S);
        var L = A(S, 2);
        $t(L, { dataKeyName: "headers" });
        var I = A(L, 2);
        {
          var T = (z) => {
            var Y = z2(), W = re(Y);
            ze(W, {
              level: 3,
              mt: "10px",
              children: (ge, $e) => {
                me();
                var X = Se("Body");
                D(ge, X);
              },
              $$slots: { default: !0 }
            });
            var te = A(W, 2), ee = Z(te), U = Z(ee);
            {
              let ge = /* @__PURE__ */ E(() => !n().bodyType || n().bodyType === "");
              rt(U, {
                type: "radio",
                value: "",
                get checked() {
                  return c(ge);
                },
                onchange: ($e) => {
                  $e.target?.checked && a(i, { bodyType: "" });
                }
              });
            }
            me(), R(ee);
            var ce = A(ee, 2), se = Z(ce);
            {
              let ge = /* @__PURE__ */ E(() => n().bodyType === "form-data");
              rt(se, {
                type: "radio",
                value: "form-data",
                get checked() {
                  return c(ge);
                },
                onchange: ($e) => {
                  $e.target?.checked && a(i, { bodyType: "form-data" });
                }
              });
            }
            me(), R(ce);
            var ae = A(ce, 2), ie = Z(ae);
            {
              let ge = /* @__PURE__ */ E(() => n().bodyType === "x-www-form-urlencoded");
              rt(ie, {
                type: "radio",
                value: "x-www-form-urlencoded",
                get checked() {
                  return c(ge);
                },
                onchange: ($e) => {
                  $e.target?.checked && a(i, { bodyType: "x-www-form-urlencoded" });
                }
              });
            }
            me(), R(ae);
            var pe = A(ae, 2), we = Z(pe);
            {
              let ge = /* @__PURE__ */ E(() => n().bodyType === "json");
              rt(we, {
                type: "radio",
                value: "json",
                get checked() {
                  return c(ge);
                },
                onchange: ($e) => {
                  $e.target?.checked && a(i, { bodyType: "json" });
                }
              });
            }
            me(), R(pe);
            var he = A(pe, 2), ue = Z(he);
            {
              let ge = /* @__PURE__ */ E(() => n().bodyType === "raw");
              rt(ue, {
                type: "radio",
                value: "raw",
                get checked() {
                  return c(ge);
                },
                onchange: ($e) => {
                  $e.target?.checked && a(i, { bodyType: "raw" });
                }
              });
            }
            me(), R(he), R(te), D(z, Y);
          };
          oe(I, (z) => {
            (n().method === "post" || n().method === "put" || n().method === "delete" || n().method === "patch") && z(T);
          });
        }
        var N = A(I, 2);
        {
          var H = (z) => {
            var Y = L2(), W = re(Y), te = Z(W);
            ze(te, {
              level: 3,
              children: (ce, se) => {
                me();
                var ae = Se("参数");
                D(ce, ae);
              },
              $$slots: { default: !0 }
            });
            var ee = A(te, 2);
            Te(ee, {
              class: "input-btn-more",
              style: "margin-left: auto",
              onclick: () => {
                s(i, "formData");
              },
              children: (ce, se) => {
                var ae = V2();
                D(ce, ae);
              },
              $$slots: { default: !0 }
            }), R(W);
            var U = A(W, 2);
            $t(U, { dataKeyName: "formData" }), D(z, Y);
          };
          oe(N, (z) => {
            n().bodyType === "form-data" && z(H);
          });
        }
        var k = A(N, 2);
        {
          var P = (z) => {
            var Y = j2(), W = re(Y), te = Z(W);
            ze(te, {
              level: 3,
              children: (ce, se) => {
                me();
                var ae = Se("Body 参数");
                D(ce, ae);
              },
              $$slots: { default: !0 }
            });
            var ee = A(te, 2);
            Te(ee, {
              class: "input-btn-more",
              style: "margin-left: auto",
              onclick: () => {
                s(i, "formUrlencoded");
              },
              children: (ce, se) => {
                var ae = I2();
                D(ce, ae);
              },
              $$slots: { default: !0 }
            }), R(W);
            var U = A(W, 2);
            $t(U, { dataKeyName: "formUrlencoded" }), D(z, Y);
          };
          oe(k, (z) => {
            n().bodyType === "x-www-form-urlencoded" && z(P);
          });
        }
        var O = A(k, 2);
        {
          var B = (z) => {
            var Y = R2(), W = Z(Y);
            Ye(W, {
              rows: 5,
              style: "width: 100%",
              placeholder: "请输入 json 信息",
              get value() {
                return n().bodyJson;
              },
              oninput: (te) => {
                a(i, { bodyJson: te.target.value });
              }
            }), R(Y), D(z, Y);
          };
          oe(O, (z) => {
            n().bodyType === "json" && z(B);
          });
        }
        var V = A(O, 2);
        {
          var F = (z) => {
            var Y = K2(), W = Z(Y);
            Ye(W, {
              rows: 5,
              style: "width: 100%",
              placeholder: "请输入请求信息",
              get value() {
                return n().bodyRaw;
              },
              oninput: (te) => {
                a(i, { bodyRaw: te.target.value });
              }
            }), R(Y), D(z, Y);
          };
          oe(V, (z) => {
            n().bodyType === "raw" && z(F);
          });
        }
        var K = A(V, 2), G = Z(K);
        ze(G, {
          level: 3,
          mt: "10px",
          children: (z, Y) => {
            me();
            var W = Se("输出参数");
            D(z, W);
          },
          $$slots: { default: !0 }
        });
        var ne = A(G, 2);
        Te(ne, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            s(i, "outputDefs");
          },
          children: (z, Y) => {
            var W = Z2();
            D(z, W);
          },
          $$slots: { default: !0 }
        }), R(K);
        var q = A(K, 2);
        Bn(q, {}), D(u, f);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(l);
}
le(sf, { data: {} }, [], [], !0);
var q2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 5C13.567 5 12 6.567 12 8.5C12 10.433 13.567 12 15.5 12C17.433 12 19 10.433 19 8.5C19 6.567 17.433 5 15.5 5ZM10 8.5C10 5.46243 12.4624 3 15.5 3C18.5376 3 21 5.46243 21 8.5C21 9.6575 20.6424 10.7315 20.0317 11.6175L22.7071 14.2929L21.2929 15.7071L18.6175 13.0317C17.7315 13.6424 16.6575 14 15.5 14C12.4624 14 10 11.5376 10 8.5ZM3 4H8V6H3V4ZM3 11H8V13H3V11ZM21 18V20H3V18H21Z"></path></svg>'), X2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), F2 = /* @__PURE__ */ J('<div class="heading svelte-ddi5i"><!> <!></div> <!> <!> <div class="setting-title svelte-ddi5i">知识库</div> <div class="setting-item svelte-ddi5i"><!></div> <div class="setting-title svelte-ddi5i">关键字</div> <div class="setting-item svelte-ddi5i"><!></div> <div class="setting-title svelte-ddi5i">获取数据量</div> <div class="setting-item svelte-ddi5i"><!></div> <div class="heading svelte-ddi5i"><!></div> <!>', 1);
const W2 = {
  hash: "svelte-ddi5i",
  code: ".heading.svelte-ddi5i {display:flex;margin-bottom:10px;}.setting-title.svelte-ddi5i {font-size:12px;color:#999;margin-bottom:4px;margin-top:10px;}.setting-item.svelte-ddi5i {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}"
};
function af(e, t) {
  de(t, !0), Ke(e, W2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un(), s = Mn();
  let a = /* @__PURE__ */ Ne(Pt([]));
  jn(async () => {
    const d = await s.provider?.knowledge?.();
    c(a).push(...d || []);
  });
  const { updateNodeData: l } = ut();
  Je(() => {
    (!n().outputDefs || n().outputDefs.length === 0) && i(o, "outputDefs", {
      name: "documents",
      dataType: "Array",
      nameDisabled: !0,
      dataTypeDisabled: !0,
      addChildDisabled: !0,
      deleteDisabled: !0,
      children: [
        {
          name: "title",
          dataType: "String",
          nameDisabled: !0,
          dataTypeDisabled: !0,
          deleteDisabled: !0
        },
        {
          name: "content",
          dataType: "String",
          nameDisabled: !0,
          dataTypeDisabled: !0,
          deleteDisabled: !0
        },
        {
          name: "documentId",
          dataType: "Number",
          nameDisabled: !0,
          dataTypeDisabled: !0,
          deleteDisabled: !0
        },
        {
          name: "knowledgeId",
          dataType: "Number",
          nameDisabled: !0,
          dataTypeDisabled: !0,
          deleteDisabled: !0
        }
      ]
    });
  });
  var u = {
    get data() {
      return n();
    },
    set data(d) {
      n(d), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (d) => {
        var f = q2();
        D(d, f);
      },
      children: (d, f) => {
        var p = F2(), h = re(p), y = Z(h);
        ze(y, {
          level: 3,
          children: (T, N) => {
            me();
            var H = Se("输入参数");
            D(T, H);
          },
          $$slots: { default: !0 }
        });
        var m = A(y, 2);
        Te(m, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o);
          },
          children: (T, N) => {
            var H = X2();
            D(T, H);
          },
          $$slots: { default: !0 }
        }), R(h);
        var w = A(h, 2);
        $t(w, {});
        var b = A(w, 2);
        ze(b, {
          level: 3,
          mt: "10px",
          children: (T, N) => {
            me();
            var H = Se("知识库设置");
            D(T, H);
          },
          $$slots: { default: !0 }
        });
        var _ = A(b, 4), $ = Z(_);
        {
          let T = /* @__PURE__ */ E(() => n().knowledgeId ? [n().knowledgeId] : []);
          pt($, {
            get items() {
              return c(a);
            },
            style: "width: 100%",
            placeholder: "请选择知识库",
            onSelect: (N) => {
              const H = N.value;
              l(o, () => ({ knowledgeId: H }));
            },
            get value() {
              return c(T);
            }
          });
        }
        R(_);
        var x = A(_, 4), C = Z(x);
        rt(C, {
          placeholder: "请输入关键字",
          style: "width: 100%",
          get value() {
            return n().keyword;
          },
          onchange: (T) => {
            const N = T.target.value;
            l(o, () => ({ keyword: N }));
          }
        }), R(x);
        var S = A(x, 4), M = Z(S);
        {
          let T = /* @__PURE__ */ E(() => n().limit || "");
          rt(M, {
            placeholder: "搜索的数据条数",
            style: "width: 100%",
            onchange: (N) => {
              const H = N.target.value;
              l(o, () => ({ limit: H }));
            },
            get value() {
              return c(T);
            }
          });
        }
        R(S);
        var j = A(S, 2), L = Z(j);
        ze(L, {
          level: 3,
          mt: "10px",
          children: (T, N) => {
            me();
            var H = Se("输出参数");
            D(T, H);
          },
          $$slots: { default: !0 }
        }), R(j);
        var I = A(j, 2);
        Bn(I, {}), D(d, p);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(u);
}
le(af, { data: {} }, [], [], !0);
var G2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path></svg>'), U2 = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), J2 = /* @__PURE__ */ J('<div class="heading svelte-1qblm04"><!> <!></div> <!> <!> <div class="setting-title svelte-1qblm04">搜索引擎</div> <div class="setting-item svelte-1qblm04"><!></div> <div class="setting-title svelte-1qblm04">关键字</div> <div class="setting-item svelte-1qblm04"><!></div> <div class="setting-title svelte-1qblm04">搜索数据量</div> <div class="setting-item svelte-1qblm04"><!></div> <div class="heading svelte-1qblm04"><!></div> <!>', 1);
const Q2 = {
  hash: "svelte-1qblm04",
  code: ".heading.svelte-1qblm04 {display:flex;margin-bottom:10px;}.setting-title.svelte-1qblm04 {font-size:12px;color:#999;margin-bottom:4px;margin-top:10px;}.setting-item.svelte-1qblm04 {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}"
};
function lf(e, t) {
  de(t, !0), Ke(e, Q2);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un(), s = Mn();
  let a = /* @__PURE__ */ Ne(Pt([]));
  jn(async () => {
    const d = await s.provider?.searchEngine?.();
    c(a).push(...d || []);
  });
  const { updateNodeData: l } = ut();
  Je(() => {
    (!n().outputDefs || n().outputDefs.length === 0) && i(o, "outputDefs", {
      name: "documents",
      dataType: "Array",
      nameDisabled: !0,
      dataTypeDisabled: !0,
      addChildDisabled: !0,
      deleteDisabled: !0,
      children: [
        {
          name: "title",
          dataType: "String",
          nameDisabled: !0,
          dataTypeDisabled: !0,
          deleteDisabled: !0
        },
        {
          name: "content",
          dataType: "String",
          nameDisabled: !0,
          dataTypeDisabled: !0,
          deleteDisabled: !0
        }
      ]
    });
  });
  var u = {
    get data() {
      return n();
    },
    set data(d) {
      n(d), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (d) => {
        var f = G2();
        D(d, f);
      },
      children: (d, f) => {
        var p = J2(), h = re(p), y = Z(h);
        ze(y, {
          level: 3,
          children: (T, N) => {
            me();
            var H = Se("输入参数");
            D(T, H);
          },
          $$slots: { default: !0 }
        });
        var m = A(y, 2);
        Te(m, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o);
          },
          children: (T, N) => {
            var H = U2();
            D(T, H);
          },
          $$slots: { default: !0 }
        }), R(h);
        var w = A(h, 2);
        $t(w, {});
        var b = A(w, 2);
        ze(b, {
          level: 3,
          mt: "10px",
          children: (T, N) => {
            me();
            var H = Se("搜索引擎设置");
            D(T, H);
          },
          $$slots: { default: !0 }
        });
        var _ = A(b, 4), $ = Z(_);
        {
          let T = /* @__PURE__ */ E(() => n().engine ? [n().engine] : []);
          pt($, {
            get items() {
              return c(a);
            },
            style: "width: 100%",
            placeholder: "请选择搜索引擎",
            onSelect: (N) => {
              const H = N.value;
              l(o, () => ({ engine: H }));
            },
            get value() {
              return c(T);
            }
          });
        }
        R(_);
        var x = A(_, 4), C = Z(x);
        rt(C, {
          placeholder: "请输入关键字",
          style: "width: 100%",
          get value() {
            return n().keyword;
          },
          onchange: (T) => {
            const N = T.target.value;
            l(o, () => ({ keyword: N }));
          }
        }), R(x);
        var S = A(x, 4), M = Z(S);
        rt(M, {
          placeholder: "搜索的数据条数",
          style: "width: 100%",
          get value() {
            return n().limit;
          },
          onchange: (T) => {
            const N = T.target.value;
            l(o, () => ({ limit: N }));
          }
        }), R(S);
        var j = A(S, 2), L = Z(j);
        ze(L, {
          level: 3,
          mt: "10px",
          children: (T, N) => {
            me();
            var H = Se("输出参数");
            D(T, H);
          },
          $$slots: { default: !0 }
        }), R(j);
        var I = A(j, 2);
        Bn(I, {}), D(d, p);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(u);
}
le(lf, { data: {} }, [], [], !0);
var eb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.46257 4.43262C7.21556 2.91688 9.5007 2 12 2C17.5228 2 22 6.47715 22 12C22 14.1361 21.3302 16.1158 20.1892 17.7406L17 12H20C20 7.58172 16.4183 4 12 4C9.84982 4 7.89777 4.84827 6.46023 6.22842L5.46257 4.43262ZM18.5374 19.5674C16.7844 21.0831 14.4993 22 12 22C6.47715 22 2 17.5228 2 12C2 9.86386 2.66979 7.88416 3.8108 6.25944L7 12H4C4 16.4183 7.58172 20 12 20C14.1502 20 16.1022 19.1517 17.5398 17.7716L18.5374 19.5674Z"></path></svg>'), tb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), nb = /* @__PURE__ */ J('<div class="heading svelte-1o34e8c"><!></div> <!> <div class="heading svelte-1o34e8c"><!> <!></div> <!>', 1);
const rb = {
  hash: "svelte-1o34e8c",
  code: ".heading.svelte-1o34e8c {display:flex;margin:10px 0;align-items:center;}.loop_handle_wrapper ::after {content:'循环体';width:100px;height:20px;background:#000;color:#fff;display:flex;justify-content:center;align-items:center;}"
};
function uf(e, t) {
  de(t, !0), Ke(e, rb);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un();
  Je(() => {
    (!n().loopVars || n().loopVars.length === 0) && i(o, "loopVars", { name: "loopVar", nameDisabled: !0, deleteDisabled: !0 });
  });
  var s = {
    get data() {
      return n();
    },
    set data(a) {
      n(a), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (a) => {
        var l = eb();
        D(a, l);
      },
      handle: (a) => {
        Qn(a, {
          type: "source",
          get position() {
            return be.Bottom;
          },
          id: "loop_handle",
          style: "bottom: -12px;width: 100px",
          class: "loop_handle_wrapper"
        });
      },
      children: (a, l) => {
        var u = nb(), d = re(u), f = Z(d);
        ze(f, {
          level: 3,
          children: (b, _) => {
            me();
            var $ = Se("循环变量");
            D(b, $);
          },
          $$slots: { default: !0 }
        }), R(d);
        var p = A(d, 2);
        $t(p, { dataKeyName: "loopVars" });
        var h = A(p, 2), y = Z(h);
        ze(y, {
          level: 3,
          children: (b, _) => {
            me();
            var $ = Se("输出参数");
            D(b, $);
          },
          $$slots: { default: !0 }
        });
        var m = A(y, 2);
        Te(m, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o, "outputDefs");
          },
          children: (b, _) => {
            var $ = tb();
            D(b, $);
          },
          $$slots: { default: !0 }
        }), R(h);
        var w = A(h, 2);
        $t(w, {
          noneParameterText: "无输出参数",
          dataKeyName: "outputDefs",
          useChildrenOnly: !0
        }), D(a, u);
      },
      $$slots: { icon: !0, handle: !0, default: !0 }
    }
  )), fe(s);
}
le(uf, { data: {} }, [], [], !0);
var ob = /* @__PURE__ */ J('<div class="input-more-setting svelte-5x0hls"><div class="input-more-item svelte-5x0hls">数据内容： <!></div> <div class="input-more-item svelte-5x0hls">确认方式： <!></div> <div class="input-more-item svelte-5x0hls">数据标题： <!></div> <div class="input-more-item svelte-5x0hls">数据描述： <!></div>   <div class="input-more-item svelte-5x0hls"><!></div></div>'), ib = /* @__PURE__ */ J('<div class="input-item svelte-5x0hls"><!></div> <div class="input-item svelte-5x0hls"><!></div> <div class="input-item svelte-5x0hls"><!></div>', 1);
const sb = {
  hash: "svelte-5x0hls",
  code: ".input-item.svelte-5x0hls {display:flex;align-items:center;}.input-more-setting.svelte-5x0hls {display:flex;flex-direction:column;gap:10px;padding:10px;background:#fff;border:1px solid #ddd;border-radius:5px;width:200px;box-shadow:0 0 10px 2px rgba(0, 0, 0, 0.1);}.input-more-setting.svelte-5x0hls .input-more-item:where(.svelte-5x0hls) {display:flex;flex-direction:column;gap:3px;font-size:12px;color:#666;}"
};
function cf(e, t) {
  de(t, !0), Ke(e, sb);
  const n = v(t, "parameter", 7), r = v(t, "index", 7), o = v(t, "dataKeyName", 7), i = v(t, "useChildrenOnly", 7);
  let s = nt(), a = Kn(s), l = /* @__PURE__ */ E(() => ({
    ...n(),
    ...a?.current?.data?.[o()][r()]
  }));
  const { updateNodeData: u } = ut(), d = (N, H) => {
    u(s, (k) => {
      let P = k.data?.[o()];
      return P[r()] = { ...P[r()], [N]: H }, { [o()]: P };
    });
  }, f = (N, H) => {
    const k = H.target.value;
    d(N, k);
  }, p = (N) => {
    const H = N.value;
    d("ref", H);
  }, h = (N) => {
    const H = N.value;
    d("formType", H);
  }, y = (N) => {
    const H = N.value;
    d("contentType", H);
  };
  let m;
  const w = () => {
    u(s, (N) => {
      let H = N.data?.[o()];
      return H.splice(r(), 1), { [o()]: [...H] };
    }), m?.hide();
  };
  let b = Jd(i());
  var _ = {
    get parameter() {
      return n();
    },
    set parameter(N) {
      n(N), g();
    },
    get index() {
      return r();
    },
    set index(N) {
      r(N), g();
    },
    get dataKeyName() {
      return o();
    },
    set dataKeyName(N) {
      o(N), g();
    },
    get useChildrenOnly() {
      return i();
    },
    set useChildrenOnly(N) {
      i(N), g();
    }
  }, $ = ib(), x = re($), C = Z(x);
  {
    let N = /* @__PURE__ */ E(() => c(l).nameDisabled === !0);
    rt(C, {
      style: "width: 100%;",
      get value() {
        return c(l).name;
      },
      placeholder: "请输入参数名称",
      get disabled() {
        return c(N);
      },
      oninput: (H) => f("name", H)
    });
  }
  R(x);
  var S = A(x, 2), M = Z(S);
  {
    var j = (N) => {
      rt(N, {
        get value() {
          return c(l).value;
        },
        placeholder: "请输入参数值",
        oninput: (H) => f("value", H)
      });
    }, L = (N) => {
      var H = Ce(), k = re(H);
      {
        var P = (O) => {
          {
            let B = /* @__PURE__ */ E(() => [c(l).ref]);
            pt(O, {
              get items() {
                return b.current;
              },
              style: "width: 100%",
              defaultValue: ["ref"],
              get value() {
                return c(B);
              },
              expandAll: !0,
              onSelect: p
            });
          }
        };
        oe(
          k,
          (O) => {
            c(l).refType !== "input" && O(P);
          },
          !0
        );
      }
      D(N, H);
    };
    oe(M, (N) => {
      c(l).refType === "fixed" ? N(j) : N(L, !1);
    });
  }
  R(S);
  var I = A(S, 2), T = Z(I);
  return At(
    ir(T, {
      placement: "bottom",
      floating: (N) => {
        var H = ob(), k = Z(H), P = A(Z(k));
        {
          let z = /* @__PURE__ */ E(() => c(l).contentType ? [c(l).contentType] : []);
          pt(P, {
            get items() {
              return ya;
            },
            style: "width: 100%",
            defaultValue: ["text"],
            get value() {
              return c(z);
            },
            onSelect: y
          });
        }
        R(k);
        var O = A(k, 2), B = A(Z(O));
        {
          let z = /* @__PURE__ */ E(() => c(l).formType ? [c(l).formType] : []);
          pt(B, {
            get items() {
              return Q0;
            },
            style: "width: 100%",
            defaultValue: ["single"],
            get value() {
              return c(z);
            },
            onSelect: h
          });
        }
        R(O);
        var V = A(O, 2), F = A(Z(V));
        Ye(F, {
          rows: 1,
          style: "width: 100%;",
          onchange: (z) => {
            f("formLabel", z);
          },
          get value() {
            return c(l).formLabel;
          }
        }), R(V);
        var K = A(V, 2), G = A(Z(K));
        Ye(G, {
          rows: 2,
          style: "width: 100%;",
          onchange: (z) => {
            f("formDescription", z);
          },
          get value() {
            return c(l).formDescription;
          }
        }), R(K);
        var ne = A(K, 2), q = Z(ne);
        Te(q, {
          onclick: w,
          children: (z, Y) => {
            me();
            var W = Se("删除");
            D(z, W);
          },
          $$slots: { default: !0 }
        }), R(ne), R(H), D(N, H);
      },
      children: (N, H) => {
        jo(N, {});
      },
      $$slots: { floating: !0, default: !0 }
    }),
    (N) => m = N,
    () => m
  ), R(I), D(e, $), fe(_);
}
le(
  cf,
  {
    parameter: {},
    index: {},
    dataKeyName: {},
    useChildrenOnly: {}
  },
  [],
  [],
  !0
);
var ab = /* @__PURE__ */ J('<div class="input-header svelte-1fllp9b">参数名称</div> <div class="input-header svelte-1fllp9b">参数值</div> <div class="input-header svelte-1fllp9b"></div>', 1), lb = /* @__PURE__ */ J('<div class="none-params svelte-1fllp9b"> </div>'), ub = /* @__PURE__ */ J('<div class="input-container svelte-1fllp9b"><!> <!></div>');
const cb = {
  hash: "svelte-1fllp9b",
  code: `.input-container.svelte-1fllp9b {display:grid;grid-template-columns:40% 50% 10%;row-gap:5px;column-gap:3px;}.input-container.svelte-1fllp9b .none-params:where(.svelte-1fllp9b) {font-size:12px;background:#f8f8f8;height:40px;display:flex;justify-content:center;align-items:center;border-radius:5px;width:calc(100% - 5px);grid-column:1 / -1;
  /* 从第一列开始到最后一列结束 */}.input-container.svelte-1fllp9b .input-header:where(.svelte-1fllp9b) {font-size:12px;color:#666;}`
};
function df(e, t) {
  de(t, !0), Ke(e, cb);
  const n = v(t, "noneParameterText", 7, "无确认数据"), r = v(t, "dataKeyName", 7, "parameters"), o = v(t, "useChildrenOnly", 7);
  let i = nt(), s = Kn(i), a = /* @__PURE__ */ E(() => [...s?.current?.data?.[r()] || []]);
  var l = {
    get noneParameterText() {
      return n();
    },
    set noneParameterText(h = "无确认数据") {
      n(h), g();
    },
    get dataKeyName() {
      return r();
    },
    set dataKeyName(h = "parameters") {
      r(h), g();
    },
    get useChildrenOnly() {
      return o();
    },
    set useChildrenOnly(h) {
      o(h), g();
    }
  }, u = ub(), d = Z(u);
  {
    var f = (h) => {
      var y = ab();
      me(4), D(h, y);
    };
    oe(d, (h) => {
      c(a).length !== 0 && h(f);
    });
  }
  var p = A(d, 2);
  return at(
    p,
    19,
    () => c(a),
    (h) => h.id,
    (h, y, m) => {
      cf(h, {
        get parameter() {
          return c(y);
        },
        get index() {
          return c(m);
        },
        get dataKeyName() {
          return r();
        },
        get useChildrenOnly() {
          return o();
        }
      });
    },
    (h) => {
      var y = lb(), m = Z(y, !0);
      R(y), xe(() => Re(m, n())), D(h, y);
    }
  ), R(u), D(e, u), fe(l);
}
le(df, { noneParameterText: {}, dataKeyName: {}, useChildrenOnly: {} }, [], [], !0);
const zs = (e, t) => {
  if (e === t) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  const n = Array.isArray(e), r = Array.isArray(t);
  if (n !== r) return !1;
  if (n && r) {
    if (e.length !== t.length) return !1;
    for (let o = 0; o < e.length; o++)
      if (!zs(e[o], t[o])) return !1;
    return !0;
  } else {
    const o = Object.keys(e), i = Object.keys(t);
    if (o.length !== i.length) return !1;
    for (const s of o)
      if (!(s in t) || !zs(e[s], t[s])) return !1;
    return !0;
  }
};
var db = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M23 12L15.9289 19.0711L14.5147 17.6569L20.1716 12L14.5147 6.34317L15.9289 4.92896L23 12ZM3.82843 12L9.48528 17.6569L8.07107 19.0711L1 12L8.07107 4.92896L9.48528 6.34317L3.82843 12Z"></path></svg>'), fb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), pb = /* @__PURE__ */ J('<div class="heading svelte-8iukvu"><!> <!></div> <!> <!> <div class="setting-title svelte-8iukvu">消息内容</div> <div class="setting-item svelte-8iukvu"><!></div> <div class="heading svelte-8iukvu"><!></div> <!>', 1);
const hb = {
  hash: "svelte-8iukvu",
  code: ".heading.svelte-8iukvu {display:flex;margin-bottom:10px;}.setting-title.svelte-8iukvu {font-size:12px;color:#999;margin-bottom:4px;margin-top:10px;}.setting-item.svelte-8iukvu {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}"
};
function ff(e, t) {
  de(t, !0), Ke(e, hb);
  const n = v(t, "data", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "data"]), o = nt(), { addParameter: i } = un(), { updateNodeData: s } = ut();
  Je(() => {
    if (n().confirms) {
      const l = n().confirms.map((u) => ({
        // id?: string;
        // name?: string;
        // nameDisabled?: boolean;
        // dataType?: string;
        // dataTypeDisabled?: boolean;
        // ref?: string;
        // refType?: string;
        // value?: string;
        // description?: string;
        // required?: boolean;
        // defaultValue?: string;
        // deleteDisabled?: boolean;
        // addChildDisabled?: boolean;
        // children?: Parameter[];
        ...u,
        nameDisabled: !0,
        dataTypeDisabled: !0,
        dataType: u.formType === "checkbox" || u.formType === "select" ? "Array" : "String",
        addChildDisabled: !0
      }));
      zs(l, n().outputDefs) || s(o, () => ({ outputDefs: l }));
    }
  });
  var a = {
    get data() {
      return n();
    },
    set data(l) {
      n(l), g();
    }
  };
  return Ft(e, Ge(
    {
      get data() {
        return n();
      }
    },
    () => r,
    {
      allowExecute: !1,
      icon: (l) => {
        var u = db();
        D(l, u);
      },
      children: (l, u) => {
        var d = pb(), f = re(d), p = Z(f);
        ze(p, {
          level: 3,
          children: (C, S) => {
            me();
            var M = Se("确认数据");
            D(C, M);
          },
          $$slots: { default: !0 }
        });
        var h = A(p, 2);
        Te(h, {
          class: "input-btn-more",
          style: "margin-left: auto",
          onclick: () => {
            i(o, "confirms");
          },
          children: (C, S) => {
            var M = fb();
            D(C, M);
          },
          $$slots: { default: !0 }
        }), R(f);
        var y = A(f, 2);
        df(y, { dataKeyName: "confirms", noneParameterText: "无确认数据" });
        var m = A(y, 2);
        ze(m, {
          level: 3,
          mt: "10px",
          children: (C, S) => {
            me();
            var M = Se("确认消息");
            D(C, M);
          },
          $$slots: { default: !0 }
        });
        var w = A(m, 4), b = Z(w);
        {
          let C = /* @__PURE__ */ E(() => n().message || "");
          Ye(b, {
            rows: 5,
            placeholder: "请输入用户需要确认的消息内容",
            style: "width: 100%",
            onchange: (S) => {
              s(o, () => ({ message: S.target.value }));
            },
            get value() {
              return c(C);
            }
          });
        }
        R(w);
        var _ = A(w, 2), $ = Z(_);
        ze($, {
          level: 3,
          mt: "10px",
          children: (C, S) => {
            me();
            var M = Se("输出参数");
            D(C, M);
          },
          $$slots: { default: !0 }
        }), R(_);
        var x = A(_, 2);
        Bn(x, { placeholder: "" }), D(l, d);
      },
      $$slots: { icon: !0, default: !0 }
    }
  )), fe(a);
}
le(ff, { data: {} }, [], [], !0);
const ds = {
  startNode: Wd,
  codeNode: rf,
  confirmNode: ff,
  llmNode: nf,
  templateNode: of,
  httpNode: sf,
  knowledgeNode: af,
  searchEngineNode: lf,
  loopNode: uf,
  endNode: ef
};
var gb = /* @__PURE__ */ J("<!> ", 1);
function pf(e, t) {
  de(t, !0);
  const n = v(t, "icon", 7), r = v(t, "title", 7), o = v(t, "type", 7), i = v(t, "description", 7), s = v(t, "extra", 7), a = (u) => {
    if (!u.dataTransfer)
      return null;
    const d = {
      type: o(),
      data: { title: r(), description: i(), ...s() }
    };
    u.dataTransfer.setData("application/tinyflow", JSON.stringify(d)), u.dataTransfer.effectAllowed = "move";
  };
  var l = {
    get icon() {
      return n();
    },
    set icon(u) {
      n(u), g();
    },
    get title() {
      return r();
    },
    set title(u) {
      r(u), g();
    },
    get type() {
      return o();
    },
    set type(u) {
      o(u), g();
    },
    get description() {
      return i();
    },
    set description(u) {
      i(u), g();
    },
    get extra() {
      return s();
    },
    set extra(u) {
      s(u), g();
    }
  };
  return Te(e, {
    draggable: !0,
    ondragstart: a,
    get "data-node-type"() {
      return o();
    },
    get title() {
      return r();
    },
    children: (u, d) => {
      var f = gb(), p = re(f);
      zu(p, n);
      var h = A(p);
      xe(() => Re(h, ` ${r() ?? ""}`)), D(u, f);
    },
    $$slots: { default: !0 }
  }), fe(l);
}
le(pf, { icon: {}, title: {}, type: {}, description: {}, extra: {} }, [], [], !0);
var vb = /* @__PURE__ */ J('<div class="tf-toolbar-subgroup-content svelte-1b5lykn"></div>'), mb = /* @__PURE__ */ J('<div class="tf-toolbar-subgroup svelte-1b5lykn"><div class="tf-toolbar-subgroup-header svelte-1b5lykn"><span class="tf-toolbar-subgroup-label"> </span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9L12 16L5 9H19Z"></path></svg></div> <!></div>'), yb = /* @__PURE__ */ J('<div class="tf-toolbar-group-content svelte-1b5lykn"></div>'), wb = /* @__PURE__ */ J('<div class="tf-toolbar-group svelte-1b5lykn"><div class="tf-toolbar-group-header svelte-1b5lykn"><span class="tf-toolbar-group-label svelte-1b5lykn"> </span> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9L12 16L5 9H19Z"></path></svg></div> <!></div>'), bb = /* @__PURE__ */ J('<div class="tf-toolbar-container-body svelte-1b5lykn"></div>'), xb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.83582 12L11.0429 18.2071L12.4571 16.7929L7.66424 12L12.4571 7.20712L11.0429 5.79291L4.83582 12ZM10.4857 12L16.6928 18.2071L18.107 16.7929L13.3141 12L18.107 7.20712L16.6928 5.79291L10.4857 12Z"></path></svg>'), kb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.1642 12L12.9571 5.79291L11.5429 7.20712L16.3358 12L11.5429 16.7929L12.9571 18.2071L19.1642 12ZM13.5143 12L7.30722 5.79291L5.89301 7.20712L10.6859 12L5.89301 16.7929L7.30722 18.2071L13.5143 12Z"></path></svg>'), _b = /* @__PURE__ */ J('<div><div class="tf-toolbar-container  svelte-1b5lykn"><!></div> <!></div>');
const $b = {
  hash: "svelte-1b5lykn",
  code: `
    /* 分组样式 */.tf-toolbar-group.svelte-1b5lykn {margin-bottom:12px;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background-color:#ffffff;box-shadow:0 2px 4px rgba(0, 0, 0, 0.05);transition:all 0.2s ease;}.tf-toolbar-group.svelte-1b5lykn:hover {box-shadow:0 3px 6px rgba(0, 0, 0, 0.1);}
    
    /* 分组标题栏 */.tf-toolbar-group-header.svelte-1b5lykn {display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background-color:#fafafa;cursor:pointer;transition:all 0.2s ease;border-bottom:1px solid #f0f0f0;}.tf-toolbar-group-header.svelte-1b5lykn:hover {background-color:#f5f5f5;}
    
    /* 分组标签 */.tf-toolbar-group-label.svelte-1b5lykn {font-weight:600;color:#333333;font-size:14px;}
    
    /* 分组图标 */.tf-toolbar-group-icon.svelte-1b5lykn {width:18px;height:18px;transition:transform 0.2s ease;color:#666666;}
    
    /* 展开状态的图标旋转 */.tf-toolbar-group-icon.expanded.svelte-1b5lykn {transform:rotate(180deg);}
    
    /* 分组内容 */
    /* 工具栏样式 */.tf-toolbar.svelte-1b5lykn {display:flex;
        /* flex-direction: column; */height:97%;}
    
    /* 工具栏容器样式 */.tf-toolbar-container.svelte-1b5lykn {flex:1;display:flex;flex-direction:column;overflow:hidden;}
    
    /* 工具栏内容区域，添加滚动效果 */.tf-toolbar-container-body.svelte-1b5lykn {flex:1;
        /* 使用 overlay 让滚动条覆盖在内容上，不占用宽度 */overflow-y:overlay;overflow-x:hidden;padding:8px;
        /* Firefox 隐藏滚动条 */scrollbar-width:none;}
    
    /* WebKit 浏览器完全隐藏滚动条 */.tf-toolbar-container-body.svelte-1b5lykn::-webkit-scrollbar {
        /* 完全隐藏滚动条 */display:none;}.tf-toolbar-container-body.svelte-1b5lykn::-webkit-scrollbar-track {display:none;}.tf-toolbar-container-body.svelte-1b5lykn::-webkit-scrollbar-thumb {display:none;}.tf-toolbar-group-content.svelte-1b5lykn {display:block;padding:8px 0;background-color:#ffffff;}
    
    /* 子分组样式 */.tf-toolbar-subgroup.svelte-1b5lykn {margin-bottom:12px;border:1px solid #f0f0f0;border-radius:6px;background-color:#fafafa;}
    
    /* 子分组标题 */.tf-toolbar-subgroup-header.svelte-1b5lykn {display:flex;justify-content:space-between;align-items:center;padding:6px 16px;background-color:#f0f0f0;font-size:12px;font-weight:600;color:#666666;border-bottom:1px solid #e0e0e0;border-radius:6px 6px 0 0;cursor:pointer;transition:all 0.2s ease;}.tf-toolbar-subgroup-header.svelte-1b5lykn:hover {background-color:#e0e0e0;}
    
    /* 子分组图标 */.tf-toolbar-subgroup-icon.svelte-1b5lykn {width:14px;height:14px;transition:transform 0.2s ease;color:#999999;}
    
    /* 子分组展开状态的图标旋转 */.tf-toolbar-subgroup-icon.expanded.svelte-1b5lykn {transform:rotate(180deg);color:#666666;}
    
    /* 子分组内容 */.tf-toolbar-subgroup-content.svelte-1b5lykn {padding:8px 0;background-color:#ffffff;border-radius:0 0 6px 6px;}
    
    /* 调整DraggableButton的样式，使其上下排列 */.tf-toolbar-subgroup-content.svelte-1b5lykn .tf-btn {display:block;width:calc(100% - 32px);margin:0 16px 8px 16px;padding:10px 14px;border:1px solid #e5e5e5;border-radius:6px;background-color:#ffffff;color:#333333;text-decoration:none;cursor:pointer;transition:all 0.2s ease;box-sizing:border-box;text-align:left;
        /* 禁止换行，超出部分显示省略号 */white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4;}.tf-toolbar-group-content.svelte-1b5lykn .tf-btn:hover {background-color:#f8f9fa;border-color:#007bff;color:#007bff;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0, 123, 255, 0.15);}
    
    /* 节点图标样式 */.tf-toolbar-group-content.svelte-1b5lykn .tf-btn svg {margin-right:8px;vertical-align:middle;width:16px;height:16px;}
    
    /* 节点标题样式 */.tf-toolbar-group-content.svelte-1b5lykn .tf-btn {font-weight:500;font-size:13px;}
    
    /* 节点描述样式 - 我们需要通过额外元素来显示描述 */.node-description.svelte-1b5lykn {display:block;margin-top:4px;font-size:11px;color:#666666;line-height:1.3;padding-left:24px; /* 与图标+标题对齐 */}
    
    /* 最后一个节点移除底部margin */.tf-toolbar-group-content.svelte-1b5lykn .tf-btn:last-child {margin-bottom:0;}`
};
function hf(e, t) {
  de(t, !0), Ke(e, $b);
  let n = /* @__PURE__ */ Ne("show"), r = /* @__PURE__ */ Ne(Pt({})), o = /* @__PURE__ */ Ne(Pt({}));
  const i = Mn(), s = i.customNodes, a = () => {
    if (l.length > 0) {
      l.forEach((x) => {
        c(r)[x.id] = !1;
      }), l.forEach((x) => {
        x.subgroups.forEach((C) => {
          c(o)[C.id] = !1;
        });
      });
      const $ = l[0];
      if ($ && (c(r)[$.id] = !0, $.subgroups.length > 0)) {
        const x = $.subgroups[0];
        c(o)[x.id] = !0;
      }
    }
  };
  let l = [];
  if (s) {
    const $ = /* @__PURE__ */ new Map();
    let x = [];
    Array.isArray(s) ? x = [...s].sort((C, S) => (C.sortNo || 0) - (S.sortNo || 0)) : x = Object.keys(s).sort((C, S) => (s[C].sortNo || 0) - (s[S].sortNo || 0)).map((C) => ({ type: C, ...s[C] }));
    for (let C of x) {
      const S = i.groupSeparator || ".", M = (C.group || "default").split(S), j = M[0] || "default", L = M[1] || "默认子分组";
      $.has(j) || $.set(j, /* @__PURE__ */ new Map());
      const I = $.get(j);
      I.has(L) || I.set(L, []), I.get(L).push({
        type: C.type,
        icon: C.icon || "",
        title: C.title,
        sortNo: C.sortNo,
        description: C.description
      });
    }
    l = Array.from($.entries()).map(([C, S]) => ({
      id: C,
      label: C === "default" ? "默认分组" : C,
      subgroups: Array.from(S.entries()).map(([M, j]) => ({
        id: `${C}.${M}`,
        label: M === "默认子分组" ? "默认子分组" : M,
        nodes: j
      }))
    })), a();
  }
  Je(() => {
    l.length > 0 && a();
  });
  const u = ($) => {
    const x = c(r)[$] || !1;
    if (Object.keys(c(r)).forEach((C) => {
      c(r)[C] = !1;
    }), Object.keys(c(o)).forEach((C) => {
      c(o)[C] = !1;
    }), !x) {
      c(r)[$] = !0;
      const C = l.find((S) => S.id === $);
      if (C && C.subgroups.length > 0) {
        const S = C.subgroups[0].id;
        c(o)[S] = !0;
      }
    }
  }, d = ($) => {
    const x = c(o)[$] || !1;
    Object.keys(c(o)).forEach((C) => {
      C.startsWith($.split(".")[0] + ".") && (c(o)[C] = !1);
    }), x || (c(o)[$] = !0);
  }, f = ($) => {
    if (!i.hiddenNodes) return !1;
    const x = typeof i.hiddenNodes == "function" ? i.hiddenNodes() : i.hiddenNodes;
    return Array.isArray(x) && x.includes($);
  }, p = ($) => $.filter((x) => !f(x.type)), h = ($) => p($.nodes).length > 0;
  var y = _b(), m = Z(y), w = Z(m);
  {
    var b = ($) => {
      var x = bb();
      at(x, 21, () => l, Cn, (C, S) => {
        var M = Ce(), j = re(M);
        at(
          j,
          17,
          () => [
            c(S).subgroups.filter((L) => h(L))
          ],
          Cn,
          (L, I) => {
            var T = Ce(), N = re(T);
            {
              var H = (k) => {
                var P = wb(), O = Z(P), B = Z(O), V = Z(B, !0);
                R(B);
                var F = A(B, 2);
                R(O);
                var K = A(O, 2);
                {
                  var G = (ne) => {
                    var q = yb();
                    at(q, 21, () => c(I), Cn, (z, Y) => {
                      var W = mb(), te = Z(W), ee = Z(te), U = Z(ee, !0);
                      R(ee);
                      var ce = A(ee, 2);
                      R(te);
                      var se = A(te, 2);
                      {
                        var ae = (ie) => {
                          var pe = vb();
                          at(pe, 21, () => p(c(Y).nodes), Cn, (we, he) => {
                            pf(we, Ge(() => c(he)));
                          }), R(pe), D(ie, pe);
                        };
                        oe(se, (ie) => {
                          c(o)[c(Y).id] && ie(ae);
                        });
                      }
                      R(W), xe(() => {
                        Re(U, c(Y).label), ft(ce, 0, `tf-toolbar-subgroup-icon ${c(o)[c(Y).id] ? "expanded" : ""}`, "svelte-1b5lykn");
                      }), Lr("click", te, () => d(c(Y).id)), D(z, W);
                    }), R(q), D(ne, q);
                  };
                  oe(K, (ne) => {
                    c(r)[c(S).id] && ne(G);
                  });
                }
                R(P), xe(() => {
                  Re(V, c(S).label), ft(F, 0, `tf-toolbar-group-icon ${c(r)[c(S).id] ? "expanded" : ""}`, "svelte-1b5lykn");
                }), Lr("click", O, () => u(c(S).id)), D(k, P);
              };
              oe(N, (k) => {
                c(I).length > 0 && k(H);
              });
            }
            D(L, T);
          }
        ), D(C, M);
      }), R(x), D($, x);
    };
    oe(w, ($) => {
      l.length > 0 && $(b);
    });
  }
  R(m);
  var _ = A(m, 2);
  Te(_, {
    onclick: () => {
      Q(n, c(n) ? "" : "show", !0);
    },
    children: ($, x) => {
      var C = Ce(), S = re(C);
      {
        var M = (L) => {
          var I = xb();
          D(L, I);
        }, j = (L) => {
          var I = kb();
          D(L, I);
        };
        oe(S, (L) => {
          c(n) === "show" ? L(M) : L(j, !1);
        });
      }
      D($, C);
    },
    $$slots: { default: !0 }
  }), R(y), xe(() => ft(y, 1, `tf-toolbar ${c(n) ?? ""}`, "svelte-1b5lykn")), D(e, y), fe();
}
le(hf, {}, [], [], !0);
const Cb = () => ({ getNode: (e) => Ae.getNode(e) }), Sb = () => ({ ensureParentInNodesBefore: (e, t) => {
  Ae.updateNodes((n) => {
    let r = -1;
    for (let s = 0; s < n.length; s++)
      if (n[s].id === e) {
        r = s;
        break;
      }
    if (r <= 0)
      return n;
    let o = -1;
    for (let s = 0; s < r; s++)
      if (n[s].parentId === e || n[s].id === t) {
        o = s;
        break;
      }
    if (o == -1)
      return n;
    const i = n[r];
    for (let s = r; s > o; s--)
      n[s] = n[s - 1];
    return n[o] = i, n;
  });
} }), Eb = () => ({ getEdgesByTarget: (e) => Ae.getEdges().filter((t) => t.target === e) });
var Pb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), Nb = /* @__PURE__ */ J('<div class="heading svelte-qt4m0r"><!> <!></div> <!>', 1), Db = /* @__PURE__ */ J('<span class="required-marker">*</span>'), Hb = /* @__PURE__ */ J('<div class="setting-title svelte-qt4m0r"> <!></div> <div class="setting-item svelte-qt4m0r"><!></div>', 1), Ob = /* @__PURE__ */ J('<span class="required-marker">*</span>'), Mb = /* @__PURE__ */ J('<div class="setting-title svelte-qt4m0r"> <!></div> <div class="setting-item svelte-qt4m0r"><!></div>', 1), Ab = /* @__PURE__ */ J('<span class="required-marker">*</span>'), Tb = /* @__PURE__ */ J('<div class="setting-title svelte-qt4m0r"> <!></div> <div class="setting-item svelte-qt4m0r"><div class="slider-container svelte-qt4m0r"><span class="svelte-qt4m0r"> </span> <input/></div></div>', 1), zb = /* @__PURE__ */ J('<span class="required-marker">*</span>'), Vb = /* @__PURE__ */ J('<div class="setting-title svelte-qt4m0r"> <!></div> <div class="setting-item svelte-qt4m0r"><!></div>', 1), Lb = /* @__PURE__ */ J('<span class="required-marker">*</span>'), Ib = /* @__PURE__ */ J('<div class="setting-title svelte-qt4m0r"> <!></div> <div class="setting-item svelte-qt4m0r"><!></div>', 1), jb = /* @__PURE__ */ ye('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>'), Rb = /* @__PURE__ */ J('<div class="heading svelte-qt4m0r"><!> <!></div> <!>', 1), Kb = /* @__PURE__ */ J("<!> <!> <div></div> <!>", 1);
const Zb = {
  hash: "svelte-qt4m0r",
  code: `.heading.svelte-qt4m0r {display:flex;align-items:center;margin-bottom:10px;}.setting-title.svelte-qt4m0r {font-size:12px;color:#999;margin-bottom:4px;margin-top:10px;}.setting-item.svelte-qt4m0r {display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:10px;}\r
\r
    /* 新增样式 */.slider-container.svelte-qt4m0r {width:100%;display:flex;flex-direction:column;gap:4px;}.slider-container.svelte-qt4m0r span:where(.svelte-qt4m0r) {font-size:12px;color:#666;display:flex;justify-content:space-between;align-items:center;}input[type="range"].svelte-qt4m0r {width:100%;height:4px;background:#ddd;border-radius:2px;outline:none;-webkit-appearance:none;}input[type="range"].svelte-qt4m0r::-webkit-slider-thumb {-webkit-appearance:none;width:14px;height:14px;background:#007bff;border-radius:50%;cursor:pointer;}\r
\r
    /* 必填项样式 */.required-marker {color:#ff4d4f;margin-left:4px;}\r
\r
    /* 验证失败样式 */.required-error {border-color:#ff4d4f !important;box-shadow:0 0 0 2px rgba(255, 77, 79, 0.2) !important;}\r
\r
    /* 输入框验证失败样式 */.required-error:focus {outline:none;border-color:#ff4d4f !important;box-shadow:0 0 0 2px rgba(255, 77, 79, 0.2) !important;}`
};
function oi(e, t) {
  de(t, !0), Ke(e, Zb);
  const n = v(t, "data", 7), r = v(t, "maxHeight", 7), o = /* @__PURE__ */ Be(t, [
    "$$slots",
    "$$events",
    "$$legacy",
    "$$host",
    "data",
    "maxHeight"
  ]), i = nt(), { addParameter: s } = un(), a = ut(), { updateNodeData: l } = a, u = (_) => {
    l(i, _);
  }, d = (_, $) => {
    u({ [_]: $.target?.value });
  }, f = { ...o, id: i, data: n() }, p = document.createElement("div"), h = Mn(), y = n().originalType || t.type;
  let m = h.customNodes[y];
  Array.isArray(h.customNodes) && (m = h.customNodes.find((_) => _.type === y) || m), m?.render?.(p, f, a), n().forms || m?.forms;
  let w;
  Je(() => {
    n().expand && w && w.append(p);
  }), Je(() => {
    n() && m?.onUpdate?.(p, { ...f, data: n() });
  }), Je(() => {
    !n().parameters && m?.parameters && u({
      parameters: xo(JSON.parse(JSON.stringify(m.parameters)))
    });
  }), Je(() => {
    !n().outputDefs && m?.outputDefs && u({
      outputDefs: xo(JSON.parse(JSON.stringify(m.outputDefs)))
    });
  });
  var b = {
    get data() {
      return n();
    },
    set data(_) {
      n(_), g();
    },
    get maxHeight() {
      return r();
    },
    set maxHeight(_) {
      r(_), g();
    }
  };
  {
    let _ = /* @__PURE__ */ E(() => ({
      ...n(),
      description: n().description || m?.description
    })), $ = /* @__PURE__ */ E(() => m?.icon);
    Ft(e, Ge(
      {
        get data() {
          return c(_);
        },
        get icon() {
          return c($);
        },
        allowExecute: !1,
        get maxHeight() {
          return r();
        }
      },
      () => o,
      {
        children: (x, C) => {
          var S = Kb(), M = re(S);
          {
            var j = (k) => {
              var P = Nb(), O = re(P), B = Z(O);
              ze(B, {
                level: 3,
                children: (G, ne) => {
                  me();
                  var q = Se("输入参数");
                  D(G, q);
                },
                $$slots: { default: !0 }
              });
              var V = A(B, 2);
              {
                var F = (G) => {
                  Te(G, {
                    class: "input-btn-more",
                    style: "margin-left: auto",
                    onclick: () => {
                      s(i);
                    },
                    children: (ne, q) => {
                      var z = Pb();
                      D(ne, z);
                    },
                    $$slots: { default: !0 }
                  });
                };
                oe(V, (G) => {
                  m?.parametersAddEnable !== !1 && G(F);
                });
              }
              R(O);
              var K = A(O, 2);
              $t(K, {}), D(k, P);
            };
            oe(M, (k) => {
              m?.parametersEnable !== !1 && n().showParameters === !0 && k(j);
            });
          }
          var L = A(M, 2);
          {
            var I = (k) => {
              var P = Ce(), O = re(P);
              at(O, 17, () => n().forms || m?.forms, Cn, (B, V) => {
                var F = Ce(), K = re(F);
                {
                  var G = (q) => {
                    var z = Hb(), Y = re(z), W = Z(Y), te = A(W);
                    {
                      var ee = (se) => {
                        var ae = Db();
                        D(se, ae);
                      };
                      oe(te, (se) => {
                        c(V).required && se(ee);
                      });
                    }
                    R(Y);
                    var U = A(Y, 2), ce = Z(U);
                    {
                      let se = /* @__PURE__ */ E(() => n()[c(V).name] || c(V).defaultValue), ae = /* @__PURE__ */ E(() => c(V).required && !n()[c(V).name] ? "required-error" : "");
                      rt(ce, Ge(
                        {
                          get placeholder() {
                            return c(V).placeholder;
                          },
                          style: "width: 100%",
                          get value() {
                            return c(se);
                          }
                        },
                        () => c(V).attrs,
                        {
                          get class() {
                            return c(ae);
                          },
                          onchange: (ie) => {
                            d(c(V).name, ie);
                          }
                        }
                      ));
                    }
                    R(U), xe(() => Re(W, `${c(V).label ?? ""} `)), D(q, z);
                  }, ne = (q) => {
                    var z = Ce(), Y = re(z);
                    {
                      var W = (ee) => {
                        var U = Mb(), ce = re(U), se = Z(ce), ae = A(se);
                        {
                          var ie = (he) => {
                            var ue = Ob();
                            D(he, ue);
                          };
                          oe(ae, (he) => {
                            c(V).required && he(ie);
                          });
                        }
                        R(ce);
                        var pe = A(ce, 2), we = Z(pe);
                        {
                          let he = /* @__PURE__ */ E(() => n()[c(V).name] || c(V).defaultValue), ue = /* @__PURE__ */ E(() => c(V).required && !n()[c(V).name] ? "required-error" : "");
                          Ye(we, Ge(
                            {
                              rows: 3,
                              get placeholder() {
                                return c(V).placeholder;
                              },
                              style: "width: 100%",
                              get value() {
                                return c(he);
                              }
                            },
                            () => c(V).attrs,
                            {
                              get class() {
                                return c(ue);
                              },
                              onchange: (ge) => {
                                d(c(V).name, ge);
                              }
                            }
                          ));
                        }
                        R(pe), xe(() => Re(se, `${c(V).label ?? ""} `)), D(ee, U);
                      }, te = (ee) => {
                        var U = Ce(), ce = re(U);
                        {
                          var se = (ie) => {
                            var pe = Tb(), we = re(pe), he = Z(we), ue = A(he);
                            {
                              var ge = (Ze) => {
                                var qe = Ab();
                                D(Ze, qe);
                              };
                              oe(ue, (Ze) => {
                                c(V).required && Ze(ge);
                              });
                            }
                            R(we);
                            var $e = A(we, 2), X = Z($e), Xe = Z(X), je = Z(Xe);
                            R(Xe);
                            var He = A(Xe, 2), Pe = (Ze) => u({ [c(V).name]: parseFloat(Ze.target.value) });
                            vt(
                              He,
                              () => ({
                                class: `nodrag ${c(V).required && !n()[c(V).name] ? "required-error" : ""}`,
                                type: "range",
                                ...c(V).attrs,
                                value: n()[c(V).name] ?? c(V).defaultValue,
                                oninput: Pe
                              }),
                              void 0,
                              void 0,
                              void 0,
                              "svelte-qt4m0r",
                              !0
                            ), R(X), R($e), xe(() => {
                              Re(he, `${c(V).label ?? ""} `), Re(je, `${c(V).description ?? ""}: ${n()[c(V).name] ?? c(V).defaultValue ?? ""}`);
                            }), D(ie, pe);
                          }, ae = (ie) => {
                            var pe = Ce(), we = re(pe);
                            {
                              var he = (ge) => {
                                var $e = Vb(), X = re($e), Xe = Z(X), je = A(Xe);
                                {
                                  var He = (qe) => {
                                    var Qe = zb();
                                    D(qe, Qe);
                                  };
                                  oe(je, (qe) => {
                                    c(V).required && qe(He);
                                  });
                                }
                                R(X);
                                var Pe = A(X, 2), Ze = Z(Pe);
                                {
                                  let qe = /* @__PURE__ */ E(() => c(V).options || []), Qe = /* @__PURE__ */ E(() => n()[c(V).name] ? [n()[c(V).name]] : [c(V).defaultValue]), Ue = /* @__PURE__ */ E(() => c(V).required && !n()[c(V).name] ? "required-error" : "");
                                  pt(Ze, {
                                    get items() {
                                      return c(qe);
                                    },
                                    style: "width: 100%",
                                    get placeholder() {
                                      return c(V).placeholder;
                                    },
                                    onSelect: (ve) => {
                                      const Le = ve.value;
                                      u({ [c(V).name]: Le });
                                    },
                                    get value() {
                                      return c(Qe);
                                    },
                                    get class() {
                                      return c(Ue);
                                    }
                                  });
                                }
                                R(Pe), xe(() => Re(Xe, `${c(V).label ?? ""} `)), D(ge, $e);
                              }, ue = (ge) => {
                                var $e = Ce(), X = re($e);
                                {
                                  var Xe = (He) => {
                                    var Pe = Ib(), Ze = re(Pe), qe = Z(Ze), Qe = A(qe);
                                    {
                                      var Ue = (Ie) => {
                                        var Ee = Lb();
                                        D(Ie, Ee);
                                      };
                                      oe(Qe, (Ie) => {
                                        c(V).required && Ie(Ue);
                                      });
                                    }
                                    R(Ze);
                                    var ve = A(Ze, 2), Le = Z(ve);
                                    {
                                      let Ie = /* @__PURE__ */ E(() => c(V).chosen?.buttonText), Ee = /* @__PURE__ */ E(() => c(V).required && !n()[c(V).chosen?.valueDataKey] ? "required-error" : "");
                                      Md(Le, {
                                        style: "width: 100%",
                                        get placeholder() {
                                          return c(V).placeholder;
                                        },
                                        get buttonText() {
                                          return c(Ie);
                                        },
                                        onChosen: (it, xt, Me) => {
                                          c(V).chosen?.onChosen?.(u, it, xt, Me);
                                        },
                                        get value() {
                                          return n()[c(V).chosen?.valueDataKey || ""];
                                        },
                                        get label() {
                                          return n()[c(V).chosen?.labelDataKey || ""];
                                        },
                                        get class() {
                                          return c(Ee);
                                        }
                                      });
                                    }
                                    R(ve), xe(() => Re(qe, `${c(V).label ?? ""} `)), D(He, Pe);
                                  }, je = (He) => {
                                    var Pe = Ce(), Ze = re(Pe);
                                    {
                                      var qe = (Qe) => {
                                        ze(Qe, Ge({ level: 3, mt: "10px" }, () => c(V).attrs, {
                                          children: (Ue, ve) => {
                                            me();
                                            var Le = Se();
                                            xe(() => Re(Le, c(V).label)), D(Ue, Le);
                                          },
                                          $$slots: { default: !0 }
                                        }));
                                      };
                                      oe(
                                        Ze,
                                        (Qe) => {
                                          c(V).type === "heading" && Qe(qe);
                                        },
                                        !0
                                      );
                                    }
                                    D(He, Pe);
                                  };
                                  oe(
                                    X,
                                    (He) => {
                                      c(V).type === "chosen" ? He(Xe) : He(je, !1);
                                    },
                                    !0
                                  );
                                }
                                D(ge, $e);
                              };
                              oe(
                                we,
                                (ge) => {
                                  c(V).type === "select" ? ge(he) : ge(ue, !1);
                                },
                                !0
                              );
                            }
                            D(ie, pe);
                          };
                          oe(
                            ce,
                            (ie) => {
                              c(V).type === "slider" ? ie(se) : ie(ae, !1);
                            },
                            !0
                          );
                        }
                        D(ee, U);
                      };
                      oe(
                        Y,
                        (ee) => {
                          c(V).type === "textarea" ? ee(W) : ee(te, !1);
                        },
                        !0
                      );
                    }
                    D(q, z);
                  };
                  oe(K, (q) => {
                    c(V).type === "input" ? q(G) : q(ne, !1);
                  });
                }
                D(B, F);
              }), D(k, P);
            };
            oe(L, (k) => {
              (n().forms || m?.forms) && k(I);
            });
          }
          var T = A(L, 2);
          At(T, (k) => w = k, () => w);
          var N = A(T, 2);
          {
            var H = (k) => {
              var P = Rb(), O = re(P), B = Z(O);
              ze(B, {
                level: 3,
                mt: "10px",
                children: (G, ne) => {
                  me();
                  var q = Se("输出参数");
                  D(G, q);
                },
                $$slots: { default: !0 }
              });
              var V = A(B, 2);
              {
                var F = (G) => {
                  Te(G, {
                    class: "input-btn-more",
                    style: "margin-left: auto",
                    onclick: () => {
                      s(i, "outputDefs");
                    },
                    children: (ne, q) => {
                      var z = jb();
                      D(ne, z);
                    },
                    $$slots: { default: !0 }
                  });
                };
                oe(V, (G) => {
                  m?.outputDefsAddEnable !== !1 && G(F);
                });
              }
              R(O);
              var K = A(O, 2);
              Bn(K, {}), D(k, P);
            };
            oe(N, (k) => {
              m?.outputDefsEnable !== !1 && n().showOutputDefs === !0 && k(H);
            });
          }
          xe(() => {
            gt(T, m?.rootStyle || ""), ft(T, 1, Rn(m?.rootClass || ""), "svelte-qt4m0r");
          }), D(x, S);
        },
        $$slots: { default: !0 }
      }
    ));
  }
  return fe(b);
}
le(oi, { data: {}, maxHeight: {} }, [], [], !0);
const Bb = () => ({ updateEdgeData: (e, t, n) => {
  const r = Ae.getEdge(e);
  if (!r)
    return;
  const o = typeof t == "function" ? t(r) : t;
  r.data = n?.replace ? o : { ...r.data, ...o }, Ae.updateEdges((i) => i.map((s) => s.id === e ? r : s));
} }), Yb = () => ({ deleteEdge: (e) => {
  Ae.removeEdge(e);
} }), qb = () => {
  const e = (t, n) => n.filter(
    // 排除循环节点的子节点，否则在多层循环嵌套时不正确
    (r) => r.source === t && r.sourceHandle !== "loop_handle"
  );
  return { getNodesFromSource: (t) => {
    const n = Ae.getEdges(), r = [];
    let o = e(t, n);
    for (; o.length > 0; ) {
      const i = [];
      o.forEach((s) => {
        r.push(Ae.getNode(s.target)), i.push(...e(s.target, n));
      }), o = i;
    }
    return r;
  } };
}, Xb = () => ({ getNodeRelativePosition: (e) => {
  let t = Ae.getNode(e);
  const n = { x: 0, y: 0 };
  for (; t; )
    n.x += t.position.x, n.y += t.position.y, t.parentId ? t = Ae.getNode(t.parentId) : t = void 0;
  return n;
} });
function Fb(e) {
  const { id: t, type: n, position: r, data: o, parentId: i } = e;
  return {
    id: t,
    type: n,
    position: { x: r.x, y: r.y },
    parentId: i || void 0,
    data: o ? JSON.parse(JSON.stringify(o)) : {},
    ...i !== void 0 && { parentId: i }
  };
}
function Wb(e) {
  const t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  for (const a of e)
    t.set(a.id, a), n.set(a.id, 0), a.parentId && (n.set(a.id, 1), r.has(a.parentId) || r.set(a.parentId, []), r.get(a.parentId).push(a.id));
  const o = [];
  for (const a of e)
    (!a.parentId || !t.has(a.parentId)) && o.push(a);
  const i = [], s = /* @__PURE__ */ new Set();
  for (; o.length > 0; ) {
    const a = o.shift();
    if (s.has(a.id)) continue;
    s.add(a.id), i.push(a);
    const l = r.get(a.id) || [];
    for (const u of l)
      s.has(u) || o.push(t.get(u));
  }
  for (const a of e)
    s.has(a.id) || i.push(a);
  return i;
}
function Gb(e) {
  const { id: t, source: n, target: r, sourceHandle: o, targetHandle: i, type: s, data: a } = e;
  return {
    id: t,
    source: n,
    target: r,
    ...o !== void 0 && { sourceHandle: o },
    ...i !== void 0 && { targetHandle: i },
    ...s !== void 0 && { type: s },
    data: a ? JSON.parse(JSON.stringify(a)) : {}
  };
}
function Vs(e, t) {
  if (e == null)
    return e;
  if (Array.isArray(e))
    return e.map((n) => Vs(n, t));
  if (typeof e == "object") {
    if (e.refType === "ref" && typeof e.ref == "string") {
      const r = e.ref.match(/^([^.\s]+)\.(.+)$/);
      if (r) {
        const [o, i, s] = r, a = t.get(i);
        if (a !== void 0)
          return { ...e, ref: `${a}.${s}` };
      }
    }
    const n = {};
    for (const r in e)
      Object.hasOwn(e, r) && (n[r] = Vs(e[r], t));
    return n;
  }
  return e;
}
const Ub = () => (ut(), { copyHandler: async (e) => {
  const t = Ae.getNodes().filter((s) => s.selected);
  if (t.length === 0) return;
  const n = Ae.getEdges().filter((s) => t.some((a) => a.id === s.source) && t.some((a) => a.id === s.target)), r = t.map(Fb), o = n.map(Gb), i = JSON.stringify({
    tinyflowNodes: r,
    tinyflowEdges: o,
    version: "1.0"
  }, null, 0);
  try {
    "clipboardData" in e && e.clipboardData ? (e.clipboardData.setData("text/plain", i), e instanceof ClipboardEvent && e.preventDefault()) : await navigator.clipboard.writeText(i), console.log("Copied nodes and edges to clipboard");
  } catch (s) {
    console.error("Failed to copy:", s);
    try {
      sessionStorage.setItem("tinyflow_clipboard", i);
    } catch {
    }
  }
}, pasteHandler: (e) => {
  const t = e.clipboardData?.getData("text/plain");
  if (!t) return;
  let n = null;
  try {
    n = JSON.parse(t);
  } catch {
    return;
  }
  if (!n?.tinyflowNodes || !Array.isArray(n.tinyflowNodes))
    return;
  e.preventDefault();
  const r = Wb(n.tinyflowNodes), o = n.tinyflowEdges || [], i = /* @__PURE__ */ new Map(), s = [];
  for (const l of r) {
    const u = `node_${zn()}`;
    i.set(l.id, u);
  }
  for (const l of r) {
    const u = i.get(l.id), d = l.parentId !== void 0 ? i.get(l.parentId) : void 0, f = Vs(l.data, i);
    s.push({
      ...l,
      id: u,
      parentId: d,
      data: f,
      position: {
        x: (l.position?.x ?? 0) + 50,
        y: (l.position?.y ?? 0) + 50
      },
      selected: !0
    });
  }
  const a = [];
  for (const l of o) {
    const u = i.get(l.source), d = i.get(l.target);
    u && d && a.push({
      ...l,
      id: `edge_${zn()}`,
      source: u,
      target: d
    });
  }
  Ae.updateNodes((l) => [...l.map((u) => ({ ...u, selected: !1 })), ...s]), Ae.updateEdges((l) => [...l.map((u) => ({ ...u, selected: !1 })), ...a]);
} }), Al = () => {
  const e = document.activeElement;
  return !e || !(e instanceof HTMLElement) ? !1 : e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement || e.isContentEditable;
};
var Jb = /* @__PURE__ */ J('<div class="panel-content svelte-woejl3"><div>边属性设置</div> <div class="setting-title svelte-woejl3">边条件设置</div> <div class="setting-item svelte-woejl3"><!></div> <div class="setting-item svelte-woejl3" style="padding: 8px 0"><!> <!></div></div>'), Qb = /* @__PURE__ */ J("<!> <!> <!> <!>", 1), ex = /* @__PURE__ */ J('<div style="position: relative; height: 100%; width: 100%;overflow: hidden"><!> <!></div>');
const tx = {
  hash: "svelte-woejl3",
  code: `.panel-content.svelte-woejl3 {padding:10px;background-color:#fff;border-radius:5px;box-shadow:0 2px 4px rgba(0, 0, 0, 0.1);width:200px;border:1px solid #efefef;}.setting-title.svelte-woejl3 {margin:10px 0;font-size:12px;color:#999;}.setting-item.svelte-woejl3 {display:flex;gap:5px;align-items:center;justify-content:end;}\r
    \r
    /* 将缩放控制条从左下角移动到右上角 */`
};
function gf(e, t) {
  de(t, !0), Ke(e, tx);
  const n = v(t, "onInit", 7), r = /* @__PURE__ */ Be(t, ["$$slots", "$$events", "$$legacy", "$$host", "onInit"]), o = ut();
  console.log("props", r), n()({ ...o, updateNodeData: Ae.updateNodeData });
  const i = Mn();
  let s = /* @__PURE__ */ Ne(!1), a = /* @__PURE__ */ Ne(null);
  const { updateEdgeData: l } = Bb(), u = (q) => {
    q.preventDefault(), q.dataTransfer && (q.dataTransfer.dropEffect = "move");
  }, d = (q) => {
    q.preventDefault();
    const z = o.screenToFlowPosition({ x: q.clientX - 250, y: q.clientY - 100 }), Y = q.dataTransfer?.getData("application/tinyflow");
    if (!Y)
      return;
    const W = JSON.parse(Y), te = Object.keys(ds).includes(W.type) ? W.type : "customNode";
    let ee = null;
    Array.isArray(i.customNodes) ? ee = i.customNodes.find((ce) => ce.type === W.type) : ee = i.customNodes?.[W.type];
    const U = {
      id: `node_${zn()}`,
      position: z,
      data: {
        ...W.data,
        // 保存原始节点类型
        originalType: W.type,
        // 保存图标
        icon: ee?.icon,
        // 保存表单配置
        forms: ee?.forms,
        // 保存参数显示配置
        showParameters: ee?.showParameters,
        showOutputDefs: ee?.showOutputDefs,
        // 设置默认展开状态
        expand: !0
      },
      type: te
    };
    Ae.addNode(U), Ae.selectNodeOnly(U.id), i.onNodeAdd?.(U);
  }, { getNode: f } = Cb(), p = (q) => {
    const z = f(q.source), Y = f(q.target);
    if (q.sourceHandle === "loop_handle" || z.parentId) {
      const W = o.getEdges();
      for (let te of W)
        if (te.target === q.target) {
          const ee = f(te.source);
          if (q.sourceHandle === "loop_handle" && ee.parentId !== z.id || z.parentId && ee.parentId !== z.parentId)
            return !1;
        }
    }
    return !(!z.parentId && Y.parentId && Y.parentId !== z.id);
  }, { getNodesFromSource: h } = qb(), { getNodeRelativePosition: y } = Xb(), { ensureParentInNodesBefore: m } = Sb(), w = (q, z) => {
    if (!z.isValid)
      return;
    const Y = z.toNode;
    if (Y.parentId)
      return;
    const W = z.fromNode, te = z.fromHandle, ee = { position: { ...Y.position } };
    if (te.id === "loop_handle" ? ee.parentId = W.id : W.parentId && (ee.parentId = W.parentId), ee.parentId) {
      const { x: U, y: ce } = y(ee.parentId);
      ee.position = { x: Y.position.x - U, y: Y.position.y - ce }, o.updateNode(Y.id, ee), h(Y.id).forEach((se) => {
        o.updateNode(se.id, {
          parentId: ee.parentId,
          position: { x: se.position.x - U, y: se.position.y - ce }
        });
      }), m(ee.parentId, Y.id);
    }
    setTimeout(() => {
      Ae.getEdges().forEach((U) => {
        U.target === Y.id && U.source == W.id && (Q(s, !0), Q(a, U, !0));
      });
    });
  }, { getEdgesByTarget: b } = Eb(), _ = (q) => {
    q.edges.forEach((z) => {
      z.id === c(a)?.id && (Q(a, null), Q(s, !1));
      const Y = f(z.target);
      if (Y && Y.parentId) {
        const W = b(z.target), { x: te, y: ee } = y(Y.parentId);
        if (W.length === 0)
          o.updateNode(Y.id, {
            parentId: void 0,
            position: { x: Y.position.x + te, y: Y.position.y + ee }
          }), h(Y.id).forEach((U) => {
            o.updateNode(U.id, {
              parentId: void 0,
              position: { x: U.position.x + te, y: U.position.y + ee }
            });
          });
        else {
          let U = !1;
          for (let ce = 0; ce < W.length; ce++) {
            const se = W[ce], ae = f(se.source);
            if (ae.parentId || ae.type === "loopNode") {
              U = !0;
              break;
            }
          }
          U || (o.updateNode(Y.id, {
            parentId: void 0,
            position: { x: Y.position.x + te, y: Y.position.y + ee }
          }), h(Y.id).forEach((ce) => {
            o.updateNode(ce.id, {
              parentId: void 0,
              position: { x: ce.position.x + te, y: ce.position.y + ee }
            });
          }));
        }
      }
    });
  }, { deleteEdge: $ } = Yb(), x = (q, z) => {
  }, C = (q) => {
  }, { copyHandler: S, pasteHandler: M } = Ub(), j = (q) => {
    Al() || ((q.ctrlKey || q.metaKey) && q.key === "c" && (q.preventDefault(), S(q)), (q.ctrlKey || q.metaKey) && q.key === "a" && (q.preventDefault(), Ae.updateNodes((z) => z.map((Y) => ({ ...Y, selected: !0 }))), Ae.updateEdges((z) => z.map((Y) => ({ ...Y, selected: !0 })))));
  }, L = async (q) => {
    Al() || M(q);
  };
  jn(() => {
    window.addEventListener("keydown", j), window.addEventListener("paste", L);
  }), Po(() => {
    window.removeEventListener("keydown", j), window.removeEventListener("paste", L);
  });
  const I = {
    ...ds,
    // 添加自定义节点类型支持
    customNode: oi
  }, T = Mn().customNodes;
  if (T)
    if (Array.isArray(T))
      for (let q of T)
        I[q.type] = oi;
    else
      for (let q of Object.keys(T))
        I[q] = oi;
  const N = Mn().onDataChange;
  Je(() => {
    N?.({
      nodes: Ae.getNodes(),
      edges: Ae.getEdges(),
      viewport: Ae.getViewport()
    });
  });
  var H = {
    get onInit() {
      return n();
    },
    set onInit(q) {
      n(q), g();
    }
  }, k = ex(), P = Z(k), O = Ae.getNodes, B = Ae.setNodes, V = Ae.getEdges, F = Ae.setEdges, K = Ae.getViewport, G = Ae.setViewport;
  {
    let q = /* @__PURE__ */ E(() => ({ ...ds, ...I })), z = /* @__PURE__ */ E(() => ({
      markerEnd: { type: vo.ArrowClosed, width: 20, height: 20 }
    }));
    yd(P, {
      get nodeTypes() {
        return c(q);
      },
      get nodes() {
        return O();
      },
      set nodes(Y) {
        B(Y);
      },
      get edges() {
        return V();
      },
      set edges(Y) {
        F(Y);
      },
      get viewport() {
        return K();
      },
      set viewport(Y) {
        G(Y);
      },
      class: "tinyflow-logo",
      ondrop: d,
      ondragover: u,
      isValidConnection: p,
      onconnectend: w,
      onconnectstart: x,
      onconnect: C,
      connectionRadius: 50,
      onedgeclick: (Y) => {
        Q(s, !0), Q(a, Y.edge, !0);
      },
      onbeforeconnect: (Y) => ({ ...Y, id: zn() }),
      ondelete: _,
      onclick: (Y) => {
        const W = Y.target;
        W.classList.contains("svelte-flow__edge-interaction") || W.classList.contains("panel-content") || W.closest(".panel-content") || (Q(s, !1), Q(a, null));
      },
      get defaultEdgeOptions() {
        return c(z);
      },
      children: (Y, W) => {
        var te = Qb(), ee = re(te);
        Pd(ee, {});
        var U = A(ee, 2);
        Cd(U, { position: "top right" });
        var ce = A(U, 2);
        Dd(ce, {});
        var se = A(ce, 2);
        {
          var ae = (ie) => {
            zo(ie, {
              children: (pe, we) => {
                var he = Jb(), ue = A(Z(he), 4), ge = Z(ue);
                {
                  let je = /* @__PURE__ */ E(() => c(a)?.data?.condition);
                  Ye(ge, {
                    rows: 3,
                    placeholder: "请输入边条件",
                    style: "width: 100%",
                    get value() {
                      return c(je);
                    },
                    onchange: (He) => {
                      c(a) && l(c(a).id, { condition: He.target?.value });
                    }
                  });
                }
                R(ue);
                var $e = A(ue, 2), X = Z($e);
                Te(X, {
                  onclick: () => {
                    $(c(a)?.id), Q(s, !1);
                  },
                  children: (je, He) => {
                    me();
                    var Pe = Se("删除");
                    D(je, Pe);
                  },
                  $$slots: { default: !0 }
                });
                var Xe = A(X, 2);
                Te(Xe, {
                  primary: !0,
                  onclick: () => {
                    Q(s, !1);
                  },
                  children: (je, He) => {
                    me();
                    var Pe = Se("保存");
                    D(je, Pe);
                  },
                  $$slots: { default: !0 }
                }), R($e), R(he), D(pe, he);
              },
              $$slots: { default: !0 }
            });
          };
          oe(se, (ie) => {
            c(s) && ie(ae);
          });
        }
        D(Y, te);
      },
      $$slots: { default: !0 }
    });
  }
  var ne = A(P, 2);
  return hf(ne, {}), R(k), D(e, k), fe(H);
}
le(gf, { onInit: {} }, [], [], !0);
function nx(e, t) {
  de(t, !0);
  const n = v(t, "options", 7), r = v(t, "onInit", 7);
  let { data: o } = n();
  if (typeof o == "string")
    try {
      o = JSON.parse(o.trim());
    } catch {
      console.error("Invalid JSON data:", o);
    }
  Ae.init(o?.nodes || [], o?.edges || []), Tr("tinyflow_options", n());
  var i = {
    get options() {
      return n();
    },
    set options(s) {
      n(s), g();
    },
    get onInit() {
      return r();
    },
    set onInit(s) {
      r(s), g();
    }
  };
  return wd(e, {
    children: (s, a) => {
      gf(s, {
        get onInit() {
          return r();
        }
      });
    },
    $$slots: { default: !0 }
  }), fe(i);
}
customElements.define("tinyflow-component", le(nx, { options: {}, onInit: {} }, [], [], !1));
const ox = /* @__PURE__ */ vf({
  __name: "Tinyflow",
  props: {
    className: {},
    style: {},
    data: {},
    provider: {},
    customNodes: {},
    onNodeExecute: { type: Function },
    hiddenNodes: { type: [Array, Function] },
    onDataChange: { type: Function },
    onNodeAdd: { type: Function },
    defaultExpanded: {},
    groupSeparator: {}
  },
  setup(e, { expose: t }) {
    const n = e, r = mf(null);
    let o = null;
    function i(f) {
      if (f === null || typeof f != "object") return f;
      try {
        return structuredClone(f);
      } catch {
        try {
          return JSON.parse(JSON.stringify(f));
        } catch {
          return console.warn("Failed to clone object, returning original (may cause issues)", f), f;
        }
      }
    }
    function s() {
      if (r.value) {
        o && (o.destroy(), o = null);
        const f = { ...n };
        "data" in f && f.data != null && (f.data = i(f.data)), o = new ty({
          ...f,
          element: r.value
        });
      }
    }
    return yf(() => {
      s();
    }), _a(() => n.customNodes, () => {
      s();
    }, { deep: !0 }), _a(() => n.data, () => {
      s();
    }, { deep: !0 }), wf(() => {
      o && (o.destroy(), o = null);
    }), t({
      getData: () => o ? o.getData() : (console.warn("Tinyflow instance is not initialized"), null),
      validate: () => o ? o.validate() : (console.warn("Tinyflow instance is not initialized"), {
        success: !1,
        errors: [{ message: "Tinyflow instance is not initialized" }]
      }),
      setData: (f) => o ? o.setData(f) : (console.warn("Tinyflow instance is not initialized"), null),
      updateNodeData: (f, p) => o ? o.updateNodeData(f, p) : (console.warn("Tinyflow instance is not initialized"), null)
    }), (f, p) => (xf(), bf("div", {
      ref_key: "divRef",
      ref: r,
      class: _f(["tinyflow", f.className]),
      style: kf(f.style)
    }, null, 6));
  }
});
export {
  ox as Tinyflow
};
//# sourceMappingURL=index.js.map
