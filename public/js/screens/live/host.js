S["live/host"] = {
  render() {
    if (!ME.user || !["teacher", "admin", "super_admin"].includes(ME.user.role)) return needLogin("the live host screen");
    return '<div class="lv-boot"><p class="muted">Loading your live game…</p></div>';
  },
  mount(root) {
    if (!ME.user || !["teacher", "admin", "super_admin"].includes(ME.user.role)) return;
    let pin = "";
    try {
      pin = sessionStorage.getItem("ca_live_pin") || "";
    } catch (e) {
    }
    if (!pin) {
      navigate("live/lobby");
      return;
    }
    SFX.init();
    SFX.muted = false;
    document.body.style.overflow = "hidden";
    const back = () => {
      SFX.music(false);
      document.body.style.overflow = "";
      navigate("live/lobby");
    };
    api("GET", "/api/live/sessions/" + pin).then((r) => {
      root.innerHTML = LV.shell("host", r.session.game);
      LV.run(root, { role: "host", pin, onExit: back, onGone: () => {
        try {
          sessionStorage.removeItem("ca_live_pin");
        } catch (e) {
        }
        back();
      } });
    }).catch(() => {
      try {
        sessionStorage.removeItem("ca_live_pin");
      } catch (e) {
      }
      navigate("live/lobby");
    });
  }
};
