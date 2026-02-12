import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/customer rewards program/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("renders Rewards, Analytics, and Admin navigation links", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Rewards" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("shows Rewards tab as active by default (root path)", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    // aria-current="page" is added by NavLink to the active link
    expect(screen.getByRole("link", { name: "Rewards" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
  });

  it("shows RewardsSummary content by default after loading", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    });
  });

  it("switches to Analytics view when Analytics link is clicked", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("link", { name: "Analytics" }));

    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("Monthly Trends")).toBeInTheDocument();
  });

  it("switches back to Rewards view when Rewards link is clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/analytics"]}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    // Start at Analytics
    expect(screen.getByText("Total Customers")).toBeInTheDocument();

    userEvent.click(screen.getByRole("link", { name: "Rewards" }));
    expect(screen.queryByText("Total Customers")).not.toBeInTheDocument();
    // Rewards-specific content: the points badge
    expect(screen.getByText("90 pts")).toBeInTheDocument();
  });

  it("shows the loading spinner initially", () => {
    api.fetchTransactions.mockReturnValue(new Promise(() => { }));
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading transactions...")).toBeInTheDocument();
  });

  it("displays an error message when the API call fails", async () => {
    api.fetchTransactions.mockRejectedValue(new Error("Network failure"));
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Error: Network failure")).toBeInTheDocument();
    });
  });

  it("switches to Admin view when Admin link is clicked", async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    userEvent.click(screen.getByRole("link", { name: "Admin" }));

    expect(screen.getByText("Add New Transaction")).toBeInTheDocument();
    expect(screen.getByLabelText("Customer Name")).toBeInTheDocument();
  });
});
