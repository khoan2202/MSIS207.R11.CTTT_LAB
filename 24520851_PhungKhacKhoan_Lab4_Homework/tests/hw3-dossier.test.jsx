import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./render-app.jsx";
import { installTribunalFetch } from "./hw3-fake-api.js";

describe("HW3 — /dossier/:playerID", () => {
  it("sidebar liệt kê hồ sơ; click mở route động", async () => {
    installTribunalFetch();
    const user = userEvent.setup();
    renderApp("/dossier");
    const nav = await screen.findByRole("navigation", { name: "Danh sách hồ sơ" });
    await user.click(await within(nav).findByRole("link", { name: /TanVuu/ }));
    expect(screen.getByTestId("loc").textContent).toBe("/dossier/tanvuu");
    expect(await screen.findByRole("heading", { name: /TanVuu — FP-2026-0157/, level: 2 })).toBeTruthy();
  });

  it("ma trận derived: Himass có chỉ số 3.65 => cảnh báo bất tương xứng", async () => {
    installTribunalFetch();
    renderApp("/dossier/himass");
    const region = await screen.findByRole("region", { name: "Ma trận bất tương xứng" });
    expect(region.textContent).toContain("Chỉ số: 3.65");
    expect(screen.getByText(/có cơ sở khiếu nại/)).toBeTruthy();
    expect(within(screen.getByRole("table")).getAllByRole("row")).toHaveLength(6); // header + hiện tại + 4 tiền lệ
  });

  it("playerID không tồn tại => 404", async () => {
    installTribunalFetch();
    renderApp("/dossier/ghost");
    expect((await screen.findByText(/Không có hồ sơ cho người chơi "ghost"/))).toBeTruthy();
  });
});
