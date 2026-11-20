import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "./api.js";

// Hook GET dùng chung: AbortController + loading dạng derived state (giống Exercise Sprint 3).
// path = null => không gọi.
export function useFetchJson(path) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const key = path ? `${path}#${version}` : null;

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    fetchJson(path, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setResult({ key, data, error: null }); })
      .catch((error) => { if (!controller.signal.aborted) setResult({ key, data: null, error }); });
    return () => controller.abort();
  }, [path, key]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const loading = key !== null && result.key !== key;
  return { data: loading ? null : result.data, error: loading ? null : result.error, loading, reload };
}
