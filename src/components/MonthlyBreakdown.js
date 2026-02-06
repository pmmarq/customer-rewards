import React from "react";
import PropTypes from "prop-types";

function MonthlyBreakdown({ month, transactions, monthlyPoints }) {
  return (
    <div className="mt-5 first:mt-4">
      <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
        {month}
        <span className="text-indigo-600 font-bold">{monthlyPoints} pts</span>
      </h3>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wider">
              <th className="text-left px-4 py-2.5 font-semibold">Date</th>
              <th className="text-left px-4 py-2.5 font-semibold">Amount</th>
              <th className="text-right px-4 py-2.5 font-semibold">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-white transition-colors">
                <td className="px-4 py-2.5 text-slate-700">
                  {new Date(txn.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 text-slate-700 font-medium">
                  ${txn.amount.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">
                  {txn.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

MonthlyBreakdown.propTypes = {
  month: PropTypes.string.isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    }),
  ).isRequired,
  monthlyPoints: PropTypes.number.isRequired,
};

export default React.memo(MonthlyBreakdown);
