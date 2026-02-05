import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerRewards from "./CustomerRewards";

const mockCustomer = {
  customerId: 1,
  name: "Alice Johnson",
  totalPoints: 250,
  months: {
    "October 2024": {
      points: 115,
      transactions: [
        { id: 1, date: "2024-10-05", amount: 120.0, points: 90 },
        { id: 2, date: "2024-10-18", amount: 75.5, points: 25 },
      ],
    },
    "November 2024": {
      points: 135,
      transactions: [{ id: 3, date: "2024-11-02", amount: 200.0, points: 250 }],
    },
  },
};

describe("CustomerRewards", () => {
  it("renders the customer name and total points", () => {
    render(<CustomerRewards customer={mockCustomer} />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("250 pts")).toBeInTheDocument();
  });

  it("does not show monthly details by default", () => {
    render(<CustomerRewards customer={mockCustomer} />);

    expect(screen.queryByText(/October 2024/)).not.toBeInTheDocument();
    expect(screen.queryByText(/November 2024/)).not.toBeInTheDocument();
  });

  it("shows the collapse arrow", () => {
    render(<CustomerRewards customer={mockCustomer} />);

    expect(screen.getByText("▼")).toBeInTheDocument();
  });

  it("expands to show monthly breakdowns when the header is clicked", () => {
    render(<CustomerRewards customer={mockCustomer} />);

    userEvent.click(screen.getByRole("button"));

    expect(screen.getByText(/October 2024/)).toBeInTheDocument();
    expect(screen.getByText(/November 2024/)).toBeInTheDocument();
  });

  it("collapses the details when clicked a second time", () => {
    render(<CustomerRewards customer={mockCustomer} />);

    const header = screen.getByRole("button");
    userEvent.click(header);
    expect(screen.getByText(/October 2024/)).toBeInTheDocument();

    userEvent.click(header);
    expect(screen.queryByText(/October 2024/)).not.toBeInTheDocument();
  });

  it("rotates the arrow icon when expanded", () => {
    render(<CustomerRewards customer={mockCustomer} />);

    const arrow = screen.getByText("▼");
    expect(arrow.style.transform).toBe("rotate(0deg)");

    userEvent.click(screen.getByRole("button"));
    expect(arrow.style.transform).toBe("rotate(180deg)");
  });
});
