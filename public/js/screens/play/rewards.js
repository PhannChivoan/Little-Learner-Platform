S["play/rewards"] = {
  render() {
    return `${head("Rewards", "Earn stars by playing games, then spend them on fun things for your buddy.")}<div id="rwBox"><p class="muted">Loading…</p></div>`;
  },
  mount(root) {
    const box = $("#rwBox", root);
    const load = () => Promise.all([api("GET", "/api/rewards"), ME.user ? api("GET", "/api/me/rewards") : Promise.resolve({ owned: [], stars: 0 })]).then(([r, m]) => {
      box.innerHTML = `${ME.user ? `<div class="g4">${stat("⭐", m.stars, "Your stars", "", "#fff0c2")}${stat("\u{1F381}", m.owned.length, "Rewards you own", "", "#ffd9e6")}</div>` : needLogin("your stars and rewards")}
      <h2 class="sec">Reward shop</h2>${r.items.length ? `<div class="g4">${r.items.map((x) => `<div class="card center col" style="align-items:center;text-align:center"><div style="font-size:3.4rem;animation:fl 3s ease-in-out infinite">${esc(x.emoji)}</div><b translate="no">${esc(x.name)}</b><div class="small muted">${esc(x.kind)}</div><div class="m8">${m.owned.includes(x.id) ? chip("✓ Yours", "#2fbf63") : btn("⭐ " + x.cost, m.stars >= x.cost && ME.user ? "sm" : "sm alt", `data-buy="${x.id}"`)}</div></div>`).join("")}</div>` : '<p class="muted">No rewards yet. Ask your teacher or an admin to add some.</p>'}`;
      trNodes(box);
    }).catch((e) => errBox(box, e));
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-buy]");
      if (!b) return;
      if (!ME.user) {
        toast("Sign in to buy rewards");
        return;
      }
      api("POST", "/api/rewards/" + b.dataset.buy + "/buy").then(() => {
        toast("\u{1F389} You got it!");
        load();
      }).catch((er) => toast("⚠️ " + er.message));
    });
    load();
  }
};
