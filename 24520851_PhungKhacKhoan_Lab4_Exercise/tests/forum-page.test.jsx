import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "../src/App.jsx";

const ok = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });

describe("Sprint 3 — Channel switcher", () => {
  it("render tin nhắn dạng <dl> và đổi kênh qua NavLink", async () => {
    globalThis.fetch = vi.fn((url) =>
      ok([{ id: url.includes("notNasa") ? "n1" : "a1", author: "bot", text: url.split("/").pop(), timestamp: "2026-11-01T08:00:00Z" }]),
    );
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/forum/nasa"]}><App /></MemoryRouter>);
    expect(await screen.findByText("nasa", { selector: "dd" })).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "#notNasa" }));
    expect(await screen.findByText("notNasa", { selector: "dd" })).toBeTruthy();
  });

  it("client chặn gửi khi thiếu nội dung (cùng luật với server)", async () => {
    globalThis.fetch = vi.fn(() => ok([]));
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/forum/nasa"]}><App /></MemoryRouter>);
    await screen.findByText("Chưa có tin nhắn.");
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(screen.getByText("Thiếu trường text.")).toBeTruthy();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1); // chỉ có GET, không POST
  });

  it("kênh lạ => 404", async () => {
    render(<MemoryRouter initialEntries={["/forum/mars"]}><App /></MemoryRouter>);
    expect((await screen.findByRole("alert")).textContent).toContain("mars");
  });
});
