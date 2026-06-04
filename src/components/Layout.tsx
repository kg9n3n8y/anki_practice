import { Outlet, useLocation } from "react-router-dom";

export function Layout() {
  const { pathname } = useLocation();
  const isPracticeMain = pathname === "/practice/main";
  const isTeigiEdit = pathname === "/teigi";

  const shellClass = [
    "app-shell",
    isPracticeMain && "app-shell--practice",
    isTeigiEdit && "app-shell--teigi",
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
