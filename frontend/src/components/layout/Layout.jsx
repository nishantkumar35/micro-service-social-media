import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((o) => !o);

  return (
    <div className="min-h-screen">
      <Navbar onMenuToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="sm:ml-64 pt-20 min-h-screen">
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
