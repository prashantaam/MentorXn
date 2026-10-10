import { Outlet, useLocation } from "react-router-dom";

import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";

import "../styles/layout/app-shell.css";

/*
 * Shared shell for every page that has the site nav + footer.
 *
 * `area` adds a class to <main> ("public-main", "student-main",
 * "teacher-main") as a hook for area-wide styles; the nav and footer
 * themselves are identical everywhere — except on the course player
 * pages, where the footer shrinks to a thin line (like Word Quest),
 * so the lesson gets the whole screen.
 */
const COURSE_PLAYER_PAGES = [
  /^\/student\/courses\/[^/]+/, // student course player (overview + topics)
  /^\/teacher\/courses\/[^/]+\/playground/, // teacher course builder
];

function AppLayout({ area = "public" }) {
  const { pathname } = useLocation();
  const isCoursePlayer = COURSE_PLAYER_PAGES.some((pattern) => pattern.test(pathname));

  return (
    <div className="mx-shell">
      <SiteHeader />

      <main className={`mx-shell__main ${area}-main`}>
        <Outlet />
      </main>

      <SiteFooter compact={isCoursePlayer} />
    </div>
  );
}

export default AppLayout;
