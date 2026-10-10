import test from "node:test";
import assert from "node:assert/strict";

import {
  createInventory,
} from "../src/homework/hw3-inventory.ts";

function assertInvariant(inventory) {
  const snapshot = inventory.snapshot();

  assert.equal(
    snapshot.available + snapshot.reserved + snapshot.sold,
    snapshot.total,
  );

  assert.ok(snapshot.available >= 0);
}

test("100 yêu cầu tranh 3 sản phẩm: chỉ 3 lượt giữ thành công", async () => {
  const inventory = createInventory({
    total: 3,
    saleEndsAt: Date.now() + 60_000,
    reservationMs: 10_000,
  });

  const results = await Promise.allSettled(
    Array.from({ length: 100 }, () =>
      Promise.resolve().then(() => inventory.reserve()),
    ),
  );

  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    3,
  );

  assert.equal(
    results.filter((result) => result.status === "rejected").length,
    97,
  );

  assert.deepEqual(inventory.snapshot(), {
    total: 3,
    available: 0,
    reserved: 3,
    sold: 0,
  });

  assertInvariant(inventory);
});

test("giữ hàng hết hạn trả hàng lại kho và không thanh toán được", () => {
  let clock = 1000;

  const inventory = createInventory({
    total: 1,
    saleEndsAt: 20_000,
    reservationMs: 1000,
    now: () => clock,
  });

  const reservation = inventory.reserve();

  clock = 2000;

  assert.equal(
    inventory.hasReservation(reservation.token),
    false,
  );

  assert.throws(() => inventory.checkout(reservation.token));

  assert.deepEqual(inventory.snapshot(), {
    total: 1,
    available: 1,
    reserved: 0,
    sold: 0,
  });

  assertInvariant(inventory);
});

test("thanh toán lặp cùng token không bán hai lần", () => {
  const inventory = createInventory({
    total: 1,
    saleEndsAt: 20_000,
    reservationMs: 10_000,
    now: () => 1000,
  });

  const reservation = inventory.reserve();

  const first = inventory.checkout(reservation.token);
  const second = inventory.checkout(reservation.token);

  assert.equal(first.id, second.id);

  inventory.cancel(reservation.token);

  assert.deepEqual(inventory.snapshot(), {
    total: 1,
    available: 0,
    reserved: 0,
    sold: 1,
  });

  assertInvariant(inventory);
});

test("hủy lặp không tăng tồn kho quá tổng ban đầu", () => {
  const inventory = createInventory({
    total: 1,
    saleEndsAt: 20_000,
    reservationMs: 10_000,
    now: () => 1000,
  });

  const reservation = inventory.reserve();

  inventory.cancel(reservation.token);
  inventory.cancel(reservation.token);

  assert.equal(inventory.snapshot().available, 1);
  assertInvariant(inventory);
});

test("deadline sale giới hạn thời gian giữ hàng", () => {
  let clock = 1000;

  const inventory = createInventory({
    total: 1,
    saleEndsAt: 1500,
    reservationMs: 10_000,
    now: () => clock,
  });

  const reservation = inventory.reserve();

  assert.equal(reservation.expiresAt, 1500);

  clock = 1500;

  assert.throws(() => inventory.reserve());
  assert.throws(() => inventory.checkout(reservation.token));

  assertInvariant(inventory);
});

test("sau khi lượt giữ hết hạn có thể giữ hàng lại bằng token mới", () => {
  let clock = 1000;

  const inventory = createInventory({
    total: 1,
    saleEndsAt: 20_000,
    reservationMs: 1000,
    now: () => clock,
  });

  const first = inventory.reserve();

  clock = 2000;

  const second = inventory.reserve();

  assert.notEqual(first.token, second.token);
  assert.equal(inventory.hasReservation(first.token), false);
  assert.equal(inventory.hasReservation(second.token), true);

  assertInvariant(inventory);
});