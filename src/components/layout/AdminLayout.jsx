import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} />

      <div
        className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300
        ${sidebarOpen ? "ml-64" : "ml-20"}`}
      >
        <Header toggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
