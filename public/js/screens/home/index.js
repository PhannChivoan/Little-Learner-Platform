S["home/index"] = {
  render() {
    const side = (cls, list) => `<div class="lp-side ${cls}" aria-hidden="true">${list.map(([e, t, d], i) => `<span style="--t:${t}%;--d:${d}s;--i:${i}">${e}</span>`).join("")}</div>`;
    const crit = [
      ["🐻", "Bruno the Bear", "Loves counting honey jars", "#ffe2c2"],
      ["🐰", "Poppy the Bunny", "Hops through spelling games", "#ffd6ea"],
      ["🦊", "Finn the Fox", "Clever with puzzles and logic", "#ffd9a8"],
      ["🐼", "Mei the Panda", "Calm, kind and great at reading", "#dff3e4"],
      ["🐸", "Lily the Frog", "Leaps into science and nature", "#d3f0d0"],
      ["🐧", "Pip the Penguin", "Slides into music and rhythm", "#d6e8ff"]
    ];
    const what = [
      ["🎮", "Kids play", "Short, colourful games that turn maths, reading and nature into adventures with animal buddies.", "#7c5cff"],
      ["🏫", "Teachers host", "Run a live quiz on the big screen, set homework and watch the whole class light up.", "#1fbfa6"],
      ["👪", "Parents follow", "A safe parent corner shows progress, rewards and what to practise next.", "#ff5fa2"]
    ];
    const steps = [
      ["🌍", "Discover", "Browse friendly games from teachers and creators."],
      ["🎮", "Play", "Solve, tap and giggle your way through each level."],
      ["🏆", "Earn", "Collect stars, badges and treats for your buddy."],
      ["🧠", "Grow", "The game gently adapts so every child stays challenged."]
    ];
    const stats = [[String(APPS.slice(1).reduce((a, x) => a + x.nav.length, 0)), "screens to explore", "🧭"], ["5", "connected areas", "🧩"], ["2", "languages: EN & ខ្មែរ", "🌐"], ["100", "% playful learning", "🎈"]];
    return `<div class="lp">
      ${side("l", [["🦋", 8, 7], ["🐻", 24, 6], ["🐰", 44, 8], ["🐥", 64, 5.5], ["🦊", 82, 7.5]])}
      ${side("r", [["🐝", 12, 6.5], ["🐼", 30, 7], ["🐸", 50, 5.5], ["🐧", 68, 8], ["🦉", 86, 6]])}
      <section class="lp-hero">
        <div class="lp-sun"></div>
        <i class="lp-cloud c1">☁️</i><i class="lp-cloud c2">☁️</i><i class="lp-cloud c3">☁️</i>
        <i class="lp-star s1">⭐</i><i class="lp-star s2">✨</i><i class="lp-star s3">⭐</i><i class="lp-star s4">✨</i>
        <div class="lp-copy">
          <span class="pill">🐾 Learn &amp; play with animal friends</span>
          <h1>Where every child <em>learns</em> by <em class="b">playing</em></h1>
          <p>Critter Academy is a playful learning world for kids, parents and teachers. Join your animal buddies to play games, host live quizzes, run a classroom and watch learning grow.</p>
          <div class="row gap8 wrap"><button class="btn lg" data-go="play/discover">🎮 Start playing</button><button class="btn alt lg" data-go="live/lobby">📺 Host live</button><button class="btn alt lg" data-go="class/dashboard">🏫 Open classroom</button></div>
        </div>
        <div class="lp-zoo">
          <span class="z z1">🐻</span><span class="z z2">🐰</span><span class="z z3">🦊</span><span class="z z4">🐼</span>
          <div class="lp-hill"></div>
        </div>
        <button class="lp-scroll" data-scroll="lp-what" aria-label="Scroll down"><span>Scroll down</span><i>🐾</i></button>
      </section>
      <section class="lp-sec" id="lp-what">
        <div class="rv"><span class="pill">What is Critter Academy?</span><h2>A cosy jungle of learning, <em>built for little ones</em></h2>
        <p class="lp-lead">Everything a child, parent and teacher needs lives in one friendly place, guided by animals that cheer you on.</p></div>
        <div class="lp-cards">${what.map(([e, t, d, c], i) => `<article class="card lp-card rv" style="--c:${c};--dl:${i * 0.12}s"><div class="ic">${e}</div><h3>${t}</h3><p>${d}</p></article>`).join("")}</div>
      </section>
      <section class="lp-sec lp-path">
        <div class="rv"><span class="pill">How it works</span><h2>Four happy steps</h2></div>
        <div class="lp-trail"><span class="walker">🐾</span>${steps.map(([e, t, d], i) => `<div class="lp-step rv" style="--dl:${i * 0.15}s"><div class="bub">${e}</div><b>${i + 1}. ${t}</b><p>${d}</p></div>`).join("")}</div>
      </section>
      <section class="lp-stats rv">${stats.map(([n, l, e]) => `<div><span class="e">${e}</span><b><span data-n="${n}">0</span></b><small>${l}</small></div>`).join("")}</section>
      <section class="lp-sec">
        <div class="rv"><span class="pill">Meet the critters</span><h2>Your new best friends</h2>
        <p class="lp-lead">Each buddy has a favourite subject. Tap one and say hello!</p></div>
        <div class="lp-crit">${crit.map(([e, n, d, c], i) => `<button class="lp-pet rv" style="--c:${c};--dl:${i * 0.08}s" data-toast="${e} ${n} says hi!"><span class="a">${e}</span><b>${n}</b><small>${d}</small></button>`).join("")}</div>
      </section>
      <section class="lp-sec">
        <div class="rv"><span class="pill">Explore the platform</span><h2>Five areas, one adventure</h2></div>
        <div class="gg">${APPS.slice(1).map((a, i) => `<section class="card grp rv" style="--c:${a.c};--dl:${i * 0.08}s"><h3><span class="gi">${a.icon}</span>${a.label}</h3><p class="muted small">${a.desc} · ${a.nav.length} screens</p><div class="lk">${a.nav.map((n) => `<button data-go="${a.id}/${n[0]}">${n[2]} ${n[1]}</button>`).join("")}</div></section>`).join("")}</div>
      </section>
      <section class="lp-cta rv">
        <div class="peek"><span>🐻</span><span>🐰</span><span>🦊</span></div>
        <h2>Ready to join the fun?</h2>
        <p>Pick a game and your animal buddy will do the rest.</p>
        <div class="row gap8 wrap" style="justify-content:center"><button class="btn lg" data-go="play/discover">🎮 Try the player</button><button class="btn alt lg" data-go="play/login">🔑 Sign up</button></div>
      </section>
    </div>`;
  },
  mount(root) {
    const count = (el) => {
      const to = +el.dataset.n, t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1400);
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1 && el.isConnected) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const items = root.querySelectorAll(".rv");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("on");
        e.target.querySelectorAll("[data-n]").forEach(count);
        io.unobserve(e.target);
      }), { threshold: 0.18 });
      items.forEach((x) => io.observe(x));
    } else {
      items.forEach((x) => {
        x.classList.add("on");
        x.querySelectorAll("[data-n]").forEach(count);
      });
    }
    root.querySelectorAll("[data-scroll]").forEach((b) => b.addEventListener("click", () => {
      const t = root.querySelector("#" + b.dataset.scroll);
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    const l = root.querySelector(".lp-side.l"), r = root.querySelector(".lp-side.r");
    const onScroll = () => {
      if (!root.isConnected) {
        window.removeEventListener("scroll", onScroll);
        return;
      }
      const y = window.scrollY;
      l.style.setProperty("--sy", y * -0.12 + "px");
      r.style.setProperty("--sy", y * -0.2 + "px");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
  }
};
