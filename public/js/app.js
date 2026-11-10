"use strict";
const DOC_TITLE = "Critter Academy \u2013 Learn & Play with Animal Friends";
const APPS = [
  { id: "home", label: "Overview", icon: "\u{1F3E0}", c: "#7c5cff", title: "Overview", nav: [["index", "Overview", "\u{1F3E0}"]] },
  { id: "play", label: "Play", icon: "\u{1F3AE}", c: "#7c5cff", title: "Player side", desc: "What kids and parents see.", nav: [["discover","Discover","🧭"],["join","Join with code","🔢"],["game","Game player","🕹️"],["rewards","Rewards","🏆"],["library","My library","📚"],["profile","Profile & buddy","🐻"],["login","Login / sign up","🔑"]] },
  { id: "live", label: "Live", icon: "\u{1F4FA}", c: "#ff5fa2", title: "Live play", desc: "Host a game on the big screen.", nav: [["lobby","Host lobby","🚪"],["leaderboard","Leaderboard","🥇"]] },
  { id: "class", label: "Classroom", icon: "\u{1F3EB}", c: "#1fbfa6", title: "Classroom & school", desc: "Teachers, classes and homework.", nav: [["dashboard","My classes","🏠"],["assign","Assignments","📝"]] },
  { id: "com", label: "Community", icon: "\u{1F30D}", c: "#3d8bff", title: "Community", desc: "Share and discover games.", nav: [["library","Public library","🔎"],["creator","Creator profile","🧑‍🎨"],["featured","Featured","🎉"]] },
  { id: "learn", label: "Learning", icon: "\u{1F9E0}", c: "#2fbf63", title: "Learning", desc: "See how your learning grows.", nav: [["analytics","Progress analytics","📈"]] }
];
function renderHeader(app) {
  $("#top").innerHTML = `<button class="logo" data-go="home/index" aria-label="Overview"><span>\u{1F43E}</span><span class="t">Critter <b>Academy</b></span></button>
    <nav class="apps" aria-label="Areas">${APPS.map((a) => `<button class="app ${a.id === app.id ? "on" : ""}" style="--c:${a.c}" data-go="${a.id}/${a.nav[0][0]}"><span>${a.icon}</span>${a.label}</button>`).join("")}</nav>
    <div class="tools">${langSwitch()}${bellBtn()}${profileBtn()}</div>`;
}
function route() {
  const [a, s] = (location.pathname.replace(/^\/+|\/+$/g, "") || "home/index").split("/");
  const app = APPS.find((x) => x.id === a) || APPS[0];
  const sid = app.nav.some((n) => n[0] === s) ? s : app.nav[0][0];
  clearTM();
  if (typeof SFX !== "undefined") SFX.music(false);
  document.body.style.overflow = "";
  if (document.fullscreenElement && !(app.id === "play" && sid === "game")) document.exitFullscreen().catch(() => {
  });
  const scr = S[app.id + "/" + sid];
  document.documentElement.style.setProperty("--acc", app.c);
  $("#shell").classList.toggle("full", app.id === "home");
  renderHeader(app);
  $("#side").innerHTML = `<h4>${app.title}</h4>` + app.nav.map(([id, l, i]) => `<button class="nv ${id === sid ? "on" : ""}" data-go="${app.id}/${id}"><span class="ic">${i}</span>${l}</button>`).join("");
  const v = $("#view");
  const root = document.createElement("div");
  root.innerHTML = scr ? scr.render() : `<p>Missing screen ${app.id}/${sid}</p>`;
  v.innerHTML = "";
  v.appendChild(root);
  v.classList.remove("in");
  void v.offsetWidth;
  v.classList.add("in");
  if (scr && scr.mount) scr.mount(root);
  trNodes($("#top"));
  trNodes($("#side"));
  trNodes(root);
  langAttr();
  window.scrollTo(0, 0);
}
