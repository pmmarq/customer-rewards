import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { calculatePoints } from '../utils/calculatePoints';
import CustomerRewards from './CustomerRewards';

// Memoized comparison function
const areEqual = (prev, next) => {
  if (prev.length !== next.length) return false;
  
  for (let i = 0; i < prev.length; i++) {
    const prevTxn = prev[i];
    const nextTxn = next[i];
    
    if (prevTxn.id !== nextTxn.id ||
        prevTxn.customerId !== nextTxn.customerId ||
        prevTxn.name !== nextTxn.name ||
        prevTxn.date !== nextTxn.date ||
        prevTxn.amount !== nextTxn.amount) {
      return false;
    }
  }
  
  return true;
};

/**
 * Optimized RewardsSummary with memoization and efficient data processing
 * Prevents unnecessary recalculations and re-renders
 */
function RewardsSummaryOptimized({ transactions }) {
  const customerData = useMemo(() => {
    // Early return for empty data
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const grouped = {};
    
    // Single pass through transactions
    for (let i = 0; i < transactions.length; i++) {
      const txn = transactions[i];
      const { customerId, name, date, amount } = txn;

      // Initialize customer if not exists
      if (!grouped[customerId]) {
        grouped[customerId] = { name, months: {} };
      }

      // Cache month calculation
      const month = new Date(date).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      // Initialize month if not exists
      if (!grouped[customerId].months[month]) {
        grouped[customerId].months[month] = { transactions: [], points: 0 };
      }

      // Calculate points once
      const points = calculatePoints(amount);

      // Add transaction and update points
      grouped[customerId].months[month].transactions.push({
        ...txn,
        points,
      });
      grouped[customerId].months[month].points += points;
    }

    // Convert to array format
    const result = [];
    for (const [customerId, data] of Object.entries(grouped)) {
      let totalPoints = 0;
      
      // Efficient total calculation
      for (const month of Object.values(data.months)) {
        totalPoints += month.points;
      }

      result.push({
        customerId: Number(customerId),
        name: data.name,
        months: data.months,
        totalPoints,
      });
    }

    return result;
  }, [transactions]);

  return (
    <div className="space-y-4">
      {customerData.map((customer) => (
        <CustomerRewardsOptimized key={customer.customerId} customer={customer} />
      ))}
    </div>
  );
}

// Memoized CustomerRewards component
const CustomerRewardsOptimized = memo(CustomerRewards, (prevProps, nextProps) => {
  // Compare customer objects efficiently
  return prevProps.customer.customerId === nextProps.customer.customerId &&
         prevProps.customer.totalPoints === nextProps.customer.totalPoints;
});

RewardsSummaryOptimized.propTypes = {
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

export default RewardsSummaryOptimized;