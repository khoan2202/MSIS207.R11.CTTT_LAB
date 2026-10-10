export interface GridQuery<T> {
  search: string;
  sortKey?: keyof T;
  ascending: boolean;
  page: number;
  pageSize: number;
}

export function queryData<T extends object>(
  data: T[],
  query: GridQuery<T>,
) {
  if (
    !Number.isInteger(query.pageSize) ||
    query.pageSize <= 0
  ) {
    throw new RangeError(
      "pageSize phải là số nguyên dương",
    );
  }

  const term =
    query.search.trim().toLocaleLowerCase("vi");

  const filtered = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value)
        .toLocaleLowerCase("vi")
        .includes(term),
    ),
  );

  const sorted = [...filtered];

  if (query.sortKey) {
    const key = query.sortKey;

    sorted.sort((first, second) => {
      const a = first[key];
      const b = second[key];

      const result =
        typeof a === "number" && typeof b === "number"
          ? a - b
          : String(a).localeCompare(
              String(b),
              "vi",
              { numeric: true },
            );

      return query.ascending ? result : -result;
    });
  }

  const pages = Math.max(
    1,
    Math.ceil(sorted.length / query.pageSize),
  );

  const page = Math.max(
    0,
    Math.min(query.page, pages - 1),
  );

  const start = page * query.pageSize;

  return {
    rows: sorted.slice(start, start + query.pageSize),
    total: sorted.length,
    page,
    pages,
  };
}
