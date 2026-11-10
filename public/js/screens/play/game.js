S["play/game"] = {
  render() {
    const P = new URLSearchParams(location.search);
    let remote = P.get("slug") || P.get("id") || "";
    if (!remote) {
      const pool = GAMES.filter((x) => x.id);
      if (pool.length) remote = String(pool[Math.floor(Math.random() * pool.length)].id);
    }
    this.remote = remote;
    const d = { skin: "linear-gradient(160deg,#7c5cff,#b59bff)", dark: true, mascot: "\u{1F43B}", hint: "Loading\u2026" };
    const g = { e: "\u{1F3AE}", t: "Loading\u2026" };
    return `<div class="gm ${d.dark ? "gm-dark" : ""}" style="--skin:${d.skin}">
      <div class="gm-top">
        <button class="gm-btn" data-go="play/discover" aria-label="Exit">⬅ Exit</button>
        <div class="gm-title"><span>${g.e}</span><b>${g.t}</b></div>
        <div class="gm-dots" id="gdots"></div>
        <div class="gm-stats">
          <button class="gm-btn round" id="gmute" aria-label="Sound">\u{1F50A}</button>
          <span class="gm-pill">⏱ <b id="tn">0</b>s</span>
          <span class="gm-pill">⭐ <b id="gsc">0</b></span>
        </div>
      </div>
      <div class="gm-bar"><i id="tbar"></i></div>
      <div class="gm-main" id="gmain"></div>
      <div class="gm-foot"><span class="gm-mascot" id="gmas">${d.mascot}</span><div class="gm-say" id="gsay">${d.hint}</div></div>
    </div>`;
  },
  mount(root) {
    const remote = this.remote;
    let d = { rounds: 0, hint: "", secs: 20 };
    let gameRef = remote;
    const t0 = Date.now();
    document.body.style.overflow = "hidden";
    SFX.init();
    SFX.muted = false;
    const main = $("#gmain", root), say = $("#gsay", root), mas = $("#gmas", root);
    const st = { n: 0, score: 0, right: 0, streak: 0, t: 0, locked: true, res: [], cur: null, timer: null, flips: [], matched: 0 };
    const tr = (el) => {
      if (typeof trNodes === "function") trNodes(el);
    };
    const dots = () => {
      $("#gdots", root).innerHTML = Array.from({ length: d.rounds }, (_, i) => `<i class="${st.res[i] === 1 ? "ok" : st.res[i] === 0 ? "bad" : i === st.n ? "cur" : ""}"></i>`).join("");
    };
    const setScore = () => {
      $("#gsc", root).textContent = st.score.toLocaleString();
    };
    const setT = () => {
      $("#tn", root).textContent = st.t;
      $("#tbar", root).style.width = st.t / (st.max || d.secs) * 100 + "%";
      $("#tbar", root).classList.toggle("low", st.t <= 4);
    };
    const buddy = (txt, mood) => {
      say.textContent = txt;
      mas.className = "gm-mascot " + (mood || "");
      tr(say);
    };
    const confetti = () => {
      const box = document.createElement("div");
      box.className = "gm-conf";
      box.innerHTML = Array.from({ length: 26 }, (_, i) => `<i style="--x:${gInt(5, 95)}%;--d:${(Math.random() * 0.6).toFixed(2)}s;--r:${gInt(-300, 300)}deg;--c:${["#ffd23f", "#ff5fa2", "#7c5cff", "#2fbf63", "#3d8bff"][i % 5]}"></i>`).join("");
      $(".gm", root).appendChild(box);
      later(() => box.remove(), 1800);
    };
    const stopTimer = () => {
      clearInterval(st.timer);
      st.timer = null;
    };
    const startTimer = (onEnd) => {
      stopTimer();
      st.max = st.cur && st.cur.secs || d.secs;
      st.t = st.max;
      setT();
      st.timer = setInterval(() => {
        if (!root.isConnected) {
          stopTimer();
          return;
        }
        if (st.locked) return;
        st.t = Math.max(0, st.t - 1);
        setT();
        if (st.t > 0 && st.t <= 5) SFX.tick(true);
        if (!st.t) onEnd();
      }, 1000);
    };
    const ptsFor = () => {
      if (st.cur && st.cur.points === 0) return 0;
      const fast = d.cfg && d.cfg.speedBonus === false ? 0 : st.t * 5;
      return 100 + fast + Math.min(st.streak, 4) * 20;
    };
    const advance = () => {
      later(() => {
        st.n++;
        next();
      }, 2800);
    };
    const finishChoice = (i) => {
      if (st.locked) return;
      st.locked = true;
      stopTimer();
      const r = st.cur, ok = i === r.ans;
      const btns = $$("[data-i]", root);
      btns.forEach((b) => {
        const k = +b.dataset.i;
        b.disabled = true;
        if (k === r.ans) b.classList.add("ok");
        else if (k === i) b.classList.add("no");
        else b.classList.add("dim");
      });
      const fb = $("#gfb", root);
      st.res[st.n] = ok ? 1 : 0;
      if (ok) {
        const pts = ptsFor();
        st.score += pts;
        st.right++;
        st.streak++;
        setScore();
        SFX.ok();
        confetti();
        SFX.say(["Correct!", "Great job!", "Awesome!", "You got it!"][gInt(0, 3)]);
        fb.innerHTML = `<span class="gm-fb-in good">✅ Correct! +${pts} ⭐</span>`;
        buddy("Yay! You are so smart!", "happy");
      } else {
        st.streak = 0;
        const timeout = i < 0;
        if (timeout) SFX.buzz();
        SFX.bad();
        SFX.say((timeout ? "Time is up! " : "Oops! ") + r.reveal);
        fb.innerHTML = `<span class="gm-fb-in bad">${timeout ? "⏰ Time is up!" : "❌ Not quite!"} ${esc(r.reveal)}</span>`;
        buddy(timeout ? "That was fast! Next time you can do it." : "Good try! Let us learn from it.", "sad");
      }
      tr(fb);
      if (d.race) {
        const me = $("#rme", root), foe = $("#rfoe", root);
        const step = 100 / d.rounds;
        me.style.left = Math.min(88, (st.right) * step * 0.88) + "%";
        foe.style.left = Math.min(88, (st.n + 1) * step * 0.7) + "%";
      }
      dots();
      advance();
    };
    const renderChoice = (r) => {
      const lay = d.layout || "grid";
      const opts = r.opts.map((o, i) => {
        if (lay === "balloon") return `<button class="gm-bal" data-i="${i}" style="--c:${o.c};--i:${i}"><i></i><span>${esc(o.s)}</span></button>`;
        if (lay === "scene") return `<button class="gm-spot" data-i="${i}" style="left:${o.x}%;top:${o.y}%;--i:${i}">${o.h}</button>`;
        return `<button class="ans a${i}" data-i="${i}">${o.h}</button>`;
      }).join("");
      const track = d.race ? `<div class="gm-track"><span class="flag">\u{1F3C1}</span><span class="rk me" id="rme" style="left:0">\u{1F680}</span><span class="rk foe" id="rfoe" style="left:0">\u{1F6F8}</span></div>` : "";
      main.innerHTML = `${track}<div class="gm-q"><h2>${esc(r.prompt)}</h2></div>
        <div class="gm-vis">${r.visual}</div>
        <div class="gm-opts ${lay}" id="gopts">${opts}</div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      $$("[data-i]", root).forEach((b) => b.addEventListener("click", () => {
        SFX.pop();
        finishChoice(+b.dataset.i);
      }));
      if (d.race) {
        const step = 100 / d.rounds;
        $("#rme", root).style.left = Math.min(88, st.right * step * 0.88) + "%";
        $("#rfoe", root).style.left = Math.min(88, st.n * step * 0.7) + "%";
      }
    };
    const finishMemory = (won) => {
      if (st.locked) return;
      st.locked = true;
      stopTimer();
      const fb = $("#gfb", root);
      st.res[st.n] = won ? 1 : 0;
      if (won) {
        const pts = 200 + st.t * 6;
        st.score += pts;
        st.right++;
        setScore();
        SFX.ok();
        confetti();
        SFX.say("Great memory!");
        fb.innerHTML = `<span class="gm-fb-in good">✅ All pairs found! +${pts} ⭐</span>`;
        buddy("Wow, what a memory!", "happy");
      } else {
        SFX.buzz();
        SFX.bad();
        const left = st.cur.cards.length / 2 - st.matched;
        SFX.say("Time is up! Here are the pairs.");
        $$(".gm-card", root).forEach((c) => {
          if (!c.classList.contains("done")) c.classList.add("flip", "miss");
        });
        fb.innerHTML = `<span class="gm-fb-in bad">⏰ Time is up! ${left} pair${left > 1 ? "s" : ""} left. Here are the answers.</span>`;
        buddy("Almost! Try to remember the places.", "sad");
      }
      tr(fb);
      dots();
      advance();
    };
    const renderMemory = (r) => {
      st.flips = [];
      st.matched = 0;
      const cols = r.cards.length <= 6 ? 3 : 4;
      main.innerHTML = `<div class="gm-q"><h2>${esc(r.prompt)}</h2></div>
        <div class="gm-mem" style="--cols:${cols}">${r.cards.map((c, i) => `<button class="gm-card" data-k="${i}"><span class="f">❓</span><span class="b">${c}</span></button>`).join("")}</div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      $$(".gm-card", root).forEach((c) => c.addEventListener("click", () => {
        if (st.locked || c.classList.contains("flip") || st.flips.length >= 2) return;
        SFX.flip();
        c.classList.add("flip");
        st.flips.push(c);
        if (st.flips.length < 2) return;
        const [a, b] = st.flips;
        if (r.cards[+a.dataset.k] === r.cards[+b.dataset.k]) {
          st.flips = [];
          st.matched++;
          later(() => {
            a.classList.add("done");
            b.classList.add("done");
            SFX.pop();
            if (st.matched === r.cards.length / 2) finishMemory(true);
          }, 350);
        } else {
          later(() => {
            if (st.locked) return;
            SFX.bad();
            a.classList.remove("flip");
            b.classList.remove("flip");
            st.flips = [];
          }, 800);
        }
      }));
    };
    const verdict = (ok, timeout, r) => {
      if (st.locked) return;
      st.locked = true;
      stopTimer();
      const fb = $("#gfb", root);
      st.res[st.n] = ok ? 1 : 0;
      $$("button,input", $("#gmain", root)).forEach((b) => {
        b.disabled = true;
      });
      if (ok) {
        const pts = ptsFor();
        st.score += pts;
        st.right++;
        st.streak++;
        setScore();
        SFX.ok();
        confetti();
        fb.innerHTML = `<span class="gm-fb-in good">✅ Correct! +${pts} ⭐</span>`;
        buddy("Yay! You are so smart!", "happy");
      } else {
        st.streak = 0;
        if (timeout) SFX.buzz();
        SFX.bad();
        fb.innerHTML = `<span class="gm-fb-in bad">${timeout ? "⏰ Time is up!" : "❌ Not quite!"} ${esc(r.reveal)}</span>`;
        buddy(timeout ? "That was fast! Next time you can do it." : "Good try! Let us learn from it.", "sad");
      }
      tr(fb);
      dots();
      advance();
    };
    const head = (r) => `<div class="gm-q"><h2>${esc(r.prompt)}</h2></div><div class="gm-vis">${r.visual || ""}</div>`;
    const norm = (v) => String(v).trim().toLowerCase().replace(/\s+/g, " ");
    const renderLesson = (r) => {
      main.innerHTML = `<div class="gm-lesson"><span class="gm-tag">\u{1F4D6} Let us learn</span><h2>${esc(r.prompt)}</h2><div class="gm-vis">${r.visual || ""}</div><p>${esc(r.body)}</p></div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
    };
    const sceneBg = (bg) => {
      if (!bg) return "";
      if (/^https?:\/\//.test(bg)) return `background:url('${bg.replace(/'/g, "")}') center/cover`;
      return `background:${bg.replace(/[;<>"]/g, "")}`;
    };
    const objHtml = (o, i, clickable) => {
      const col = o.color ? `color:${o.color.replace(/[;<>"]/g, "")};` : "";
      const st0 = `left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%;--fs:${o.fs};${col}`;
      let inner = esc(o.text);
      if (o.kind === "image") inner = `<img src="${esc(o.text)}" alt="" draggable="false">`;
      const bgc = o.kind === "shape" || o.kind === "zone" || o.kind === "button" ? `background:${o.color ? o.color.replace(/[;<>"]/g, "") : "#7c5cff"};color:#fff;` : "";
      return `<${clickable ? "button" : "div"} class="so so-${o.kind} role-${o.role}" data-o="${i}" data-oid="${esc(o.id)}" style="${st0}${bgc}">${inner}</${clickable ? "button" : "div"}>`;
    };
    const renderCanvas = (r) => {
      const objs = r.objs;
      const tap = r.mode !== "drag";
      main.innerHTML = `<div class="gm-q"><h2>${esc(r.prompt)}</h2></div><div class="gm-scene" id="gscene" style="${sceneBg(r.bg)}">${objs.map((o, i) => objHtml(o, i, tap ? o.role === "correct" || o.role === "wrong" : o.role === "drag")).join("")}</div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      const sc = $("#gscene", root);
      if (tap) {
        const need = objs.filter((o) => o.role === "correct").length;
        let found = 0, miss = 0;
        $$("button.so", sc).forEach((b) => b.addEventListener("click", () => {
          if (st.locked || b.classList.contains("found")) return;
          const o = objs[+b.dataset.o];
          if (o.role === "correct") {
            b.classList.add("found");
            found++;
            SFX.pop();
            if (found >= need) later(() => verdict(true, false, r), 250);
          } else {
            b.classList.add("oops");
            SFX.buzz();
            miss++;
            later(() => b.classList.remove("oops"), 500);
            if (miss >= 3) verdict(false, false, r);
          }
        }));
        st.onTime = () => {
          $$(".role-correct:not(.found)", sc).forEach((b) => b.classList.add("hint"));
          verdict(false, true, r);
        };
      } else {
        const need = objs.filter((o) => o.role === "drag").length;
        let done = 0;
        $$("button.so", sc).forEach((b) => {
          const o = objs[+b.dataset.o];
          const hx = o.x, hy = o.y;
          b.addEventListener("pointerdown", (e) => {
            if (st.locked || b.classList.contains("done")) return;
            e.preventDefault();
            b.setPointerCapture(e.pointerId);
            b.classList.add("lift");
            const rect = sc.getBoundingClientRect();
            const move = (ev) => {
              b.style.left = (ev.clientX - rect.left) / rect.width * 100 - o.w / 2 + "%";
              b.style.top = (ev.clientY - rect.top) / rect.height * 100 - o.h / 2 + "%";
            };
            const up = (ev) => {
              b.removeEventListener("pointermove", move);
              b.removeEventListener("pointerup", up);
              b.classList.remove("lift");
              const px = (ev.clientX - rect.left) / rect.width * 100, py = (ev.clientY - rect.top) / rect.height * 100;
              const z = objs.find((q) => q.role === "target" && px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h);
              if (z && z.id === o.target) {
                b.style.left = z.x + z.w / 2 - o.w / 2 + "%";
                b.style.top = z.y + z.h / 2 - o.h / 2 + "%";
                b.classList.add("done");
                SFX.pop();
                done++;
                if (done >= need) later(() => verdict(true, false, r), 300);
              } else {
                if (z) SFX.buzz();
                b.style.left = hx + "%";
                b.style.top = hy + "%";
              }
            };
            b.addEventListener("pointermove", move);
            b.addEventListener("pointerup", up);
            move(e);
          });
        });
        st.onTime = () => {
          $$("button.so:not(.done)", sc).forEach((b) => {
            const o = objs[+b.dataset.o];
            const z = objs.find((q) => q.id === o.target);
            if (z) {
              b.style.left = z.x + z.w / 2 - o.w / 2 + "%";
              b.style.top = z.y + z.h / 2 - o.h / 2 + "%";
              b.classList.add("hint");
            }
          });
          verdict(false, true, r);
        };
      }
    };
    const renderType = (r) => {
      main.innerHTML = `${head(r)}<form class="gm-type" id="gtf"><input id="gti" autocomplete="off" placeholder="Type your answer" aria-label="Your answer"><button class="gm-big-btn" type="submit">Check ✔</button></form><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      const inp = $("#gti", root);
      later(() => inp.focus(), 60);
      $("#gtf", root).addEventListener("submit", (e) => {
        e.preventDefault();
        if (st.locked || !inp.value.trim()) return;
        const ok = r.acc.some((a) => norm(a) === norm(inp.value));
        inp.classList.add(ok ? "ok" : "no");
        verdict(ok, false, r);
      });
      st.onTime = () => {
        inp.classList.add("no");
        verdict(false, true, r);
      };
    };
    const renderOrder = (r) => {
      st.pick = [];
      main.innerHTML = `${head(r)}<div class="gm-slots" id="gsl">${r.items.map((_, i) => `<span class="gm-slot" data-s="${i}">${i + 1}</span>`).join("")}</div><div class="gm-chips" id="gch">${r.mix.map((x, i) => `<button class="gm-chip" data-c="${i}">${esc(x)}</button>`).join("")}</div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      const draw = () => {
        $$(".gm-slot", root).forEach((s, i) => {
          s.textContent = st.pick[i] !== void 0 ? r.mix[st.pick[i]] : i + 1;
          s.classList.toggle("full", st.pick[i] !== void 0);
        });
        $$(".gm-chip", root).forEach((c) => {
          c.classList.toggle("used", st.pick.includes(+c.dataset.c));
        });
      };
      const check = () => {
        const got = st.pick.map((i) => r.mix[i]);
        const ok = got.every((x, i) => x === r.items[i]);
        $$(".gm-slot", root).forEach((s, i) => s.classList.add(got[i] === r.items[i] ? "ok" : "no"));
        verdict(ok, false, r);
      };
      $$(".gm-chip", root).forEach((c) => c.addEventListener("click", () => {
        if (st.locked || st.pick.includes(+c.dataset.c)) return;
        SFX.pop();
        st.pick.push(+c.dataset.c);
        draw();
        if (st.pick.length === r.items.length) later(check, 350);
      }));
      $$(".gm-slot", root).forEach((s) => s.addEventListener("click", () => {
        if (st.locked) return;
        const i = +s.dataset.s;
        if (st.pick[i] === void 0) return;
        st.pick.splice(i, 1);
        SFX.flip();
        draw();
      }));
      st.onTime = () => {
        $$(".gm-slot", root).forEach((s, i) => {
          s.textContent = r.items[i];
          s.classList.add("no");
        });
        verdict(false, true, r);
      };
    };
    const renderSlider = (r) => {
      const mid = Math.round((r.min + (r.max - r.min) / 2) / r.step) * r.step;
      main.innerHTML = `${head(r)}<div class="gm-slide"><div class="gm-val" id="gsv">${mid}</div><input type="range" id="gsr" min="${r.min}" max="${r.max}" step="${r.step}" value="${mid}" aria-label="Your answer"><div class="gm-range"><span>${r.min}</span><span>${r.max}</span></div><button class="gm-big-btn" id="gsb">Lock in ✔</button></div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      const inp = $("#gsr", root);
      inp.addEventListener("input", () => {
        $("#gsv", root).textContent = inp.value;
        SFX.flip();
      });
      $("#gsb", root).addEventListener("click", () => {
        if (st.locked) return;
        verdict(Math.abs(+inp.value - r.ans) <= r.tol, false, r);
      });
      st.onTime = () => verdict(false, true, r);
    };
    const renderMatch = (r) => {
      st.left = null;
      st.done = 0;
      main.innerHTML = `${head(r)}<div class="gm-match"><div class="col" id="gml">${r.pairs.map((p, i) => `<button class="gm-m" data-l="${i}">${esc(p[0])}</button>`).join("")}</div><div class="col" id="gmr">${r.right.map((x) => `<button class="gm-m" data-r="${x[1]}">${esc(x[0])}</button>`).join("")}</div></div><div class="gm-fb" id="gfb"></div>`;
      tr(main);
      $$("[data-l]", root).forEach((b) => b.addEventListener("click", () => {
        if (st.locked || b.classList.contains("done")) return;
        SFX.pop();
        $$("[data-l]", root).forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        st.left = +b.dataset.l;
      }));
      $$("[data-r]", root).forEach((b) => b.addEventListener("click", () => {
        if (st.locked || st.left === null || b.classList.contains("done")) return;
        const L = $(`[data-l="${st.left}"]`, root);
        if (+b.dataset.r === st.left) {
          SFX.ok();
          L.classList.remove("sel");
          L.classList.add("done");
          b.classList.add("done");
          st.left = null;
          st.done++;
          if (st.done === r.pairs.length) later(() => verdict(true, false, r), 300);
        } else {
          SFX.bad();
          b.classList.add("no");
          later(() => b.classList.remove("no"), 450);
        }
      }));
      st.onTime = () => verdict(false, true, r);
    };
    const results = () => {
      stopTimer();
      const total = d.scored || d.rounds, pct = st.right / total, stars = pct >= 0.8 ? 3 : pct >= 0.5 ? 2 : 1;
      SFX.music(false);
      api("POST", "/api/play/results", { game: gameRef, score: st.score, correct: st.right, total, seconds: Math.round((Date.now() - t0) / 1000) }).catch(() => {
      });
      SFX.win();
      confetti();
      main.innerHTML = `<div class="gm-res"><div class="gm-big" style="font-size:5rem">${d.mascot}</div><h2>${pct >= 0.5 ? "Hooray, great job!" : "Nice try! Practice makes perfect."}</h2>
        <div class="gm-stars">${[1, 2, 3].map((s) => `<span class="${s <= stars ? "on" : ""}" style="--i:${s}">⭐</span>`).join("")}</div>
        <p><b>${st.right}</b> of <b>${total}</b> correct · <b>${st.score.toLocaleString()}</b> points</p>
        <div class="row center gap12 wrap"><button class="gm-big-btn" id="gagain">\u{1F501} Play again</button><button class="gm-big-btn alt" data-go="play/game">\u{1F3B2} Another game</button><button class="gm-big-btn alt" data-go="play/discover">\u{1F3E0} Home</button></div></div>`;
      tr(main);
      $("#gagain", root).addEventListener("click", () => {
        st.n = 0;
        st.score = 0;
        st.right = 0;
        st.streak = 0;
        st.res = [];
        setScore();
        next();
      });
      buddy("You played so well today!", "happy");
      dots();
    };
    const next = () => {
      if (st.n >= d.rounds) {
        results();
        return;
      }
      const r = d.make(st.n);
      st.cur = r;
      st.locked = false;
      dots();
      buddy(d.hint);
      mas.className = "gm-mascot";
      st.onTime = null;
      if (r.kind === "lesson") {
        renderLesson(r);
        startTimer(() => {
          if (st.locked) return;
          st.locked = true;
          stopTimer();
          st.res[st.n] = 2;
          dots();
          st.n++;
          next();
        });
      } else if (r.kind === "memory") {
        renderMemory(r);
        startTimer(() => finishMemory(false));
      } else if (r.kind === "type" || r.kind === "order" || r.kind === "slider" || r.kind === "match" || r.kind === "canvas") {
        ({ type: renderType, order: renderOrder, slider: renderSlider, match: renderMatch, canvas: renderCanvas })[r.kind](r);
        startTimer(() => st.onTime && st.onTime());
      } else {
        renderChoice(r);
        startTimer(() => finishChoice(-1));
      }
      SFX.setDuck(1);
      if (!(d.cfg && d.cfg.music === false)) {
        const m = r.music || "";
        const isUrl = m.startsWith("http");
        const url = isUrl ? m : m ? "" : d.cfg.musicUrl || "";
        const track = m && !isUrl ? m : d.cfg.track || "happy";
        const key = url || track;
        if (st.musicKey !== void 0 && st.musicKey !== key) SFX.music(false);
        st.musicKey = key;
        SFX.url = url;
        SFX.track = track;
        SFX.music(true);
      }
    };
    $("#gmute", root).addEventListener("click", (e) => {
      SFX.muted = !SFX.muted;
      e.currentTarget.textContent = SFX.muted ? "\u{1F507}" : "\u{1F50A}";
      if (SFX.muted) SFX.stop();
      else if (!st.locked) SFX.music(true);
    });
    setScore();
    if (!remote) {
      main.innerHTML = `<div class="gm-res"><div class="gm-big">\u{1F61E}</div><h2>No games yet</h2><button class="gm-big-btn" data-go="play/discover">\u{1F3E0} Home</button></div>`;
      return;
    }
    api("GET", "/api/games/" + encodeURIComponent(remote)).then((r) => {
      const game = r.game;
      gameRef = game.id;
      d = customDef(game);
      if (!d.rounds) throw new Error("This game has no questions yet");
      SFX.track = d.cfg.track || "happy";
      SFX.url = d.cfg.musicUrl || "";
      const gm = $(".gm", root);
      gm.style.setProperty("--skin", d.skin);
      gm.classList.toggle("gm-dark", !!d.dark);
      $(".gm-title", root).innerHTML = `<span>${esc(game.emoji)}</span><b translate="no">${esc(game.title)}</b>`;
      mas.textContent = d.mascot;
      next();
    }).catch((e) => {
      main.innerHTML = `<div class="gm-res"><div class="gm-big">\u{1F61E}</div><h2>${esc(e.message)}</h2><button class="gm-big-btn" data-go="play/discover">\u{1F3E0} Home</button></div>`;
    });
  }
};
