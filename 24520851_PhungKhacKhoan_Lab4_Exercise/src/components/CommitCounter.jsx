import { Profiler, useRef, useState, useCallback } from "react";

// Đếm số lần React "commit" (cập nhật DOM) của cây con bằng <Profiler>.
// Dùng để so sánh form cũ (5 useEffect) và form mới (derived state).
// Không dùng useEffect để đếm vì bản thân việc setState trong effect sẽ tạo thêm render.
export default function CommitCounter({ id, children }) {
  const count = useRef(0);
  const [snapshot, setSnapshot] = useState(0);

  const onRender = useCallback(() => {
    count.current += 1;
  }, []);

  return (
    <div className="commit-counter">
      <Profiler id={id} onRender={onRender}>{children}</Profiler>
      <p className="counter-row">
        <button type="button" className="secondary" onClick={() => setSnapshot(count.current)}>
          Xem số commit
        </button>
        <button type="button" className="secondary" onClick={() => { count.current = 0; setSnapshot(0); }}>
          Đặt lại
        </button>
        <output aria-live="polite">Tổng commit: {snapshot}</output>
      </p>
    </div>
  );
}
