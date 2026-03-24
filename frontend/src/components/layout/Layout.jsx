import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuToggle={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="p-4 sm:ml-64 pt-24 min-h-screen">
        <main className="max-w-4xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
