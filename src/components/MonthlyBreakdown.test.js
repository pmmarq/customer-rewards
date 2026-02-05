import { render, screen } from '@testing-library/react';
import MonthlyBreakdown from './MonthlyBreakdown';

const mockTransactions = [
  { id: 1, date: '2024-10-05', amount: 120.0, points: 90 },
  { id: 2, date: '2024-10-18', amount: 75.5, points: 25 },
];

describe('MonthlyBreakdown', () => {
  beforeEach(() => {
    render(
      <MonthlyBreakdown
        month="October 2024"
        transactions={mockTransactions}
        monthlyPoints={115}
      />
    );
  });

  it('renders the month name and monthly point total', () => {
    expect(screen.getByText(/October 2024/)).toBeInTheDocument();
    expect(screen.getByText('115 pts')).toBeInTheDocument();
  });

  it('renders table column headers', () => {
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Points')).toBeInTheDocument();
  });

  it('renders a row for each transaction', () => {
    const rows = screen.getAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
  });

  it('displays formatted amounts with dollar sign', () => {
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByText('$75.50')).toBeInTheDocument();
  });

  it('displays the correct points per transaction', () => {
    expect(screen.getByText('90')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });
});
