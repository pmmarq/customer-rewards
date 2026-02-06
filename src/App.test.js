import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as api from "./services/api";

jest.mock("./services/api");

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
    customerId: 2,
    name: "Bob Smith",
    date: "2024-10-12",
    amount: 200.0,
  },
];

describe("App", () => {
  beforeEach(() => {
    api.fetchTransactions.mockResolvedValue(mockTransactions);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the app header", async () => {
    render(<App />);
    expect(screen.getByText(/customer rewards program/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("renders Rewards, Analytics, and Admin navigation tabs", async () => {
    render(<App />);
    expect(screen.getByRole("tab", { name: "Rewards" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Admin" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("shows Rewards tab as active by default", async () => {
    render(<App />);
    expect(screen.getByRole("tab", { name: "Rewards" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("shows RewardsSummary content by default after loading", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    });
  });

  it("switches to Analytics view when Analytics tab is clicked", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("tab", { name: "Analytics" }));

    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("Monthly Trends")).toBeInTheDocument();
  });

  it("switches back to Rewards view when Rewards tab is clicked", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("tab", { name: "Analytics" }));
    expect(screen.getByText("Total Customers")).toBeInTheDocument();

    userEvent.click(screen.getByRole("tab", { name: "Rewards" }));
    expect(screen.queryByText("Total Customers")).not.toBeInTheDocument();
    // Rewards-specific content: the points badge
    expect(screen.getByText("90 pts")).toBeInTheDocument();
  });

  it("shows the loading spinner initially", () => {
    api.fetchTransactions.mockReturnValue(new Promise(() => {}));
    render(<App />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading transactions...")).toBeInTheDocument();
  });

  it("displays an error message when the API call fails", async () => {
    api.fetchTransactions.mockRejectedValue(new Error("Network failure"));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Error: Network failure")).toBeInTheDocument();
    });
  });

  it("switches to Admin view when Admin tab is clicked", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("tab", { name: "Admin" }));

    expect(screen.getByText("Add New Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Customer Name")).toBeInTheDocument();
  });
});
