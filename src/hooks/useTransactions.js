import { useState, useEffect } from 'react';
import { fetchTransactions } from '../services/api';

/**
 * Custom hook that fetches transaction data from the simulated API.
 * Manages loading, error, and data states internally.
 *
 * @returns {{ transactions: Array, loading: boolean, error: string|null }}
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchTransactions()
      .then((data) => {
        if (!cancelled) {
          setTransactions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { transactions, loading, error };
}
