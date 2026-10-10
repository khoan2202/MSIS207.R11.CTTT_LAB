const states: unknown[] = [];

let cursor = 0;
let renderer = () => {};

export function resetCursor(): void {
  cursor = 0;
}

export function clearStore(): void {
  states.length = 0;
  cursor = 0;
  renderer = () => {};
}

export function setRenderer(callback: () => void): void {
  renderer = callback;
}

export function nextSlot(initialValue: unknown): number {
  const slot = cursor++;

  if (slot >= states.length) {
    states.push(initialValue);
  }

  return slot;
}

export function readSlot(slot: number): unknown {
  return states[slot];
}

export function writeSlot(
  slot: number,
  value: unknown,
): void {
  states[slot] = value;
}

export function notifyRender(): void {
  renderer();
}