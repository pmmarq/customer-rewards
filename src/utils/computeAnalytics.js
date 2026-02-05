import { calculatePoints } from './calculatePoints';

/**
 * Compute high-level analytics metrics from a list of transactions.
 *
 * @param {Array} transactions - Raw transaction array.
 * @returns {Object} Analytics metrics including totals, averages, trends, and rankings.
 */
export function computeAnalytics(transactions) {
  if (!transactions || transactions.length === 0) {
    return {
      totalCustomers: 0,
      totalTransactions: 0,
      totalPoints: 0,
      totalSpent: 0,
      averagePurchase: 0,
      highestSpender: null,
      monthlyTrends: [],
      topCustomers: [],
    };
  }

  const totalTransactions = transactions.length;
  const totalSpent = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  const averagePurchase = totalSpent / totalTransactions;

  const customerMap = {};
  const monthMap = {};

  transactions.forEach((txn) => {
    const points = calculatePoints(txn.amount);

    if (!customerMap[txn.customerId]) {
      customerMap[txn.customerId] = {
        customerId: txn.customerId,
        name: txn.name,
        totalPoints: 0,
        totalSpent: 0,
        transactionCount: 0,
      };
    }
    customerMap[txn.customerId].totalPoints += points;
    customerMap[txn.customerId].totalSpent += txn.amount;
    customerMap[txn.customerId].transactionCount += 1;

    const month = new Date(txn.date).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
    if (!monthMap[month]) {
      monthMap[month] = {
        month,
        sortKey: new Date(txn.date).toISOString().slice(0, 7),
        transactionCount: 0,
        totalSpent: 0,
        totalPoints: 0,
      };
    }
    monthMap[month].transactionCount += 1;
    monthMap[month].totalSpent += txn.amount;
    monthMap[month].totalPoints += points;
  });

  const topCustomers = Object.values(customerMap).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  const totalCustomers = topCustomers.length;
  const totalPoints = topCustomers.reduce((sum, c) => sum + c.totalPoints, 0);
  const highestSpender = topCustomers[0] || null;

  const monthlyTrends = Object.values(monthMap).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey)
  );

  return {
    totalCustomers,
    totalTransactions,
    totalPoints,
    totalSpent,
    averagePurchase,
    highestSpender,
    monthlyTrends,
    topCustomers,
  };
}
