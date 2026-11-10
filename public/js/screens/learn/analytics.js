S["learn/analytics"] = {
  render() {
    if (!ME.user) return needLogin("your progress");
    return `${head("Progress analytics", "How your learning is going, based on the games you played.")}<div id="anBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    if (!ME.user) return;
    const box = $("#anBox", root);
    api("GET", "/api/me/analytics").then((r) => {
      const s = r.stats;
      if (!s.games) {
        box.innerHTML = '<div class="card"><p class="muted">Play a few games and your progress will appear here.</p></div>';
        return;
      }
      const max = Math.max(...r.daily.map((d) => d.points), 1);
      box.innerHTML = `<div class="g4">${stat("\u{1F3AE}", s.games, "Games played", "", "#efeaff")}${stat("\u{1F3AF}", s.accuracy + "%", "Accuracy", "", "#d8f5e4")}${stat("⭐", s.points, "Points", "", "#fff0c2")}${stat("\u{1F4C5}", s.activeDays, "Active days", "", "#ffe9cc")}</div>
      <div class="g2 m16">${card("Accuracy by subject", r.subjects.map((x) => `<div class="li"><b style="min-width:90px">${esc(x.subject)}</b><div class="grow">${bar(x.accuracy, x.accuracy >= 70 ? "#2fbf63" : "#f5a300")}</div><span class="small">${x.accuracy}%</span></div>`).join(""))}
      ${card("Points per day", `<div style="display:flex;align-items:flex-end;gap:8px;height:150px">${r.daily.map((d) => `<div class="center col" style="flex:1;align-items:center;justify-content:flex-end;height:100%"><i style="display:block;width:100%;max-width:34px;height:${Math.max(6, d.points / max * 100)}%;background:var(--acc);border-radius:8px 8px 0 0"></i><span class="tiny muted">${d.day.slice(5)}</span></div>`).join("")}</div>`)}</div>
      ${card("Games to practise", r.weak.map((w) => `<div class="li"><span class="av">${w.emoji}</span><b class="grow" translate="no">${esc(w.title)}</b>${chip(w.accuracy + "%", w.accuracy >= 70 ? "#2fbf63" : "#f5a300")}</div>`).join(""))}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
  }
};
