import { renderHook, waitFor } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import * as api from '../services/api';

// Mock the API module so we control timing and responses
jest.mock('../services/api');

describe('useTransactions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts in a loading state with an empty transactions array', () => {
    api.fetchTransactions.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useTransactions());

    expect(result.current.loading).toBe(true);
    expect(result.current.transactions).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns transactions and sets loading to false on success', async () => {
    const mockData = [{ id: 1, amount: 120 }];
    api.fetchTransactions.mockResolvedValue(mockData);

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('sets an error message when the API call fails', async () => {
    api.fetchTransactions.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.transactions).toEqual([]);
  });
});
