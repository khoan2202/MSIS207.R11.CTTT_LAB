import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import App from "../src/App.jsx";
import { AuthProvider } from "../src/auth/AuthContext.jsx";

// Render toàn bộ App tại một URL, bọc đủ Provider như main.jsx.
export function renderApp(path, { extra = null, user = null } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider initialUser={user}>
        <App />
        {extra}
      </AuthProvider>
    </MemoryRouter>,
  );
}
