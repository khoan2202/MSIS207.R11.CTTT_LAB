import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router";
import { renderApp } from "./render-app.jsx";

function LocationProbe() {
  const loc = useLocation();
  return <output data-testid="loc">{loc.pathname + loc.search}</output>;
}

const setup = (path) =>
  renderApp(path, { extra: <LocationProbe /> });

describe("Live Defense #1 — useSearchParams", () => {
  it("đọc bộ lọc từ URL khi tải trang (deep link)", () => {
    setup("/people?team=Quality");
    const nav = screen.getByRole("navigation", { name: "Danh sách nhân sự" });
    expect([...nav.querySelectorAll("li a")].map((a) => a.textContent)).toEqual(["Lê Chi"]);
  });

  it("gõ tìm kiếm cập nhật URL; mở chi tiết vẫn giữ query", async () => {
    const user = userEvent.setup();
    setup("/people");
    await user.type(screen.getByLabelText("Tìm theo tên"), "trần");
    expect(screen.getByTestId("loc").textContent).toBe("/people?q=tr%E1%BA%A7n");
    await user.click(screen.getByRole("link", { name: "Trần Bình" }));
    expect(screen.getByTestId("loc").textContent).toBe("/people/p02?q=tr%E1%BA%A7n");
    expect(await screen.findByRole("heading", { name: "Trần Bình" })).toBeTruthy();
  });
});
