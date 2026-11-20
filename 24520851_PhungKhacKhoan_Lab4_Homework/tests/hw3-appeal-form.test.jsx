import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./render-app.jsx";
import { installTribunalFetch } from "./hw3-fake-api.js";

const STATEMENT = "Hai lần mất kết nối do sự cố mạng của ký túc xá vào tối hôm đó, có xác nhận của ban quản lý kèm theo.";

async function openForm(path = "/dossier/himass") {
  renderApp(path);
  return screen.findByRole("form", { name: /Form khiếu nại/ });
}

describe("HW3 — Appeal form engine", () => {
  it("validate real-time: lỗi hiện sau blur, đếm ký tự, cross-field evidenceUrl", async () => {
    installTribunalFetch();
    const user = userEvent.setup();
    const form = within(await openForm());
    const email = form.getByLabelText("Email liên hệ");
    await user.type(email, "abc");
    await user.tab();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    await user.type(email, "@uit.edu.vn");
    expect(email.getAttribute("aria-invalid")).toBeNull();

    await user.type(form.getByLabelText("Trình bày"), "Mười ký tự");
    expect(form.getByText(/^10 \/ 2000 ký tự/)).toBeTruthy();

    await user.selectOptions(form.getByLabelText("Lý do khiếu nại"), "new-evidence");
    await user.click(form.getByRole("button", { name: "Nộp đơn khiếu nại" }));
    expect(form.getByText(/cần kèm link bằng chứng/)).toBeTruthy();
  });

  it("nộp hợp lệ => POST đúng payload và hiện biên nhận", async () => {
    const posted = [];
    installTribunalFetch({ onPost: (body, res) => { posted.push(body); return res({ appealId: "AP-1", playerId: "himass", reason: body.reason, requestedOutcome: body.requestedOutcome, status: "received" }, 201); } });
    const user = userEvent.setup();
    const form = within(await openForm());
    await user.type(form.getByLabelText("Email liên hệ"), "team@example.com");
    await user.selectOptions(form.getByLabelText("Lý do khiếu nại"), "disproportionate");
    await user.selectOptions(form.getByLabelText("Kết quả mong muốn"), "reduce");
    await user.type(form.getByLabelText("Trình bày"), STATEMENT);
    await user.click(form.getByLabelText(/trung thực/));
    await user.click(form.getByRole("button", { name: "Nộp đơn khiếu nại" }));
    expect(await screen.findByText("Đã nhận đơn khiếu nại.")).toBeTruthy();
    expect(posted[0]).toMatchObject({ playerId: "himass", reason: "disproportionate", acknowledge: true });
  });

  it("lỗi 400 từ server gắn vào đúng field", async () => {
    installTribunalFetch({ onPost: (_b, res) => res({ error: "Đơn khiếu nại chưa hợp lệ.", fields: { contactEmail: "Email bị chặn bởi server." } }, 400) });
    const user = userEvent.setup();
    const form = within(await openForm());
    await user.type(form.getByLabelText("Email liên hệ"), "team@example.com");
    await user.selectOptions(form.getByLabelText("Lý do khiếu nại"), "procedural");
    await user.selectOptions(form.getByLabelText("Kết quả mong muốn"), "review");
    await user.type(form.getByLabelText("Trình bày"), STATEMENT);
    await user.click(form.getByLabelText(/trung thực/));
    await user.click(form.getByRole("button", { name: "Nộp đơn khiếu nại" }));
    expect(await form.findByText("Email bị chặn bởi server.")).toBeTruthy();
    expect(form.getByLabelText("Email liên hệ").getAttribute("aria-invalid")).toBe("true");
  });

  it("đã nộp trước đó => hiện biên nhận thay vì form", async () => {
    installTribunalFetch({ appeals: { tanvuu: { appealId: "AP-9", playerId: "tanvuu", reason: "technical-issue", requestedOutcome: "revoke", status: "received" } } });
    renderApp("/dossier/tanvuu");
    expect(await screen.findByText("AP-9")).toBeTruthy();
    expect(screen.queryByRole("form", { name: /Form khiếu nại/ })).toBeNull();
  });

  it("hết hạn SLA => form bị khóa", async () => {
    installTribunalFetch({ now: Date.now() - 7 * 3600 * 1000 }); // tanvuu đã quá hạn 1 giờ
    renderApp("/dossier/tanvuu");
    await waitFor(() => expect(screen.getByText(/Đã quá hạn SLA/)).toBeTruthy());
    expect(screen.getByRole("button", { name: "Nộp đơn khiếu nại" }).disabled).toBe(true);
    expect(screen.getByRole("timer").textContent).toBe("00:00:00");
  });
});
