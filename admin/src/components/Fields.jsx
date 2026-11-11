import { useId, useState } from "react";

export function Field({ label, value, onChange, textarea, rows = 3, type = "text", placeholder, hint }) {
  const id = useId();
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Tag id={id} type={textarea ? undefined : type} rows={textarea ? rows : undefined}
        value={value ?? ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function ImagePreview({ url, alt = "Preview" }) {
  if (!url || !/^https?:\/\//i.test(url)) return <div className="img-prev empty">No image</div>;
  return <img className="img-prev" src={url} alt={alt} onError={(e) => (e.currentTarget.style.opacity = 0.2)}
    onLoad={(e) => (e.currentTarget.style.opacity = 1)} />;
}

// Generic repeating rows with add / remove / reorder.
export function RowList({ title, items, onChange, blank, addLabel = "Add row", renderRow }) {
  const list = items || [];
  const patch = (i, field, value) => onChange(list.map((r, j) => (j === i ? { ...r, [field]: value } : r)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const n = [...list];
    [n[i], n[j]] = [n[j], n[i]];
    onChange(n);
  };
  const remove = (i) => onChange(list.filter((_, j) => j !== i));

  return (
    <fieldset className="rowlist">
      <legend>{title}</legend>
      {list.length === 0 && <p className="muted">Nothing here yet.</p>}
      {list.map((row, i) => (
        <div className="rowcard" key={i}>
          <div className="rowcard-head">
            <span className="ord">{i + 1}</span>
            <div className="row-tools">
              <button type="button" className="ghost-btn sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${title} ${i + 1} up`}>↑</button>
              <button type="button" className="ghost-btn sm" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Move ${title} ${i + 1} down`}>↓</button>
              <ConfirmButton label="Remove" onConfirm={() => remove(i)} ariaLabel={`Remove ${title} ${i + 1}`} />
            </div>
          </div>
          {renderRow(row, (f, v) => patch(i, f, v), i)}
        </div>
      ))}
      <button type="button" className="ghost-btn" onClick={() => onChange([...list, { ...blank }])}>+ {addLabel}</button>
    </fieldset>
  );
}

// Two-click inline confirm (no window.confirm).

export function ConfirmButton({ label = "Delete", onConfirm, ariaLabel }) {
  const [armed, setArmed] = useState(false);
  return (
    <button type="button" aria-label={armed ? "Confirm: " + (ariaLabel || label) : ariaLabel || label}
      className={"ghost-btn sm " + (armed ? "danger" : "")}
      onClick={() => { if (armed) { setArmed(false); onConfirm(); } else setArmed(true); }}
      onBlur={() => setArmed(false)}>
      {armed ? "Confirm?" : label}
    </button>
  );
}

export function SaveBar({ dirty, saving, onSave, disabled }) {
  return (
    <div className="savebar">
      <span className={"dirty " + (dirty ? "on" : "")} aria-live="polite">
        {dirty ? "Unsaved changes" : "All changes saved"}
      </span>
      <button className="btn" type="submit" onClick={onSave} disabled={saving || disabled || !dirty}>
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}