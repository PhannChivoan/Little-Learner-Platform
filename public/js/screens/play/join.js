S["play/join"] = {
  render() {
    const pin = (new URLSearchParams(location.search).get("pin") || "").replace(/\D/g, "").slice(0, 6);
    return `<div style="max-width:520px;margin:30px auto"><div class="card center col" style="align-items:center;text-align:center" id="jBox">
      <div style="font-size:3.4rem;animation:fl 3s ease-in-out infinite">\u{1F39F}️</div><h1 style="font-size:1.8rem">Join a game</h1><p class="muted">Type the 6-digit PIN you see on the big screen.</p>
      <input class="in" id="jpin" inputmode="numeric" maxlength="6" placeholder="000000" value="${esc(pin)}" aria-label="Game PIN" style="text-align:center;font-size:2rem;letter-spacing:10px;max-width:300px">
      <label class="lbl" style="width:100%;text-align:left">Your nickname</label><input class="in" id="jnick" value="${esc(ME.user ? ME.user.name : "")}" maxlength="16" aria-label="Nickname" translate="no">
      <p class="lg-err" id="jerr" hidden style="color:var(--bad);margin-top:8px"></p>
      <div class="m16 row gap8">${btn("Join the game \u{1F680}", "lg", 'id="jgo"')}</div><p class="tiny muted m8">No email needed. Only a nickname is shown on screen.</p></div></div>`;
  },
  mount(root) {
    const go = $("#jgo", root), err = $("#jerr", root);
    let busy = false;
    const join = () => {
      if (busy) return;
      busy = true;
      go.disabled = true;
      err.hidden = true;
      const name = $("#jnick", root).value.trim(), emoji = ME.user ? ME.user.emoji : "\u{1F43B}";
      api("POST", "/api/live/join", { pin: $("#jpin", root).value.trim(), name, emoji }).then((r) => {
        try {
          sessionStorage.setItem("ca_live_player", JSON.stringify({ pin: r.session.pin, pid: r.playerId, token: r.token, name, emoji }));
        } catch (e) {
        }
        navigate("live/play");
      }).catch((e) => {
        err.textContent = e.message;
        err.hidden = false;
        busy = false;
        go.disabled = false;
      });
    };
    go.addEventListener("click", join);
    root.addEventListener("keydown", (e) => {
      if (e.key === "Enter") join();
    });
  }
};
