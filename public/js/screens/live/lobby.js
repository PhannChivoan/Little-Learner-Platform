S["live/lobby"] = {
  render() {
    if (!ME.user) return needLogin("the host lobby");
    if (!["teacher", "admin", "super_admin"].includes(ME.user.role)) return `<div class="card"><h2>Teachers host live games</h2><p class="muted">Your account is a ${esc(ME.user.role)} account. Sign up as a teacher to host a live game.</p></div>`;
    return `${head("Host lobby", "Pick a game, share the PIN and start when everyone has joined.")}<div id="hBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    if (!ME.user || !["teacher", "admin", "super_admin"].includes(ME.user.role)) return;
    const box = $("#hBox", root);
    let pin = "", game = null, st = null;
    try {
      pin = sessionStorage.getItem("ca_live_pin") || "";
    } catch (e) {
    }
    const setup = () => api("GET", "/api/games?limit=200").then((r) => {
      const list = r.games.filter((g) => g.questionCount > 0);
      box.innerHTML = list.length ? card("Choose a game", `<select class="sel" id="hGame">${list.map((g) => `<option value="${g.id}">${esc(g.emoji + " " + g.title)} (${g.questionCount} questions)</option>`).join("")}</select><div class="m16">${btn("\u{1F680} Create live game", "lg", 'id="hCreate"')}</div>`) : card("No quiz games yet", '<p class="muted">Create a quiz in the web admin Studio and publish it. Live games need games that have questions.</p>');
    }).catch((e) => errBox(box, e));
    const view = () => {
      if (!st) return;
      const q = game && game.questions[st.current];
      const players = st.players.map((p, i) => `<div class="li"><b>${i + 1}</b><span class="av sm">${esc(p.emoji)}</span><span class="grow" translate="no">${esc(p.name)}</span>${chip(p.score + " pts")}</div>`).join("") || '<p class="muted">Waiting for players…</p>';
      let main;
      if (st.status === "lobby") main = card("Join at this page with the PIN", `<div style="font-size:4rem;font-weight:700;letter-spacing:12px;text-align:center">${esc(st.pin)}</div><div class="center m16" style="text-align:center">${btn("▶ Start game", "lg", 'data-live="start"')} ${btn("Cancel", "alt", 'data-live="end"')}</div>`);
      else if (st.status === "playing") main = card(`Question ${st.current + 1} of ${game ? game.questions.length : "?"}`, q ? `<h2 translate="no">${esc(q.q)}</h2><div class="g2 m8">${q.a.map((a, i) => `<div class="card tight flat ${i === q.c ? "on" : ""}" translate="no">${i === q.c ? "✔ " : ""}${esc(a)}</div>`).join("")}</div><div class="m16">${btn(st.current + 1 >= game.questions.length ? "Finish" : "Next question ▶", "lg", 'data-live="next"')} ${btn("End game", "alt", 'data-live="end"')}</div>` : `<p>All questions are done.</p><div class="m16">${btn("End game", "lg", 'data-live="end"')}</div>`);
      else main = card("Game over", `<p class="muted">The game has ended.</p><div class="m16">${btn("New game", "lg", 'data-live="new"')}</div>`);
      box.innerHTML = `<div class="g21"><div>${main}</div>${card(`Players (${st.players.length})`, players)}</div>`;
      trNodes(box);
    };
    const poll = () => pin && api("GET", "/api/live/sessions/" + pin).then((r) => {
      st = r.session;
      view();
    }).catch(() => {
    });
    const resume = () => api("GET", "/api/live/sessions/" + pin).then(async (r) => {
      st = r.session;
      if (st.status === "ended") throw new Error("ended");
      game = (await api("GET", "/api/games/" + st.gameId)).game;
      view();
      every(poll, 1500);
    }).catch(() => {
      pin = "";
      setup();
    });
    root.addEventListener("click", async (e) => {
      if (e.target.closest("#hCreate")) {
        try {
          const id = +$("#hGame", root).value;
          const r = await api("POST", "/api/live/sessions", { gameId: id });
          pin = r.session.pin;
          st = r.session;
          game = (await api("GET", "/api/games/" + id)).game;
          try {
            sessionStorage.setItem("ca_live_pin", pin);
          } catch (er) {
          }
          view();
          every(poll, 1500);
        } catch (er) {
          toast("⚠️ " + er.message);
        }
        return;
      }
      const b = e.target.closest("[data-live]");
      if (!b) return;
      const a = b.dataset.live;
      if (a === "new") {
        pin = "";
        st = null;
        clearTM();
        setup();
        return;
      }
      api("POST", "/api/live/sessions/" + pin + "/" + a).then((r) => {
        st = r.session;
        view();
      }).catch((er) => toast("⚠️ " + er.message));
    });
    if (pin) resume();
    else setup();
  }
};
