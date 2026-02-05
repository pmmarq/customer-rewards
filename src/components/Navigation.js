import React from 'react';

function Navigation({ activeTab, onTabChange }) {
  const tabs = ['Rewards', 'Analytics'];

  return (
    <nav className="flex justify-center gap-1 mt-6" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onTabChange(tab)}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
            activeTab === tab
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-indigo-200 hover:text-white hover:bg-white/10'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

export default Navigation;
