import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, User, Settings } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <li>
    <Link
      to={to}
      className={cn(
        "flex items-center p-3 text-gray-900 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-indigo-50 text-indigo-700 scale-[1.02] shadow-sm" 
          : "hover:bg-gray-50 text-gray-600"
      )}
    >
      <Icon className={cn(
        "w-5 h-5 transition duration-75",
        active ? "text-indigo-700" : "text-gray-500 group-hover:text-indigo-600"
      )} />
      <span className="ml-3 font-medium">{label}</span>
    </Link>
  </li>
);

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200 sm:translate-x-0",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="h-full px-4 py-4 overflow-y-auto bg-white">
        <ul className="space-y-2 font-medium">
          <SidebarLink
            to="/"
            icon={Home}
            label="Home"
            active={location.pathname === "/"}
          />
          <SidebarLink
            to="/search"
            icon={Search}
            label="Search"
            active={location.pathname === "/search"}
          />
          <SidebarLink
            to="/create"
            icon={PlusSquare}
            label="Create"
            active={location.pathname === "/create"}
          />
          <SidebarLink
            to="/profile"
            icon={User}
            label="Profile"
            active={location.pathname === "/profile"}
          />
        </ul>
        
        <div className="mt-8 pt-8 border-t border-gray-100">
          <ul className="space-y-2">
            <SidebarLink
              to="/settings"
              icon={Settings}
              label="Settings"
              active={location.pathname === "/settings"}
            />
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
