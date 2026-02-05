import React, { useState, useCallback } from 'react';
import MonthlyBreakdown from './MonthlyBreakdown';

/**
 * Displays a single customer's reward summary with an
 * expandable section showing the monthly breakdown.
 */
function CustomerRewards({ customer }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className="customer-card">
      <div className="customer-header" onClick={toggle} role="button" tabIndex={0}>
        <h2>{customer.name}</h2>
        <span className="total-points">
          Total: <strong>{customer.totalPoints}</strong> pts
        </span>
        <span className="toggle-icon">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="customer-details">
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
