import type {
  InventorySnapshot,
  Order,
  Reservation,
} from "./hw3-contracts.ts";

interface InventoryOptions {
  total: number;
  saleEndsAt: number;
  reservationMs: number;
  now?: () => number;
}

export function createInventory(options: InventoryOptions) {
  if (!Number.isInteger(options.total) || options.total < 1) {
    throw new Error("Tồn kho phải là số nguyên dương.");
  }

  if (
    !Number.isFinite(options.reservationMs) ||
    options.reservationMs <= 0
  ) {
    throw new Error("Thời hạn giữ hàng không hợp lệ.");
  }

  if (!Number.isFinite(options.saleEndsAt)) {
    throw new Error("Deadline không hợp lệ.");
  }

  const now = options.now ?? Date.now;

  const reservations = new Map<string, Reservation>();
  const orders = new Map<string, Order>();

  let available = options.total;

  function sweep(at: number): void {
    for (const [token, reservation] of reservations) {
      if (reservation.expiresAt <= at) {
        reservations.delete(token);
        available += 1;
      }
    }
  }

  function reserve(): Reservation {
    const at = now();
    sweep(at);

    if (at >= options.saleEndsAt) {
      throw new Error("Flash Sale đã kết thúc.");
    }

    if (available <= 0) {
      throw new Error("Sản phẩm đã hết hàng.");
    }

    const reservation: Reservation = {
      token: crypto.randomUUID(),
      expiresAt: Math.min(
        at + options.reservationMs,
        options.saleEndsAt,
      ),
    };

    // Kiểm tra và giảm tồn kho trong cùng một thao tác đồng bộ.
    available -= 1;
    reservations.set(reservation.token, reservation);

    return { ...reservation };
  }

  function checkout(token: string): Order {
    const at = now();
    sweep(at);

    // Thanh toán lặp cùng token trả cùng đơn hàng,
    // không tăng số lượng đã bán lần thứ hai.
    const existing = orders.get(token);

    if (existing) {
      return { ...existing };
    }

    const reservation = reservations.get(token);

    if (!reservation) {
      throw new Error("Lượt giữ hàng không tồn tại hoặc đã hết hạn.");
    }

    reservations.delete(token);

    const order: Order = {
      id: crypto.randomUUID(),
      token,
      createdAt: at,
    };

    orders.set(token, order);

    return { ...order };
  }

  function cancel(token: string): void {
    sweep(now());

    if (reservations.delete(token)) {
      available += 1;
    }
  }

  function hasReservation(token: string): boolean {
    sweep(now());
    return reservations.has(token);
  }

  function snapshot(): InventorySnapshot {
    sweep(now());

    return {
      total: options.total,
      available,
      reserved: reservations.size,
      sold: orders.size,
    };
  }

  return {
    reserve,
    checkout,
    cancel,
    hasReservation,
    snapshot,
  };
}

export type Inventory = ReturnType<typeof createInventory>;