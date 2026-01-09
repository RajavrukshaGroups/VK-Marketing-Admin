import { FiMenu, FiLogOut } from "react-icons/fi";
import { logoutAdmin } from "../../utils/auth";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
      {/* Hamburger (ALL screens) */}
      <button
        onClick={toggleSidebar}
        className="text-gray-600 hover:text-gray-900 transition"
      >
        <FiMenu size={22} />
      </button>

      {/* Right actions */}
      <button
        onClick={logoutAdmin}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition"
      >
        <FiLogOut size={16} />
        Logout
      </button>
    </header>
  );
};

export default Header;
