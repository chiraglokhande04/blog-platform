import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

/** Shell for all admin pages: sidebar on the left, page content on the right. */
export default function AdminLayout({ brand = "Inkwell" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar open={open} onClose={() => setOpen(false)} brand={brand} />

      <div className="min-w-0 flex-1">
        {/* Top bar, mobile only */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold tracking-tight text-slate-900">{brand}</span>
        </div>

        <Outlet />
      </div>
    </div>
  );
}