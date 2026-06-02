import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__brand">
          <span className="site-header__logo" aria-hidden>
            SG
          </span>
          <div>
            <p className="site-header__name">StockGuard</p>
            <p className="site-header__tag">Limited drop</p>
          </div>
        </div>
        <span className="site-header__pill">Live</span>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>Built for high-concurrency inventory — no overselling, ever.</p>
      </footer>
    </div>
  );
}
