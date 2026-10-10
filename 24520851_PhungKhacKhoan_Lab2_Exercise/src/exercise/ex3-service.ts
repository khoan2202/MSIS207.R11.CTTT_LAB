import type { Item } from "./ex3-types.ts";

function delay(
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();

    const abort = () => {
      clearTimeout(timer);

      reject(
        new DOMException(
          "Request đã bị hủy",
          "AbortError",
        ),
      );
    };

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, milliseconds);

    signal.addEventListener("abort", abort, {
      once: true,
    });
  });
}

export async function fetchFeed(
  signal: AbortSignal,
  shouldFail = false,
  waitMilliseconds = 900,
): Promise<Item[]> {
  await delay(waitMilliseconds, signal);

  signal.throwIfAborted();

  if (shouldFail) {
    throw new Error(
      "Không tải được dữ liệu. Hãy thử kết nối lại.",
    );
  }

  return [
    {
      id: "item-1",
      title: "VNode mô tả cấu trúc giao diện",
    },
    {
      id: "item-2",
      title: "State được giữ bằng closure và slot",
    },
    {
      id: "item-3",
      title: "Chỉ request mới nhất được cập nhật giao diện",
    },
  ];
}