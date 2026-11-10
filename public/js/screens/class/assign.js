S["class/assign"] = {
  render() {
    if (!ME.user) return needLogin("assignments");
    return `${head("Assignments", "Homework games for your classes.")}<div id="aBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    if (!ME.user) return;
    const teacher = ["teacher", "admin", "super_admin"].includes(ME.user.role);
    const box = $("#aBox", root);
    let classes = [], games = [], cid = 0;
    const draw = (list) => {
      box.innerHTML = `<div class="row gap12 wrap"><select class="sel" id="aClass" style="width:auto">${classes.map((c) => `<option value="${c.id}" ${c.id === cid ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></div>
      <div class="${teacher ? "g21" : ""} m16"><div>${list.length ? list.map((a) => `<div class="card" style="margin-bottom:12px"><div class="row sp wrap gap8"><div class="row gap12"><span class="av lg">${a.game ? a.game.emoji : "\u{1F3AE}"}</span><div><b translate="no">${esc(a.title)}</b><div class="small muted">${a.due ? "Due " + esc(a.due) : "No due date"}</div></div></div><div class="row gap8">${teacher ? chip(a.done + "/" + a.students + " done", "#2fbf63") + btn("\u{1F5D1}️", "sm alt", `data-del="${a.id}" aria-label="Delete"`) : (a.mine ? chip("✓ Done", "#2fbf63") : btn("▶ Play", "sm", `data-gid="${a.gameId}" data-go="play/game"`))}</div></div>${teacher ? bar(a.students ? a.done / a.students * 100 : 0, "#2fbf63") : ""}</div>`).join("") : '<div class="card"><p class="muted">No assignments yet.</p></div>'}</div>
      ${teacher ? card("New assignment", `<label class="lbl">Game</label><select class="sel" id="aGame">${games.map((g) => `<option value="${g.id}">${esc(g.emoji + " " + g.title)}</option>`).join("")}</select><label class="lbl">Title (optional)</label><input class="in" id="aTitle"><label class="lbl">Due date</label><input class="in" id="aDue" type="date"><div class="m16">${btn("➕ Assign", "", 'id="aAdd"')}</div>`) : ""}</div>`;
      trNodes(box);
    };
    const load = () => api("GET", "/api/classes/" + cid + "/assignments").then((r) => draw(r.assignments)).catch((e) => errBox(box, e));
    api("GET", "/api/classes").then(async (r) => {
      classes = r.classes;
      if (!classes.length) {
        box.innerHTML = `<div class="card"><p class="muted">${teacher ? "Create a class first." : "Join a class to see assignments."}</p><div class="m16">${btn("My classes", "", 'data-go="class/dashboard"')}</div></div>`;
        return;
      }
      cid = classes[0].id;
      if (teacher) games = (await api("GET", "/api/games?limit=200")).games;
      load();
    }).catch((e) => errBox(box, e));
    root.addEventListener("change", (e) => {
      if (e.target.id === "aClass") {
        cid = +e.target.value;
        load();
      }
    });
    root.addEventListener("click", (e) => {
      const d = e.target.closest("[data-del]");
      if (d) return api("DELETE", "/api/assignments/" + d.dataset.del).then(load).catch((er) => toast("⚠️ " + er.message));
      if (e.target.closest("#aAdd")) {
        return api("POST", "/api/classes/" + cid + "/assignments", { gameId: +$("#aGame", root).value, title: $("#aTitle", root).value, due: $("#aDue", root).value }).then(() => {
          toast("Assigned");
          load();
        }).catch((er) => toast("⚠️ " + er.message));
      }
    });
  }
};
