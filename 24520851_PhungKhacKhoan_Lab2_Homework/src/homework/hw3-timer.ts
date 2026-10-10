export function remainingMs(
  deadline: number,
  now = Date.now(),
): number {
  return Math.max(0, deadline - now);
}

export function formatRemaining(milliseconds: number): string {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(seconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;
}

export function startClock(
  onTick: (now: number) => void,
): () => void {
  let frame = 0;
  let stopped = false;
  let previousBucket = -1;

  function tick(): void {
    if (stopped) {
      return;
    }

    const now = Date.now();
    const bucket = Math.floor(now / 100);

    // Kiểm tra khoảng 10 lần/giây.
    // Giao diện chỉ ghi text khi giá trị hiển thị thay đổi.
    if (bucket !== previousBucket) {
      previousBucket = bucket;
      onTick(now);
    }

    frame = requestAnimationFrame(tick);
  }

  frame = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}