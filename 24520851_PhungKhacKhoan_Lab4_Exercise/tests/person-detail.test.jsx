import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import PersonDetail from "../src/people/PersonDetail.jsx";
import App from "../src/App.jsx";
import { PEOPLE } from "../src/data/people.js";

const renderDetail = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/people/:id" element={<PersonDetail people={PEOPLE} />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Sprint 1 — PersonDetail", () => {
  it("đọc id từ useParams và render <dl> semantic", () => {
    renderDetail("/people/p02");
    expect(screen.getByRole("heading", { name: "Trần Bình" })).toBeTruthy();
    const dl = document.querySelector("dl.person-details");
    expect(dl.querySelectorAll("dt")).toHaveLength(4);
    expect(dl.textContent).toContain("Backend Engineer");
  });

  it("id không hợp lệ => 404 thay vì crash", () => {
    renderDetail("/people/xyz");
    expect(screen.getByRole("alert").textContent).toContain('"xyz"');
  });

  it("qua App: lazy chunk tải xong và NavLink tương ứng active", async () => {
    render(<MemoryRouter initialEntries={["/people/p03"]}><App /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Lê Chi" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Lê Chi" }).className).toBe("active-link");
  });
});
