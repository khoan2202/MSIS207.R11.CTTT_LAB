import { screen } from "@testing-library/react";
import { renderApp } from "./render-app.jsx";
import { PEOPLE } from "../src/data/people.js";

describe("Sprint 1 — PeopleLayout", () => {
  it("render sidebar với đủ link và route index trong Outlet", () => {
    renderApp("/people");
    const nav = screen.getByRole("navigation", { name: "Danh sách nhân sự" });
    expect(nav.querySelectorAll("a")).toHaveLength(PEOPLE.length);
    expect(screen.getByText(/Chọn một người/)).toBeTruthy();
  });
});
