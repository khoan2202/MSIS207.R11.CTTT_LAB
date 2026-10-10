import type { Inventory } from "./hw3-inventory";
import type { Order, Reservation } from "./hw3-contracts";

function abortError(): DOMException {
  return new DOMException("Tác vụ đã bị hủy.", "AbortError");
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) {
    throw abortError();
  }
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

export function createSaleService(inventory: Inventory) {
  async function reserve(
    signal: AbortSignal,
  ): Promise<Reservation> {
    await delay(700, signal);
    throwIfAborted(signal);

    return inventory.reserve();
  }

  async function checkout(
    token: string,
    signal: AbortSignal,
    shouldFail = false,
  ): Promise<Order> {
    await delay(1000, signal);
    throwIfAborted(signal);

    if (shouldFail) {
      throw new Error("Thanh toán thất bại do lỗi mô phỏng.");
    }

    return inventory.checkout(token);
  }

  return {
    reserve,
    checkout,
  };
}