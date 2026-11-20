import { Fragment, useState } from "react";
import { NavLink, useParams } from "react-router";
import { useForumMessages } from "./useForumMessages.js";
import { validateMessagePayload } from "../../shared/messageRules.js";
import Skeleton from "../components/Skeleton.jsx";
import NotFound from "../pages/NotFound.jsx";

export const CHANNELS = ["nasa", "esports-tribunal", "notNasa"];

// Sprint 3 — Live Channel Switcher. Kênh nằm trên URL (/forum/:channel)
// nên có thể deep-link và dùng nút Back của trình duyệt.
export default function ForumPage() {
  const { channel = CHANNELS[0] } = useParams();
  if (!CHANNELS.includes(channel)) return <NotFound message={`Không có kênh "${channel}".`} />;

  return (
    <>
      <h2>Sprint 3 — Forum full-stack</h2>
      <nav aria-label="Chọn kênh" className="channel-tabs">
        {CHANNELS.map((c) => (
          <NavLink key={c} to={`/forum/${c}`} className={({ isActive }) => (isActive ? "active" : "")}>
            #{c}
          </NavLink>
        ))}
      </nav>
      {/* key={channel}: đổi kênh thì reset form soạn tin của kênh trước */}
      <Channel key={channel} channel={channel} />
    </>
  );
}

function Channel({ channel }) {
  const { data, loading, error, postMessage, reload } = useForumMessages(channel);

  return (
    <div className="form-grid">
      <section className="card" aria-labelledby="msg-title" aria-busy={loading}>
        <h3 id="msg-title">Tin nhắn #{channel}</h3>
        {loading && <Skeleton lines={3} minHeight={150} label={`Đang tải kênh ${channel}…`} />}
        {error && (
          <div role="alert">
            <p>Không tải được tin nhắn: {error.message}</p>
            <button type="button" onClick={reload}>Thử lại</button>
          </div>
        )}
        {!loading && !error && data.length === 0 && <p>Chưa có tin nhắn.</p>}
        {!loading && !error && data.length > 0 && (
          <dl className="message-list">
            {data.map((msg) => (
              // Fragment có key: nhóm dt+dd mà không thêm thẻ bọc thừa trong <dl>
              <Fragment key={msg.id}>
                <dt>
                  <strong>{msg.author}</strong>{" "}
                  <time dateTime={msg.timestamp}>{new Date(msg.timestamp).toLocaleString("vi-VN")}</time>
                </dt>
                <dd>{msg.text}</dd>
              </Fragment>
            ))}
          </dl>
        )}
      </section>
      <Composer onSend={postMessage} />
    </div>
  );
}

function Composer({ onSend }) {
  const [values, setValues] = useState({ author: "", text: "" });
  const [attempted, setAttempted] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [sending, setSending] = useState(false);

  const errors = attempted ? validateMessagePayload(values) : {}; // derived, cùng luật với server
  const shownErrors = { ...errors, ...(serverError?.body?.fields ?? {}) };

  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    setServerError(null);
    if (Object.keys(validateMessagePayload(values)).length) return;
    setSending(true);
    try {
      await onSend(values);
      setValues((v) => ({ ...v, text: "" }));
      setAttempted(false);
    } catch (err) {
      setServerError(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="card" noValidate onSubmit={onSubmit} aria-label="Gửi tin nhắn">
      <h3>Gửi tin nhắn</h3>
      <div className="field-group">
        <label htmlFor="msg-author">Tên hiển thị</label>
        <input id="msg-author" name="author" value={values.author} onChange={onChange}
          aria-invalid={shownErrors.author ? true : undefined}
          aria-describedby={shownErrors.author ? "msg-author-err" : undefined} />
        {shownErrors.author && <span id="msg-author-err" className="field-error">{shownErrors.author}</span>}
      </div>
      <div className="field-group">
        <label htmlFor="msg-text">Nội dung</label>
        <textarea id="msg-text" name="text" rows={3} value={values.text} onChange={onChange}
          aria-invalid={shownErrors.text ? true : undefined}
          aria-describedby={shownErrors.text ? "msg-text-err" : undefined} />
        {shownErrors.text && <span id="msg-text-err" className="field-error">{shownErrors.text}</span>}
      </div>
      {serverError && !serverError.body?.fields && <p role="alert" className="field-error">{serverError.message}</p>}
      <button type="submit" disabled={sending}>{sending ? "Đang gửi…" : "Gửi"}</button>
    </form>
  );
}
