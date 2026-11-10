import Link from "next/link";

const COLS: [string, [string, string][]][] = [
  ["Play", [["Discover", "/play/discover"], ["Join with code", "/play/join"], ["Rewards", "/play/rewards"], ["My library", "/play/library"]]],
  ["Live & Class", [["Host lobby", "/live/lobby"], ["Leaderboard", "/live/leaderboard"], ["My classes", "/class/dashboard"], ["Assignments", "/class/assign"]]],
  ["Community", [["Public library", "/com/library"], ["Creator profile", "/com/creator"], ["Featured", "/com/featured"]]],
  ["Learning", [["Progress analytics", "/learn/analytics"]]],
];

export default function Footer() {
  return (
    <footer className="ft">
      <div className="walk" aria-hidden="true">
        <span>🐻</span><span>🐰</span><span>🦊</span><span>🐼</span>
      </div>
      <div className="ft-in">
        <div className="ft-brand">
          <b><span>🐾</span> Critter Academy</b>
          <p>A playful learning world where kids, parents and teachers grow together with their animal friends.</p>
          <div className="badges"><i>🎮 Play</i><i>📺 Live</i><i>🏫 Classroom</i><i>🌐 EN / ខ្មែរ</i></div>
        </div>
        {COLS.map(([h, links]) => (
          <div key={h}>
            <h4>{h}</h4>
            <ul>
              {links.map(([l, to]) => (
                <li key={to}><Link href={to}>{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="ft-bot">
        <span>© 2026 Critter Academy. All rights reserved.</span>
        <span>Made with <span className="hearts">💜</span> for little learners</span>
      </div>
    </footer>
  );
}
