"use client";

import { useEffect, useRef, useState } from "react";
import { loadCore } from "./runtime";

const FLAKES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 47) % 100,
  size: 10 + ((i * 7) % 14),
  dur: 6 + ((i * 3) % 7),
  delay: -((i * 5) % 9),
}));

const ANIMALS = ["🐰", "🦊", "🐼", "🐸", "🐥", "🐻"];

function Bear() {
  return (
    <svg className="bear" viewBox="0 0 400 340" role="img" aria-label="Polar bear waving hello">
      <ellipse cx="200" cy="322" rx="110" ry="12" fill="#9bc7ea" opacity=".45" />
      <ellipse cx="200" cy="262" rx="95" ry="62" fill="#fff" stroke="#cfe3f3" strokeWidth="4" />
      <path d="M130 238 Q200 290 270 238 L262 258 Q200 306 138 258 Z" fill="#ff5fa2" />
      <rect x="236" y="244" width="30" height="58" rx="12" fill="#ff5fa2" transform="rotate(-8 250 244)" />
      <g className="ear"><circle cx="118" cy="104" r="34" fill="#fff" stroke="#cfe3f3" strokeWidth="4" /><circle cx="118" cy="106" r="18" fill="#ffc9dc" /></g>
      <g className="ear"><circle cx="282" cy="104" r="34" fill="#fff" stroke="#cfe3f3" strokeWidth="4" /><circle cx="282" cy="106" r="18" fill="#ffc9dc" /></g>
      <ellipse cx="200" cy="170" rx="102" ry="92" fill="#fff" stroke="#cfe3f3" strokeWidth="4" />
      <g className="eye"><circle cx="158" cy="154" r="11" fill="#2b3a67" /><circle cx="162" cy="150" r="4" fill="#fff" /></g>
      <g className="eye"><circle cx="242" cy="154" r="11" fill="#2b3a67" /><circle cx="246" cy="150" r="4" fill="#fff" /></g>
      <ellipse cx="136" cy="184" rx="18" ry="11" fill="#ffb3cf" opacity=".7" />
      <ellipse cx="264" cy="184" rx="18" ry="11" fill="#ffb3cf" opacity=".7" />
      <ellipse cx="200" cy="190" rx="40" ry="30" fill="#f1f8ff" />
      <ellipse cx="200" cy="176" rx="15" ry="11" fill="#2b3a67" />
      <path d="M200 187 V198 M184 202 Q200 216 216 202" fill="none" stroke="#2b3a67" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="136" cy="276" rx="26" ry="20" fill="#fff" stroke="#cfe3f3" strokeWidth="4" />
      <g className="paw">
        <ellipse cx="300" cy="208" rx="24" ry="42" fill="#fff" stroke="#cfe3f3" strokeWidth="4" transform="rotate(-18 300 208)" />
        <circle cx="304" cy="172" r="9" fill="#ffc9dc" />
      </g>
    </svg>
  );
}

export default function Welcome({ title, line }: { title: string; line: string }) {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<"load" | "hi">("load");
  const [animal, setAnimal] = useState(0);
  const dur = 3200;
  const intro = useRef(true);

  useEffect(() => {
    let seen = window.top !== window.self;
    try {
      seen = seen || sessionStorage.getItem("ca_welcomed") === "1";
    } catch {}
    if (seen) {
      loadCore();
      setShow(false);
      return;
    }
    setAnimal(Math.floor(Math.random() * ANIMALS.length));
    document.body.style.overflow = "hidden";
    Promise.all([loadCore().catch(() => {}), new Promise((r) => setTimeout(r, 3200))]).then(() => {
      intro.current = false;
      setPhase("hi");
    });
  }, []);

  useEffect(() => {
    if (phase !== "hi") return;
    const t = setTimeout(close, 6000);
    return () => clearTimeout(t);
  }, [phase]);

  function close() {
    try {
      sessionStorage.setItem("ca_welcomed", "1");
    } catch {}
    document.body.style.overflow = "";
    setShow(false);
  }

  return (
    <div className={"wl" + (show ? "" : " out")} style={{ "--d": dur + "ms" } as React.CSSProperties} aria-hidden={!show} role="dialog" aria-label="Welcome">
      <div className="snow" aria-hidden="true">
        {FLAKES.map((f, i) => (
          <i key={i} style={{ left: f.left + "%", fontSize: f.size, animationDuration: f.dur + "s", animationDelay: f.delay + "s" }}>❄</i>
        ))}
      </div>
      <div className="ground" />
      {phase === "load" ? (
        <div className="stage">
          <h1 className="load-title">
            Getting ready<span className="dots"><span>.</span><span>.</span><span>.</span></span>
          </h1>
          <div className="track">
            <span className="runner">{ANIMALS[animal]}</span>
            <div className="bar"><b /></div>
          </div>
          <p>Your animal friends are packing their bags!</p>
        </div>
      ) : (
        <div className="stage">
          <Bear />
          <h1>{title}</h1>
          <p>{line}</p>
          <button className="go" onClick={close}>Let&apos;s go! 🐾</button>
        </div>
      )}
    </div>
  );
}
