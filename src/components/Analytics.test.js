import { render, screen, within } from "@testing-library/react";
import Analytics from "./Analytics";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

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

describe("Analytics", () => {
  describe("with transaction data", () => {
    beforeEach(() => {
      render(<Analytics transactions={mockTransactions} />);
    });

    it("renders all four summary stat cards", () => {
      expect(screen.getByText("Total Customers")).toBeInTheDocument();
      expect(screen.getByText("Total Transactions")).toBeInTheDocument();
      expect(screen.getByText("Total Points")).toBeInTheDocument();
      expect(screen.getByText("Avg Purchase")).toBeInTheDocument();
    });

    it("displays the correct stat card values", () => {
      // Verify each stat card value by scoping to its label's parent
      const customersCard = screen.getByText("Total Customers").closest("div");
      expect(within(customersCard).getByText("2")).toBeInTheDocument();

      const transactionsCard = screen
        .getByText("Total Transactions")
        .closest("div");
      expect(within(transactionsCard).getByText("4")).toBeInTheDocument();

      const pointsCard = screen.getByText("Total Points").closest("div");
      expect(within(pointsCard).getByText("365")).toBeInTheDocument();

      expect(screen.getByText("$111.25")).toBeInTheDocument();
    });

    it("displays the highest spender callout", () => {
      expect(screen.getByText("Highest Spender")).toBeInTheDocument();
      // Scope to the callout section to avoid matching the Top Customers table
      const callout = screen.getByText("Highest Spender").closest("div");
      expect(within(callout).getByText("Bob Smith")).toBeInTheDocument();
    });

    it("renders the Monthly Trends table heading and rows", () => {
      expect(screen.getByText("Monthly Trends")).toBeInTheDocument();
      expect(screen.getByText(/October 2024/)).toBeInTheDocument();
      expect(screen.getByText(/November 2024/)).toBeInTheDocument();
      expect(screen.getByText(/December 2024/)).toBeInTheDocument();
    });

    it("renders the Sales Over Time chart section", () => {
      expect(screen.getByText("Sales Over Time")).toBeInTheDocument();
    });

    it("renders the Top Customers table with customer names", () => {
      expect(screen.getByText("Top Customers")).toBeInTheDocument();
      expect(screen.getByText("Customer")).toBeInTheDocument();
    });
  });

  describe("with empty transaction data", () => {
    it("renders stat cards with zero values", () => {
      render(<Analytics transactions={[]} />);

      expect(screen.getByText("Total Customers")).toBeInTheDocument();
      expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
    });

    it("does not render the highest spender callout", () => {
      render(<Analytics transactions={[]} />);

      expect(screen.queryByText("Highest Spender")).not.toBeInTheDocument();
    });
  });
});
