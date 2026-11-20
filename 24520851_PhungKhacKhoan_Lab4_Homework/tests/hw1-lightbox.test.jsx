import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./render-app.jsx";
import { neighborId } from "../src/gallery/GalleryPage.jsx";

const dialog = () => document.querySelector("dialog.lightbox");

describe("HW1 — Lightbox <dialog> + deep link", () => {
  it("deep link ?photo=c2 mở sẵn dialog đúng ảnh", async () => {
    renderApp("/gallery?category=city&photo=c2");
    await screen.findByRole("heading", { name: /Gallery/ });
    expect(dialog().open).toBe(true);
    expect(screen.getByRole("heading", { name: "Thành phố về đêm" })).toBeTruthy();
    expect(screen.getByText("Ảnh 2 / 4")).toBeTruthy();
  });

  it("mở bằng click => URL có ?photo, giữ category; đóng => xóa photo và trả focus về thumbnail", async () => {
    const user = userEvent.setup();
    renderApp("/gallery?category=nature");
    await screen.findByRole("heading", { name: /Gallery/ });
    const thumb = screen.getByRole("button", { name: /Hoàng hôn trên núi/ });
    await user.click(thumb);
    expect(screen.getByTestId("loc").textContent).toBe("/gallery?category=nature&photo=n4");
    expect(dialog().open).toBe(true);

    await user.click(screen.getByRole("button", { name: "Đóng ảnh" }));
    expect(dialog().open).toBe(false);
    expect(screen.getByTestId("loc").textContent).toBe("/gallery?category=nature");
    expect(document.activeElement).toBe(thumb);
  });

  it("phím → và ← chuyển ảnh theo vòng trong category", async () => {
    const user = userEvent.setup();
    renderApp("/gallery?category=nature&photo=n4");
    await screen.findByRole("heading", { name: "Hoàng hôn trên núi" });
    await act(async () => { screen.getByRole("button", { name: "Đóng ảnh" }).focus(); });
    await user.keyboard("{ArrowRight}");
    expect(screen.getByTestId("loc").textContent).toBe("/gallery?category=nature&photo=n1");
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByTestId("loc").textContent).toBe("/gallery?category=nature&photo=n4");
  });

  it("id ảnh không tồn tại => không mở dialog", async () => {
    renderApp("/gallery?photo=zzz");
    await screen.findByRole("heading", { name: /Gallery/ });
    expect(dialog().open).toBe(false);
  });

  it("neighborId quay vòng", () => {
    const list = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(neighborId(list, "c", 1)).toBe("a");
    expect(neighborId(list, "a", -1)).toBe("c");
  });
});
