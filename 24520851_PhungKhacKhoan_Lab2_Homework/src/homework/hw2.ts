import { el } from "../core/dom";
import { createAudioEngine } from "./hw2-audio-engine";
import {
  createAudioQueue,
  type AudioQueue,
  type QueueSnapshot,
} from "./hw2-audio-queue";
import { createDemoAudio } from "./hw2-demo-audio";
import { startVisualizer } from "./hw2-visualizer";
import type { AudioEngine } from "./hw2-contracts";

export function mountHomework2(
  root: HTMLElement,
): () => void {
  const demo = createDemoAudio();

  let engine: AudioEngine | null = null;
  let queue: AudioQueue | null = null;
  let stopVisualizer: (() => void) | null = null;
  let disposed = false;
  let starting = false;

  const logs: string[] = [];

  const status = el(
    "p",
    { role: "status", "aria-live": "polite" },
    "Nhấn Bật âm thanh để bắt đầu.",
  );

  const queueList = el("ol", {
    className: "audio-queue",
    "aria-label": "Các bài đang trong hàng đợi",
  });

  const logList = el("ol", {
    className: "audio-log",
    "aria-label": "Nhật ký hoạt động",
  });

  const canvas = el("canvas", {
    className: "audio-canvas",
    role: "img",
    "aria-label": "Biểu đồ phổ tần số của âm thanh đang phát",
  });

  const actionButtons: HTMLButtonElement[] = [];

  function log(message: string): void {
    if (disposed) {
      return;
    }

    logs.push(message);

    if (logs.length > 60) {
      logs.shift();
    }

    logList.replaceChildren(
      ...logs.map((message) => el("li", {}, message)),
    );

    logList.scrollTop = logList.scrollHeight;
  }

  function update(snapshot: QueueSnapshot): void {
    if (disposed) {
      return;
    }

    status.textContent = snapshot.playing
      ? `Đang phát: ${snapshot.playing}. Tác vụ tải/decode: ${snapshot.downloading}/2.`
      : `Chưa phát bài nào. Tác vụ tải/decode: ${snapshot.downloading}/2.`;

    queueList.replaceChildren(
      ...snapshot.items.map((item) =>
        el(
          "li",
          {},
          `${item.title} — ${item.status}`,
        ),
      ),
    );

    if (snapshot.items.length === 0) {
      queueList.append(el("li", {}, "Hàng đợi trống."));
    }
  }

  function addTrack(
    title: string,
    url: string,
  ): void {
    if (!queue || disposed) {
      return;
    }

    try {
      queue.enqueue({
        id: crypto.randomUUID(),
        title,
        url,
      });
    } catch (error) {
      log(
        error instanceof Error
          ? error.message
          : String(error),
      );
    }
  }

  const startButton = el(
    "button",
    {
      type: "button",
      onClick: async () => {
        if (starting || engine || disposed) {
          return;
        }

        starting = true;
        startButton.disabled = true;

        let candidate: AudioEngine | null = null;

        try {
          // Tạo và resume trực tiếp từ thao tác bấm của user.
          candidate = createAudioEngine();
          await candidate.resume();

          if (disposed) {
            await candidate.dispose();
            return;
          }

          engine = candidate;

          stopVisualizer = startVisualizer(
            canvas,
            engine.analyser,
          );

          queue = createAudioQueue({
            engine,
            load: demo.load,
            onChange: update,
            onLog: log,
          });

          for (const button of actionButtons) {
            button.disabled = false;
          }

          startButton.textContent = "Âm thanh đã bật";
          status.textContent = "Sẵn sàng. Hãy thêm bài.";
          log("Audio engine đã sẵn sàng.");
        } catch (error) {
          stopVisualizer?.();
          stopVisualizer = null;

          queue?.dispose();
          queue = null;
          engine = null;

          await candidate?.dispose().catch(() => {});

          if (!disposed) {
            startButton.disabled = false;
            status.textContent =
              "Không bật được âm thanh. Hãy thử lại.";

            log(
              error instanceof Error
                ? error.message
                : String(error),
            );
          }
        } finally {
          starting = false;
        }
      },
    },
    "Bật âm thanh",
  );

  const sampleButtons = demo.tracks.map((track) => {
    const button = el(
      "button",
      {
        type: "button",
        disabled: true,
        onClick: () => addTrack(track.title, track.url),
      },
      `Thêm ${track.title}`,
    );

    actionButtons.push(button);
    return button;
  });

  const fifoButton = el(
    "button",
    {
      type: "button",
      disabled: true,
      onClick: () => {
        for (const track of demo.tracks) {
          addTrack(track.title, track.url);
        }
      },
    },
    "Test FIFO: thêm A → B → C",
  );

  const errorButton = el(
    "button",
    {
      type: "button",
      disabled: true,
      onClick: () =>
        addTrack(
          "Bài lỗi để kiểm tra phục hồi",
          "/audio-file-does-not-exist.wav",
        ),
    },
    "Thêm bài lỗi",
  );

  const cancelButton = el(
    "button",
    {
      type: "button",
      disabled: true,
      onClick: () => queue?.cancelAll(),
    },
    "Hủy toàn bộ",
  );

  actionButtons.push(
    fifoButton,
    errorButton,
    cancelButton,
  );

  root.replaceChildren(
    el("h1", {}, "Homework 2 — Audio Queue & Visualizer"),
    el(
      "p",
      {},
      "Tải/decode tối đa hai bài đồng thời; phát từng bài theo thứ tự FIFO.",
    ),
    el(
      "section",
      {
        className: "toolbar",
        "aria-label": "Điều khiển âm thanh",
      },
      startButton,
      ...sampleButtons,
      fifoButton,
      errorButton,
      cancelButton,
    ),
    status,
    canvas,
    el("h2", {}, "Hàng đợi"),
    queueList,
    el("h2", {}, "Nhật ký"),
    el(
      "p",
      {},
      "Trong bài test FIFO, B có thể sẵn sàng trước A nhưng thứ tự phát vẫn là A, B, C.",
    ),
    logList,
  );

  queueList.append(el("li", {}, "Hàng đợi trống."));

  return () => {
    if (disposed) {
      return;
    }

    disposed = true;

    queue?.dispose();
    stopVisualizer?.();

    if (engine) {
      void engine.dispose().catch((error: unknown) => {
        console.error("Không đóng được AudioContext:", error);
      });
    }

    demo.dispose();
  };
}