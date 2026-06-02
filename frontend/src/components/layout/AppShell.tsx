import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  online?: boolean;
}

export function AppShell({ children, online = true }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__brand">
          <span className="site-header__logo" aria-hidden>
            SG
          </span>
          <div>
            <p className="site-header__name">StockGuard</p>
            <p className="site-header__tag">Limited inventory drop</p>
          </div>
        </div>
        <div className="site-header__meta">
          <span
            className={`site-header__online ${online ? "site-header__online--ok" : ""}`}
            title={online ? "Connected to API" : "Offline"}
          >
            {online ? "Online" : "Offline"}
          </span>
          <span className="site-header__pill">Live drop</span>
        </div>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <p>High-concurrency reservations · Transactional stock · Auto-expiring holds</p>
      </footer>
    </div>
  );
}
