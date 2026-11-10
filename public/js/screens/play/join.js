S["play/join"] = {
  render() {
    return `<div style="max-width:520px;margin:30px auto"><div class="card center col" style="align-items:center;text-align:center" id="jBox">
      <div style="font-size:3.4rem;animation:fl 3s ease-in-out infinite">\u{1F39F}️</div><h1 style="font-size:1.8rem">Join a game</h1><p class="muted">Type the 6-digit PIN you see on the big screen.</p>
      <input class="in" id="jpin" inputmode="numeric" maxlength="6" placeholder="000000" aria-label="Game PIN" style="text-align:center;font-size:2rem;letter-spacing:10px;max-width:300px">
      <label class="lbl" style="width:100%;text-align:left">Your nickname</label><input class="in" id="jnick" value="${esc(ME.user ? ME.user.name : "")}" maxlength="16" aria-label="Nickname" translate="no">
      <p class="lg-err" id="jerr" hidden style="color:var(--bad);margin-top:8px"></p>
      <div class="m16 row gap8">${btn("Join the game \u{1F680}", "lg", 'id="jgo"')}</div><p class="tiny muted m8">No email needed. Only a nickname is shown on screen.</p></div></div>`;
  },
  mount(root) {
    const box = $("#jBox", root);
    let pin = "", pid = 0, game = null, shown = -1, answered = false, status = "";
    const draw = (s) => {
      status = s.status;
      if (s.status === "lobby") {
        box.innerHTML = `<div style="font-size:3.4rem;animation:fl 3s ease-in-out infinite">⏳</div><h2>You are in!</h2><p class="muted">Waiting for the teacher to start…</p><div class="chips m16">${s.players.map((p) => chip(esc(p.emoji + " " + p.name))).join("")}</div>`;
      } else if (s.status === "ended") {
        const rank = s.players.findIndex((p) => p.id === pid) + 1;
        box.innerHTML = `<div style="font-size:3.4rem">\u{1F3C6}</div><h2>Game over!</h2><p>You finished <b>#${rank}</b> with <b>${(s.players.find((p) => p.id === pid) || {}).score || 0}</b> points.</p>${s.players.slice(0, 5).map((p, i) => `<div class="li"><b>${i + 1}</b><span class="grow" translate="no">${esc(p.emoji + " " + p.name)}</span>${chip(p.score + " pts")}</div>`).join("")}<div class="m16">${btn("Done", "lg", 'data-go="play/discover"')}</div>`;
        trNodes(box);
        return;
      } else if (game && s.current !== shown) {
        shown = s.current;
        answered = false;
        const q = game.questions[s.current];
        if (!q) {
          box.innerHTML = `<div style="font-size:3rem">\u{1F389}</div><h2>All questions done!</h2><p class="muted">Waiting for the final scores…</p>`;
        } else {
          box.innerHTML = `<p class="muted">Question ${s.current + 1} of ${game.questions.length}</p><h2 translate="no">${esc(q.q)}</h2>${q.img ? `<div class="gm-big" style="font-size:3rem">${q.img}</div>` : ""}<div class="ans4 m16" style="width:100%">${q.a.map((a, i) => `<button class="ans a${i}" data-c="${i}" translate="no">${esc(a)}</button>`).join("")}</div><div id="jfb" class="m16"></div>`;
          t0 = Date.now();
        }
      }
      trNodes(box);
    };
    let t0 = Date.now();
    const poll = () => {
      if (!pin) return;
      api("GET", "/api/live/sessions/" + pin).then(async (r) => {
        if (r.session.status === "playing" && !game) {
          game = (await api("GET", "/api/games/" + r.session.gameId)).game;
        }
        draw(r.session);
      }).catch(() => {
      });
    };
    box.addEventListener("click", (e) => {
      const a = e.target.closest("[data-c]");
      if (!a || answered) return;
      answered = true;
      const q = game.questions[shown];
      const left = Math.max(0, 1 - (Date.now() - t0) / ((q.t || 20) * 1000));
      $$(".ans", box).forEach((x) => {
        x.disabled = true;
      });
      api("POST", "/api/live/sessions/" + pin + "/answer", { playerId: pid, choice: +a.dataset.c, timeLeft: left }).then((r) => {
        a.classList.add(r.correct ? "ok" : "no");
        const right = $(`[data-c="${r.answer}"]`, box);
        if (right) right.classList.add("ok");
        $("#jfb", box).innerHTML = `<span class="pill">${r.correct ? "✅ Correct! +" + r.points : "❌ Not this time"}</span>`;
      }).catch((er) => toast("⚠️ " + er.message));
    });
    $("#jgo", root).addEventListener("click", () => {
      const err = $("#jerr", root);
      err.hidden = true;
      api("POST", "/api/live/join", { pin: $("#jpin", root).value.trim(), name: $("#jnick", root).value.trim(), emoji: ME.user ? ME.user.emoji : "\u{1F43B}" }).then((r) => {
        pin = r.session.pin;
        pid = r.playerId;
        draw(r.session);
        every(poll, 1500);
      }).catch((e) => {
        err.textContent = e.message;
        err.hidden = false;
      });
    });
  }
};
