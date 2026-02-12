import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Navigation from "./Navigation";

describe("Navigation", () => {
  it("renders all tab links", () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Rewards" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Analytics" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin" })).toBeInTheDocument();
  });

  it("marks the active tab with aria-current page", () => {
    render(
      <MemoryRouter initialEntries={["/analytics"]}>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Analytics" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Rewards" })).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  // Removed onTabChange test as it's handled by Router now

  it("applies distinct styling to the active tab", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Navigation />
      </MemoryRouter>
    );

    const activeTab = screen.getByRole("link", { name: "Rewards" });
    const inactiveTab = screen.getByRole("link", { name: "Analytics" });

    expect(activeTab.className).toContain("text-indigo-700");
    expect(inactiveTab.className).toContain("text-indigo-200");
  });
});
