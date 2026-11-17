const LV = {
  SHAPES: ["▲", "◆", "●", "■"],
  KEY: "ca_live_player",
  ordinal(n) {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },
  readPlayer() {
    try {
      return JSON.parse(sessionStorage.getItem(LV.KEY) || "null");
    } catch (e) {
      return null;
    }
  },
  savePlayer(o) {
    try {
      sessionStorage.setItem(LV.KEY, JSON.stringify(o));
    } catch (e) {
    }
  },
  clearPlayer() {
    try {
      sessionStorage.removeItem(LV.KEY);
    } catch (e) {
    }
  },
  count(el, from, to, ms) {
    const t0 = performance.now(), dur = ms || 1100;
    const step = (t) => {
      if (!el.isConnected) return;
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  confetti(parent) {
    const box = document.createElement("div");
    box.className = "gm-conf";
    box.innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="--x:${Math.floor(Math.random() * 96)}%;--d:${(Math.random() * 0.8).toFixed(2)}s;--r:${Math.floor(Math.random() * 600 - 300)}deg;--c:${["#ffd23f", "#ff5fa2", "#7c5cff", "#2fbf63", "#3d8bff"][i % 5]}"></i>`).join("");
    parent.appendChild(box);
    later(() => box.remove(), 2600);
  },
  visual(img) {
    if (!img) return "";
    return typeof visualFor === "function" ? visualFor(img) : `<div class="gm-big">${esc(img)}</div>`;
  },
  options(opts, cfg) {
    return opts.map((o, i) => {
      const cls = "ans a" + i + (cfg.mine === i ? " picked" : cfg.mine !== void 0 && cfg.mine !== null ? " dim" : "");
      const inner = `<span class="lv-shape">${LV.SHAPES[i]}</span><span class="lv-ot">${esc(o)}</span>`;
      return cfg.click ? `<button class="${cls}" data-i="${i}">${inner}</button>` : `<div class="${cls}">${inner}</div>`;
    }).join("");
  },
  dist(options, reveal) {
    const max = Math.max(1, ...reveal.counts);
    return `<div class="lv-dist">${options.map((o, i) => `<div class="lv-col ${i === reveal.correct ? "right" : "wrong"}"><b class="lv-cn">${reveal.counts[i]}</b><div class="lv-bar a${i}" style="--h:${Math.max(6, Math.round(reveal.counts[i] / max * 100))}%;--d:${i * 0.12}s"></div><div class="lv-lab a${i}"><span class="lv-shape">${LV.SHAPES[i]}</span>${i === reveal.correct ? '<em class="lv-tick">✔</em>' : ""}</div><small>${esc(o)}</small></div>`).join("")}</div>`;
  },
  board(box, list, cfg) {
    const limit = cfg.limit || 5, me = cfg.me || 0, animate = cfg.animate !== false;
    const vis = list.filter((p) => Math.min(p.rank, p.prevRank) <= limit || p.id === me);
    const H = 64, P = 74;
    const pos0 = new Map(vis.slice().sort((a, b) => a.prevRank - b.prevRank || a.id - b.id).map((p, i) => [p.id, i]));
    const pos1 = new Map(vis.slice().sort((a, b) => a.rank - b.rank || a.id - b.id).map((p, i) => [p.id, i]));
    box.style.height = vis.length * P + "px";
    box.innerHTML = vis.map((p) => `<div class="lv-row ${p.id === me ? "me" : ""}" data-id="${p.id}" style="height:${H}px;transform:translateY(${(animate ? pos0 : pos1).get(p.id) * P}px)"><span class="lv-rk">${animate ? p.prevRank : p.rank}</span><span class="lv-av">${esc(p.emoji)}</span><span class="lv-nm" translate="no">${esc(p.name)}</span><span class="lv-fire">${p.streak >= 2 ? "\u{1F525}" + p.streak : ""}</span><span class="lv-dl"></span><b class="lv-sc">${(animate ? p.prevScore : p.score).toLocaleString()}</b></div>`).join("");
    if (!animate) return;
    const row = (p) => $(`.lv-row[data-id="${p.id}"]`, box);
    later(() => vis.forEach((p) => {
      const r = row(p);
      if (r && p.delta > 0) {
        $(".lv-dl", r).textContent = "+" + p.delta.toLocaleString();
        r.classList.add("gain");
      }
    }), 350);
    later(() => vis.forEach((p) => {
      const r = row(p);
      if (!r) return;
      r.style.transform = `translateY(${pos1.get(p.id) * P}px)`;
      LV.count($(".lv-sc", r), p.prevScore, p.score, 1300);
      later(() => {
        $(".lv-rk", r).textContent = p.rank;
        if (p.rank < p.prevRank) r.classList.add("up");
      }, 700);
    }), 1500);
  },
  podium(list, me) {
    const top = list.slice(0, 3);
    const order = [top[1], top[0], top[2]].filter(Boolean);
    const medal = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" };
    return `<div class="lv-podium">${order.map((p) => `<div class="lv-pod r${p.rank} ${p.id === me ? "me" : ""}"><div class="lv-pcrown">${p.rank === 1 ? "\u{1F451}" : ""}</div><div class="lv-pav">${esc(p.emoji)}</div><div class="lv-pname" translate="no">${esc(p.name)}</div><div class="lv-pstep"><span>${medal[p.rank]}</span><b data-score="${p.score}">0</b></div></div>`).join("")}</div>`;
  },
  shell(role, game) {
    const host = role === "host";
    return `<div class="gm lv lv-${role} ${game.dark === false ? "" : "gm-dark"}" id="lv" style="--skin:${typeof SKIN_BG !== "undefined" ? SKIN_BG[game.skin] || SKIN_BG.jungle : "#7c5cff"}">
      <div class="gm-top"><button class="gm-btn" id="lvExit">⬅ Exit</button><div class="gm-title"><span>${esc(game.emoji)}</span><b translate="no">${esc(game.title)}</b></div><div class="gm-dots" id="lvDots"></div>
        <div class="gm-stats"><button class="gm-btn round" id="lvMute" aria-label="Sound">\u{1F50A}</button><span class="gm-pill" id="lvP1">⏱ <b id="lvT">0</b>s</span><span class="gm-pill" id="lvP2"></span></div></div>
      <div class="gm-bar"><i id="lvBar"></i></div>
      <div class="gm-main lv-main" id="lvMain"></div>
      ${host ? '<div class="lv-ctrl" id="lvCtrl" hidden><button id="lvPrev" aria-label="Previous question" title="Previous question (Left arrow)">⏮</button><button id="lvPlay" aria-label="Pause" title="Pause or resume (Space)">⏸</button><button id="lvNext" aria-label="Skip ahead" title="Skip ahead (Right arrow)">⏭</button><span class="lv-info" id="lvInfo"></span><button id="lvEnd" class="end" title="End the game">⏹ End</button></div>' : ""}
      <div class="lv-pause" id="lvPause" hidden><div><span>⏸</span><b>Game paused</b></div></div>
      <div class="lv-off" id="lvOff" hidden>Reconnecting…</div></div>`;
  },
  run(root, cfg) {
    const host = cfg.role === "host";
    let st = null, key = "", deadline = 0, frozen = null, polling = false, misses = 0, locked = false, shownBoard = false, lastSecond = -1, kicked = 0, known = new Set();
    const $m = (s) => $(s, root);
    const sound = (f) => {
      try {
        if (typeof SFX !== "undefined") f(SFX);
      } catch (e) {
      }
    };
    const url = "/api/live/sessions/" + cfg.pin + (host ? "" : "?player=" + cfg.pid);
    const music = (on) => sound((S2) => {
      if (!host) return;
      S2.track = st && st.game.track || "happy";
      S2.url = st && st.game.musicUrl || "";
      S2.music(on);
    });
    const pills = (s) => {
      if (host) $m("#lvP2").innerHTML = s.phase === "question" ? `\u{1F465} <b id="lvAnP">${s.answered}</b>/${s.playerCount}` : `\u{1F465} <b>${s.playerCount}</b>`;
      else $m("#lvP2").innerHTML = `⭐ <b>${(s.me ? s.me.score : 0).toLocaleString()}</b>`;
    };
    const dots = (s) => {
      $m("#lvDots").innerHTML = s.total > 0 && s.total <= 24 && s.phase !== "lobby" ? Array.from({ length: s.total }, (_, i) => `<i class="${i < s.index || s.phase === "finished" ? "ok" : i === s.index ? "cur" : ""}"></i>`).join("") : "";
    };
    const gameCard = (s) => `<div class="lv-gcard"><span class="lv-gem">${esc(s.game.emoji)}</span><div><b translate="no">${esc(s.game.title)}</b><small>${s.total} question${s.total === 1 ? "" : "s"}${s.hostName ? " \u00B7 hosted by " + esc(s.hostName) : ""}</small></div></div>`;
    const lobby = (s) => {
      const digits = s.pin.split("").map((d, i) => `<span style="--i:${i}">${d}</span>`).join("");
      $m("#lvMain").innerHTML = host
        ? `<div class="lv-lobby">${gameCard(s)}<p class="lv-join">Join at <b>${esc(location.host)}/play/join</b> with this PIN</p><div class="lv-pin" aria-label="Game PIN">${digits}</div><button class="gm-big-btn lv-startbtn" id="lvStart">\u25B6 Start game</button><div class="lv-room"><h3>Players in the room <span class="lv-rc" id="lvRc">0</span></h3><div class="lv-players" id="lvPlayers"></div><div class="lv-note" id="lvWait"></div></div></div>`
        : `<div class="lv-lobby">${gameCard(s)}<div class="lv-meav">${esc(cfg.emoji)}</div><h2>You are in!</h2><p class="lv-name" translate="no">${esc(cfg.name)}</p><div class="lv-room"><h3>Players in the room <span class="lv-rc" id="lvRc">0</span></h3><div class="lv-players" id="lvPlayers"></div></div><div class="lv-note">Waiting for the host to start\u2026 <span class="lv-dotsw"><i></i><i></i><i></i></span></div></div>`;
      known = new Set();
      lobbyUpdate(s);
    };
    const lobbyUpdate = (s) => {
      const box = $m("#lvPlayers");
      if (!box) return;
      s.players.forEach((p) => {
        if (known.has(p.id)) return;
        known.add(p.id);
        box.insertAdjacentHTML("beforeend", `<span class="lv-chip pop ${p.id === cfg.pid ? "me" : ""}" translate="no">${esc(p.emoji)} ${esc(p.name)}${p.id === cfg.pid ? " (you)" : ""}</span>`);
        sound((S2) => S2.pop());
      });
      Array.from(box.children).forEach((c, i) => {
        if (i >= s.players.length) c.remove();
      });
      const rc = $m("#lvRc");
      if (rc) rc.textContent = s.playerCount;
      const wait = $m("#lvWait");
      if (wait) wait.textContent = s.playerCount ? "Press Start when everyone is in." : "Waiting for players to join with the PIN\u2026";
      const st0 = $m("#lvStart");
      if (st0) {
        st0.disabled = !s.playerCount;
        st0.title = s.playerCount ? "" : "Waiting for at least one player";
      }
    };
    const intro = (s) => {
      const q = s.question;
      $m("#lvMain").innerHTML = `<div class="lv-intro"><div class="lv-qn"><span>Question</span><b>${q.index + 1}</b><small>of ${q.total}</small></div><h2>${esc(q.text)}</h2><div class="lv-count"><i></i><i></i><i></i></div></div>`;
      sound((S2) => S2.flip());
    };
    const question = (s) => {
      const q = s.question;
      locked = !!(s.me && s.me.answered);
      const mine = s.me && s.me.answered ? s.me.choice : null;
      $m("#lvMain").innerHTML = `<div class="gm-q"><h2>${esc(q.text)}</h2></div><div class="gm-vis">${LV.visual(q.img)}</div><div class="gm-opts lv-opts" id="lvOpts">${LV.options(q.options, { click: !host && !locked, mine })}</div><div class="lv-foot" id="lvFoot"></div>`;
      foot(s);
      if (host) music(true);
    };
    const foot = (s) => {
      const f = $m("#lvFoot");
      if (!f) return;
      if (host) {
        f.innerHTML = `<div class="lv-anbar"><i style="width:${s.playerCount ? Math.round(s.answered / s.playerCount * 100) : 0}%"></i></div><div class="lv-note">${s.answered} of ${s.playerCount} answered</div>`;
        const p = $m("#lvAnP");
        if (p) p.textContent = s.answered;
      } else f.innerHTML = locked ? '<div class="lv-locked"><span>✅</span> Answer locked in! <span class="lv-dotsw"><i></i><i></i><i></i></span></div>' : '<div class="lv-note">Tap fast. Quicker answers earn more points!</div>';
    };
    const meCard = (s) => {
      const m = s.me;
      if (!m) return "";
      const above = s.players.find((p) => p.rank === m.rank - 1);
      const gap = above ? above.score - m.score : 0;
      const moved = m.prevRank && m.rank < m.prevRank ? ` <span class="lv-up">▲ ${m.prevRank - m.rank}</span>` : m.prevRank && m.rank > m.prevRank ? ` <span class="lv-down">▼ ${m.rank - m.prevRank}</span>` : "";
      return `<div class="lv-me ${m.correct ? "good" : "bad"}"><div class="lv-mi">${m.correct ? "✅" : m.answered ? "❌" : "⏰"}</div><div class="lv-mt"><b>${m.correct ? "Correct!" : m.answered ? "Not this time" : "Time is up"}</b><span>${m.correct ? `+<i id="lvPts">0</i> points` : "No points this round"}${m.bonus ? ` <em>\u{1F525} streak bonus +${m.bonus}</em>` : ""}</span></div><div class="lv-mr"><b>${LV.ordinal(m.rank)}</b><small>${above ? gap.toLocaleString() + " behind " + esc(above.name) : "You are in front!"}${moved}</small></div></div>`;
    };
    const board = (s) => {
      const q = s.question, rv = s.reveal;
      shownBoard = false;
      $m("#lvMain").innerHTML = `${host ? "" : meCard(s)}<div class="lv-stage" id="lvStage"><div class="lv-reveal" id="lvReveal"><div class="gm-q"><h2 class="lv-small">${esc(q.text)}</h2></div>${LV.dist(q.options, rv)}</div><div class="lv-boardwrap" id="lvBW" hidden><h3 class="lv-bt">\u{1F3C6} Leaderboard</h3><div class="lv-board" id="lvBoard"></div></div></div>`;
      const pts = $m("#lvPts");
      if (pts && s.me) LV.count(pts, 0, s.me.points, 1000);
      if (!host && s.me) sound((S2) => (s.me.correct ? S2.ok() : S2.bad()));
      else sound((S2) => S2.pop());
      if (host) sound((S2) => S2.setDuck(0.3));
    };
    const showBoard = (s) => {
      shownBoard = true;
      const rv = $m("#lvReveal"), bw = $m("#lvBW");
      if (!bw) return;
      if (rv) rv.classList.add("out");
      later(() => {
        const bd = $m("#lvBoard");
        if (!bd || !bw.isConnected) return;
        if (rv) rv.hidden = true;
        bw.hidden = false;
        LV.board(bd, s.players, { limit: 5, me: cfg.pid || 0, animate: true });
      }, 380);
    };
    const finish = (s) => {
      music(false);
      sound((S2) => S2.win());
      const m = s.me;
      const rest = s.players.slice(3, 10).map((p) => `<div class="lv-rrow ${p.id === cfg.pid ? "me" : ""}"><b>${p.rank}</b><span>${esc(p.emoji)}</span><span class="grow" translate="no">${esc(p.name)}</span><b>${p.score.toLocaleString()}</b></div>`).join("");
      $m("#lvMain").innerHTML = `<div class="lv-final"><h2>\u{1F3C6} ${host ? "Final results" : m ? "You finished " + LV.ordinal(m.rank) + "!" : "Game over"}</h2>${s.players.length ? LV.podium(s.players, cfg.pid) : '<p class="lv-note">Nobody played this round.</p>'}${rest ? `<div class="lv-rest">${rest}</div>` : ""}<div class="lv-actions">${host ? '<button class="gm-big-btn" id="lvAgain">\u{1F3AE} New live game</button>' : '<button class="gm-big-btn" id="lvHome">\u{1F3E0} Home</button>'}</div></div>`;
      $$("[data-score]", root).forEach((b, i) => later(() => LV.count(b, 0, +b.dataset.score, 1400), 500 + i * 450));
      later(() => LV.confetti($m("#lv")), 900);
    };
    const enter = (s) => {
      dots(s);
      lastSecond = -1;
      if (s.phase !== "leaderboard" && host) sound((S2) => S2.setDuck(1));
      if (s.phase === "lobby") lobby(s);
      else if (s.phase === "intro") intro(s);
      else if (s.phase === "question") question(s);
      else if (s.phase === "leaderboard") board(s);
      else {
        finish(s);
      }
      $m("#lvP1").hidden = s.phase === "lobby" || s.phase === "finished";
      if (host) $m("#lvCtrl").hidden = s.phase === "lobby" || s.phase === "finished";
    };
    const update = (s) => {
      if (s.phase === "lobby") lobbyUpdate(s);
      else if (s.phase === "question") {
        if (host) foot(s);
      }
    };
    const apply = (s) => {
      st = s;
      misses = 0;
      $m("#lvOff").hidden = true;
      const k = s.phase + ":" + s.index;
      deadline = performance.now() + s.remaining * 1000;
      frozen = s.paused ? s.remaining : null;
      $m("#lvPause").hidden = !s.paused;
      pills(s);
      if (host) {
        $m("#lvPlay").textContent = s.paused ? "▶" : "⏸";
        $m("#lvPlay").setAttribute("aria-label", s.paused ? "Resume" : "Pause");
        $m("#lvInfo").textContent = s.total ? "Question " + (s.index + 1) + " of " + s.total : "";
      }
      if (k !== key) {
        key = k;
        enter(s);
      } else update(s);
    };
    const poll = () => {
      if (polling) return;
      polling = true;
      api("GET", url).then((r) => apply(r.session)).catch((e) => {
        misses++;
        if (e && e.status === 404 && misses > 2) {
          if (cfg.onGone) cfg.onGone();
          return;
        }
        if (misses > 2) $m("#lvOff").hidden = false;
      }).finally(() => {
        polling = false;
      });
    };
    const act = (a) => api("POST", "/api/live/sessions/" + cfg.pin + "/" + a).then((r) => apply(r.session)).catch((e) => toast("⚠️ " + e.message));
    const tickTimer = () => {
      if (!st || !$m("#lvT")) return;
      const left = frozen !== null ? frozen : Math.max(0, (deadline - performance.now()) / 1000);
      const dur = st.duration || 1;
      const active = st.phase === "intro" || st.phase === "question" || st.phase === "leaderboard";
      $m("#lvT").textContent = Math.ceil(left);
      const bar = $m("#lvBar");
      bar.style.width = active ? Math.min(100, left / dur * 100) + "%" : "0%";
      bar.classList.toggle("low", st.phase === "question" && left <= 5);
      if (st.phase === "question" && frozen === null) {
        const sec = Math.ceil(left);
        if (sec !== lastSecond && sec > 0 && sec <= 5) sound((S2) => S2.tick(true));
        lastSecond = sec;
      }
      if (st.phase === "leaderboard" && !shownBoard && st.duration - left >= 3.8) showBoard(st);
      if (active && frozen === null && left <= 0 && performance.now() - kicked > 700) {
        kicked = performance.now();
        poll();
      }
    };
    root.addEventListener("click", (e) => {
      if (e.target.closest("#lvExit")) {
        if (cfg.onExit) cfg.onExit();
        return;
      }
      if (e.target.closest("#lvMute")) {
        sound((S2) => {
          S2.muted = !S2.muted;
          $m("#lvMute").textContent = S2.muted ? "\u{1F507}" : "\u{1F50A}";
          if (S2.muted) S2.stop();
          else music(true);
        });
        return;
      }
      if (host) {
        if (e.target.closest("#lvStart")) act("start");
        else if (e.target.closest("#lvPrev")) act("prev");
        else if (e.target.closest("#lvNext")) act("next");
        else if (e.target.closest("#lvPlay")) act(st && st.paused ? "resume" : "pause");
        else if (e.target.closest("#lvEnd")) {
          if (confirm("End this live game for everyone?")) act("end");
        } else if (e.target.closest("#lvAgain")) {
          try {
            sessionStorage.removeItem("ca_live_pin");
          } catch (er) {
          }
          navigate("live/lobby");
        }
        return;
      }
      if (e.target.closest("#lvHome")) {
        LV.clearPlayer();
        navigate("play/discover");
        return;
      }
      const b = e.target.closest("#lvOpts [data-i]");
      if (b && st && st.phase === "question" && !locked && !st.paused) {
        locked = true;
        const i = +b.dataset.i;
        $$("#lvOpts .ans", root).forEach((x, n) => {
          x.disabled = true;
          x.classList.add(n === i ? "picked" : "dim");
        });
        foot(st);
        sound((S2) => S2.pop());
        api("POST", "/api/live/sessions/" + cfg.pin + "/answer", { playerId: cfg.pid, token: cfg.token, choice: i }).catch((er) => toast("⚠️ " + er.message)).finally(poll);
      }
    });
    if (host) {
      const onKey = (e) => {
        if (!root.isConnected) {
          document.removeEventListener("keydown", onKey);
          return;
        }
        if (!st || st.phase === "lobby" || st.phase === "finished" || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        if (e.code === "Space") {
          e.preventDefault();
          act(st.paused ? "resume" : "pause");
        } else if (e.key === "ArrowRight") act("next");
        else if (e.key === "ArrowLeft") act("prev");
      };
      document.addEventListener("keydown", onKey);
    }
    every(poll, 1000);
    every(tickTimer, 120);
    poll();
    return { act, poll };
  }
};
