import { Link, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>かるた配置暗記</h1>
        <p>
          競技かるたの暗記時間向けに、取り札の配置を覚え、決まり字から位置を思い出す練習ができる
          Web アプリです。
        </p>
      </header>
      <nav className="app-nav" aria-label="メイン">
        <Link to="/" className="app-button secondary">
          トップ
        </Link>
        <Link to="/practice/start" className="app-button secondary">
          暗記練習
        </Link>
        <Link to="/teigi" className="app-button secondary">
          定位置編集
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
