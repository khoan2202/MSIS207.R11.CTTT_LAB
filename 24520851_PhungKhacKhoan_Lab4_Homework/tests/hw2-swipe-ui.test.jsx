import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./render-app.jsx";

const PROFILES = [
  { id: "a", name: "Lan", age: 22, city: "HCM", bio: "bio", tags: ["x"], hue: 10 },
  { id: "b", name: "Minh", age: 24, city: "HN", bio: "bio", tags: ["y"], hue: 200 },
];

beforeEach(() => {
  localStorage.clear();
  globalThis.fetch = vi.fn(async (url, opts = {}) => {
    if (url.endsWith("/api/profiles")) return { ok: true, status: 200, json: async () => PROFILES };
    if (url.includes("/api/swipes?")) return { ok: true, status: 200, json: async () => [] };
    return { ok: true, status: opts.method === "DELETE" ? 204 : 201, json: async () => ({}) };
  });
  HTMLElement.prototype.setPointerCapture = () => {};
});

const deck = () => screen.getByRole("group", { name: /Hồ sơ hiện tại|Bộ bài đã hết/ });

describe("HW2 — Swipe UI (bàn phím + pointer)", () => {
  it("phím →, ↑ và Backspace cập nhật lá bài và điểm", async () => {
    const user = userEvent.setup();
    renderApp("/swipe");
    await screen.findByRole("heading", { name: "Lan, 22" });
    deck().focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("heading", { name: "Minh, 24" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Điểm:/ }).textContent).toContain("10");
    await user.keyboard("{ArrowUp}");
    expect(screen.getByText("Hết hồ sơ rồi!")).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Điểm:/ }).textContent).toContain("35");
    await user.keyboard("{Backspace}");
    expect(screen.getByRole("heading", { name: "Minh, 24" })).toBeTruthy();
    expect(screen.getByText(/Đã hoàn tác: Minh quay lại bộ bài/)).toBeTruthy();
  });

  it("kéo lá bài sang trái quá ngưỡng => bỏ qua (-5); kéo ngắn => trả về", async () => {
    renderApp("/swipe");
    const card = (await screen.findByRole("heading", { name: "Lan, 22" })).closest("article");
    fireEvent.pointerDown(card, { pointerId: 1, isPrimary: true, button: 0, clientX: 300, clientY: 200 });
    fireEvent.pointerMove(card, { pointerId: 1, clientX: 260, clientY: 200 });
    fireEvent.pointerUp(card, { pointerId: 1, clientX: 260, clientY: 200 });
    expect(screen.getByRole("heading", { name: "Lan, 22" })).toBeTruthy(); // chưa đủ ngưỡng

    fireEvent.pointerDown(card, { pointerId: 2, isPrimary: true, button: 0, clientX: 300, clientY: 200 });
    fireEvent.pointerUp(card, { pointerId: 2, clientX: 120, clientY: 210 });
    await waitFor(() => expect(screen.getByRole("heading", { name: "Minh, 24" })).toBeTruthy());
    expect(screen.getByRole("heading", { name: /Điểm:/ }).textContent).toContain("-5");
  });

  it("pointerup không có pointerdown trước đó không gây crash", async () => {
    renderApp("/swipe");
    const card = (await screen.findByRole("heading", { name: "Lan, 22" })).closest("article");
    expect(() => fireEvent.pointerUp(card, { pointerId: 9, clientX: 999, clientY: 0 })).not.toThrow();
  });

  it("server tắt => hiện hướng dẫn chạy server thay vì trắng trang", async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError("Failed to fetch"); });
    renderApp("/swipe");
    expect((await screen.findByRole("alert")).textContent).toContain("npm run server");
  });
});

describe("HW2 — regression: biến CSS --hue không bị ghi đè", () => {
  it("lá bài trên cùng giữ --hue cả khi không kéo", async () => {
    renderApp("/swipe");
    const card = (await screen.findByRole("heading", { name: "Lan, 22" })).closest("article");
    expect(card.style.getPropertyValue("--hue")).toBe("10");
  });
});
