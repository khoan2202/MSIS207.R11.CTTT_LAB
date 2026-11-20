import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./render-app.jsx";
import { ShowData } from "../src/form/ShowData.jsx";

describe("Sprint 2 — ShowData inspector", () => {
  it("render cặp dt/dd và che mật khẩu", () => {
    render(<ShowData data={{ email: "a@b.cc", password: "abc12345" }} />);
    const terms = screen.getAllByRole("term").map((t) => t.textContent);
    expect(terms).toEqual(["email", "password"]);
    expect(screen.queryByText("abc12345")).toBeNull();
  });

  it("submit hợp lệ trên trang /form => inspector hiện dữ liệu", async () => {
    const user = userEvent.setup();
    renderApp("/form");
    const form = await screen.findByRole("form", { name: "Form mới (Context + derived state)" });
    const f = within(form);
    await user.type(f.getByLabelText("Họ tên"), "Phùng Khắc Khoan");
    await user.type(f.getByLabelText("Email"), "24520851@gm.uit.edu.vn");
    await user.type(f.getByLabelText("Tuổi"), "20");
    await user.type(f.getByLabelText("Mật khẩu"), "lab4react19");
    await user.type(f.getByLabelText("Nhập lại mật khẩu"), "lab4react19");
    await user.click(f.getByRole("button", { name: "Gửi" }));
    const inspector = screen.getByRole("region", { name: "Dữ liệu đã gửi" });
    expect(inspector.textContent).toContain("Phùng Khắc Khoan");
  });
});
