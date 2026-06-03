import { Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();
  const isPracticeMain = pathname === "/practice/main";

  return (
    <div
      className={`app-shell${isPracticeMain ? " app-shell--practice" : ""}`}
    >
      <main>
        <Outlet />
      </main>
    </div>
  );
}
