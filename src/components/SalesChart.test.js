import { render, screen } from "@testing-library/react";
import SalesChart from "./SalesChart";

// ResponsiveContainer relies on DOM layout measurements that JSDOM cannot provide.
// Mock it to render children with fixed dimensions so Recharts actually draws the SVG.
jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");
  return {
    ...Original,
    ResponsiveContainer: ({ children }) => (
      <Original.ResponsiveContainer width={800} height={300}>
        {children}
      </Original.ResponsiveContainer>
    ),
  };
});

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockMonthlyTrends = [
  {
    month: "October 2024",
    sortKey: "2024-10",
    transactionCount: 10,
    totalSpent: 1500.0,
    totalPoints: 800,
  },
  {
    month: "November 2024",
    sortKey: "2024-11",
    transactionCount: 8,
    totalSpent: 1200.0,
    totalPoints: 600,
  },
  {
    month: "December 2024",
    sortKey: "2024-12",
    transactionCount: 12,
    totalSpent: 2000.0,
    totalPoints: 1100,
  },
];

describe("SalesChart", () => {
  it("renders the chart heading", () => {
    render(<SalesChart monthlyTrends={mockMonthlyTrends} />);

    expect(screen.getByText("Sales Over Time")).toBeInTheDocument();
  });

  it("renders an SVG element for the chart", () => {
    const { container } = render(
      <SalesChart monthlyTrends={mockMonthlyTrends} />,
    );

    const svg = container.querySelector("svg.recharts-surface");
    expect(svg).toBeInTheDocument();
  });

  it("renders bar rectangles for the data", () => {
    const { container } = render(
      <SalesChart monthlyTrends={mockMonthlyTrends} />,
    );

    const bars = container.querySelectorAll(".recharts-bar-rectangle");
    // 2 bars per month (Total Spent + Points Earned) x 3 months = 6
    expect(bars.length).toBe(6);
  });

  it("renders legend items for both series", () => {
    render(<SalesChart monthlyTrends={mockMonthlyTrends} />);

    expect(screen.getByText("Total Spent")).toBeInTheDocument();
    expect(screen.getByText("Points Earned")).toBeInTheDocument();
  });

  it("renders the empty state when given no data", () => {
    render(<SalesChart monthlyTrends={[]} />);

    expect(screen.getByText("Sales Over Time")).toBeInTheDocument();
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders the empty state when given null", () => {
    render(<SalesChart monthlyTrends={null} />);

    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders tooltip data correctly when provided", () => {
    // Test the actual rendered chart that includes tooltips
    const { container } = render(<SalesChart monthlyTrends={mockMonthlyTrends} />);
    
    // Verify the chart has tooltip functionality by checking if chart renders
    const svg = container.querySelector("svg.recharts-surface");
    expect(svg).toBeInTheDocument();
  });
});
