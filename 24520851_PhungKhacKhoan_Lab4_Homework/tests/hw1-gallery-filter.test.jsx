import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./render-app.jsx";

const imgs = () => within(screen.getAllByRole("list").at(-1)).getAllByRole("img");

describe("HW1 — lọc category bằng useSearchParams", () => {
  it("deep link ?category=city chỉ hiện ảnh đô thị", async () => {
    renderApp("/gallery?category=city");
    await screen.findByRole("heading", { name: /Gallery/ });
    expect(imgs()).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Đô thị" }).getAttribute("aria-current")).toBe("page");
  });

  it("bấm chip cập nhật URL; 'Tất cả' xóa tham số", async () => {
    const user = userEvent.setup();
    renderApp("/gallery");
    await screen.findByRole("heading", { name: /Gallery/ });
    expect(imgs()).toHaveLength(12);
    await user.click(screen.getByRole("link", { name: "Bằng chứng" }));
    expect(screen.getByTestId("loc").textContent).toBe("/gallery?category=evidence");
    expect(imgs()).toHaveLength(4);
    await user.click(screen.getByRole("link", { name: "Tất cả" }));
    expect(screen.getByTestId("loc").textContent).toBe("/gallery");
  });

  it("category không hợp lệ => hiện tất cả", async () => {
    renderApp("/gallery?category=abc");
    await screen.findByRole("heading", { name: /Gallery/ });
    expect(imgs()).toHaveLength(12);
  });

  it("ảnh có width/height (CLS = 0) và alt", async () => {
    renderApp("/gallery");
    await screen.findByRole("heading", { name: /Gallery/ });
    for (const img of imgs()) {
      expect(img.getAttribute("width")).toBe("800");
      expect(img.getAttribute("alt")).not.toBe("");
    }
  });
});
