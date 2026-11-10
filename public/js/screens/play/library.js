S["play/library"] = {
  render() {
    if (!ME.user) return needLogin("your library");
    return `${head("My library", "Games you saved and games you played.", btn("\u{1F50E} Find more", "", 'data-go="com/library"'))}<div id="lbBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    if (!ME.user) return;
    const box = $("#lbBox", root);
    const load = () => Promise.all([api("GET", "/api/me/library"), api("GET", "/api/play/history")]).then(([s, h]) => {
      const card1 = (x) => `<article class="gc" data-gi="${GAMES.findIndex((g) => g.id === x.id)}" data-gid="${x.id}" data-go="play/game"><div class="th" style="${gradStyle(x.gradient)}"><span class="em">${x.emoji}</span></div><div class="bd"><h4 translate="no">${esc(x.title)}</h4><p>by ${esc(x.author)}</p><div class="row gap8 m8">${btn("▶ Play", "sm", 'data-go="play/game"')}${btn("Remove", "sm alt", `data-unsave="${x.id}"`)}</div></div></article>`;
      box.innerHTML = `<h2 class="sec">Saved games</h2>${s.games.length ? `<div class="g4">${s.games.map(card1).join("")}</div>` : '<p class="muted">Nothing saved yet. Tap ♥ Save on a game in the public library.</p>'}
      <h2 class="sec">Play history</h2>${h.history.length ? card("", h.history.map((x) => `<div class="li"><span class="av">${x.emoji}</span><div class="grow"><b translate="no">${esc(x.title)}</b><div class="small muted">${x.created.slice(0, 16).replace("T", " ")}</div></div>${chip(x.correct + "/" + x.total, "#2fbf63")}${chip(x.score + " pts", "#7c5cff")}</div>`).join("")) : '<p class="muted">No games played yet.</p>'}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    root.addEventListener("click", (e) => {
      const u = e.target.closest("[data-unsave]");
      if (u) {
        e.stopPropagation();
        api("DELETE", "/api/me/library/" + u.dataset.unsave).then(load).catch((er) => toast("⚠️ " + er.message));
      }
    }, true);
    load();
  }
};
