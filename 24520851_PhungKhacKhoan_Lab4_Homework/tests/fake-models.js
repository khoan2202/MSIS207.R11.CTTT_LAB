// Model giả mô phỏng đúng phần API Mongoose mà routes sử dụng
// (find().sort().lean(), findOne().lean(), exists, create, deleteOne, unique index -> lỗi 11000).
function matches(doc, filter) {
  return Object.entries(filter).every(([k, v]) => doc[k] === v);
}

function query(resultFn) {
  let sortSpec = null;
  const q = {
    sort(spec) { sortSpec = spec; return q; },
    lean() {
      let rows = resultFn().map((d) => structuredClone(d));
      if (Array.isArray(rows) && sortSpec) {
        const [[key, dir]] = Object.entries(sortSpec);
        rows = rows.sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
      }
      return Promise.resolve(rows);
    },
  };
  return q;
}

// defaults: mô phỏng giá trị default của schema (Mongoose tự điền khi create).
export function createFakeModel({ uniques = [], seed = [], defaults = {} } = {}) {
  const docs = seed.map((d) => ({ ...d }));
  let tick = 0;
  return {
    docs,
    find(filter = {}) { return query(() => docs.filter((d) => matches(d, filter))); },
    findOne(filter) {
      const q = query(() => docs.filter((d) => matches(d, filter)).slice(0, 1));
      return { lean: () => q.lean().then((r) => r[0] ?? null) };
    },
    async exists(filter) { return docs.some((d) => matches(d, filter)) ? { _id: "x" } : null; },
    async create(data) {
      for (const keys of uniques) {
        if (docs.some((d) => keys.every((k) => d[k] === data[k]))) {
          throw Object.assign(new Error("E11000 duplicate key"), { code: 11000, keyPattern: Object.fromEntries(keys.map((k) => [k, 1])) });
        }
      }
      const doc = { _id: `fake${tick}`, ...defaults, ...data, createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, tick++)) };
      docs.push(doc);
      return { ...doc };
    },
    async deleteOne(filter) {
      const i = docs.findIndex((d) => matches(d, filter));
      if (i >= 0) docs.splice(i, 1);
      return { deletedCount: i >= 0 ? 1 : 0 };
    },
  };
}
