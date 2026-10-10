import { h } from "../core/vnode.ts";

import {
  useState,
  type Setter,
} from "../core/state.ts";

import { renderApp } from "../core/runtime.ts";

import { fetchFeed } from "./ex3-service.ts";

import type {
  Item,
  ViewState,
} from "./ex3-types.ts";

export function mountExercise3(
  root: HTMLElement,
): () => void {
  let currentRequest: AbortController | undefined;
  let requestVersion = 0;
  let alive = true;

  async function loadData(
    setState: Setter<ViewState<Item[]>>,
    shouldFail = false,
    waitMilliseconds = 900,
  ): Promise<void> {
    currentRequest?.abort();

    const controller = new AbortController();
    currentRequest = controller;

    const version = ++requestVersion;

    setState({
      status: "LOADING",
    });

    try {
      const items = await fetchFeed(
        controller.signal,
        shouldFail,
        waitMilliseconds,
      );

      if (
        !alive ||
        controller.signal.aborted ||
        version !== requestVersion
      ) {
        return;
      }

      setState({
        status: "SUCCESS",
        data: items,
      });
    } catch (error) {
      if (
        !alive ||
        controller.signal.aborted ||
        version !== requestVersion
      ) {
        return;
      }

      setState({
        status: "ERROR",

        error:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định.",
      });
    }
  }

  function DataFeed() {
    const [state, setState] =
      useState<ViewState<Item[]>>({
        status: "IDLE",
      });

    function cancelRequest(): void {
      currentRequest?.abort();
      requestVersion++;

      setState({
        status: "IDLE",
      });
    }

    const content =
      state.status === "IDLE"
        ? h(
            "p",
            null,
            "Chưa có dữ liệu. Bấm Tải dữ liệu để bắt đầu.",
          )
        : state.status === "LOADING"
          ? h(
              "section",
              {
                "aria-label": "Đang tải dữ liệu",
                "aria-busy": true,
              },

              h(
                "p",
                { role: "status" },
                "Đang tải dữ liệu…",
              ),

              [1, 2, 3].map((key) =>
                h("div", {
                  key,
                  className: "skeleton",
                  "aria-hidden": true,
                }),
              ),
            )
          : state.status === "ERROR"
            ? h(
                "section",
                { "aria-label": "Lỗi tải dữ liệu" },

                h(
                  "p",
                  {
                    role: "alert",
                    className: "error",
                  },
                  state.error,
                ),

                h(
                  "button",
                  {
                    type: "button",

                    onClick: () => {
                      void loadData(setState);
                    },
                  },
                  "Retry Connection",
                ),
              )
            : h(
                "section",
                { "aria-label": "Dữ liệu đã tải" },

                h("h2", null, "Kết quả"),

                h(
                  "ul",
                  null,

                  state.data.map((item) =>
                    h(
                      "li",
                      { key: item.id },
                      item.title,
                    ),
                  ),
                ),
              );

    return h(
      "section",
      { id: "exercise-3" },

      h(
        "header",
        null,

        h(
          "h1",
          null,
          "Exercise 3: Async State Machine",
        ),

        h(
          "p",
          null,
          "Skeleton, Retry và bảo vệ kết quả request mới nhất.",
        ),
      ),

      h(
        "p",
        {
          id: "state-label",
          role: "status",
        },
        `Trạng thái: ${state.status}`,
      ),

      h(
        "nav",
        {
          className: "load-controls",
          "aria-label": "Điều khiển tải dữ liệu",
        },

        h(
          "button",
          {
            type: "button",

            onClick: () => {
              void loadData(setState);
            },
          },
          "Tải dữ liệu",
        ),

        h(
          "button",
          {
            type: "button",

            onClick: () => {
              void loadData(setState, true);
            },
          },
          "Giả lập lỗi",
        ),

        h(
          "button",
          {
            type: "button",

            onClick: () => {
              void loadData(
                setState,
                true,
                1800,
              );
            },
          },
          "Yêu cầu chậm",
        ),

        h(
          "button",
          {
            type: "button",

            onClick: () => {
              void loadData(
                setState,
                false,
                200,
              );
            },
          },
          "Yêu cầu nhanh",
        ),

        h(
          "button",
          {
            type: "button",
            disabled: state.status !== "LOADING",
            onClick: cancelRequest,
          },
          "Hủy",
        ),
      ),

      content,
    );
  }

  const cleanupApp = renderApp(DataFeed, root);

  return () => {
    alive = false;
    requestVersion++;

    currentRequest?.abort();
    cleanupApp();
  };
}