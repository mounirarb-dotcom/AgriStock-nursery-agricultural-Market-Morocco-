import React from 'react';
import { NavTabItem } from './NavbarTypes';

interface NavbarDesktopTabsProps {
  tabs: NavTabItem[];
}

export const NavbarDesktopTabs: React.FC<NavbarDesktopTabsProps> = ({ tabs }) => {
  return (
    <nav
      className="hidden lg:flex items-center gap-1 bg-[#091510] p-1 rounded-xl border border-[#1b3b2c] shadow-inner"
      aria-label="Navigation principale"
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          id={`nav-tab-${tab.id}`}
          onClick={tab.onClick}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
            tab.isActive
              ? 'bg-emerald-700 text-white shadow-xs ring-1 ring-emerald-500/40 font-bold'
              : 'text-stone-300 hover:text-white hover:bg-[#162f23]'
          }`}
        >
          <span className="shrink-0">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};
