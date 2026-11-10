S["play/profile"] = {
  render() {
    if (!ME.user) return needLogin("your profile");
    return `${head("Profile & buddy", "Your stars, level and recent games.", btn("Sign out", "alt", "data-signout"))}<div id="pfBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    if (!ME.user) return;
    const box = $("#pfBox", root);
    const emojis = ["\u{1F430}", "\u{1F43B}", "\u{1F43C}", "\u{1F98A}", "\u{1F438}", "\u{1F984}", "\u{1F431}", "\u{1F427}", "\u{1F981}", "\u{1F418}"];
    api("GET", "/api/me/overview").then((r) => {
      const s = r.stats;
      box.innerHTML = `<div class="g21"><div class="col gap16">
        <div class="card row gap16 wrap" style="align-items:center"><span class="av xl" style="background:#ffd9a8;font-size:4rem;width:110px;height:110px">${esc(r.user.emoji)}</span><div class="grow"><h2 translate="no">${esc(r.user.name)}</h2><div class="muted small">${esc(r.user.role)} · Level ${s.level}</div><div class="m8">${bar(s.levelProgress, "#ffb703")}</div><div class="tiny muted">${s.points % 2000} / 2000 points to the next level</div></div></div>
        <div class="g4">${stat("⭐", s.stars, "Stars to spend", "", "#fff0c2")}${stat("\u{1F3AE}", s.games, "Games played", "", "#efeaff")}${stat("\u{1F3AF}", s.accuracy + "%", "Accuracy", "", "#d8f5e4")}${stat("\u{1F3C6}", s.perfect, "Perfect games", "", "#ffe9cc")}</div>
        ${card("Recent games", r.history.length ? r.history.map((h) => `<div class="li"><span class="av" style="${gradStyle(h.gradient)}">${h.emoji}</span><div class="grow"><b translate="no">${esc(h.title)}</b><div class="small muted">${h.correct}/${h.total} correct · ${h.created.slice(0, 10)}</div></div>${chip(h.score + " pts", "#7c5cff")}</div>`).join("") : '<p class="muted">Play a game and it will show up here.</p>')}</div>
        <div class="col gap16">${card("Choose your buddy", `<div class="chips pickgroup" id="pfEm">${emojis.map((e) => `<button class="fchip ${e === r.user.emoji ? "on" : ""}" data-pick data-e="${e}" style="font-size:1.6rem">${e}</button>`).join("")}</div><label class="lbl">Display name</label><input class="in" id="pfName" value="${esc(r.user.name)}" translate="no"><div class="m16">${btn("Save", "", 'id="pfSave"')}</div>`)}
        ${card("Account", `<div class="small muted">${esc(r.user.email)}</div><div class="small muted">Joined ${r.user.created.slice(0, 10)}</div><div class="small muted">${s.activeDays} active day${s.activeDays === 1 ? "" : "s"}</div>`)}</div></div>`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    root.addEventListener("click", (e) => {
      if (!e.target.closest("#pfSave")) return;
      const on = $("#pfEm .on", root);
      api("PUT", "/api/auth/me", { name: $("#pfName", root).value, emoji: on ? on.dataset.e : void 0 }).then(() => loadMe()).then(() => {
        toast("Saved");
        route();
      }).catch((er) => toast("⚠️ " + er.message));
    });
  }
};
