import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navigation from "./Navigation";

describe("Navigation", () => {
  it("renders all tab buttons", () => {
    render(<Navigation activeTab="Rewards" onTabChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Rewards" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Admin" })).toBeInTheDocument();
  });

  it("marks the active tab with aria-selected true", () => {
    render(<Navigation activeTab="Analytics" onTabChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Analytics" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Rewards" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onTabChange with the tab name when clicked", () => {
    const handleChange = jest.fn();
    render(<Navigation activeTab="Rewards" onTabChange={handleChange} />);

    userEvent.click(screen.getByRole("tab", { name: "Analytics" }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("Analytics");
  });

  it("applies distinct styling to the active tab", () => {
    render(<Navigation activeTab="Rewards" onTabChange={() => {}} />);

    const activeTab = screen.getByRole("tab", { name: "Rewards" });
    const inactiveTab = screen.getByRole("tab", { name: "Analytics" });

    expect(activeTab.className).toContain("text-indigo-700");
    expect(inactiveTab.className).toContain("text-indigo-200");
  });

  it("renders within a tablist role", () => {
    render(<Navigation activeTab="Rewards" onTabChange={() => {}} />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});
