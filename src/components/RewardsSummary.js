import React, { useMemo } from 'react';
import { calculatePoints } from '../utils/calculatePoints';
import CustomerRewards from './CustomerRewards';

/**
 * Top-level component that takes raw transactions,
 * groups them by customer, computes per-month and total points,
 * and renders a CustomerRewards card for each customer.
 */
function RewardsSummary({ transactions }) {
  const customerData = useMemo(() => {
    const grouped = {};

    transactions.forEach((txn) => {
      const { customerId, name, date, amount } = txn;

      if (!grouped[customerId]) {
        grouped[customerId] = { name, months: {} };
      }

      const month = new Date(date).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      if (!grouped[customerId].months[month]) {
        grouped[customerId].months[month] = { transactions: [], points: 0 };
      }

      const points = calculatePoints(amount);

      grouped[customerId].months[month].transactions.push({
        ...txn,
        points,
      });
      grouped[customerId].months[month].points += points;
    });

    return Object.entries(grouped).map(([customerId, data]) => {
      const totalPoints = Object.values(data.months).reduce(
        (sum, m) => sum + m.points,
        0
      );

      return {
        customerId: Number(customerId),
        name: data.name,
        months: data.months,
        totalPoints,
      };
    });
  }, [transactions]);

  return (
    <div className="rewards-summary">
      {customerData.map((customer) => (
        <CustomerRewards key={customer.customerId} customer={customer} />
      ))}
    </div>
  );
}

export default RewardsSummary;
