import { el } from "../core/dom";
import type {
  Reservation,
  SaleState,
} from "./hw3-contracts";
import { createInventory } from "./hw3-inventory";
import { createSaleService } from "./hw3-service";
import {
  formatRemaining,
  remainingMs,
  startClock,
} from "./hw3-timer";

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function mountHomework3(
  root: HTMLElement,
): () => void {
  // Mỗi lần tải lại trang bắt đầu một phiên mô phỏng mới.
  const saleEndsAt = Date.now() + 120_000;

  const inventory = createInventory({
    total: 3,
    saleEndsAt,
    reservationMs: 10_000,
  });

  const service = createSaleService(inventory);

  let state: SaleState = { status: "IDLE" };
  let controller: AbortController | null = null;
  let operationVersion = 0;
  let disposed = false;
  let lastStock = "";

  const saleClock = el("strong", {}, "02:00");
  const reservationClock = el("strong", {}, "—");
  const stockText = el("p", {});
  const statusText = el("p", {
    role: "status",
    "aria-live": "polite",
  });

  const failInput = el("input", {
    type: "checkbox",
    id: "hw3-fail-payment",
  });

  const orderText = el("p", {
    className: "sale-order",
  });

  function reservationOfState(): Reservation | null {
    if (
      state.status === "RESERVED" ||
      state.status === "CHECKING_OUT"
    ) {
      return state.reservation;
    }

    return null;
  }

  function updateStock(): void {
    const snapshot = inventory.snapshot();

    const text =
      `Tổng: ${snapshot.total} · ` +
      `Còn: ${snapshot.available} · ` +
      `Đang giữ: ${snapshot.reserved} · ` +
      `Đã bán: ${snapshot.sold}`;

    if (text !== lastStock) {
      stockText.textContent = text;
      lastStock = text;
    }
  }

  function renderState(): void {
    if (disposed) {
      return;
    }

    const saleExpired = remainingMs(saleEndsAt) === 0;
    const busy =
      state.status === "RESERVING" ||
      state.status === "CHECKING_OUT";

    buyButton.disabled =
      saleExpired ||
      busy ||
      state.status === "RESERVED" ||
      state.status === "SUCCESS" ||
      inventory.snapshot().available === 0;

    payButton.disabled = state.status !== "RESERVED";

    cancelButton.disabled =
      state.status !== "RESERVING" &&
      state.status !== "RESERVED" &&
      state.status !== "CHECKING_OUT";

    failInput.disabled = state.status === "CHECKING_OUT";

    orderText.textContent = "";

    switch (state.status) {
      case "IDLE":
        statusText.textContent =
          "Sẵn sàng. Mỗi lượt giữ hàng có tối đa 10 giây.";
        break;

      case "RESERVING":
        statusText.textContent = "Đang gửi yêu cầu giữ hàng…";
        break;

      case "RESERVED":
        statusText.textContent =
          "Đã giữ một sản phẩm. Hãy thanh toán trước khi hết hạn.";
        break;

      case "CHECKING_OUT":
        statusText.textContent = "Đang thanh toán…";
        break;

      case "SUCCESS":
        statusText.textContent = "Thanh toán thành công.";
        orderText.textContent = `Mã đơn hàng: ${state.order.id}`;
        break;

      case "EXPIRED":
      case "ERROR":
        statusText.textContent = state.message;
        break;
    }

    if (
      saleExpired &&
      state.status !== "SUCCESS" &&
      state.status !== "EXPIRED"
    ) {
      statusText.textContent = "Flash Sale đã kết thúc.";
    }

    updateStock();
  }

  function setState(next: SaleState): void {
    state = next;
    renderState();
  }

  async function reserve(): Promise<void> {
    if (
      disposed ||
      state.status === "RESERVING" ||
      state.status === "RESERVED" ||
      state.status === "CHECKING_OUT" ||
      state.status === "SUCCESS"
    ) {
      return;
    }

    if (remainingMs(saleEndsAt) === 0) {
      setState({
        status: "EXPIRED",
        message: "Flash Sale đã kết thúc.",
      });
      return;
    }

    const current = new AbortController();
    controller = current;

    const version = ++operationVersion;

    setState({ status: "RESERVING" });

    try {
      const reservation = await service.reserve(current.signal);

      // Nếu rời trang/hủy sau lúc API giữ được hàng,
      // phải trả lượt giữ vừa tạo lại cho kho.
      if (
        disposed ||
        current.signal.aborted ||
        version !== operationVersion
      ) {
        inventory.cancel(reservation.token);
        return;
      }

      if (!inventory.hasReservation(reservation.token)) {
        setState({
          status: "EXPIRED",
          message: "Lượt giữ hàng đã hết hạn.",
        });
        return;
      }

      setState({
        status: "RESERVED",
        reservation,
      });
    } catch (error) {
      if (
        !disposed &&
        !current.signal.aborted &&
        version === operationVersion
      ) {
        setState({
          status: "ERROR",
          message: messageOf(error),
        });
      }
    } finally {
      if (controller === current) {
        controller = null;
      }
    }
  }

  async function checkout(): Promise<void> {
    if (disposed || state.status !== "RESERVED") {
      return;
    }

    const reservation = state.reservation;

    if (!inventory.hasReservation(reservation.token)) {
      setState({
        status: "EXPIRED",
        message: "Lượt giữ hàng đã hết hạn.",
      });
      return;
    }

    const current = new AbortController();
    controller = current;

    const version = ++operationVersion;
    const shouldFail = failInput.checked;

    setState({
      status: "CHECKING_OUT",
      reservation,
    });

    try {
      const order = await service.checkout(
        reservation.token,
        current.signal,
        shouldFail,
      );

      if (
        disposed ||
        current.signal.aborted ||
        version !== operationVersion
      ) {
        return;
      }

      setState({
        status: "SUCCESS",
        order,
      });
    } catch (error) {
      if (
        disposed ||
        current.signal.aborted ||
        version !== operationVersion
      ) {
        return;
      }

      const stillReserved = inventory.hasReservation(
        reservation.token,
      );

      // Trả hàng khi thanh toán thất bại.
      inventory.cancel(reservation.token);

      setState(
        stillReserved
          ? {
              status: "ERROR",
              message: `${messageOf(error)} Hàng đã được trả lại kho.`,
            }
          : {
              status: "EXPIRED",
              message: "Lượt giữ hàng hết hạn trong lúc thanh toán.",
            },
      );
    } finally {
      if (controller === current) {
        controller = null;
      }
    }
  }

  function cancel(): void {
    if (disposed) {
      return;
    }

    operationVersion += 1;
    controller?.abort();
    controller = null;

    const reservation = reservationOfState();

    if (reservation) {
      inventory.cancel(reservation.token);
    }

    setState({ status: "IDLE" });
  }

  const buyButton = el(
    "button",
    {
      type: "button",
      onClick: reserve,
    },
    "Giữ hàng",
  );

  const payButton = el(
    "button",
    {
      type: "button",
      onClick: checkout,
    },
    "Thanh toán",
  );

  const cancelButton = el(
    "button",
    {
      type: "button",
      onClick: cancel,
    },
    "Hủy giao dịch",
  );

  root.replaceChildren(
    el("h1", {}, "Homework 3 — Flash Sale"),
    el(
      "p",
      {},
      "Phiên mô phỏng: 3 sản phẩm, sale 2 phút, giữ hàng tối đa 10 giây.",
    ),
    el(
      "section",
      {
        className: "sale-card",
        "aria-label": "Sản phẩm Flash Sale",
      },
      el("h2", {}, "Laptop dành cho sinh viên"),
      el(
        "p",
        { className: "sale-price" },
        "12.990.000 ₫",
      ),
      el("p", {}, "Sale kết thúc sau: ", saleClock),
      el("p", {}, "Thời gian giữ hàng còn: ", reservationClock),
      stockText,
      el(
        "div",
        { className: "toolbar" },
        buyButton,
        payButton,
        cancelButton,
      ),
      el(
        "label",
        {
          className: "sale-failure-option",
          htmlFor: "hw3-fail-payment",
        },
        failInput,
        " Mô phỏng lỗi thanh toán",
      ),
      statusText,
      orderText,
    ),
    el(
      "p",
      {},
      "Đây là backend mô phỏng trong một trang. Tải lại trang sẽ tạo phiên mới.",
    ),
  );

  // Helper el() hiện tại dùng setAttribute:
  // label cần thuộc tính HTML "for".
  const failureLabel = failInput.parentElement;

  if (failureLabel instanceof HTMLLabelElement) {
    failureLabel.htmlFor = failInput.id;
  }

  renderState();

  function tick(now: number): void {
    if (disposed) {
      return;
    }

    const saleRemaining = remainingMs(saleEndsAt, now);
    const saleText = formatRemaining(saleRemaining);

    if (saleClock.textContent !== saleText) {
      saleClock.textContent = saleText;
    }

    const reservation = reservationOfState();
    const reservationText = reservation
      ? formatRemaining(remainingMs(reservation.expiresAt, now))
      : "—";

    if (reservationClock.textContent !== reservationText) {
      reservationClock.textContent = reservationText;
    }

    if (
      reservation &&
      !inventory.hasReservation(reservation.token)
    ) {
      operationVersion += 1;
      controller?.abort();
      controller = null;

      setState({
        status: "EXPIRED",
        message: "Lượt giữ hàng đã hết hạn. Hàng được trả lại kho.",
      });
    } else if (
      saleRemaining === 0 &&
      state.status !== "SUCCESS" &&
      state.status !== "EXPIRED"
    ) {
      operationVersion += 1;
      controller?.abort();
      controller = null;

      setState({
        status: "EXPIRED",
        message: "Flash Sale đã kết thúc.",
      });
    }

    updateStock();
  }

  tick(Date.now());
  const stopClock = startClock(tick);

  return () => {
    if (disposed) {
      return;
    }

    disposed = true;
    operationVersion += 1;

    controller?.abort();
    controller = null;

    const reservation = reservationOfState();

    if (reservation) {
      inventory.cancel(reservation.token);
    }

    stopClock();
  };
}