S["live/lobby"] = {
  render() {
    if (!ME.user) return needLogin("the host lobby");
    if (!["teacher", "admin", "super_admin"].includes(ME.user.role)) return `<div class="card"><h2>Teachers host live games</h2><p class="muted">Your account is a ${esc(ME.user.role)} account. Sign up as a teacher to host a live game.</p></div>`;
    return `${head("Host a live game", "Pick a quiz, share the PIN and press start. The game then runs by itself with scores after every question. You can pause, go back or skip ahead.")}<div id="hBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    if (!ME.user || !["teacher", "admin", "super_admin"].includes(ME.user.role)) return;
    const box = $("#hBox", root);
    let pin = "";
    try {
      pin = sessionStorage.getItem("ca_live_pin") || "";
    } catch (e) {
    }
    const forget = () => {
      try {
        sessionStorage.removeItem("ca_live_pin");
      } catch (e) {
      }
    };
    const setup = (running) => api("GET", "/api/games?limit=200").then((r) => {
      const list = r.games.filter((g) => g.questionCount > 0);
      const resume = running ? card("A live game is still open", `<p>PIN <b style="letter-spacing:4px;font-size:1.4rem">${esc(running.pin)}</b> \xB7 ${esc(running.game.title)} \xB7 ${running.playerCount} player${running.playerCount === 1 ? "" : "s"}</p><div class="m16 row gap8">${btn("\u{1F4FA} Go back to it", "lg", 'id="hResume"')}${btn("Close it", "alt", 'id="hClose"')}</div>`) : "";
      box.innerHTML = resume + (list.length ? card("Choose a game", `<select class="sel" id="hGame">${list.map((g) => `<option value="${g.id}">${esc(g.emoji + " " + g.title)} (${g.questionCount} questions)</option>`).join("")}</select><p class="tiny muted m8">Live games use Quiz and True / False questions. Other question types are skipped.</p><div class="m16">${btn("\u{1F680} Create live game", "lg", 'id="hCreate"')}</div>`) : card("No quiz games yet", '<p class="muted">Create a quiz in the web admin Studio and publish it. Live games need games that have questions.</p>'));
      trNodes(box);
    }).catch((e) => errBox(box, e));
    const start = () => {
      if (!pin) return setup(null);
      return api("GET", "/api/live/sessions/" + pin).then((r) => {
        if (r.session.phase === "finished") {
          forget();
          pin = "";
          return setup(null);
        }
        return setup(r.session);
      }).catch(() => {
        forget();
        pin = "";
        return setup(null);
      });
    };
    root.addEventListener("click", (e) => {
      if (e.target.closest("#hCreate")) {
        const id = +$("#hGame", root).value;
        api("POST", "/api/live/sessions", { gameId: id }).then((r) => {
          try {
            sessionStorage.setItem("ca_live_pin", r.session.pin);
          } catch (er) {
          }
          navigate("live/host");
        }).catch((er) => toast("⚠️ " + er.message));
        return;
      }
      if (e.target.closest("#hResume")) {
        navigate("live/host");
        return;
      }
      if (e.target.closest("#hClose")) {
        api("POST", "/api/live/sessions/" + pin + "/end").catch(() => {
        }).finally(() => {
          forget();
          pin = "";
          setup(null);
        });
      }
    });
    start();
  }
};
