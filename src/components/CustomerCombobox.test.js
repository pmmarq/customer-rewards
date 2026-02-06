import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomerCombobox from "./CustomerCombobox";

const mockCustomers = [
  { customerId: 1, name: "Alice Smith" },
  { customerId: 1, name: "Alice Smith" },
  { customerId: 2, name: "Bob Johnson" },
  { customerId: 2, name: "Bob Johnson" },
  { customerId: 2, name: "Bob Johnson" },
];

const defaultProps = {
  customers: mockCustomers,
  value: "",
  onChange: jest.fn(),
  error: null,
};

function renderCombobox(props = {}) {
  return render(<CustomerCombobox {...defaultProps} {...props} />);
}

describe("CustomerCombobox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the input with correct label", () => {
      renderCombobox();
      expect(screen.getByLabelText("Customer Name")).toBeInTheDocument();
    });

    it("renders with placeholder text", () => {
      renderCombobox();
      expect(
        screen.getByPlaceholderText("Search or enter new customer name"),
      ).toBeInTheDocument();
    });

    it("displays error message when error prop is provided", () => {
      renderCombobox({ error: "Name is required" });
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });

    it("has combobox role with correct aria attributes", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");
      expect(input).toHaveAttribute("aria-haspopup", "listbox");
      expect(input).toHaveAttribute("aria-autocomplete", "list");
    });
  });

  describe("dropdown behavior", () => {
    it("shows dropdown with existing customers on focus", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.click(input);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("shows transaction count for each customer", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.click(input);

      expect(screen.getByText("2 transactions")).toBeInTheDocument();
      expect(screen.getByText("3 transactions")).toBeInTheDocument();
    });

    it("filters customers based on input", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.type(input, "alice");

      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
      expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
    });
  });

  describe("new customer indication", () => {
    it("shows 'Create new customer' option when typing non-matching name", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.type(input, "Charlie Brown");

      expect(
        screen.getByText('Create "Charlie Brown" as new customer'),
      ).toBeInTheDocument();
    });

    it("shows helper text for new customer", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.type(input, "Charlie Brown");

      expect(
        screen.getByText("New customer will be created"),
      ).toBeInTheDocument();
    });

    it("shows helper text for existing customer with transaction count", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.type(input, "Alice Smith");

      expect(
        screen.getByText(/Adding transaction for existing customer/),
      ).toBeInTheDocument();
      expect(screen.getByText(/2 previous transactions/)).toBeInTheDocument();
    });

    it("does not show 'Create new' option when exact match exists", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.type(input, "Alice Smith");

      expect(
        screen.queryByText(/Create .* as new customer/),
      ).not.toBeInTheDocument();
    });

    it("matches existing customer case-insensitively", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.type(input, "alice smith");

      expect(
        screen.getByText(/Adding transaction for existing customer/),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Create .* as new customer/),
      ).not.toBeInTheDocument();
    });
  });

  describe("selection", () => {
    it("calls onChange when selecting existing customer", () => {
      const onChange = jest.fn();
      renderCombobox({ onChange });
      const input = screen.getByRole("combobox");

      userEvent.click(input);
      userEvent.click(screen.getByText("Bob Johnson"));

      expect(onChange).toHaveBeenLastCalledWith("Bob Johnson");
    });

    it("calls onChange when typing", () => {
      const onChange = jest.fn();
      renderCombobox({ onChange });
      const input = screen.getByRole("combobox");

      userEvent.type(input, "Test");

      expect(onChange).toHaveBeenCalledWith("T");
      expect(onChange).toHaveBeenCalledWith("Te");
      expect(onChange).toHaveBeenCalledWith("Tes");
      expect(onChange).toHaveBeenCalledWith("Test");
    });

    it("closes dropdown after selecting a customer", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.click(input);
      userEvent.click(screen.getByText("Alice Smith"));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("keyboard navigation", () => {
    it("closes dropdown on Escape key", () => {
      renderCombobox();
      const input = screen.getByRole("combobox");

      userEvent.click(input);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      userEvent.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });
});
