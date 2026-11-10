S["play/login"] = {
  render() {
    const roles = [["kid", "\u{1F9D2}", "Kid"], ["parent", "\u{1F468}‍\u{1F469}‍\u{1F467}", "Parent"], ["teacher", "\u{1F469}‍\u{1F3EB}", "Teacher"], ["creator", "\u{1F9D1}‍\u{1F3A8}", "Creator"]];
    if (ME.user) {
      return `<div class="card nop" style="max-width:520px;margin:30px auto;padding:30px;text-align:center"><div style="font-size:4rem">${esc(ME.user.emoji)}</div><h2>You are signed in as ${esc(ME.user.name)}</h2><p class="muted">${esc(ME.user.email)} · ${esc(ME.user.role)}</p><div class="row center gap12 wrap m16">${btn("\u{1F3AE} Play", "lg", 'data-go="play/discover"')}${btn("Sign out", "alt lg", "data-signout")}</div></div>`;
    }
    return `<div class="card nop" style="max-width:900px;margin:16px auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)"><style>@media(max-width:760px){.lg-l{display:none}}</style>
      <div class="lg-l center col" style="background:linear-gradient(160deg,#dcd3ff,#ffc9de);padding:30px;justify-content:center;align-items:center"><div style="font-size:5.5rem;animation:fl 3s ease-in-out infinite">\u{1F43B}</div><h2 style="margin:10px 0 6px">Welcome to Critter Academy!</h2><p>Sign in to save your stars, games and progress.</p></div>
      <div style="padding:24px"><div class="row gap8" id="auTabs"><button class="fchip on" data-m="in">Log in</button><button class="fchip" data-m="up">Sign up</button></div>
        <form id="auForm" class="m16" novalidate>
          <div id="auUp" hidden><div class="pickgroup g4" style="gap:10px;margin-bottom:6px">${roles.map((r, i) => `<button type="button" class="card tight center col ${i ? "" : "on"}" data-pick data-role="${r[0]}" style="align-items:center;border-width:3px"><span style="font-size:1.8rem">${r[1]}</span><b class="small">${r[2]}</b></button>`).join("")}</div>
          <label class="lbl">Your name</label><input class="in" id="auName" autocomplete="name"></div>
          <label class="lbl">Email</label><input class="in" id="auEmail" type="email" autocomplete="username" placeholder="you@email.com">
          <label class="lbl">Password</label><input class="in" id="auPass" type="password" autocomplete="current-password" placeholder="6+ characters">
          <p class="lg-err" id="auErr" role="alert" hidden style="color:var(--bad);margin-top:8px"></p>
          <div class="m16 col gap8">${btn("Log in", "lg", 'id="auGo" type="submit"')}${btn("\u{1F440} Play as guest", "ghost", 'data-go="play/discover"')}</div>
        </form><p class="tiny muted m16">\u{1F512} We keep kids’ data minimal and never show ads.</p></div></div>`;
  },
  mount(root) {
    if (ME.user) return;
    let mode = "in";
    const err = $("#auErr", root), go = $("#auGo", root);
    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-m]");
      if (!t) return;
      mode = t.dataset.m;
      $$("[data-m]", root).forEach((x) => x.classList.toggle("on", x === t));
      $("#auUp", root).hidden = mode === "in";
      go.textContent = tr(mode === "in" ? "Log in" : "Create account");
      err.hidden = true;
    });
    $("#auForm", root).addEventListener("submit", (e) => {
      e.preventDefault();
      err.hidden = true;
      const body = { email: $("#auEmail", root).value.trim(), password: $("#auPass", root).value };
      if (mode === "up") {
        body.name = $("#auName", root).value.trim();
        const r = $(".pickgroup .on", root);
        body.role = r ? r.dataset.role : "kid";
        body.emoji = { kid: "\u{1F430}", parent: "\u{1F43B}", teacher: "\u{1F43C}", creator: "\u{1F98A}" }[body.role];
      }
      go.disabled = true;
      api("POST", mode === "in" ? "/api/auth/login" : "/api/auth/register", body).then((r) => {
        TOKEN.set(r.token, true);
        return loadMe().then(() => navigate(r.user.role === "teacher" ? "class/dashboard" : "play/discover"));
      }).catch((er) => {
        go.disabled = false;
        err.textContent = er.message;
        err.hidden = false;
      });
    });
  }
};
