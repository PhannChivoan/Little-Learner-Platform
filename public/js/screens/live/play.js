S["live/play"] = {
  render() {
    return '<div class="lv-boot"><p class="muted">Joining the game…</p></div>';
  },
  mount(root) {
    const p = LV.readPlayer();
    if (!p) {
      navigate("play/join");
      return;
    }
    SFX.init();
    SFX.muted = false;
    document.body.style.overflow = "hidden";
    const leave = (to) => {
      LV.clearPlayer();
      document.body.style.overflow = "";
      navigate(to);
    };
    api("GET", "/api/live/sessions/" + p.pin + "?player=" + p.pid).then((r) => {
      root.innerHTML = LV.shell("play", r.session.game);
      LV.run(root, { role: "play", pin: p.pin, pid: p.pid, token: p.token, name: p.name, emoji: p.emoji, onExit: () => leave("play/discover"), onGone: () => leave("play/join") });
    }).catch(() => leave("play/join"));
  }
};
