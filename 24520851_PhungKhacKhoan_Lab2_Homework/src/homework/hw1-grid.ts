import { el } from "../core/dom.ts";

import {
  queryData,
  type GridQuery,
} from "./hw1-query.ts";

import type { DataGridProps } from "./hw1-data.ts";

export function createDataGrid<
  T extends { id: string },
>(props: DataGridProps<T>) {
  const selected = new Set<string>();

  const query: GridQuery<T> = {
    search: "",
    ascending: true,
    page: 0,
    pageSize: 5,
  };

  let activeRow = 0;
  let activeCol = 0;

  let afterChange = () => {};

  let result = queryData(props.data, query);

  function getCell(
    event: Event,
  ): HTMLElement | null {
    if (!(event.target instanceof Element)) {
      return null;
    }

    return event.target.closest<HTMLElement>(
      "[data-row][data-col]",
    );
  }

  const table = el("table", {
    role: "grid",
    "aria-label": props.ariaLabel,
    "aria-describedby": "grid-help",
    "aria-multiselectable": true,

    onFocusIn: (event: Event) => {
      const cell = getCell(event);

      if (!cell) {
        return;
      }

      activeRow = Number(cell.dataset.row);
      activeCol = Number(cell.dataset.col);

      syncFocus(false);
    },

    onKeyDown: (event: KeyboardEvent) => {
      const cell = getCell(event);

      if (!cell) {
        return;
      }

      const supported = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Enter",
        " ",
      ];

      if (!supported.includes(event.key)) {
        return;
      }

      activeRow = Number(cell.dataset.row);
      activeCol = Number(cell.dataset.col);

      if (
        activeRow === 0 &&
        (event.key === "Enter" || event.key === " ")
      ) {
        // Header dùng hành vi kích hoạt button của browser.
        return;
      }

      event.preventDefault();

      if (event.key === "Enter" || event.key === " ") {
        const id = cell.closest<HTMLElement>("tr")?.dataset.id;

        if (id) {
          selectRow(id, event.key === " ");
        }

        return;
      }

      if (event.key === "ArrowUp") activeRow--;
      if (event.key === "ArrowDown") activeRow++;
      if (event.key === "ArrowLeft") activeCol--;
      if (event.key === "ArrowRight") activeCol++;

      if (event.key === "Home") {
        activeCol = 0;

        if (event.ctrlKey) {
          activeRow = 0;
        }
      }

      if (event.key === "End") {
        activeCol = props.columns.length - 1;

        if (event.ctrlKey) {
          activeRow = result.rows.length;
        }
      }

      syncFocus(true);
    },
  });

  const status = el("p", {
    role: "status",
    "aria-live": "polite",
  });

  function syncFocus(moveFocus: boolean): void {
    activeRow = Math.max(
      0,
      Math.min(activeRow, result.rows.length),
    );

    activeCol = Math.max(
      0,
      Math.min(activeCol, props.columns.length - 1),
    );

    const cells =
      table.querySelectorAll<HTMLElement>(
        "[data-row][data-col]",
      );

    cells.forEach((cell) => {
      const focusTarget =
        cell.querySelector<HTMLButtonElement>("button") ??
        cell;

      const active =
        Number(cell.dataset.row) === activeRow &&
        Number(cell.dataset.col) === activeCol;

      cell.tabIndex = -1;
      focusTarget.tabIndex = active ? 0 : -1;

      if (active && moveFocus) {
        focusTarget.focus();
      }
    });
  }

  function selectRow(
    id: string,
    toggle: boolean,
  ): void {
    if (toggle && selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }

    const item = props.data.find((row) => row.id === id);

    if (item && selected.has(id)) {
      props.onRowSelect?.(item);
    }

    refresh(true);
  }

  function refresh(restoreFocus = false): void {
    result = queryData(props.data, query);
    query.page = result.page;

    const headerRow = el("tr", { role: "row" });

    props.columns.forEach((column, colIndex) => {
      const sortDirection =
        query.sortKey === column.accessorKey
          ? query.ascending
            ? "ascending"
            : "descending"
          : "none";

      const header = el("th", {
        role: "columnheader",
        scope: "col",
        "aria-sort": column.sortable
          ? sortDirection
          : undefined,
        "data-row": 0,
        "data-col": colIndex,
      });

      if (column.sortable) {
        header.append(
          el(
            "button",
            {
              type: "button",
              tabIndex: -1,
              "aria-label": `Sắp xếp ${column.header}`,

              onClick: () => {
                activeRow = 0;
                activeCol = colIndex;

                query.ascending =
                  query.sortKey === column.accessorKey
                    ? !query.ascending
                    : true;

                query.sortKey = column.accessorKey;

                refresh(true);
              },
            },
            column.header,
          ),
        );
      } else {
        header.textContent = column.header;
      }

      headerRow.append(header);
    });

    const body = el("tbody", { role: "rowgroup" });

    result.rows.forEach((item, rowIndex) => {
      const row = el("tr", {
        role: "row",
        "data-id": item.id,
        "aria-selected": selected.has(item.id),
      });

      props.columns.forEach((column, colIndex) => {
        const value = item[column.accessorKey];

        const text =
          typeof value === "number"
            ? value.toLocaleString("vi-VN")
            : String(value);

        row.append(
          el(
            "td",
            {
              role: "gridcell",
              tabIndex: -1,
              "data-row": rowIndex + 1,
              "data-col": colIndex,

              onClick: () => {
                activeRow = rowIndex + 1;
                activeCol = colIndex;

                selectRow(item.id, true);
              },
            },
            text,
          ),
        );
      });

      body.append(row);
    });

    table.replaceChildren(
      el("caption", {}, props.ariaLabel),

      el(
        "thead",
        { role: "rowgroup" },
        headerRow,
      ),

      body,
    );

    status.textContent =
      `${result.total} kết quả. ` +
      `Trang ${result.page + 1}/${result.pages}. ` +
      `Đã chọn ${selected.size} dòng.`;

    syncFocus(restoreFocus);
    afterChange();
  }

  refresh();

  return {
    table,
    status,

    setSearch(search: string): void {
      query.search = search;
      query.page = 0;
      activeRow = 0;
      refresh(false);
    },

    previousPage(): void {
      query.page--;
      activeRow = 0;
      refresh(false);
    },

    nextPage(): void {
      query.page++;
      activeRow = 0;
      refresh(false);
    },

    get hasPrevious(): boolean {
      return result.page > 0;
    },

    get hasNext(): boolean {
      return result.page < result.pages - 1;
    },

    onChange(callback: () => void): void {
      afterChange = callback;
      callback();
    },
  };
}