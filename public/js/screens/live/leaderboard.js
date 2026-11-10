S["live/leaderboard"] = {
  render() {
    return `${head("Leaderboard", "Live scores of the game you are hosting.")}<div id="ldBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    const box = $("#ldBox", root);
    let pin = "";
    try {
      pin = sessionStorage.getItem("ca_live_pin") || "";
    } catch (e) {
    }
    if (!pin) {
      box.innerHTML = `<div class="card"><p class="muted">No live game is running. Host one from the lobby.</p><div class="m16">${btn("\u{1F6AA} Host lobby", "", 'data-go="live/lobby"')}</div></div>`;
      return;
    }
    const medals = ["\u{1F947}", "\u{1F948}", "\u{1F949}"];
    const draw = () => api("GET", "/api/live/sessions/" + pin).then((r) => {
      const s = r.session;
      box.innerHTML = `<div class="row gap8 wrap" style="margin-bottom:12px">${chip("PIN " + s.pin, "#7c5cff")}${chip(s.status, s.status === "playing" ? "#2fbf63" : "#f5a300")}${chip(s.players.length + " players")}</div>
      ${s.players.length ? card("", s.players.map((p, i) => `<div class="li"><b style="width:36px;font-size:1.4rem">${medals[i] || i + 1}</b><span class="av">${esc(p.emoji)}</span><b class="grow" translate="no">${esc(p.name)}</b>${chip(p.score + " pts", i === 0 ? "#f5a300" : "#7c5cff")}</div>`).join("")) : '<div class="card"><p class="muted">No players have joined yet.</p></div>'}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    draw();
    every(draw, 2000);
  }
};
