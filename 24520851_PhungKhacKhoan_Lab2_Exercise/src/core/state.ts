import {
  nextSlot,
  readSlot,
  writeSlot,
  notifyRender,
} from "./store.ts";

export type Setter<T> = (
  next: T | ((previous: T) => T),
) => void;

export function useState<T>(
  initialValue: T,
): [T, Setter<T>] {
  const slot = nextSlot(initialValue);

  const setState: Setter<T> = (next) => {
    const previous = readSlot(slot) as T;

    const resolved =
      typeof next === "function"
        ? (next as (previous: T) => T)(previous)
        : next;

    if (Object.is(previous, resolved)) {
      return;
    }

    writeSlot(slot, resolved);
    notifyRender();
  };

  return [readSlot(slot) as T, setState];
}