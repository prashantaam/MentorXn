/*
 * Top-nav links for each audience. The header picks a set based on
 * who is signed in, so student and teacher share one SiteHeader.
 * Only list routes that exist in App.jsx.
 */
export const NAV_LINKS = {
  guest: [
    { to: "/#courses", label: "Courses" },
    { to: "/teacher/login", label: "Teach on MentorXn" },
  ],
  student: [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/#courses", label: "Courses" },
  ],
  teacher: [
    { to: "/teacher/dashboard", label: "Dashboard" },
    { to: "/teacher/courses", label: "My courses", end: true },
    { to: "/teacher/courses/create", label: "Create a course" },
  ],
};

export const HOME_BY_ROLE = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
};

export const LOGIN_BY_ROLE = {
  student: "/login",
  teacher: "/teacher/login",
};

export const ACCOUNT_PATH = "/account";
