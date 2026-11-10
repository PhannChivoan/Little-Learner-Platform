S["com/featured"] = {
  render() {
    return `${head("Featured games", "Hand-picked by the Critter Academy team.")}<div id="fBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    const box = $("#fBox", root);
    Promise.all([api("GET", "/api/games?featured=1"), api("GET", "/api/games?sort=rating&limit=8"), api("GET", "/api/games?sort=new&limit=8")]).then(([f, t, n]) => {
      const grid = (list) => list.length ? `<div class="g4">${list.map((x) => gcard(GAMES.find((g) => g.id === x.id) || { t: x.title, e: x.emoji, g: x.gradient, by: x.author, pl: String(x.plays), r: x.rating, s: x.subject, a: x.age, tp: x.kind, id: x.id }, "", "play/game")).join("")}</div>` : '<p class="muted">Nothing here yet.</p>';
      box.innerHTML = `<h2 class="sec">⭐ Editor’s picks</h2>${grid(f.games)}<h2 class="sec">\u{1F3C6} Top rated</h2>${grid(t.games)}<h2 class="sec">\u{1F195} Newest</h2>${grid(n.games)}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
  }
};
