S["com/library"] = {
  render() {
    const subjects = ["All"].concat([...new Set(GAMES.map((g) => g.s))]);
    return `${head("Public library", "Free games made by teachers, parents and creators.", btn("\u{1F4DA} My library", "", 'data-go="play/library"'))}
    <div class="row gap12 wrap"><label class="search grow" style="min-width:260px">\u{1F50D}<input id="lSearch" placeholder="Search by name, subject or creator" aria-label="Search"></label><select class="sel" id="lSort" style="width:auto" aria-label="Sort"><option value="plays">Most popular</option><option value="new">Newest</option><option value="rating">Top rated</option></select></div>
    <div class="chips pickgroup m8" id="lSub">${subjects.map((s, i) => `<button class="fchip ${i ? "" : "on"}" data-pick data-s="${esc(s)}">${esc(s)}</button>`).join("")}</div>
    <div class="g4 m16" id="lGrid"></div>`;
  },
  mount(root) {
    const grid = $("#lGrid", root);
    let sub = "All";
    const draw = () => {
      const q = $("#lSearch", root).value.trim().toLowerCase(), sort = $("#lSort", root).value;
      const num = (g) => g.pl.endsWith("k") ? parseFloat(g.pl) * 1000 : +g.pl;
      const list = GAMES.filter((g) => (sub === "All" || g.s === sub) && (!q || (g.t + " " + g.s + " " + g.by + " " + g.tp).toLowerCase().includes(q)));
      list.sort((a, b) => sort === "rating" ? b.r - a.r : sort === "new" ? (b.id || 0) - (a.id || 0) : num(b) - num(a));
      grid.innerHTML = list.length ? list.map((x) => gcard(x, `<div class="row gap8 m8">${btn("▶ Play", "sm", 'data-go="play/game"')}${x.id ? btn("♥ Save", "sm alt", `data-save="${x.id}"`) : ""}</div>`)).join("") : '<p class="muted">No games match your search.</p>';
      trNodes(grid);
    };
    $("#lSearch", root).addEventListener("input", draw);
    $("#lSort", root).addEventListener("change", draw);
    root.addEventListener("click", (e) => {
      const s = e.target.closest("[data-s]");
      if (s) {
        sub = s.dataset.s;
        draw();
      }
    });
    draw();
  }
};
