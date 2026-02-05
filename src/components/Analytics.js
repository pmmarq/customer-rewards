import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { computeAnalytics } from "../utils/computeAnalytics";
import SalesChart from "./SalesChart";
import SortableTable from "./SortableTable";

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
    [transactions],
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
        <StatCard
          label="Avg Purchase"
          value={`$${averagePurchase.toFixed(2)}`}
        />
      </div>

      {/* Highest Spender Callout */}
      {highestSpender && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
          <p className="text-sm font-medium text-slate-500">Highest Spender</p>
          <p className="text-xl font-bold text-indigo-700 mt-1">
            {highestSpender.name}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {highestSpender.totalPoints.toLocaleString()} points from{" "}
            {highestSpender.transactionCount} transactions ($
            {highestSpender.totalSpent.toFixed(2)} total)
          </p>
        </div>
      )}

      {/* Sales Over Time Chart */}
      <SalesChart monthlyTrends={monthlyTrends} />

      {/* Monthly Trends Table */}
      <SortableTable
        title="Monthly Trends"
        data={monthlyTrends}
        rowKey={(row) => row.month}
        defaultSortKey="sortKey"
        defaultSortDir="asc"
        columns={[
          {
            key: "month",
            label: "Month",
            sortable: false,
            cellClass: "text-slate-700 font-medium",
          },
          {
            key: "sortKey",
            label: "Month",
            sortable: true,
            cellClass: "hidden",
            render: () => null,
          },
          { key: "transactionCount", label: "Transactions" },
          {
            key: "totalSpent",
            label: "Total Spent",
            render: (row) => `$${row.totalSpent.toFixed(2)}`,
          },
          {
            key: "totalPoints",
            label: "Points",
            align: "right",
            cellClass: "text-right font-semibold text-indigo-600",
          },
        ].filter((col) => col.key !== "sortKey")}
      />

      {/* Top Customers Table */}
      <SortableTable
        title="Top Customers"
        data={topCustomers}
        rowKey={(row) => row.customerId}
        defaultSortKey="totalPoints"
        defaultSortDir="desc"
        columns={[
          {
            key: "name",
            label: "Customer",
            cellClass: "text-slate-700 font-medium",
          },
          { key: "transactionCount", label: "Transactions" },
          {
            key: "totalSpent",
            label: "Total Spent",
            render: (row) => `$${row.totalSpent.toFixed(2)}`,
          },
          {
            key: "totalPoints",
            label: "Points",
            align: "right",
            cellClass: "text-right font-semibold text-indigo-600",
          },
        ]}
      />
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

Analytics.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      customerId: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired
    })
  ).isRequired
};

export default Analytics;
