import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Admin from "./Admin";

const mockTransactions = [
  {
    id: 1,
    customerId: 1,
    name: "Alice Smith",
    date: "2024-10-15",
    amount: 150.0,
    isManual: true,
  },
  {
    id: 2,
    customerId: 2,
    name: "Bob Johnson",
    date: "2024-10-10",
    amount: 200.0,
    isManual: true,
  },
];

const mockUniqueCustomers = [
  { customerId: 1, name: "Alice Smith", transactionCount: 1 },
  { customerId: 2, name: "Bob Johnson", transactionCount: 1 },
];

const mockHandlers = {
  onAddTransaction: jest.fn(),
  onUpdateTransaction: jest.fn(),
  onDeleteTransaction: jest.fn(),
};

function renderAdmin(
  transactions = mockTransactions,
  uniqueCustomers = mockUniqueCustomers,
) {
  return render(
    <Admin
      transactions={transactions}
      uniqueCustomers={uniqueCustomers}
      onAddTransaction={mockHandlers.onAddTransaction}
      onUpdateTransaction={mockHandlers.onUpdateTransaction}
      onDeleteTransaction={mockHandlers.onDeleteTransaction}
    />,
  );
}

describe("Admin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("form rendering", () => {
    it("renders the add transaction form", () => {
      renderAdmin();
      expect(screen.getByText("Add New Transaction")).toBeInTheDocument();
      expect(screen.getByLabelText("Customer Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Transaction Date")).toBeInTheDocument();
      expect(screen.getByLabelText("Amount ($)")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Transaction" }),
      ).toBeInTheDocument();
    });

    it("does not render a Customer ID input field", () => {
      renderAdmin();
      expect(screen.queryByLabelText("Customer ID")).not.toBeInTheDocument();
    });

    it("renders the manual transactions list with count", () => {
      renderAdmin();
      expect(
        screen.getByText("Manually Added Transactions (2)"),
      ).toBeInTheDocument();
    });

    it("shows empty state when no manual transactions exist", () => {
      renderAdmin([], []);
      expect(
        screen.getByText("Manually Added Transactions (0)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/No manual transactions yet/),
      ).toBeInTheDocument();
    });

    it("renders manual transaction rows with details", () => {
      renderAdmin();
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      expect(screen.getByText("$150.00")).toBeInTheDocument();
      expect(screen.getByText("$200.00")).toBeInTheDocument();
    });
  });

  describe("adding transactions", () => {
    it("calls onAddTransaction with form data and auto-generated customerId for new customer", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Charlie Brown");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "175.50");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(mockHandlers.onAddTransaction).toHaveBeenCalledWith({
        customerId: 3, // max existing is 2, so new customer gets 3
        name: "Charlie Brown",
        date: "2024-11-20",
        amount: 175.5,
      });
    });

    it("uses existing customerId when adding transaction for existing customer", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Alice Smith");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(mockHandlers.onAddTransaction).toHaveBeenCalledWith({
        customerId: 1, // Alice Smith's existing customerId
        name: "Alice Smith",
        date: "2024-11-20",
        amount: 100,
      });
    });

    it("matches existing customer name case-insensitively", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "alice smith");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(mockHandlers.onAddTransaction).toHaveBeenCalledWith({
        customerId: 1,
        name: "alice smith",
        date: "2024-11-20",
        amount: 100,
      });
    });

    it("clears the form after successful submission", () => {
      renderAdmin();

      const nameInput = screen.getByLabelText("Customer Name");

      userEvent.type(nameInput, "Charlie Brown");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "175.50");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(nameInput).toHaveValue("");
    });

    it("shows points preview when amount is entered", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Amount ($)"), "150");

      expect(screen.getByText(/Points Preview/)).toBeInTheDocument();
      expect(screen.getByText(/150 points/)).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("shows error when name is missing", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(mockHandlers.onAddTransaction).not.toHaveBeenCalled();
    });

    it("shows error when date is missing", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Test");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(screen.getByText("Date is required")).toBeInTheDocument();
      expect(mockHandlers.onAddTransaction).not.toHaveBeenCalled();
    });

    it("shows error when amount is invalid", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Test");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "-50");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(
        screen.getByText("Valid positive amount is required"),
      ).toBeInTheDocument();
      expect(mockHandlers.onAddTransaction).not.toHaveBeenCalled();
    });
  });

  describe("editing transactions", () => {
    it("populates form when Edit button is clicked", () => {
      renderAdmin();

      const row = screen.getByText("Alice Smith").closest("tr");
      userEvent.click(
        within(row).getByRole("button", { name: /Edit transaction 1/ }),
      );

      expect(screen.getByLabelText("Customer Name")).toHaveValue("Alice Smith");
      expect(screen.getByLabelText("Amount ($)")).toHaveValue(150);
      expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Update Transaction" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
    });

    it("calls onUpdateTransaction when form is submitted in edit mode", () => {
      renderAdmin();

      const row = screen.getByText("Alice Smith").closest("tr");
      userEvent.click(
        within(row).getByRole("button", { name: /Edit transaction 1/ }),
      );

      const amountInput = screen.getByLabelText("Amount ($)");
      userEvent.clear(amountInput);
      userEvent.type(amountInput, "300");

      userEvent.click(
        screen.getByRole("button", { name: "Update Transaction" }),
      );

      expect(mockHandlers.onUpdateTransaction).toHaveBeenCalledWith(1, {
        customerId: 1,
        name: "Alice Smith",
        date: "2024-10-15",
        amount: 300,
      });
    });

    it("cancels edit mode when Cancel button is clicked", () => {
      renderAdmin();

      const row = screen.getByText("Alice Smith").closest("tr");
      userEvent.click(
        within(row).getByRole("button", { name: /Edit transaction 1/ }),
      );

      expect(screen.getByText("Edit Transaction")).toBeInTheDocument();

      userEvent.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.getByText("Add New Transaction")).toBeInTheDocument();
      expect(screen.getByLabelText("Customer Name")).toHaveValue("");
    });
  });

  describe("deleting transactions", () => {
    it("calls onDeleteTransaction when Delete button is clicked", () => {
      renderAdmin();

      const row = screen.getByText("Alice Smith").closest("tr");
      userEvent.click(
        within(row).getByRole("button", { name: /Delete transaction 1/ }),
      );

      expect(mockHandlers.onDeleteTransaction).toHaveBeenCalledWith(1);
    });

    it("cancels edit mode when the edited transaction is deleted", () => {
      renderAdmin();

      const row = screen.getByText("Alice Smith").closest("tr");
      userEvent.click(
        within(row).getByRole("button", { name: /Edit transaction 1/ }),
      );

      expect(screen.getByText("Edit Transaction")).toBeInTheDocument();

      userEvent.click(
        within(row).getByRole("button", { name: /Delete transaction 1/ }),
      );

      expect(screen.getByText("Add New Transaction")).toBeInTheDocument();
      expect(mockHandlers.onDeleteTransaction).toHaveBeenCalledWith(1);
    });
  });

  describe("transactions display", () => {
    it("sorts transactions by date descending", () => {
      renderAdmin();

      const rows = screen.getAllByRole("row");
      // Header is row[0], data rows start at [1]
      // 2024-10-15 (Alice) should come before 2024-10-10 (Bob) when sorted desc
      expect(within(rows[1]).getByText("Alice Smith")).toBeInTheDocument();
      expect(within(rows[2]).getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("displays calculated points for each transaction", () => {
      renderAdmin();

      // $150 = 50 + 100 = 150 points (50 from $50-$100 tier, 100 from $100+ tier)
      // $200 = 50 + 200 = 250 points
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("250")).toBeInTheDocument();
    });

    it("only shows manual transactions in the table", () => {
      const mixedTransactions = [
        {
          id: 1,
          customerId: 1,
          name: "Manual User",
          date: "2024-10-15",
          amount: 100.0,
          isManual: true,
        },
        {
          id: 2,
          customerId: 2,
          name: "API User",
          date: "2024-10-10",
          amount: 200.0,
        },
      ];

      renderAdmin(mixedTransactions);

      expect(
        screen.getByText("Manually Added Transactions (1)"),
      ).toBeInTheDocument();
      expect(screen.getByText("Manual User")).toBeInTheDocument();
      expect(screen.queryByText("API User")).not.toBeInTheDocument();
    });
  });

  describe("customer ID generation", () => {
    it("generates customerId as 1 when no transactions exist", () => {
      renderAdmin([], []);

      userEvent.type(screen.getByLabelText("Customer Name"), "First Customer");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      userEvent.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(mockHandlers.onAddTransaction).toHaveBeenCalledWith({
        customerId: 1,
        name: "First Customer",
        date: "2024-11-20",
        amount: 100,
      });
    });
  });

  describe("confirmation summary", () => {
    it("shows new customer confirmation when all fields filled with new name", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Charlie Brown");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      expect(
        screen.getByText(/This will create a new customer:/),
      ).toBeInTheDocument();
      expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    });

    it("shows existing customer confirmation when selecting existing customer", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Alice Smith");
      userEvent.type(screen.getByLabelText("Transaction Date"), "2024-11-20");
      userEvent.type(screen.getByLabelText("Amount ($)"), "100");

      // Confirmation summary should show the customer name
      expect(screen.getByText(/Adding transaction for:/)).toBeInTheDocument();
    });

    it("does not show confirmation summary when form is incomplete", () => {
      renderAdmin();

      userEvent.type(screen.getByLabelText("Customer Name"), "Charlie Brown");
      // Missing date and amount

      expect(
        screen.queryByText(/This will create a new customer:/),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Adding transaction for:/),
      ).not.toBeInTheDocument();
    });

    it("does not show confirmation summary in edit mode", () => {
      renderAdmin();

      const row = screen.getByText("Alice Smith").closest("tr");
      userEvent.click(
        within(row).getByRole("button", { name: /Edit transaction 1/ }),
      );

      // Form is populated but should not show confirmation in edit mode
      expect(
        screen.queryByText(/This will create a new customer:/),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Adding transaction for:/),
      ).not.toBeInTheDocument();
    });
  });
});
