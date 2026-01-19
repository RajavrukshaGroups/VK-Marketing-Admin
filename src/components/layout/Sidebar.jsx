import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiSettings,
  FiGrid,
  FiAward,
  FiUploadCloud,
} from "react-icons/fi";

const Sidebar = ({ isOpen }) => {
  const linkClasses = ({ isActive }) =>
    `group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
     transition-all duration-300
     ${
       isActive
         ? "bg-blue-600 text-white shadow"
         : "text-gray-300 hover:bg-gray-800 hover:text-white"
     }`;

  const navItems = [
    { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/admin/category", icon: FiGrid, label: "Business Category" },
    {
      to: "/admin/membership-types",
      icon: FiAward,
      label: "Membership Plans",
    },
    { to: "/admin/users", icon: FiUsers, label: "Users" },

    { to: "/admin/view-payments", icon: FiCreditCard, label: "Payments" },

    {
      to: "/admin/post-notification",
      icon: FiUploadCloud,
      label: "Notification",
    },

    { to: "/admin/settings", icon: FiSettings, label: "Settings" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-800
      transition-all duration-300 z-40
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-gray-800">
        <span className="text-blue-500 font-bold text-lg transition-all duration-300">
          {isOpen ? "VK ADMIN" : "VK"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClasses}>
            {/* Icon */}
            <Icon
              className={`text-lg shrink-0 transition-all duration-300
                group-hover:scale-110 group-hover:rotate-3
                ${isOpen ? "ml-0" : "mx-auto"}
              `}
            />

            {/* Label (expanded mode) */}
            <span
              className={`whitespace-nowrap transition-all duration-300
                ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                }
              `}
            >
              {label}
            </span>

            {/* 🔔 Tooltip (collapsed mode only) */}
            {!isOpen && (
              <span
                className="pointer-events-none absolute left-full ml-3
                rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white
                opacity-0 scale-95 shadow-lg
                transition-all duration-200
                group-hover:opacity-100 group-hover:scale-100"
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer (only when expanded) */}
      {isOpen && (
        <div className="absolute bottom-0 w-full px-6 py-4 text-xs text-gray-500 border-t border-gray-800 transition-opacity duration-300">
          © {new Date().getFullYear()} VK Marketing
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
