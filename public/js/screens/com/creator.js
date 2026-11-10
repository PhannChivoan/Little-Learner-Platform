S["com/creator"] = {
  render() {
    const authors = [...new Set(GAMES.map((g) => g.by))];
    const me = ME.user && authors.includes(ME.user.name) ? ME.user.name : authors[0] || "Critter Team";
    return `${head("Creator profile", "See the games a creator has published.")}
    <div class="row gap12 wrap"><select class="sel" id="crSel" style="width:auto">${authors.map((a) => `<option ${a === me ? "selected" : ""}>${esc(a)}</option>`).join("")}</select></div><div id="crBox" class="m16"></div>`;
  },
  mount(root) {
    const box = $("#crBox", root);
    const load = (name) => api("GET", "/api/games/by-author/" + encodeURIComponent(name)).then((r) => {
      const plays = r.games.reduce((a, g) => a + g.plays, 0);
      box.innerHTML = `<div class="card row gap16 wrap" style="align-items:center"><span class="av xl" style="background:#ffd9a8;width:90px;height:90px;font-size:3rem">\u{1F9D1}‍\u{1F3A8}</span><div><h2 translate="no">${esc(name)}</h2><div class="muted">${r.games.length} games · ${plays.toLocaleString()} plays</div></div></div>
      <h2 class="sec">Games</h2>${r.games.length ? `<div class="g4">${r.games.map((x) => gcard(GAMES.find((g) => g.id === x.id) || { t: x.title, e: x.emoji, g: x.gradient, by: x.author, pl: String(x.plays), r: x.rating, s: x.subject, a: x.age, tp: x.kind, id: x.id }, "", "play/game")).join("")}</div>` : '<p class="muted">No published games yet.</p>'}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    $("#crSel", root).addEventListener("change", (e) => load(e.target.value));
    if ($("#crSel", root).value) load($("#crSel", root).value);
  }
};
