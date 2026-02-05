import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortableTable from "./SortableTable";

const mockData = [
  { id: 1, name: "Charlie Brown", score: 80, amount: 200 },
  { id: 2, name: "Alice Smith", score: 95, amount: 150 },
  { id: 3, name: "Bob Johnson", score: 70, amount: 300 },
];

const columns = [
  { key: "name", label: "Name", cellClass: "text-slate-700 font-medium" },
  { key: "score", label: "Score" },
  {
    key: "amount",
    label: "Amount",
    align: "right",
    render: (row) => `$${row.amount}`,
  },
];

function renderTable(props = {}) {
  return render(
    <SortableTable
      title="Test Table"
      data={mockData}
      rowKey={(row) => row.id}
      columns={columns}
      {...props}
    />,
  );
}

describe("SortableTable", () => {
  it("renders the title", () => {
    renderTable();
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    renderTable();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("renders all data rows", () => {
    renderTable();
    expect(screen.getByText("Charlie Brown")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("uses custom render functions for cells", () => {
    renderTable();
    expect(screen.getByText("$200")).toBeInTheDocument();
    expect(screen.getByText("$150")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
  });

  it("sorts ascending on first click of a column header", () => {
    renderTable();

    userEvent.click(screen.getByText("Name"));

    const rows = screen.getAllByRole("row");
    // row[0] is header, data rows start at [1]
    // Sorted by last name ascending: Brown (Charlie), Johnson (Bob), Smith (Alice)
    expect(within(rows[1]).getByText("Charlie Brown")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Bob Johnson")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Alice Smith")).toBeInTheDocument();
  });

  it("toggles to descending on second click of the same column", () => {
    renderTable();

    const header = screen.getByText("Name");
    userEvent.click(header);
    userEvent.click(header);

    const rows = screen.getAllByRole("row");
    // Descending by last name: Smith (Alice), Johnson (Bob), Brown (Charlie)
    expect(within(rows[1]).getByText("Alice Smith")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Bob Johnson")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Charlie Brown")).toBeInTheDocument();
  });

  it("sorts numeric columns correctly", () => {
    renderTable();

    userEvent.click(screen.getByText("Score"));

    const rows = screen.getAllByRole("row");
    // Ascending: 70, 80, 95
    expect(within(rows[1]).getByText("Bob Johnson")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Charlie Brown")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Alice Smith")).toBeInTheDocument();
  });

  it("resets to ascending when switching to a different column", () => {
    renderTable();

    // Sort by Name descending
    const nameHeader = screen.getByText("Name");
    userEvent.click(nameHeader);
    userEvent.click(nameHeader);

    // Switch to Score — should be ascending
    userEvent.click(screen.getByText("Score"));

    const rows = screen.getAllByRole("row");
    // Ascending by score: Bob(70), Charlie(80), Alice(95)
    expect(within(rows[1]).getByText("Bob Johnson")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Alice Smith")).toBeInTheDocument();
  });

  it("sets aria-sort on the active column header", () => {
    renderTable();

    const nameHeader = screen.getByText("Name").closest("th");
    const scoreHeader = screen.getByText("Score").closest("th");

    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    userEvent.click(screen.getByText("Name"));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(scoreHeader).toHaveAttribute("aria-sort", "none");

    userEvent.click(screen.getByText("Name"));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("respects defaultSortKey and defaultSortDir", () => {
    renderTable({ defaultSortKey: "score", defaultSortDir: "desc" });

    const rows = screen.getAllByRole("row");
    // Descending by score: Alice(95), Charlie(80), Bob(70)
    expect(within(rows[1]).getByText("Alice Smith")).toBeInTheDocument();
    expect(within(rows[2]).getByText("Charlie Brown")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("does not sort when a non-sortable column is clicked", () => {
    const cols = [
      { key: "name", label: "Name", sortable: false },
      { key: "score", label: "Score" },
    ];

    render(
      <SortableTable
        title="Test"
        data={mockData}
        rowKey={(row) => row.id}
        columns={cols}
      />,
    );

    const nameHeader = screen.getByText("Name").closest("th");

    userEvent.click(screen.getByText("Name"));
    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    // Data order should remain unchanged (original order)
    const rows = screen.getAllByRole("row");
    expect(within(rows[1]).getByText("Charlie Brown")).toBeInTheDocument();
  });

  it("sorts names by last name when multiple name parts exist", () => {
    const complexNames = [
      { id: 1, name: "Mary Anne Wilson", score: 80 },
      { id: 2, name: "John Davis", score: 95 },
      { id: 3, name: "Sarah", score: 70 },
      { id: 4, name: "Robert Michael Johnson", score: 85 },
    ];

    render(
      <SortableTable
        title="Complex Names Test"
        data={complexNames}
        rowKey={(row) => row.id}
        columns={[
          { key: "name", label: "Name" },
          { key: "score", label: "Score" },
        ]}
      />,
    );

    userEvent.click(screen.getByText("Name"));

    const rows = screen.getAllByRole("row");
    // Sorted by last name: Davis (John), Johnson (Robert Michael), Sarah, Wilson (Mary Anne)
    expect(within(rows[1]).getByText("John Davis")).toBeInTheDocument();
    expect(
      within(rows[2]).getByText("Robert Michael Johnson"),
    ).toBeInTheDocument();
    expect(within(rows[3]).getByText("Sarah")).toBeInTheDocument();
    expect(within(rows[4]).getByText("Mary Anne Wilson")).toBeInTheDocument();
  });
});
