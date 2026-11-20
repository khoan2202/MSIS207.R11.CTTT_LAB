import { Profiler } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimpleForm } from "../src/form/SimpleForm.jsx";

describe("Sprint 2 — InputField validation", () => {
  it("label gắn với input qua useId; lỗi hiện sau blur với aria-invalid + aria-describedby", async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    const email = screen.getByLabelText("Email");
    expect(email.getAttribute("aria-invalid")).toBeNull();

    await user.type(email, "abc");
    await user.tab();
    expect(email.getAttribute("aria-invalid")).toBe("true");
    const errorEl = document.getElementById(email.getAttribute("aria-describedby"));
    expect(errorEl.textContent).toMatch(/định dạng/);

    // Sửa đúng => lỗi biến mất ngay trong cùng lần render (real-time).
    await user.type(email, "@uit.edu.vn");
    expect(email.getAttribute("aria-invalid")).toBeNull();
  });

  it("submit khi còn lỗi: hiện tóm tắt và focus vào field lỗi đầu tiên", async () => {
    const user = userEvent.setup();
    const onValid = vi.fn();
    render(<SimpleForm onValidSubmit={onValid} />);
    await user.click(screen.getByRole("button", { name: "Gửi" }));
    expect(screen.getByRole("alert").textContent).toContain("4 trường");
    expect(document.activeElement).toBe(screen.getByLabelText("Họ tên"));
    expect(onValid).not.toHaveBeenCalled();
  });

  it("mỗi phím gõ chỉ tạo đúng 1 commit (không waterfall)", async () => {
    const user = userEvent.setup();
    let commits = 0;
    render(<Profiler id="new" onRender={() => { commits += 1; }}><SimpleForm /></Profiler>);
    commits = 0;
    await user.type(screen.getByLabelText("Họ tên"), "K");
    expect(commits).toBe(1);
  });
});
