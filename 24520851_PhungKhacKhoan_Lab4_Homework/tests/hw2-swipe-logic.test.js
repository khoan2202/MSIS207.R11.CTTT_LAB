import {
  historyReducer, computeScore, computeStats, remainingProfiles, gestureToAction, KEY_TO_ACTION,
} from "../src/swipe/swipeLogic.js";
import { validateSwipePayload } from "../shared/swipeRules.js";

const profiles = [{ id: "a" }, { id: "b" }, { id: "c" }];
const e = (profileId, action, clientId = profileId) => ({ clientId, profileId, action });

describe("HW2 — LIFO undo stack", () => {
  it("swipe push vào cuối, undo pop đúng lượt mới nhất", () => {
    let h = [];
    h = historyReducer(h, { type: "swipe", entry: e("a", "like") });
    h = historyReducer(h, { type: "swipe", entry: e("b", "nope") });
    h = historyReducer(h, { type: "swipe", entry: e("c", "superlike") });
    h = historyReducer(h, { type: "undo" });
    expect(h.map((x) => x.profileId)).toEqual(["a", "b"]);
    h = historyReducer(h, { type: "undo" });
    expect(h.map((x) => x.profileId)).toEqual(["a"]);
  });

  it("undo stack rỗng không lỗi; reducer không mutate mảng cũ", () => {
    const empty = Object.freeze([]);
    expect(historyReducer(empty, { type: "undo" })).toEqual([]);
    const one = Object.freeze([e("a", "like")]);
    historyReducer(one, { type: "swipe", entry: e("b", "like") });
    expect(one).toHaveLength(1);
  });

  it("undo kèm clientId chỉ pop đúng lượt đó (chống double-press)", () => {
    const h = [e("a", "like"), e("b", "nope")];
    const once = historyReducer(h, { type: "undo", clientId: "b" });
    expect(historyReducer(once, { type: "undo", clientId: "b" })).toEqual([e("a", "like")]);
  });

  it("chặn swipe trùng profile", () => {
    const h = historyReducer([e("a", "like")], { type: "swipe", entry: e("a", "nope", "x") });
    expect(h).toHaveLength(1);
  });

  it("remove/restore dùng cho rollback khi server lỗi", () => {
    const h = [e("a", "like"), e("b", "nope")];
    expect(historyReducer(h, { type: "remove", clientId: "a" }).map((x) => x.profileId)).toEqual(["b"]);
    expect(historyReducer([e("a", "like")], { type: "restore", entry: e("b", "nope") })).toHaveLength(2);
  });
});

describe("HW2 — derived state", () => {
  it("điểm bất đối xứng: like +10, superlike +25, nope -5", () => {
    expect(computeScore([e("a", "like"), e("b", "nope"), e("c", "superlike")])).toBe(30);
    expect(computeScore([e("a", "nope"), e("b", "nope")])).toBe(-10);
  });
  it("undo làm điểm và bộ bài tự quay lại", () => {
    const h = [e("a", "like"), e("b", "superlike")];
    const after = historyReducer(h, { type: "undo" });
    expect(computeScore(after)).toBe(10);
    expect(remainingProfiles(profiles, after).map((p) => p.id)).toEqual(["b", "c"]);
  });
  it("thống kê tỉ lệ thích", () => {
    expect(computeStats([e("a", "like"), e("b", "nope"), e("c", "superlike"), e("d", "nope")]))
      .toMatchObject({ like: 1, nope: 2, superlike: 1, total: 4, likeRate: 50 });
  });
});

describe("HW2 — input mapping", () => {
  it("phím mũi tên => action", () => {
    expect(KEY_TO_ACTION).toEqual({ ArrowLeft: "nope", ArrowRight: "like", ArrowUp: "superlike" });
  });
  it.each([[150, 0, "like"], [-150, 10, "nope"], [20, -160, "superlike"], [60, -40, null]])(
    "kéo (%i, %i) => %s", (dx, dy, expected) => expect(gestureToAction(dx, dy)).toBe(expected),
  );
});

describe("HW2 — validateSwipePayload (dùng chung server)", () => {
  const ok = { clientId: crypto.randomUUID(), sessionId: crypto.randomUUID(), profileId: "a", action: "like" };
  it("hợp lệ => không lỗi", () => expect(validateSwipePayload(ok)).toEqual({}));
  it("action lạ và UUID sai bị bắt", () => {
    expect(Object.keys(validateSwipePayload({ ...ok, action: "love", clientId: "1" }))).toEqual(["clientId", "action"]);
  });
});
