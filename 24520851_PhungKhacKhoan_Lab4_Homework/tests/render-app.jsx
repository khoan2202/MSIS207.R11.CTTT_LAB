import { render } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import App from "../src/App.jsx";

export function LocationProbe() {
  const loc = useLocation();
  return <output data-testid="loc">{loc.pathname + loc.search}</output>;
}

export function renderApp(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}
