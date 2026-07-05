import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu, Sparkles } from "lucide-react";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.username?.[0]?.toUpperCase() || "U";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        background: "rgba(240, 235, 255, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "2px solid rgba(196,181,253,0.35)",
      }}
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left — logo + mobile menu */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-btn"
            onClick={onMenuToggle}
            className="sm:hidden p-2 rounded-xl transition-colors hover:bg-purple-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-purple-700" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            {/* Clay logo blob */}
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#8b5cf6,#ec4899)",
                boxShadow: "0 4px 0px #6d28d9, 0 6px 14px rgba(109,40,217,0.35)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-xl font-black tracking-tight hidden sm:block"
              style={{ color: "#5b21b6" }}
            >
              MicroSocial
            </span>
          </Link>
        </div>

        {/* Right — user avatar + logout */}
        {user && (
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 group"
              title={user.username}
            >
              {/* Clay avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black"
                style={{
                  background: "linear-gradient(135deg,#8b5cf6,#c026d3)",
                  boxShadow: "0 3px 0px #6d28d9",
                }}
              >
                {initials}
              </div>
              <span className="hidden md:block text-sm font-bold text-purple-900">
                {user.username}
              </span>
            </Link>

            <button
              id="logout-btn"
              onClick={handleLogout}
              title="Logout"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: "rgba(244,114,182,0.12)",
                border: "2px solid rgba(244,114,182,0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(244,114,182,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(244,114,182,0.12)";
              }}
            >
              <LogOut className="w-4 h-4 text-pink-500" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
