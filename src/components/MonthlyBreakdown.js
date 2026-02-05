import React from 'react';

/**
 * Renders a table of transactions for a single month,
 * showing date, amount, and points earned per transaction,
 * plus a monthly subtotal.
 */
function MonthlyBreakdown({ month, transactions, monthlyPoints }) {
  return (
    <div className="monthly-breakdown">
      <h3>
        {month} &mdash; <span className="month-points">{monthlyPoints} pts</span>
      </h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>{new Date(txn.date).toLocaleDateString()}</td>
              <td>${txn.amount.toFixed(2)}</td>
              <td>{txn.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MonthlyBreakdown;
