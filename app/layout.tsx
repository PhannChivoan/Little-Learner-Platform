import type { Metadata } from "next";
import Welcome from "./welcome";
import Footer from "./footer";

export const metadata: Metadata = {
  title: "Critter Academy – Learn & Play with Animal Friends",
  description: "Critter Academy – UI prototype (English / ខ្មែរ)",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `window.CA_API=${JSON.stringify(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")};` }} />
        <link rel="stylesheet" href="/css/fonts.css" />
        <link rel="stylesheet" href="/css/app.css" />
        <link rel="stylesheet" href="/css/footer.css" />
        <link rel="stylesheet" href="/css/welcome.css" />
        <link rel="stylesheet" href="/css/home.css" />
        <link rel="stylesheet" href="/css/game.css" />
      </head>
      <body>
        <Welcome title="Hi friend! Welcome to Critter Academy!" line="Learn and play with your animal friends." />
        <header className="top" id="top"></header>
        <div className="shell" id="shell">
          <aside className="side card" id="side"></aside>
          <main className="main" id="view"></main>
        </div>
        <div id="toast" role="status"></div>
        <div className="ovl" id="ovl" hidden>
          <div className="mdl" id="mdl"></div>
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
