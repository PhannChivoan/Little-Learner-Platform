"use strict";
const I18N = { lang: "en" };
try {
  if (localStorage.getItem("ca_lang") === "km") I18N.lang = "km";
} catch (e) {
}
const SPLIT = /^([^A-Za-z0-9“"'(\[]*)([\s\S]*?)([^A-Za-z0-9.!?”"')\]%,;]*)$/;
const HAS = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
function trCore(core) {
  if (HAS(KM, core)) return KM[core];
  for (const r of KM_RULES) {
    const m = core.match(r[0]);
    if (m) {
      const v = r[1](...m.slice(1));
      if (v !== void 0) return v;
    }
  }
  if (core.indexOf(" \xB7 ") > 0) {
    const parts = core.split(" \xB7 "), out = parts.map(trPart);
    if (out.some((x) => x !== void 0)) return parts.map((p, i) => out[i] === void 0 ? p : out[i]).join(" \xB7 ");
  }
  const n = core.match(/^(\d[\d,.:\/]*[kKM%]?)\s+(.+)$/);
  if (n) {
    const v = trPart(n[2]);
    if (v !== void 0) return n[1] + " " + v;
  }
  let t = core;
  KM_TITLES.forEach((x) => {
    t = t.replace(x[0], x[1]);
  });
  for (const k in KM_NAMES) t = t.replace(new RegExp("\\b" + k + "\\b", "g"), KM_NAMES[k]);
  return t !== core ? t : void 0;
}
function trPart(p) {
  const m = p.match(SPLIT);
  if (!m) return void 0;
  const v = trCore(m[2]);
  return v === void 0 ? void 0 : m[1] + v + m[3];
}
const K = (s) => {
  const v = trCore(s);
  return v === void 0 ? s : v;
};
function tr(s) {
  if (I18N.lang !== "km" || s === null || s === void 0) return s;
  const str = String(s);
  if (!/[A-Za-z]/.test(str)) return str;
  const v = trPart(str);
  return v === void 0 ? str : v;
}
const TR_ATTRS = ["placeholder", "aria-label", "title", "data-toast", "data-ph"];
function trText(n) {
  const p = n.parentElement;
  if (!p || /^(SCRIPT|STYLE|CODE)$/.test(p.nodeName) || p.closest('[contenteditable="true"],[translate="no"]') || !n.nodeValue.trim()) return;
  const t = tr(n.nodeValue);
  if (t !== n.nodeValue) n.nodeValue = t;
}
function trNodes(root) {
  if (I18N.lang !== "km" || !root) return;
  if (root.nodeType === 3) {
    trText(root);
    return;
  }
  if (root.nodeType !== 1) return;
  const w = document.createTreeWalker(root, 4);
  const list = [];
  while (w.nextNode()) list.push(w.currentNode);
  list.forEach(trText);
  [root, ...root.querySelectorAll("[placeholder],[aria-label],[title],[data-toast],[data-ph]")].forEach((el) => TR_ATTRS.forEach((a) => {
    if (el.hasAttribute(a)) {
      const v = el.getAttribute(a), t = tr(v);
      if (t !== v) el.setAttribute(a, t);
    }
  }));
}
new MutationObserver((ms) => {
  if (I18N.lang === "km") ms.forEach((m) => m.addedNodes.forEach(trNodes));
}).observe(document.documentElement, { childList: true, subtree: true });
function langAttr() {
  document.documentElement.lang = I18N.lang;
  document.title = tr(DOC_TITLE);
}
function setLang(l) {
  I18N.lang = l === "km" ? "km" : "en";
  try {
    localStorage.setItem("ca_lang", I18N.lang);
  } catch (e) {
  }
  route();
}
function langSwitch() {
  const on = (l) => I18N.lang === l ? "on" : "";
  return `<div class="langsw" role="group" aria-label="Language"><button class="${on("en")}" data-lang="en" aria-pressed="${I18N.lang === "en"}">EN</button><button class="${on("km")}" data-lang="km" aria-pressed="${I18N.lang === "km"}">\u1781\u17D2\u1798\u17C2\u179A</button></div>`;
}
