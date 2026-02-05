import { computeAnalytics } from './computeAnalytics';

const mockTransactions = [
  { id: 1, customerId: 1, name: 'Alice Johnson', date: '2024-10-05', amount: 120.0 },
  { id: 2, customerId: 1, name: 'Alice Johnson', date: '2024-11-02', amount: 75.0 },
  { id: 3, customerId: 2, name: 'Bob Smith',     date: '2024-10-12', amount: 200.0 },
  { id: 4, customerId: 2, name: 'Bob Smith',     date: '2024-12-20', amount: 50.0 },
];

describe('computeAnalytics', () => {
  it('returns zeroed metrics for an empty array', () => {
    const result = computeAnalytics([]);
    expect(result.totalCustomers).toBe(0);
    expect(result.totalTransactions).toBe(0);
    expect(result.totalPoints).toBe(0);
    expect(result.averagePurchase).toBe(0);
    expect(result.highestSpender).toBeNull();
    expect(result.monthlyTrends).toEqual([]);
    expect(result.topCustomers).toEqual([]);
  });

  it('returns zeroed metrics for null input', () => {
    const result = computeAnalytics(null);
    expect(result.totalCustomers).toBe(0);
    expect(result.totalTransactions).toBe(0);
  });

  it('computes the correct number of unique customers', () => {
    const result = computeAnalytics(mockTransactions);
    expect(result.totalCustomers).toBe(2);
  });

  it('computes the correct total transaction count', () => {
    const result = computeAnalytics(mockTransactions);
    expect(result.totalTransactions).toBe(4);
  });

  it('computes the correct total points', () => {
    // Alice: $120 -> 90, $75 -> 25 = 115
    // Bob:   $200 -> 250, $50 -> 0 = 250
    // Total: 365
    const result = computeAnalytics(mockTransactions);
    expect(result.totalPoints).toBe(365);
  });

  it('computes the correct average purchase amount', () => {
    // (120 + 75 + 200 + 50) / 4 = 111.25
    const result = computeAnalytics(mockTransactions);
    expect(result.averagePurchase).toBeCloseTo(111.25);
  });

  it('computes the correct total spent', () => {
    const result = computeAnalytics(mockTransactions);
    expect(result.totalSpent).toBeCloseTo(445.0);
  });

  it('identifies the highest spender by total points', () => {
    const result = computeAnalytics(mockTransactions);
    expect(result.highestSpender.name).toBe('Bob Smith');
    expect(result.highestSpender.totalPoints).toBe(250);
  });

  it('returns monthly trends sorted chronologically', () => {
    const result = computeAnalytics(mockTransactions);
    expect(result.monthlyTrends).toHaveLength(3);
    expect(result.monthlyTrends[0].month).toMatch(/October 2024/);
    expect(result.monthlyTrends[1].month).toMatch(/November 2024/);
    expect(result.monthlyTrends[2].month).toMatch(/December 2024/);
  });

  it('returns top customers sorted by total points descending', () => {
    const result = computeAnalytics(mockTransactions);
    expect(result.topCustomers[0].name).toBe('Bob Smith');
    expect(result.topCustomers[1].name).toBe('Alice Johnson');
  });

  it('tracks per-customer transaction counts correctly', () => {
    const result = computeAnalytics(mockTransactions);
    const bob = result.topCustomers.find((c) => c.name === 'Bob Smith');
    expect(bob.transactionCount).toBe(2);
    expect(bob.totalSpent).toBeCloseTo(250.0);
  });
});
