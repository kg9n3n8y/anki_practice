import { Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();
  const isPracticeMain = pathname === "/practice/main";
  const isPositionEdit = pathname === "/position";

  const shellClass = [
    "app-shell",
    isPracticeMain && "app-shell--practice",
    isPositionEdit && "app-shell--position",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
