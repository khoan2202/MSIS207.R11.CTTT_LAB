import {
  abortError,
  throwIfAborted,
  type AudioEngine,
} from "./hw2-contracts";

export function createAudioEngine(): AudioEngine {
  const context = new AudioContext();

  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.8;

  const gain = context.createGain();
  gain.gain.value = 0.18;

  // Source → Analyser → Gain → Speakers
  analyser.connect(gain);
  gain.connect(context.destination);

  let disposed = false;
  let activeCancel: (() => void) | null = null;
  let disposal: Promise<void> | null = null;

  function assertAlive(): void {
    if (disposed) {
      throw new Error("Audio engine đã đóng.");
    }
  }

  async function resume(): Promise<void> {
    assertAlive();

    if (context.state === "suspended") {
      await context.resume();
    }

    assertAlive();
  }

  async function decode(
    bytes: ArrayBuffer,
    signal: AbortSignal,
  ): Promise<AudioBuffer> {
    assertAlive();
    throwIfAborted(signal);

    const buffer = await context.decodeAudioData(bytes);

    // decodeAudioData không hỗ trợ AbortSignal.
    // Nếu bị hủy trong lúc decode, bỏ kết quả khi decode hoàn tất.
    throwIfAborted(signal);
    assertAlive();

    return buffer;
  }

  function play(
    buffer: AudioBuffer,
    signal: AbortSignal,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let source: AudioBufferSourceNode | null = null;
      let settled = false;
      let cancel: (() => void) | null = null;

      function finish(error?: unknown): void {
        if (settled) {
          return;
        }

        settled = true;
        signal.removeEventListener("abort", onAbort);

        const currentSource = source;
        source = null;

        if (currentSource) {
          currentSource.onended = null;

          try {
            currentSource.stop();
          } catch {
            // Source có thể đã kết thúc hoặc chưa start.
          }

          currentSource.disconnect();
          currentSource.buffer = null;
        }

        if (activeCancel === cancel) {
          activeCancel = null;
        }

        if (error !== undefined) {
          reject(error);
        } else {
          resolve();
        }
      }

      function onAbort(): void {
        finish(abortError());
      }

      try {
        assertAlive();
        throwIfAborted(signal);

        if (context.state !== "running") {
          throw new Error(
            "Audio chưa sẵn sàng. Hãy nhấn nút bật âm thanh.",
          );
        }

        if (activeCancel) {
          throw new Error("Một bài khác đang được phát.");
        }

        // AudioBufferSourceNode chỉ được start một lần.
        // Vì vậy mỗi lượt phát phải tạo source mới.
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        source.onended = () => finish();

        cancel = onAbort;
        activeCancel = cancel;

        signal.addEventListener("abort", onAbort, {
          once: true,
        });

        // Kiểm tra lại ngay trước khi start.
        throwIfAborted(signal);
        source.start();
      } catch (error) {
        finish(error);
      }
    });
  }

  function dispose(): Promise<void> {
    if (disposal) {
      return disposal;
    }

    disposed = true;
    activeCancel?.();

    analyser.disconnect();
    gain.disconnect();

    disposal =
      context.state === "closed"
        ? Promise.resolve()
        : context.close();

    return disposal;
  }

  return {
    analyser,
    resume,
    decode,
    play,
    dispose,
  };
}