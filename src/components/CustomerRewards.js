import React, { useState, useCallback } from "react";
import MonthlyBreakdown from "./MonthlyBreakdown";

function CustomerRewards({ customer }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
      <div
        className="flex items-center px-5 py-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={toggle}
        role="button"
        tabIndex={0}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-slate-800 truncate">
            {customer.name}
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full mr-3">
          {customer.totalPoints} pts
        </span>
        <span
          className="text-slate-400 text-xs transition-transform duration-200"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/50">
          {Object.entries(customer.months).map(([month, data]) => (
            <MonthlyBreakdown
              key={month}
              month={month}
              transactions={data.transactions}
              monthlyPoints={data.points}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerRewards;
