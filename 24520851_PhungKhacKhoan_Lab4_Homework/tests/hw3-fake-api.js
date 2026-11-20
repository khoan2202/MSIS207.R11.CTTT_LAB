import { buildDossiers } from "../server/data/dossiers.js";

// fetch giả cho test UI HW3: trả dossier theo URL, đếm request.
export function installTribunalFetch({ now = Date.now(), appeals = {}, onPost } = {}) {
  const dossiers = buildDossiers(new Date(now)).map(({ _id, ...rest }) => ({
    playerId: _id, ...rest, issuedAt: rest.issuedAt.toISOString(), appealDeadline: rest.appealDeadline.toISOString(),
  }));
  const res = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });
  globalThis.fetch = vi.fn(async (url, opts = {}) => {
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    if (path === "/api/time") return res({ now: Date.now() });
    if (path === "/api/dossiers") return res(dossiers);
    let m = path.match(/^\/api\/dossiers\/(.+)$/);
    if (m) { const d = dossiers.find((x) => x.playerId === m[1].toLowerCase()); return d ? res(d) : res({ error: "404" }, 404); }
    m = path.match(/^\/api\/appeals\/(.+)$/);
    if (m) return appeals[m[1]] ? res(appeals[m[1]]) : res({ error: "Chưa có" }, 404);
    if (path === "/api/appeals" && opts.method === "POST") return onPost ? onPost(JSON.parse(opts.body), res) : res({}, 201);
    return res({ error: "?" }, 404);
  });
  return dossiers;
}
