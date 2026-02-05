import React, { useMemo } from 'react';
import { computeAnalytics } from '../utils/computeAnalytics';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function Analytics({ transactions }) {
  const analytics = useMemo(
    () => computeAnalytics(transactions),
    [transactions]
  );

  const {
    totalCustomers,
    totalTransactions,
    totalPoints,
    averagePurchase,
    highestSpender,
    monthlyTrends,
    topCustomers,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={totalCustomers} />
        <StatCard label="Total Transactions" value={totalTransactions} />
        <StatCard label="Total Points" value={totalPoints.toLocaleString()} />
        <StatCard label="Avg Purchase" value={`$${averagePurchase.toFixed(2)}`} />
      </div>

      {/* Highest Spender Callout */}
      {highestSpender && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
          <p className="text-sm font-medium text-slate-500">Highest Spender</p>
          <p className="text-xl font-bold text-indigo-700 mt-1">
            {highestSpender.name}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {highestSpender.totalPoints.toLocaleString()} points from{' '}
            {highestSpender.transactionCount} transactions ($
            {highestSpender.totalSpent.toFixed(2)} total)
          </p>
        </div>
      )}

      {/* Monthly Trends Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Monthly Trends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wider">
                <th className="text-left px-4 py-2.5 font-semibold">Month</th>
                <th className="text-left px-4 py-2.5 font-semibold">Transactions</th>
                <th className="text-left px-4 py-2.5 font-semibold">Total Spent</th>
                <th className="text-right px-4 py-2.5 font-semibold">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyTrends.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{row.month}</td>
                  <td className="px-4 py-2.5 text-slate-700">{row.transactionCount}</td>
                  <td className="px-4 py-2.5 text-slate-700">${row.totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">
                    {row.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Top Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wider">
                <th className="text-left px-4 py-2.5 font-semibold">Rank</th>
                <th className="text-left px-4 py-2.5 font-semibold">Customer</th>
                <th className="text-left px-4 py-2.5 font-semibold">Transactions</th>
                <th className="text-left px-4 py-2.5 font-semibold">Total Spent</th>
                <th className="text-right px-4 py-2.5 font-semibold">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCustomers.map((customer, index) => (
                <tr key={customer.customerId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-500 font-medium">#{index + 1}</td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium">{customer.name}</td>
                  <td className="px-4 py-2.5 text-slate-700">{customer.transactionCount}</td>
                  <td className="px-4 py-2.5 text-slate-700">${customer.totalSpent.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-indigo-600">
                    {customer.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
