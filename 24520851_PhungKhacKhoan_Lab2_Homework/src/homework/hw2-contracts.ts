export interface AudioEngine {
  readonly analyser: AnalyserNode;

  resume(): Promise<void>;

  decode(
    bytes: ArrayBuffer,
    signal: AbortSignal,
  ): Promise<AudioBuffer>;

  play(
    buffer: AudioBuffer,
    signal: AbortSignal,
  ): Promise<void>;

  dispose(): Promise<void>;
}

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

export function abortError(): DOMException {
  return new DOMException("Tác vụ đã bị hủy.", "AbortError");
}

export function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw abortError();
  }
}