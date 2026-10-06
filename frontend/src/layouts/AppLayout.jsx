import { Outlet } from "react-router-dom";

import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";

import "../styles/layout/app-shell.css";

/*
 * Shared shell for every page that has the site nav + footer.
 *
 * `area` adds a class to <main> ("public-main", "student-main",
 * "teacher-main") as a hook for area-wide styles; the nav and footer
 * themselves are identical everywhere.
 */
function AppLayout({ area = "public" }) {
  return (
    <div className="mx-shell">
      <SiteHeader />

      <main className={`mx-shell__main ${area}-main`}>
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

export default AppLayout;
