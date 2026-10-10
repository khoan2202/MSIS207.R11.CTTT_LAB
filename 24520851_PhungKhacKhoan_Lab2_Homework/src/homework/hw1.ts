import { el } from "../core/dom.ts";

import {
  laptops,
  columns,
} from "./hw1-data.ts";

import { createDataGrid } from "./hw1-grid.ts";

export function mountHomework1(
  root: HTMLElement,
): void {
  const announcement = el("p", {
    role: "status",
  });

  const grid = createDataGrid({
    data: laptops,
    columns,
    ariaLabel: "Danh sách laptop",

    onRowSelect: (item) => {
      announcement.textContent =
        `Đã chọn ${item.name}, hãng ${item.brand}.`;
    },
  });

  const search = el("input", {
    id: "grid-search",
    type: "search",
    placeholder: "Ví dụ: Dell",

    onInput: (event: Event) => {
      const input = event.target as HTMLInputElement;
      grid.setSearch(input.value);
    },
  });

  const previous = el(
    "button",
    {
      type: "button",

      onClick: () => {
        grid.previousPage();
      },
    },
    "Trang trước",
  );

  const next = el(
    "button",
    {
      type: "button",

      onClick: () => {
        grid.nextPage();
      },
    },
    "Trang sau",
  );

  grid.onChange(() => {
    previous.disabled = !grid.hasPrevious;
    next.disabled = !grid.hasNext;
  });

  root.replaceChildren(
    el("h1", {}, "Homework 1: Data Grid"),

    el(
      "p",
      { id: "grid-help" },
      "Tab vào bảng. Mũi tên di chuyển, Enter chọn dòng, " +
        "Space bật/tắt chọn. Enter trên tiêu đề để sắp xếp.",
    ),

    el(
      "section",
      {
        className: "toolbar",
        "aria-label": "Lọc laptop",
      },

      el(
        "label",
        { for: "grid-search" },
        "Tìm kiếm",
      ),

      search,
    ),

    el(
      "section",
      {
        className: "table-wrap",
        "aria-label": "Bảng dữ liệu laptop",
      },
      grid.table,
    ),

    grid.status,
    announcement,

    el(
      "nav",
      { "aria-label": "Phân trang" },
      previous,
      next,
    ),
  );
}