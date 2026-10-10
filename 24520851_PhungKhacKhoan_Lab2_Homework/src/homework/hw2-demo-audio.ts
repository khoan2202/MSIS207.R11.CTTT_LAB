import {
  abortError,
  throwIfAborted,
  type AudioTrack,
} from "./hw2-contracts";

function createTone(frequency: number): Blob {
  const sampleRate = 22050;
  const seconds = 2;
  const sampleCount = sampleRate * seconds;

  const bytes = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(bytes);

  function writeText(offset: number, text: string): void {
    for (let index = 0; index < text.length; index += 1) {
      view.setUint8(offset + index, text.charCodeAt(index));
    }
  }

  writeText(0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, sampleCount * 2, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;

    // Fade đầu/cuối để giảm tiếng click.
    const fadeIn = Math.min(1, time / 0.04);
    const fadeOut = Math.min(1, (seconds - time) / 0.08);
    const envelope = Math.max(0, Math.min(fadeIn, fadeOut));

    const fundamental = Math.sin(
      2 * Math.PI * frequency * time,
    );

    const harmonic =
      0.25 * Math.sin(2 * Math.PI * frequency * 2 * time);

    const sample =
      (fundamental + harmonic) * envelope * 0.5;

    view.setInt16(
      44 + index * 2,
      Math.round(sample * 32767),
      true,
    );
  }

  return new Blob([bytes], { type: "audio/wav" });
}

function delay(
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    throwIfAborted(signal);

    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);

    function onAbort(): void {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    }

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function createDemoAudio() {
  const urls = [
    URL.createObjectURL(createTone(262)),
    URL.createObjectURL(createTone(330)),
    URL.createObjectURL(createTone(392)),
  ];

  const delays = new Map<string, number>([
    [urls[0]!, 1200],
    [urls[1]!, 150],
    [urls[2]!, 400],
  ]);

  const tracks: Omit<AudioTrack, "id">[] = [
    {
      title: "A — Đô, tải chậm",
      url: urls[0]!,
    },
    {
      title: "B — Mi, tải nhanh",
      url: urls[1]!,
    },
    {
      title: "C — Sol",
      url: urls[2]!,
    },
  ];

  async function load(
    track: AudioTrack,
    signal: AbortSignal,
  ): Promise<ArrayBuffer> {
    await delay(delays.get(track.url) ?? 0, signal);
    throwIfAborted(signal);

    const response = await fetch(track.url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const bytes = await response.arrayBuffer();
    throwIfAborted(signal);

    return bytes;
  }

  function dispose(): void {
    for (const url of urls) {
      URL.revokeObjectURL(url);
    }
  }

  return {
    tracks,
    load,
    dispose,
  };
}