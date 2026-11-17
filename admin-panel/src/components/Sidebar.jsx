import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { UsersIcon, DocumentIcon, TagIcon, ChatIcon } from "./dashboard/icons";

const icon = {
  className: "h-5 w-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};
const HomeIcon = () => (
  <svg {...icon}>
    <rect x="3" y="3" width="7" height="8" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="15" width="7" height="6" rx="1.5" />
  </svg>
);
const SettingsIcon = () => (
  <svg {...icon}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </svg>
);
const LogoutIcon = () => (
  <svg {...icon}>
    <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />
  </svg>
);

export const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <HomeIcon />, end: true },
  { to: "/blogs", label: "Blogs", icon: <DocumentIcon /> },
  { to: "/categories", label: "Categories", icon: <TagIcon /> },
  { to: "/comments", label: "Comments", icon: <ChatIcon /> },
  { to: "/users", label: "Users", icon: <UsersIcon /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon /> },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
   ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`;

export default function Sidebar({ open, onClose, brand = "Inkwell" }) {
  // Close the mobile drawer with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 px-4 py-6 text-slate-100
          transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center gap-2.5 px-2 text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-slate-900">{brand[0]}</span>
          {brand}
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={linkClass}>
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/login"
          className="flex items-center gap-3 rounded-lg border-t border-slate-700 px-3 pt-4 text-sm font-medium text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <LogoutIcon />
          Sign out
        </Link>
      </aside>
    </>
  );
}