import transactions from "../data/transactions";

/**
 * Simulate an asynchronous API call that returns the transaction data
 * after a short delay, mimicking a real network request.
 *
 * @returns {Promise<Array>} Resolves with the full list of transactions.
 */
export function fetchTransactions() {
  return new Promise((resolve) => {
    const delay = Math.random() * 3000;
    setTimeout(() => {
      resolve(transactions);
    }, delay);
  });
}
