import { useCallback, useEffect, useState } from "react";
import { API_URL, fetchJson } from "./api.js";

// Sprint 3 contract — useForumMessages(forumId)
// => { data, loading, error, postMessage(payload), reload() }
//
// Chống race condition khi đổi kênh nhanh:
// 1) Mỗi lần forumId đổi, effect cũ chạy cleanup => controller.abort()
//    => request cũ bị hủy thật sự ở tầng mạng (DevTools hiện "(canceled)").
// 2) Guard signal.aborted trước mọi setState: kể cả khi response cũ đã về
//    tới nơi, nó cũng không được ghi đè dữ liệu của kênh mới.
// 3) Kết quả lưu kèm "key" của request; loading là DERIVED STATE
//    (key hiện tại khác key của kết quả) => không cần setLoading(true) trong effect.
export function useForumMessages(forumId) {
  const [version, setVersion] = useState(0); // tăng để refetch sau khi POST
  const [result, setResult] = useState({ key: null, data: [], error: null });
  const requestKey = `${forumId}#${version}`;

  useEffect(() => {
    const controller = new AbortController();

    const fetchMessages = async () => {
      try {
        const data = await fetchJson(`${API_URL}/api/messages/${encodeURIComponent(forumId)}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResult({ key: requestKey, data, error: null });
      } catch (err) {
        // AbortError là hủy chủ động, không phải lỗi => bỏ qua.
        if (!controller.signal.aborted) setResult({ key: requestKey, data: [], error: err });
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, [forumId, requestKey]);

  const postMessage = useCallback(
    async (payload) => {
      const created = await fetchJson(`${API_URL}/api/messages/${encodeURIComponent(forumId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setVersion((v) => v + 1); // kích hoạt refetch danh sách
      return created;
    },
    [forumId],
  );

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const loading = result.key !== requestKey;
  return {
    data: loading ? [] : result.data,
    loading,
    error: loading ? null : result.error,
    postMessage,
    reload,
  };
}
