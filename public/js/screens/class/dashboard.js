S["class/dashboard"] = {
  render() {
    if (!ME.user) return needLogin("your classes");
    const teacher = ["teacher", "admin", "super_admin"].includes(ME.user.role);
    return `${head(teacher ? "Teacher dashboard" : "My classes", teacher ? "Create classes, share the code and follow every student." : "Join a class with the code from your teacher.")}
    <div class="g21"><div id="cBox"><p class="muted">Loading…</p></div>
    ${teacher ? card("New class", `<label class="lbl">Class name</label><input class="in" id="cName" placeholder="Grade 1A" translate="no"><div class="m16">${btn("➕ Create class", "", 'id="cAdd"')}</div>`) : card("Join a class", `<label class="lbl">Class code</label><input class="in" id="cCode" maxlength="6" placeholder="ABC123" style="text-transform:uppercase;letter-spacing:4px"><div class="m16">${btn("Join", "", 'id="cJoin"')}</div>`)}</div>`;
  },
  mount(root) {
    if (!ME.user) return;
    const teacher = ["teacher", "admin", "super_admin"].includes(ME.user.role);
    const box = $("#cBox", root);
    const list = () => api("GET", "/api/classes").then((r) => {
      box.innerHTML = r.classes.length ? r.classes.map((c) => `<section class="card" style="margin-bottom:14px"><div class="row sp wrap gap8"><div><h3 translate="no">${esc(c.name)}</h3><div class="small muted">${c.students} student${c.students === 1 ? "" : "s"}</div></div><div class="row gap8">${teacher ? chip("Code: " + c.code, "#7c5cff") + btn("\u{1F4CB}", "sm alt", `data-copy="${c.code}" aria-label="Copy code"`) : ""}${btn("Open", "sm", `data-open="${c.id}"`)}${teacher ? btn("\u{1F5D1}️", "sm alt", `data-del="${c.id}" aria-label="Delete"`) : ""}</div></div></section>`).join("") : `<div class="card"><p class="muted">${teacher ? "No classes yet. Create your first class." : "You have not joined a class yet."}</p></div>`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    const open = (id) => api("GET", "/api/classes/" + id).then((r) => {
      const c = r.class_;
      box.innerHTML = `<div class="row sp wrap gap8" style="margin-bottom:10px"><h2 translate="no">${esc(c.name)}</h2><div class="row gap8">${teacher ? chip("Code: " + c.code, "#7c5cff") : ""}${btn("⬅ All classes", "sm alt", "data-back")}</div></div>
      ${card("Students", c.members.length ? table(["Student", "Games", "Points", "Accuracy", ""], c.members.map((m) => [`<span translate="no">${esc(m.emoji + " " + m.name)}</span>`, m.games, m.points, `<div style="min-width:90px">${bar(m.accuracy, m.accuracy >= 70 ? "#2fbf63" : "#f5a300")}</div>`, teacher ? btn("Remove", "sm alt", `data-rm="${m.id}" data-c="${c.id}"`) : ""])) : '<p class="muted">No students yet. Share the class code.</p>')}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    root.addEventListener("click", (e) => {
      const o = e.target.closest("[data-open]");
      if (o) return open(o.dataset.open);
      if (e.target.closest("[data-back]")) return list();
      const d = e.target.closest("[data-del]");
      if (d && confirm("Delete this class?")) return api("DELETE", "/api/classes/" + d.dataset.del).then(list).catch((er) => toast("⚠️ " + er.message));
      const rm = e.target.closest("[data-rm]");
      if (rm) return api("DELETE", "/api/classes/" + rm.dataset.c + "/members/" + rm.dataset.rm).then(() => open(rm.dataset.c)).catch((er) => toast("⚠️ " + er.message));
      if (e.target.closest("#cAdd")) {
        const name = $("#cName", root).value.trim();
        if (!name) return toast("Give the class a name");
        return api("POST", "/api/classes", { name }).then(() => {
          $("#cName", root).value = "";
          toast("Class created");
          list();
        }).catch((er) => toast("⚠️ " + er.message));
      }
      if (e.target.closest("#cJoin")) {
        return api("POST", "/api/classes/join", { code: $("#cCode", root).value }).then(() => {
          $("#cCode", root).value = "";
          toast("You joined the class");
          list();
        }).catch((er) => toast("⚠️ " + er.message));
      }
    });
    list();
  }
};
