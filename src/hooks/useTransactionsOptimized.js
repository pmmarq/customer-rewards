import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchTransactions } from '../services/api';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = 'customer_transactions_cache';

/**
 * Optimized hook with caching and state management
 * Prevents unnecessary re-fetches and provides stable references
 */
export function useTransactionsOptimized() {
  const [state, setState] = useState({
    transactions: [],
    loading: true,
    error: null,
    lastFetched: null
  });

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Use cache if valid
        if (now - timestamp < CACHE_DURATION && data.length > 0) {
          setState(prev => ({
            ...prev,
            transactions: data,
            loading: false,
            lastFetched: timestamp
          }));
          return;
        }
      } catch (error) {
        console.warn('Failed to parse cached transactions:', error);
      }
    }
    
    // Fetch fresh data
    loadTransactions();
  }, []);

  const loadTransactions = useCallback(async (forceRefresh = false) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await fetchTransactions();
      
      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      setState(prev => ({
        ...prev,
        transactions: data,
        loading: false,
        lastFetched: Date.now()
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.message,
        loading: false
      }));
    }
  }, []);

  // Memoized transaction array for stable reference
  const memoizedTransactions = useMemo(() => state.transactions, [state.transactions]);

  // Stable reference check function
  const hasDataChanged = useCallback((newTransactions) => {
    return JSON.stringify(state.transactions) !== JSON.stringify(newTransactions);
  }, [state.transactions]);

  return {
    transactions: memoizedTransactions,
    loading: state.loading,
    error: state.error,
    lastFetched: state.lastFetched,
    refetch: () => loadTransactions(true),
    hasDataChanged
  };
}