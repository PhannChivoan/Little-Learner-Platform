S["play/discover"] = {
  render() {
    const cats = [["\u{1F522}", "Numbers", "#ffd9a8"], ["\u{1F524}", "Letters", "#dcd3ff"], ["\u{1F3A8}", "Colors", "#ffc9de"], ["\u{1F43E}", "Animals", "#bdf1e6"], ["\u{1F0CF}", "Memory", "#cdf3ae"], ["\u{1F52C}", "Science", "#c7e8ff"], ["\u1780", "Khmer", "#ffd0d0"], ["\u{1F3B5}", "Music", "#ffe3a3"]];

    const pick = GAMES.find((g) => g.f) || GAMES[0];
    return `${head("Hi " + (ME.user ? esc(ME.user.name) : "friend") + "! \u{1F44B}", "What do you want to learn and play today?", btn("\u{1F522} Join with code", "alt", 'data-go="play/join"'))}
    <div class="row gap12 wrap"><label class="search grow" style="min-width:240px">\u{1F50D}<input placeholder="Search games, animals, letters\u2026" aria-label="Search"><button class="btn sm">Search</button></label>
      <select class="sel" style="width:auto" aria-label="Language"><option>\u{1F310} English</option><option>\u1781\u17D2\u1798\u17C2\u179A Khmer</option><option>Both</option></select></div>
    <div class="chips m8 pickgroup">${["All ages", "3\u20134", "5\u20136", "7\u20138", "9+"].map((c, i) => `<button class="fchip ${i ? "" : "on"}" data-pick>${c}</button>`).join("")}</div>
    <div class="g21 m16">
      <div class="card" style="background:linear-gradient(135deg,#dcd3ff,#a592f5);border:0;color:#2b1f5c;display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between">
        ${pick ? `<div data-gid="${pick.id}"><span class="pill" style="background:#fff">⭐ Today's pick</span><h2 style="font-size:2rem;margin:8px 0 4px" translate="no">${esc(pick.t)}</h2><p>${esc(pick.s)} · ages ${esc(pick.a)}</p><div class="m16">${btn("▶ Play now", "lg", 'data-go="play/game"')}</div></div><span style="font-size:6rem;animation:fl 3s ease-in-out infinite">${pick.e}</span>` : '<p>No games yet. Create one in the web admin.</p>'}</div>
      ${card("Daily missions", '<div id="dmBody"><p class="muted small">Sign in to track your daily missions.</p></div>', '<span class="chip" id="dmStreak" style="--c:#ff8a2b" hidden></span>')}
    </div>
    <h2 class="sec">Pick a subject</h2>
    <div class="g4f">${cats.map((c) => `<button class="card tight" style="background:${c[2]};border:0;text-align:center;font-weight:600" data-go="com/library"><div style="font-size:2.4rem;animation:fl 3s ease-in-out infinite">${c[0]}</div>${c[1]}</button>`).join("")}</div>
    <h2 class="sec">Start here</h2>
    <div class="g3">${GAMES.slice(0, 3).map((g) => `<button class="card tight row gap12" style="text-align:left" data-gid="${g.id}" data-go="play/game"><span class="av lg" style="background:linear-gradient(135deg,${g.g});border-radius:20px">${g.e}</span><div class="grow"><b>${g.t}</b><div class="small muted">${esc(g.s)} · ages ${esc(g.a)}</div></div></button>`).join("")}</div>
    <h2 class="sec">\u{1F525} Trending now</h2>
    <div class="g4">${GAMES.slice(0, 8).map((g) => gcard(g, "", "play/game")).join("")}</div>
    <h2 class="sec">\u{1F195} New this week</h2>
    <div class="g4">${[...GAMES].sort((a, b) => b.id - a.id).slice(0, 4).map((g) => gcard(g, "", "play/game")).join("")}</div>${GAMES.length > 10 ? `<h2 class="sec">🧑‍🎨 Made by creators</h2><div class="g4">${GAMES.slice(10).map((g) => gcard(g, "", "play/game")).join("")}</div>` : ""}`;
  },
  mount(root) {
    if (!ME.user) return;
    api("GET", "/api/me/overview").then((r) => {
      const today = new Date().toISOString().slice(0, 10);
      const t = r.history.filter((h) => h.created.slice(0, 10) === today);
      const games = t.length, right = t.reduce((a, h) => a + h.correct, 0);
      const m = [["Play 3 games today", games, 3], ["Answer 10 questions correctly today", right, 10], ["Reach 500 points in total", r.stats.points, 500]];
      $("#dmBody", root).innerHTML = m.map((x) => `<div class="li"><div class="grow"><div class="small b">${x[0]}</div>${bar(Math.min(100, x[1] / x[2] * 100), "#ffb703")}</div><span class="tiny muted">${Math.min(x[1], x[2])}/${x[2]}</span></div>`).join("");
      const d = $("#dmStreak", root);
      d.textContent = "\u{1F525} " + r.stats.activeDays + " day" + (r.stats.activeDays === 1 ? "" : "s");
      d.hidden = false;
      trNodes($("#dmBody", root));
    }).catch(() => {
    });
  }
};
