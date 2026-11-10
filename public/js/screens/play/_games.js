const SFX = {
  ctx: null,
  muted: false,
  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const C = window.AudioContext || window.webkitAudioContext;
    if (C) this.ctx = new C();
    if (!this.unlock) {
      this.unlock = () => {
        if (this.ctx && this.ctx.state !== "running") this.ctx.resume();
      };
      ["pointerdown", "keydown", "touchstart", "click"].forEach((ev) => document.addEventListener(ev, this.unlock, true));
    }
  },
  tone(f, t0, d, type = "sine", v = 0.18) {
    if (this.muted || !this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, c.currentTime + t0);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(v, c.currentTime + t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + d);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + t0);
    o.stop(c.currentTime + t0 + d + 0.05);
  },
  ok() {
    this.setDuck(0.25);
    [659, 784, 988, 1319].forEach((f, i) => this.tone(f, i * 0.07, 0.25, "square", 0.1));
    [523, 659, 784].forEach((f) => this.tone(f, 0.3, 0.45, "triangle", 0.14));
    this.tone(1568, 0.34, 0.4, "sine", 0.1);
  },
  bad() {
    this.setDuck(0.25);
    [[311, 0], [277, 0.22], [247, 0.44], [196, 0.66]].forEach(([f, t], i) => {
      this.tone(f, t, i === 3 ? 0.6 : 0.22, "sawtooth", 0.13);
      this.tone(f * 1.01, t, i === 3 ? 0.6 : 0.22, "square", 0.05);
    });
  },
  buzz() {
    this.tone(120, 0, 0.7, "sawtooth", 0.16);
    this.tone(124, 0, 0.7, "square", 0.08);
  },
  tick(fast) {
    this.tone(fast ? 1250 : 900, 0, 0.05, "square", fast ? 0.09 : 0.05);
  },
  pop() {
    this.tone(700, 0, 0.07, "sine", 0.16);
    this.tone(1100, 0.04, 0.07, "sine", 0.12);
  },
  flip() {
    this.tone(420, 0, 0.06, "triangle", 0.12);
  },
  win() {
    [523, 659, 784, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, i * 0.12, 0.3, "triangle"));
  },
  bgTimer: null,
  step: 0,
  noise(t0, d, v, freq) {
    if (this.muted || !this.ctx) return;
    const c = this.ctx, n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = buf;
    f.type = "highpass";
    f.frequency.value = freq;
    g.gain.setValueAtTime(v, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + d);
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start(c.currentTime + t0);
  },
  kick() {
    if (this.muted || !this.ctx) return;
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(150, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, c.currentTime + 0.14);
    g.gain.setValueAtTime(0.28, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.18);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.2);
  },
  duck: 1,
  track: "happy",
  url: "",
  aud: null,
  setDuck(v) {
    this.duck = v;
    if (this.aud) this.aud.volume = 0.5 * v;
  },
  music(on) {
    if (this.url) {
      if (!on || this.muted) {
        if (this.aud) this.aud.pause();
        return;
      }
      if (!this.aud || this.aud.dataset.src !== this.url) {
        if (this.aud) this.aud.pause();
        this.aud = new Audio(this.url);
        this.aud.dataset.src = this.url;
        this.aud.loop = true;
      }
      this.aud.volume = 0.5 * this.duck;
      if (this.aud.paused) this.aud.play().catch(() => {});
      return;
    }
    if (this.aud) this.aud.pause();
    if (on && this.bgTimer) return;
    clearInterval(this.bgTimer);
    this.bgTimer = null;
    if (!on || this.muted || !this.ctx || this.track === "none") return;
    const TR = {
      happy: { ms: 125, drums: true, wave: "square", mv: 0.045, roots: [131, 110, 175, 196], chords: [[262, 330, 392], [220, 262, 330], [262, 349, 440], [247, 294, 392]], mel: [
        [784, 0, 659, 784, 880, 0, 784, 659, 523, 0, 659, 0, 784, 880, 988, 0],
        [659, 0, 523, 659, 784, 0, 659, 523, 440, 0, 523, 0, 659, 784, 659, 0],
        [698, 0, 880, 698, 1047, 0, 880, 698, 880, 0, 698, 0, 523, 659, 698, 0],
        [784, 0, 988, 784, 1175, 0, 988, 784, 988, 0, 784, 0, 659, 784, 988, 1175]] },
      calm: { ms: 200, drums: false, wave: "sine", mv: 0.1, roots: [131, 98, 110, 87], chords: [[262, 330, 392], [196, 247, 294], [220, 262, 330], [175, 220, 262]], mel: [
        [523, 0, 0, 0, 392, 0, 0, 0, 440, 0, 0, 0, 392, 0, 0, 0],
        [330, 0, 0, 0, 392, 0, 0, 0, 523, 0, 0, 0, 392, 0, 0, 0],
        [440, 0, 0, 0, 523, 0, 0, 0, 587, 0, 0, 0, 523, 0, 0, 0],
        [440, 0, 0, 0, 392, 0, 0, 0, 330, 0, 0, 0, 262, 0, 0, 0]] },
      party: { ms: 100, drums: true, wave: "square", mv: 0.035, roots: [175, 131, 147, 196], chords: [[349, 440, 523], [262, 330, 392], [294, 370, 440], [392, 494, 587]], mel: [
        [698, 0, 698, 0, 880, 0, 698, 0, 587, 0, 0, 698, 0, 880, 0, 0],
        [784, 0, 784, 0, 659, 0, 784, 0, 659, 0, 523, 0, 659, 0, 784, 0],
        [587, 0, 587, 0, 740, 0, 880, 0, 740, 0, 587, 0, 0, 880, 0, 740],
        [784, 0, 988, 0, 784, 0, 659, 0, 784, 988, 0, 1175, 0, 988, 0, 784]] },
      adventure: { ms: 130, drums: true, wave: "sawtooth", mv: 0.03, roots: [110, 87, 131, 98], chords: [[220, 262, 330], [175, 220, 262], [262, 330, 392], [196, 247, 294]], mel: [
        [440, 0, 0, 440, 523, 0, 0, 523, 659, 0, 0, 659, 587, 0, 523, 0],
        [698, 0, 0, 698, 659, 0, 0, 587, 523, 0, 0, 0, 440, 0, 0, 0],
        [523, 0, 0, 523, 659, 0, 0, 659, 784, 0, 0, 784, 698, 0, 659, 0],
        [587, 0, 0, 494, 587, 0, 0, 659, 587, 0, 0, 0, 494, 0, 0, 0]] },
      magic: { ms: 150, drums: false, wave: "triangle", mv: 0.09, roots: [165, 131, 110, 123], chords: [[330, 392, 494], [262, 330, 392], [220, 262, 330], [247, 294, 370]], mel: [
        [659, 784, 988, 784, 659, 784, 988, 1175, 988, 784, 659, 784, 988, 784, 659, 0],
        [523, 659, 784, 659, 523, 659, 784, 988, 784, 659, 523, 659, 784, 659, 523, 0],
        [440, 523, 659, 523, 440, 523, 659, 784, 659, 523, 440, 523, 659, 523, 440, 0],
        [494, 587, 740, 587, 494, 587, 740, 880, 740, 587, 494, 587, 740, 587, 494, 0]] },
      groove: { ms: 135, drums: true, wave: "triangle", mv: 0.08, roots: [147, 196, 131, 175], chords: [[294, 370, 440], [392, 494, 587], [262, 330, 392], [349, 440, 523]], mel: [
        [0, 587, 0, 740, 0, 880, 0, 740, 0, 587, 0, 0, 740, 0, 0, 0],
        [0, 784, 0, 988, 0, 1175, 0, 988, 0, 784, 0, 0, 988, 0, 0, 0],
        [0, 523, 0, 659, 0, 784, 0, 659, 0, 523, 0, 0, 659, 0, 0, 0],
        [0, 698, 0, 880, 0, 1047, 0, 880, 0, 698, 0, 0, 880, 0, 0, 0]] }
    };
    const T = TR[this.track] || TR.happy, roots = T.roots, chords = T.chords, mel = T.mel;
    this.step = 0;
    this.bgTimer = setInterval(() => {
      if (this.ctx.state !== "running") {
        this.ctx.resume();
        return;
      }
      const st = this.step++, i = st % 16, bar = Math.floor(st / 16) % 4, k = this.duck;
      if (T.drums && i % 4 === 0 && k > 0.5) this.kick();
      if (T.drums && i % 8 === 4 && k > 0.5) this.noise(0, 0.12, 0.12, 1800);
      if (T.drums && i % 2 === 1 && k > 0.5) this.noise(0, 0.04, 0.05, 7000);
      if (i % 2 === 0) this.tone(roots[bar] * (i % 8 === 6 ? 2 : 1), 0, T.ms / 700, "triangle", 0.13 * k);
      if (i % 4 === 2) chords[bar].forEach((f) => this.tone(f, 0, T.ms / 1100, T.wave === "sine" ? "sine" : "square", 0.022 * k));
      const m = mel[bar][i];
      if (m) this.tone(m, 0, T.ms / 780, T.wave, T.mv * k);
    }, T.ms);
  },
  say() {
  },
  stop() {
    this.music(false);
  }
};
const gShuf = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const gInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const gPick = (a, n) => gShuf(a).slice(0, n);
const gChoice = (prompt, visual, opts, ans, reveal, say) => ({ kind: "choice", prompt, visual, opts, ans, reveal, say: say || prompt });
const gMix = (right, wrongs, n = 4) => {
  const list = gShuf([right].concat(gPick(wrongs.filter((w) => w !== right), n - 1)));
  return { list, ans: list.indexOf(right) };
};
const SKIN_BG = {
  jungle: "linear-gradient(160deg,#2fbf63,#8fe08a)",
  ocean: "linear-gradient(180deg,#3d8bff,#9be0ff)",
  space: "linear-gradient(180deg,#1a1446,#3b2d8f 60%,#6b4fd8)",
  candy: "linear-gradient(160deg,#ff5fa2,#ffc9de)",
  farm: "linear-gradient(160deg,#f5a300,#ffe58a)",
  desert: "linear-gradient(160deg,#ff8a2b,#ffd9a8)",
  sunny: "linear-gradient(160deg,#ff9a3c,#ffcf5c)",
  grape: "linear-gradient(160deg,#7c5cff,#b59bff)",
  mint: "linear-gradient(160deg,#1fbfa6,#74e0c8)",
  coral: "linear-gradient(160deg,#ff6b7a,#ffb199)",
  lime: "linear-gradient(160deg,#6fcf3f,#bff08a)",
  deepsea: "linear-gradient(180deg,#0a67c9,#37b4ff 70%,#9be0ff)",
  sky: "linear-gradient(180deg,#8fd3ff,#d6f0ff 70%,#fff)",
  gold: "linear-gradient(160deg,#ffbf3c,#ffe58a)",
  meadow: "linear-gradient(180deg,#9ce37a,#4faa4b)"
};
const COLOR_MAP = { red: "#ff4d5e", blue: "#3d8bff", green: "#2fbf63", yellow: "#ffc61a", purple: "#9a6bff", orange: "#ff8a2b", pink: "#ff7eb6", brown: "#a0643c", black: "#3a3340", white: "#e9e4f0" };
const BAL_PALETTE = ["#ff4d5e", "#3d8bff", "#2fbf63", "#ffc61a", "#9a6bff", "#ff8a2b"];
const SCENE_CELLS = [[8, 10], [40, 6], [72, 12], [14, 52], [48, 48], [78, 56]];
function visualFor(img) {
  if (!img) return "";
  if (/^https?:\/\//.test(img)) return `<div class="gm-pic"><img src="${esc(img)}" alt="" draggable="false"></div>`;
  const chars = [...img];
  if (/^[\d\s+−=?-]+$/.test(img) && chars.length > 3) return `<div class="gm-sum">${esc(img)}</div>`;
  if (chars.length <= 4 && /^[\p{L}\s]+$/u.test(img) && !/\p{Extended_Pictographic}/u.test(img)) return `<div class="gm-letter ${/[ក-៿]/.test(img) ? "km" : ""}">${esc(chars[0])}${chars.length > 2 ? `<small>${esc(chars.slice(2).join(""))}</small>` : ""}</div>`;
  if (chars.length >= 2 && /\p{Extended_Pictographic}/u.test(img) && !/\s/.test(img) && !/[A-Za-z]/.test(img)) return `<div class="gm-heap">${chars.map((c, i) => `<span style="--i:${i}">${esc(c)}</span>`).join("")}</div>`;
  return `<div class="gm-big">${esc(img)}</div>`;
}
function customDef(game) {
  const km = typeof I18N !== "undefined" && I18N.lang === "km";
  const cfg = game.config && game.config.settings || {};
  const ok2 = (q) => {
    const t = q.type || "quiz";
    if (t === "lesson") return !!(q.q || q.text);
    if (t === "canvas") return (q.objs || []).length > 0;
    if (t === "type") return (q.acc || []).some(Boolean);
    if (t === "order") return (q.items || []).filter(Boolean).length >= 2;
    if (t === "slider") return q.max > q.min;
    if (t === "match") return (q.pairs || []).filter((p) => p[0] && p[1]).length >= 2;
    if (t === "memory") return (q.cards || []).filter(Boolean).length >= 2;
    return q.a && q.a.filter(Boolean).length >= 2;
  };
  let qs = (game.questions || []).filter(ok2);
  if (cfg.shuffle) qs = gShuf(qs);
  if (cfg.limit > 0) qs = qs.slice(0, cfg.limit);
  const layout = cfg.layout || "grid";
  return {
    skin: SKIN_BG[game.skin] || SKIN_BG.jungle,
    dark: cfg.dark !== false,
    secs: 20,
    rounds: qs.length,
    scored: qs.filter((q) => q.type !== "lesson").length,
    mascot: game.emoji || "\u{1F43B}",
    hint: cfg.hint || "Pick the right answer!",
    layout,
    race: !!cfg.race,
    cfg,
    make(n) {
      const q = qs[n], t = q.type || "quiz";
      const text = km && q.qk ? q.qk : q.q;
      const vis = visualFor(q.img);
      let r;
      if (t === "canvas") r = { kind: "canvas", prompt: text, visual: "", mode: q.mode === "drag" ? "drag" : "tap", bg: q.bg || "", objs: q.objs, reveal: q.mode === "drag" ? "Each item has its own place" : "Look for the glowing ones", say: text };
      else if (t === "lesson") r = { kind: "lesson", prompt: text, visual: vis, body: km && q.textk ? q.textk : q.text || "", say: text };
      else if (t === "type") r = { kind: "type", prompt: text, visual: vis, acc: q.acc.filter(Boolean), reveal: "The answer is " + q.acc.filter(Boolean)[0], say: text };
      else if (t === "order") {
        const items = q.items.filter(Boolean);
        let mix = gShuf(items);
        if (mix.join("|") === items.join("|")) mix = items.slice().reverse();
        r = { kind: "order", prompt: text, visual: vis, items, mix, reveal: "Right order: " + items.join(" → "), say: text };
      } else if (t === "slider") r = { kind: "slider", prompt: text, visual: vis, min: q.min, max: q.max, step: q.step || 1, ans: q.ans, tol: q.tol || 0, reveal: "The answer is " + q.ans, say: text };
      else if (t === "match") {
        const pairs = q.pairs.filter((p) => p[0] && p[1]);
        r = { kind: "match", prompt: text, visual: vis, pairs, right: gShuf(pairs.map((p, i) => [p[1], i])), reveal: "Pairs: " + pairs.map((p) => p[0] + " = " + p[1]).join(", "), say: text };
      } else if (t === "memory") r = { kind: "memory", prompt: text || "Find the matching pairs!", cards: gShuf(q.cards.filter(Boolean).flatMap((a) => [a, a])), say: text };
      else {
        const list = q.a.map((a, i) => ({ a: km && q.ak && q.ak[i] ? q.ak[i] : a, orig: i })).filter((o) => o.a);
        const mixed = t === "truefalse" || cfg.shuffleAnswers === false ? list : gShuf(list);
        const ans = mixed.findIndex((o) => o.orig === q.c);
        const cells = gShuf(SCENE_CELLS);
        const opts = mixed.map((o, i) => {
          if (layout === "balloon") return { h: "", s: o.a, c: COLOR_MAP[String(o.a).toLowerCase()] || BAL_PALETTE[i % BAL_PALETTE.length] };
          if (layout === "scene") return { h: `<span class="big">${esc(o.a)}</span>`, s: o.a, x: cells[i % 6][0], y: cells[i % 6][1] };
          return { h: `<b>${esc(o.a)}</b>`, s: o.a };
        });
        r = gChoice(text, vis, opts, ans < 0 ? 0 : ans, "The answer is " + (mixed[ans < 0 ? 0 : ans] || {}).a, text);
      }
      r.secs = q.t || 20;
      r.points = q.p;
      r.music = q.music || "";
      return r;
    }
  };
}
