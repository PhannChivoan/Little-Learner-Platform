"use client";

const CORE = ["lang-km","i18n","lib","api","app"];
const SHARED = ["play"];

type Win = Window & { __caCore?: Promise<void>; __caNav?: (to: string) => void; S?: Record<string, unknown> };

function addScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(src));
    document.body.appendChild(el);
  });
}

export function loadCore(): Promise<void> {
  const w = window as Win;
  if (!w.__caCore) {
    w.__caCore = CORE.reduce<Promise<void>>((p, n) => p.then(() => addScript("/js/" + n + ".js")), Promise.resolve());
  }
  return w.__caCore;
}

const loaded = new Set<string>();

async function loadOnce(src: string) {
  if (loaded.has(src)) return;
  loaded.add(src);
  await addScript(src);
}

export async function showScreen(id: string) {
  await loadCore();
  const w = window as unknown as { syncGames?: () => Promise<unknown>; loadMe?: () => Promise<unknown> };
  await Promise.all([w.syncGames?.(), w.loadMe?.()]);
  if (id) {
    const area = id.split("/")[0];
    if (SHARED.includes(area)) await loadOnce("/js/screens/" + area + "/_shared.js");
    if (area === "play") await loadOnce("/js/screens/play/_games.js");
    await loadOnce("/js/screens/" + id + ".js");
  }
  (window as unknown as { route: () => void }).route();
}

export function setNavigator(fn: (to: string) => void) {
  (window as Win).__caNav = fn;
}
