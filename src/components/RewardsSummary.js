import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { calculatePoints } from "../utils/calculatePoints";
import CustomerRewards from "./CustomerRewards";

function RewardsSummary({ transactions }) {
  const customerData = useMemo(() => {
    const grouped = {};

    transactions.forEach((txn) => {
      const { customerId, name, date, amount } = txn;

      if (!grouped[customerId]) {
        grouped[customerId] = { name, months: {} };
      }

      const month = new Date(date).toLocaleString("default", {
        month: "long",
        year: "numeric",
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
        0,
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
    <div className="space-y-4">
      {customerData.map((customer) => (
        <CustomerRewards key={customer.customerId} customer={customer} />
      ))}
    </div>
  );
}

RewardsSummary.propTypes = {
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

export default RewardsSummary;
