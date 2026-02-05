import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RewardsSummary from "./RewardsSummary";

const mockTransactions = [
  {
    id: 1,
    customerId: 1,
    name: "Alice Johnson",
    date: "2024-10-05",
    amount: 120.0,
  },
  {
    id: 2,
    customerId: 1,
    name: "Alice Johnson",
    date: "2024-11-02",
    amount: 75.0,
  },
  {
    id: 3,
    customerId: 2,
    name: "Bob Smith",
    date: "2024-10-12",
    amount: 200.0,
  },
  { id: 4, customerId: 2, name: "Bob Smith", date: "2024-12-20", amount: 50.0 },
];

describe("RewardsSummary", () => {
  it("renders a card for each unique customer", () => {
    render(<RewardsSummary transactions={mockTransactions} />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("computes the correct total points per customer", () => {
    // Alice: $120 → 90 pts, $75 → 25 pts  → total 115
    // Bob:   $200 → 250 pts, $50 → 0 pts  → total 250
    render(<RewardsSummary transactions={mockTransactions} />);

    expect(screen.getByText("115 pts")).toBeInTheDocument();
    expect(screen.getByText("250 pts")).toBeInTheDocument();
  });

  it("groups transactions by month within each customer", () => {
    render(<RewardsSummary transactions={mockTransactions} />);

    // Expand Alice's card
    userEvent.click(screen.getByText("Alice Johnson"));

    expect(screen.getByText(/October 2024/)).toBeInTheDocument();
    expect(screen.getByText(/November 2024/)).toBeInTheDocument();
  });

  it("renders no customer cards when given an empty transaction list", () => {
    render(<RewardsSummary transactions={[]} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
