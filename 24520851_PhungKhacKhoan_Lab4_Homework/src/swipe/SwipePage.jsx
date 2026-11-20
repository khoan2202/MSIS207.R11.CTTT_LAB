import { useState } from "react";
import { useSwipeDeck } from "./useSwipeDeck.js";
import { KEY_TO_ACTION, gestureToAction } from "./swipeLogic.js";
import { loadSessionId, saveSessionId } from "./session.js";
import { SCORE_WEIGHTS } from "../../shared/swipeRules.js";
import Skeleton from "../components/Skeleton.jsx";

const ACTION_LABEL = { like: "Thích", nope: "Bỏ qua", superlike: "Siêu thích" };
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

// HW2 — Full-Stack Interactive Card-Swipe Deck — "Hẹn Hò Nhưng Không Yêu" Edition.
export default function SwipePage() {
  // Lazy initializer: chỉ đọc localStorage một lần khi mount.
  const [sessionId, setSessionId] = useState(loadSessionId);
  const restart = () => setSessionId(saveSessionId(crypto.randomUUID()));

  return (
    <section aria-labelledby="swipe-title">
      <h1 id="swipe-title">Hẹn Hò Nhưng Không Yêu <span className="subtitle">— Card-Swipe Deck</span></h1>
      {/* key={sessionId}: phiên mới => remount, reset toàn bộ state của deck */}
      <SwipeDeck key={sessionId} sessionId={sessionId} onRestart={restart} />
    </section>
  );
}

function SwipeDeck({ sessionId, onRestart }) {
  const deck = useSwipeDeck(sessionId);
  const [drag, setDrag] = useState(null); // { startX, startY, dx, dy, pointerId } khi đang kéo
  const [announcement, setAnnouncement] = useState("");

  const doSwipe = (action) => {
    const entry = deck.swipe(action);
    if (entry) {
      const name = deck.top.name;
      setAnnouncement(`${ACTION_LABEL[action]} ${name} (${signed(SCORE_WEIGHTS[action])}). Điểm: ${deck.score + SCORE_WEIGHTS[action]}.`);
    }
  };

  const doUndo = () => {
    const undone = deck.undo();
    if (undone) {
      const name = deck.profiles.find((p) => p.id === undone.profileId)?.name ?? "";
      setAnnouncement(`Đã hoàn tác: ${name} quay lại bộ bài. Điểm: ${deck.score - SCORE_WEIGHTS[undone.action]}.`);
    }
  };

  // ----- Bàn phím: ← bỏ qua, → thích, ↑ siêu thích, Backspace hoàn tác -----
  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      doUndo();
      return;
    }
    const action = KEY_TO_ACTION[e.key];
    if (action) {
      e.preventDefault(); // không cuộn trang khi bấm mũi tên
      doSwipe(action);
    }
  };

  // ----- Pointer Events: một bộ handler cho chuột, cảm ứng và bút -----
  const handlePointerDown = (e) => {
    if (!e.isPrimary || e.button !== 0) return;
    // Pointer capture: vẫn nhận pointermove/up kể cả khi con trỏ ra khỏi lá bài.
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ startX: e.clientX, startY: e.clientY, dx: 0, dy: 0, pointerId: e.pointerId });
  };
  const handlePointerMove = (e) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    setDrag({ ...drag, dx: e.clientX - drag.startX, dy: e.clientY - drag.startY });
  };
  const handlePointerUp = (e) => {
    // Guard: slide gốc đọc startPos.x khi startPos có thể là null => crash.
    if (!drag || e.pointerId !== drag.pointerId) return;
    const action = gestureToAction(e.clientX - drag.startX, e.clientY - drag.startY);
    setDrag(null);
    if (action) doSwipe(action);
  };
  const handlePointerCancel = () => setDrag(null);

  if (deck.loading) return <Skeleton lines={5} minHeight={460} label="Đang tải bộ bài…" />;

  if (deck.error) {
    return (
      <div className="card" role="alert">
        <h2>Không kết nối được server</h2>
        <p>{deck.error.message}</p>
        <p>Chạy <code>npm run seed</code> rồi <code>npm run server</code> (cần MONGODB_URI trong <code>.env</code>), sau đó tải lại trang.</p>
      </div>
    );
  }

  const preview = drag ? gestureToAction(drag.dx, drag.dy) : null;
  const next = deck.remaining[1] ?? null;

  return (
    <div className="swipe-layout">
      <div>
        <p id="deck-help" className="field-hint">
          Bấm vào bộ bài rồi dùng phím <kbd>←</kbd> bỏ qua, <kbd>→</kbd> thích, <kbd>↑</kbd> siêu thích,{" "}
          <kbd>Backspace</kbd> hoàn tác. Hoặc kéo lá bài sang trái/phải/lên trên.
        </p>
        <div
          className="deck"
          tabIndex={0}
          role="group"
          aria-roledescription="bộ bài"
          aria-label={deck.top ? `Hồ sơ hiện tại: ${deck.top.name}, ${deck.remaining.length} hồ sơ còn lại` : "Bộ bài đã hết"}
          aria-describedby="deck-help"
          aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp Backspace"
          onKeyDown={handleKeyDown}
        >
          {next && <ProfileCard profile={next} className="card-behind" aria-hidden="true" />}
          {deck.top ? (
            <ProfileCard
              profile={deck.top}
              className={`card-top${drag ? " dragging" : ""}`}
              style={drag ? { transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx / 15}deg)` } : undefined}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              stamp={preview && ACTION_LABEL[preview]}
              stampKind={preview}
            />
          ) : (
            <div className="profile-card empty-deck">
              <h2>Hết hồ sơ rồi!</h2>
              <p>Điểm cuối cùng: <strong>{deck.score}</strong></p>
              <button type="button" onClick={onRestart}>Chơi phiên mới</button>
            </div>
          )}
        </div>

        <div className="swipe-actions">
          <button type="button" className="action nope" onClick={() => doSwipe("nope")} disabled={!deck.top} aria-keyshortcuts="ArrowLeft">
            <span aria-hidden="true">✕</span> Bỏ qua
          </button>
          <button type="button" className="action super" onClick={() => doSwipe("superlike")} disabled={!deck.top} aria-keyshortcuts="ArrowUp">
            <span aria-hidden="true">★</span> Siêu thích
          </button>
          <button type="button" className="action like" onClick={() => doSwipe("like")} disabled={!deck.top} aria-keyshortcuts="ArrowRight">
            <span aria-hidden="true">♥</span> Thích
          </button>
          <button type="button" className="action undo secondary" onClick={doUndo} disabled={!deck.last} aria-keyshortcuts="Backspace">
            <span aria-hidden="true">↶</span> Hoàn tác
          </button>
        </div>
        <p className="visually-hidden" role="status" aria-live="polite">{announcement}</p>
        {deck.syncError && <p role="alert" className="field-error">{deck.syncError}</p>}
      </div>

      <aside className="card score-panel" aria-labelledby="score-title">
        <h2 id="score-title">Điểm: <output>{deck.score}</output></h2>
        <dl className="stats">
          <div><dt>Thích (+{SCORE_WEIGHTS.like})</dt><dd>{deck.stats.like}</dd></div>
          <div><dt>Siêu thích (+{SCORE_WEIGHTS.superlike})</dt><dd>{deck.stats.superlike}</dd></div>
          <div><dt>Bỏ qua ({SCORE_WEIGHTS.nope})</dt><dd>{deck.stats.nope}</dd></div>
          <div><dt>Tỉ lệ thích</dt><dd>{deck.stats.likeRate}%</dd></div>
          <div><dt>Còn lại</dt><dd>{deck.remaining.length} / {deck.profiles.length}</dd></div>
        </dl>
        <h3>Lịch sử (mới nhất trước)</h3>
        {deck.history.length === 0 ? (
          <p>Chưa có lượt nào.</p>
        ) : (
          <ol className="history-list" reversed>
            {[...deck.history].reverse().map((h) => (
              <li key={h.clientId}>
                {deck.profiles.find((p) => p.id === h.profileId)?.name} — {ACTION_LABEL[h.action]} ({signed(SCORE_WEIGHTS[h.action])})
              </li>
            ))}
          </ol>
        )}
        <button type="button" className="secondary" onClick={onRestart}>Bắt đầu phiên mới</button>
      </aside>
    </div>
  );
}

function ProfileCard({ profile, className = "", stamp = null, stampKind = null, style, ...rest }) {
  // Tách riêng `style` rồi gộp với biến CSS --hue. Nếu spread {...rest} chứa style SAU,
  // nó sẽ ghi đè mất --hue (lỗi đã gặp: lá bài trên cùng bị trong suốt).
  return (
    <article {...rest} className={`profile-card ${className}`} style={{ "--hue": profile.hue, ...style }}>
      {stamp && <span className={`stamp stamp-${stampKind}`} aria-hidden="true">{stamp}</span>}
      <div className="avatar" aria-hidden="true">{profile.name.slice(0, 1)}</div>
      <h2>{profile.name}, {profile.age}</h2>
      <p className="city">{profile.city}</p>
      <p>{profile.bio}</p>
      <ul className="tags" aria-label="Sở thích">
        {profile.tags.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </article>
  );
}
