import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { to: "/",       icon: Home,   label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/profile", icon: User,  label: "Profile" },
];

const AVATAR_COLORS = [
  { bg: "linear-gradient(135deg,#8b5cf6,#c026d3)", shadow: "#6d28d9" },
  { bg: "linear-gradient(135deg,#34d399,#059669)",  shadow: "#047857" },
  { bg: "linear-gradient(135deg,#fb923c,#ea580c)",  shadow: "#c2410c" },
  { bg: "linear-gradient(135deg,#60a5fa,#2563eb)",  shadow: "#1d4ed8" },
  { bg: "linear-gradient(135deg,#f472b6,#db2777)",  shadow: "#be185d" },
];

const SidebarLink = ({ to, icon: Icon, label, active, onClose }) => (
  <li>
    <Link
      to={to}
      onClick={onClose}
      className={`sidebar-link${active ? " active" : ""}`}
    >
      <div
        className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={
          active
            ? {
                background: "linear-gradient(135deg,#8b5cf6,#c026d3)",
                boxShadow: "0 3px 0px #6d28d9",
              }
            : { background: "rgba(139,92,246,0.1)" }
        }
      >
        <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-purple-500"}`} size={18} />
      </div>
      <span>{label}</span>
    </Link>
  </li>
);

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        width: "240px",
        height: "100vh",
        paddingTop: "4.5rem",
        transform: isOpen ? "translateX(0)" : undefined,
        transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        background: "rgba(240,235,255,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "2px solid rgba(196,181,253,0.35)",
      }}
      className={!isOpen ? "max-sm:-translate-x-full sm:translate-x-0" : ""}
    >
      <div className="h-full flex flex-col px-4 py-5 overflow-y-auto">
        {/* Nav Links */}
        <nav className="flex-1">
          <p className="text-xs font-black text-purple-400 uppercase tracking-widest px-2 mb-3">
            Navigation
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <SidebarLink
                key={to}
                to={to}
                icon={icon}
                label={label}
                active={location.pathname === to}
                onClose={onClose}
              />
            ))}
          </ul>
        </nav>

        {/* Bottom decoration */}
        <div
          className="mt-6 rounded-3xl p-4 text-center"
          style={{
            background: "linear-gradient(135deg,rgba(139,92,246,0.12),rgba(236,72,153,0.10))",
            border: "2px solid rgba(196,181,253,0.35)",
          }}
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2"
            style={{
              background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
              boxShadow: "0 4px 0px #6d28d9",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-bold text-purple-800">MicroSocial</p>
          <p className="text-xs text-purple-500 mt-0.5">Share your world 🌎</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
