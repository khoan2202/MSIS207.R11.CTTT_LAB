import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { renderApp } from "./render-app.jsx";

function LocationProbe() {
  const loc = useLocation();
  return <output data-testid="loc">{loc.pathname + loc.search}</output>;
}

describe("Live Defense #4 — Protected Route", () => {
  it("chưa đăng nhập => chuyển tới /login, đăng nhập xong quay lại đúng URL đích (kèm query)", async () => {
    const user = userEvent.setup();
    renderApp("/admin?tab=audit", { extra: <LocationProbe /> });
    expect(screen.getByTestId("loc").textContent).toBe("/login");
    expect(screen.getByText("/admin?tab=audit")).toBeTruthy();

    await user.type(screen.getByLabelText("Tên đăng nhập"), "khoan");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(screen.getByTestId("loc").textContent).toBe("/admin?tab=audit");
    expect(screen.getByRole("heading", { name: "Khu vực quản trị" })).toBeTruthy();
  });

  it("đã đăng nhập => vào thẳng, đăng xuất => bị đá về /login", async () => {
    const user = userEvent.setup();
    renderApp("/admin", { user: { name: "khoan" }, extra: <LocationProbe /> });
    expect(screen.getByText("khoan")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
    expect(screen.getByTestId("loc").textContent).toBe("/login");
  });
});
