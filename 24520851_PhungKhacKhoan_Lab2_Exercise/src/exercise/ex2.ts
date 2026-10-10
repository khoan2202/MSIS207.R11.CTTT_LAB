import { h } from "../core/vnode.ts";
import { useState } from "../core/state.ts";
import { renderApp } from "../core/runtime.ts";

interface Task {
  id: string;
  title: string;
  done: boolean;
}

type Filter = "ALL" | "ACTIVE" | "DONE";

function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "task-1",
      title: "Đọc contract VNode",
      done: false,
    },
    {
      id: "task-2",
      title: "Kiểm tra renderer",
      done: true,
    },
  ]);

  const [filter, setFilter] = useState<Filter>("ALL");
  const [draft, setDraft] = useState("");

  function addTask(event: Event): void {
    event.preventDefault();

    const title = draft.trim();

    if (!title) {
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      done: false,
    };

    setTasks((previous) => [...previous, newTask]);
    setDraft("");
  }

  function toggleTask(id: string): void {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task,
      ),
    );
  }

  function deleteTask(id: string): void {
    setTasks((previous) =>
      previous.filter((task) => task.id !== id),
    );
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === "ACTIVE") {
      return !task.done;
    }

    if (filter === "DONE") {
      return task.done;
    }

    return true;
  });

  const completedCount =
    tasks.filter((task) => task.done).length;

  const filters: {
    value: Filter;
    label: string;
  }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "ACTIVE", label: "Chưa xong" },
    { value: "DONE", label: "Đã xong" },
  ];

  return h(
    "section",
    { id: "exercise-2" },

    h(
      "header",
      null,
      h("h1", null, "Exercise 2: Task Manager"),

      h(
        "p",
        { role: "status" },
        `Tổng: ${tasks.length} | Hoàn thành: ${completedCount}`,
      ),
    ),

    h(
      "form",
      { onSubmit: addTask },

      h(
        "label",
        { for: "task-title" },
        "Tên công việc",
      ),

      h("input", {
        id: "task-title",
        type: "text",
        value: draft,
        placeholder: "Nhập công việc mới",

        onInput: (event: Event) => {
          const input =
            event.target as HTMLInputElement;

          setDraft(input.value);
        },
      }),

      h(
        "button",
        { type: "submit" },
        h("span", null, "Thêm công việc"),
      ),
    ),

    h(
      "nav",
      { "aria-label": "Bộ lọc công việc" },

      filters.map((item) =>
        h(
          "button",
          {
            key: item.value,
            type: "button",
            "aria-pressed": filter === item.value,

            onClick: () => {
              setFilter(item.value);
            },
          },

          item.label,
        ),
      ),
    ),

    h(
      "ul",
      { id: "task-list" },

      visibleTasks.map((task) =>
        h(
          "li",
          {
            key: task.id,
            "data-task-id": task.id,
          },

          h(
            "span",
            {
              className: task.done ? "done" : "",
            },
            task.title,
          ),

          h(
            "button",
            {
              type: "button",
              "aria-pressed": task.done,
              "aria-label": `Đổi trạng thái ${task.title}`,

              onClick: () => {
                toggleTask(task.id);
              },
            },

            task.done ? "Đánh dấu chưa xong" : "Hoàn thành",
          ),

          h(
            "button",
            {
              type: "button",
              "aria-label": `Xóa ${task.title}`,

              onClick: () => {
                deleteTask(task.id);
              },
            },

            "Xóa",
          ),
        ),
      ),
    ),

    visibleTasks.length === 0
      ? h("p", { role: "status" }, "Không có công việc phù hợp.")
      : null,
  );
}

export function mountExercise2(
  root: HTMLElement,
): () => void {
  return renderApp(TaskApp, root);
}