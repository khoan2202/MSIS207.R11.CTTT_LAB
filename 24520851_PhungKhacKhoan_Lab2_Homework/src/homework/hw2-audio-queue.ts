import {
  throwIfAborted,
  type AudioEngine,
  type AudioTrack,
} from "./hw2-contracts";

type TrackStatus =
  | "WAITING"
  | "LOADING"
  | "READY"
  | "PLAYING"
  | "FAILED"
  | "CANCELLED";

interface QueueItem {
  track: AudioTrack;
  controller: AbortController;
  status: TrackStatus;
  buffer?: AudioBuffer;
}

export interface QueueSnapshot {
  downloading: number;
  playing: string | null;
  items: {
    id: string;
    title: string;
    status: TrackStatus;
  }[];
}

interface QueueOptions {
  engine: AudioEngine;
  load: (
    track: AudioTrack,
    signal: AbortSignal,
  ) => Promise<ArrayBuffer>;
  onChange: (snapshot: QueueSnapshot) => void;
  onLog: (message: string) => void;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createAudioQueue(options: QueueOptions) {
  const items: QueueItem[] = [];

  let downloading = 0;
  let playing = false;
  let disposed = false;

  function emit(): void {
    if (disposed) {
      return;
    }

    options.onChange({
      downloading,
      playing:
        items.find((item) => item.status === "PLAYING")
          ?.track.title ?? null,
      items: items.map((item) => ({
        id: item.track.id,
        title: item.track.title,
        status: item.status,
      })),
    });
  }

  async function prepare(item: QueueItem): Promise<void> {
    downloading += 1;
    item.status = "LOADING";

    options.onLog(`Đang tải: ${item.track.title}`);
    emit();

    try {
      const signal = item.controller.signal;

      const bytes = await options.load(item.track, signal);
      throwIfAborted(signal);

      const buffer = await options.engine.decode(bytes, signal);
      throwIfAborted(signal);

      if (disposed) {
        return;
      }

      item.buffer = buffer;
      item.status = "READY";

      options.onLog(`Sẵn sàng: ${item.track.title}`);
    } catch (error) {
      if (disposed) {
        return;
      }

      if (item.controller.signal.aborted) {
        item.status = "CANCELLED";
      } else {
        item.status = "FAILED";
        options.onLog(
          `Lỗi ${item.track.title}: ${errorMessage(error)}`,
        );
      }
    } finally {
      downloading -= 1;

      if (!disposed) {
        emit();
        pumpDownloads();
        void drain();
      }
    }
  }

  function pumpDownloads(): void {
    if (disposed) {
      return;
    }

    while (downloading < 2) {
      const next = items.find(
        (item) => item.status === "WAITING",
      );

      if (!next) {
        break;
      }

      // prepare() tăng downloading trước lần await đầu tiên.
      void prepare(next);
    }
  }

  async function drain(): Promise<void> {
    if (disposed || playing) {
      return;
    }

    // Loại bài lỗi/hủy ở đầu hàng đợi.
    while (
      items[0]?.status === "FAILED" ||
      items[0]?.status === "CANCELLED"
    ) {
      const removed = items.shift();

      if (removed) {
        removed.buffer = undefined;
      }
    }

    const head = items[0];

    // Không vượt qua bài đầu nếu nó chưa sẵn sàng.
    // Đây là điều giữ đúng thứ tự FIFO.
    if (!head || head.status !== "READY" || !head.buffer) {
      emit();
      return;
    }

    playing = true;
    head.status = "PLAYING";

    options.onLog(`Bắt đầu phát: ${head.track.title}`);
    emit();

    try {
      await options.engine.play(
        head.buffer,
        head.controller.signal,
      );

      if (!disposed) {
        options.onLog(`Phát xong: ${head.track.title}`);
      }
    } catch (error) {
      if (!disposed && !head.controller.signal.aborted) {
        options.onLog(
          `Lỗi phát ${head.track.title}: ${errorMessage(error)}`,
        );
      }
    } finally {
      head.buffer = undefined;

      if (items[0] === head) {
        items.shift();
      }

      playing = false;

      if (!disposed) {
        emit();
        pumpDownloads();
        void drain();
      }
    }
  }

  function enqueue(track: AudioTrack): void {
    if (disposed) {
      throw new Error("Hàng đợi đã đóng.");
    }

    if (items.length >= 20) {
      throw new Error("Hàng đợi tối đa 20 bài.");
    }

    items.push({
      track,
      controller: new AbortController(),
      status: "WAITING",
    });

    options.onLog(`Thêm vào hàng đợi: ${track.title}`);

    emit();
    pumpDownloads();
  }

  function cancelAll(): void {
    if (disposed) {
      return;
    }

    for (const item of items) {
      item.status = "CANCELLED";
      item.controller.abort();
      item.buffer = undefined;
    }

    options.onLog("Đã hủy toàn bộ hàng đợi.");
    emit();

    void drain();
  }

  function dispose(): void {
    if (disposed) {
      return;
    }

    disposed = true;

    for (const item of items) {
      item.controller.abort();
      item.buffer = undefined;
    }

    items.length = 0;
  }

  return {
    enqueue,
    cancelAll,
    dispose,
  };
}

export type AudioQueue = ReturnType<typeof createAudioQueue>;