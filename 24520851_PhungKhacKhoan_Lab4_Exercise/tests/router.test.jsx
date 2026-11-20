import { screen } from "@testing-library/react";
import { renderApp } from "./render-app.jsx";

const renderAt = (path) =>
  renderApp(path);

describe("Ex 1.2 — Router v7 layout", () => {
  it("hiển thị Home ở route index và đánh dấu NavLink active", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { name: "Trang chủ" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Trang chủ" }).className).toBe("active");
    expect(screen.getByRole("link", { name: "Giới thiệu" }).className).toBe("");
  });

  it("render About trong Outlet của Layout", async () => {
    renderAt("/about");
    expect(await screen.findByRole("heading", { name: "Giới thiệu" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Điều hướng chính" })).toBeTruthy();
  });

  it("route không tồn tại trả về 404", async () => {
    renderAt("/khong-co");
    expect((await screen.findByRole("alert")).textContent).toContain("404");
  });
});
