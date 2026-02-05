import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the app header", () => {
  render(<App />);
  const heading = screen.getByText(/customer rewards program/i);
  expect(heading).toBeInTheDocument();
});
