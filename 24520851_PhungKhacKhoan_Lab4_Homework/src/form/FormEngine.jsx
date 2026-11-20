import { createContext, useContext, useId, useState } from "react";

// Context Form Engine dùng lại được (mở rộng từ Sprint 2 của Exercise):
// - values/touched là state; errors = validate(values) là DERIVED, tính trong render — không useEffect.
// - Lỗi từ server (400 + fields) được gộp vào và tự xóa khi người dùng sửa field đó.
const FormEngineContext = createContext(null);

export function useFormEngine() {
  const ctx = useContext(FormEngineContext);
  if (!ctx) throw new Error("Field phải nằm trong <FormEngine>.");
  return ctx;
}

export function FormEngine({ initial, validate, onSubmit, disabled = false, label, children }) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [formError, setFormError] = useState("");
  const summaryId = useId();

  const errors = validate(values); // real-time, đồng bộ
  const isValid = Object.keys(errors).length === 0;
  const visibleErrors = {
    ...Object.fromEntries(Object.entries(errors).filter(([f]) => submitAttempted || touched[f])),
    ...serverErrors,
  };

  const setField = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setServerErrors((s) => {
      if (!(name in s)) return s;
      const { [name]: _removed, ...rest } = s;
      return rest;
    });
  };
  const touch = (name) => setTouched((t) => (t[name] ? t : { ...t, [name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (disabled || submitting) return;
    setSubmitAttempted(true);
    setFormError("");
    if (!isValid) {
      e.currentTarget.elements.namedItem(Object.keys(errors)[0])?.focus();
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      if (err?.body?.fields) setServerErrors(err.body.fields);
      setFormError(err?.message ?? "Gửi thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const errorCount = Object.keys(visibleErrors).length;
  const ctx = { values, visibleErrors, setField, touch, disabled: disabled || submitting, submitting };

  return (
    <FormEngineContext.Provider value={ctx}>
      <form noValidate onSubmit={handleSubmit} aria-label={label} aria-describedby={submitAttempted && errorCount ? summaryId : undefined}>
        {submitAttempted && errorCount > 0 && (
          <p id={summaryId} role="alert" className="form-summary">Còn {errorCount} trường cần sửa.</p>
        )}
        {formError && errorCount === 0 && <p role="alert" className="form-summary">{formError}</p>}
        {children}
      </form>
    </FormEngineContext.Provider>
  );
}

// ---------- Field components: useId + aria-invalid + aria-describedby ----------
function useFieldA11y(name, hint) {
  const { visibleErrors } = useFormEngine();
  const id = useId();
  const error = visibleErrors[name];
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return { id, error, describedBy, hintId: `${id}-hint`, errorId: `${id}-error` };
}

function FieldMessages({ hint, hintId, error, errorId }) {
  return (
    <>
      {hint && <small id={hintId} className="field-hint">{hint}</small>}
      {error && <span id={errorId} className="field-error">{error}</span>}
    </>
  );
}

export function TextField({ name, label, hint = "", type = "text", ...props }) {
  const { values, setField, touch, disabled } = useFormEngine();
  const a = useFieldA11y(name, hint);
  return (
    <div className="field-group">
      <label htmlFor={a.id}>{label}</label>
      <input id={a.id} name={name} type={type} value={values[name]} disabled={disabled}
        onChange={(e) => setField(name, e.target.value)} onBlur={() => touch(name)}
        aria-invalid={a.error ? true : undefined} aria-describedby={a.describedBy} {...props} />
      <FieldMessages hint={hint} {...a} />
    </div>
  );
}

export function SelectField({ name, label, options, hint = "", placeholder = "— Chọn —" }) {
  const { values, setField, touch, disabled } = useFormEngine();
  const a = useFieldA11y(name, hint);
  return (
    <div className="field-group">
      <label htmlFor={a.id}>{label}</label>
      <select id={a.id} name={name} value={values[name]} disabled={disabled}
        onChange={(e) => setField(name, e.target.value)} onBlur={() => touch(name)}
        aria-invalid={a.error ? true : undefined} aria-describedby={a.describedBy}>
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <FieldMessages hint={hint} {...a} />
    </div>
  );
}

export function TextAreaField({ name, label, min, max, rows = 6 }) {
  const { values, setField, touch, disabled } = useFormEngine();
  const length = values[name].trim().length; // derived
  const hint = `${length} / ${max} ký tự (tối thiểu ${min}).`;
  const a = useFieldA11y(name, hint);
  return (
    <div className="field-group">
      <label htmlFor={a.id}>{label}</label>
      <textarea id={a.id} name={name} rows={rows} value={values[name]} disabled={disabled}
        onChange={(e) => setField(name, e.target.value)} onBlur={() => touch(name)}
        aria-invalid={a.error ? true : undefined} aria-describedby={a.describedBy} />
      <FieldMessages hint={hint} {...a} />
    </div>
  );
}

export function CheckboxField({ name, label }) {
  const { values, setField, touch, disabled } = useFormEngine();
  const a = useFieldA11y(name, "");
  return (
    <div className="field-group checkbox">
      <label htmlFor={a.id}>
        <input id={a.id} name={name} type="checkbox" checked={values[name]} disabled={disabled}
          onChange={(e) => { setField(name, e.target.checked); touch(name); }}
          aria-invalid={a.error ? true : undefined} aria-describedby={a.describedBy} />
        {" "}{label}
      </label>
      <FieldMessages {...a} />
    </div>
  );
}
