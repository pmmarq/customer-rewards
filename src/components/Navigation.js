import { memo } from "react";
import { NavLink } from "react-router-dom";

function Navigation() {
  const tabs = [
    { name: "Rewards", path: "/" },
    { name: "Analytics", path: "/analytics" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <nav className="flex justify-center gap-1 mt-6">
      {tabs.map((tab) => (
        <NavLink
          key={tab.name}
          to={tab.path}
          className={({ isActive }) =>
            `px-5 py-2 text-sm font-semibold rounded-full transition-colors ${isActive
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-indigo-200 hover:text-white hover:bg-white/10"
            }`
          }
        >
          {tab.name}
        </NavLink>
      ))}
    </nav>
  );
}

export default memo(Navigation);
