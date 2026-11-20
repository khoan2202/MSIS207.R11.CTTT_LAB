import { useState } from "react";
import { FormEngine, TextField, SelectField, TextAreaField, CheckboxField, useFormEngine } from "../form/FormEngine.jsx";
import { APPEAL_INITIAL, APPEAL_OUTCOMES, APPEAL_REASONS, STATEMENT_LIMITS, validateAppeal } from "../../shared/appealRules.js";
import { fetchJson } from "../lib/api.js";
import { useFetchJson } from "../lib/useFetchJson.js";

const labelOf = (list, id) => list.find((x) => x.id === id)?.label ?? id;

// HW3 — Appeal Form Engine. `expired` đến từ useAppealSlaTimer (derived), không phải state riêng.
export default function AppealSection({ playerId, displayName, expired }) {
  const existing = useFetchJson(`/api/appeals/${playerId}`);
  const [receipt, setReceipt] = useState(null);
  const shown = receipt ?? existing.data;

  return (
    <section className="card" aria-labelledby="appeal-title">
      <h2 id="appeal-title">Đơn khiếu nại của {displayName}</h2>
      {existing.loading && <p>Đang kiểm tra đơn đã nộp…</p>}
      {!existing.loading && shown && <Receipt appeal={shown} />}
      {!existing.loading && !shown && existing.error && (
        <p role="alert">Không kiểm tra được trạng thái đơn: {existing.error.message}</p>
      )}
      {!existing.loading && !shown && !existing.error && (
        <>
          {expired && <p role="alert" className="form-summary">Đã quá hạn SLA — không thể nộp đơn mới.</p>}
          <FormEngine
            label={`Form khiếu nại của ${displayName}`}
            initial={APPEAL_INITIAL}
            validate={validateAppeal}
            disabled={expired}
            onSubmit={async (values) => {
              const created = await fetchJson("/api/appeals", {
                method: "POST",
                body: JSON.stringify({ ...values, playerId }),
              });
              setReceipt(created);
            }}
          >
            <TextField name="contactEmail" label="Email liên hệ" type="email" autoComplete="email" />
            <SelectField name="reason" label="Lý do khiếu nại" options={APPEAL_REASONS} />
            <SelectField name="requestedOutcome" label="Kết quả mong muốn" options={APPEAL_OUTCOMES} />
            <TextAreaField name="statement" label="Trình bày" min={STATEMENT_LIMITS.min} max={STATEMENT_LIMITS.max} />
            <TextField name="evidenceUrl" label="Link bằng chứng (https)" type="url" inputMode="url"
              hint="Bắt buộc nếu chọn lý do 'Có bằng chứng mới'." />
            <CheckboxField name="acknowledge" label="Tôi xác nhận thông tin trên là trung thực." />
            <SubmitButton expired={expired} />
          </FormEngine>
        </>
      )}
    </section>
  );
}

// Nút submit đọc `submitting` từ context của FormEngine để hiện "Đang gửi…".
function SubmitButton({ expired }) {
  const { submitting } = useFormEngine();
  return (
    <button type="submit" disabled={expired || submitting}>
      {submitting ? "Đang gửi…" : "Nộp đơn khiếu nại"}
    </button>
  );
}

function Receipt({ appeal }) {
  return (
    <div role="status" className="receipt">
      <p><strong>Đã nhận đơn khiếu nại.</strong></p>
      <dl className="kv">
        <div><dt>Mã đơn</dt><dd>{appeal.appealId}</dd></div>
        <div><dt>Lý do</dt><dd>{labelOf(APPEAL_REASONS, appeal.reason)}</dd></div>
        <div><dt>Mong muốn</dt><dd>{labelOf(APPEAL_OUTCOMES, appeal.requestedOutcome)}</dd></div>
        <div><dt>Trạng thái</dt><dd>{appeal.status === "received" ? "Đã tiếp nhận" : appeal.status}</dd></div>
      </dl>
    </div>
  );
}
