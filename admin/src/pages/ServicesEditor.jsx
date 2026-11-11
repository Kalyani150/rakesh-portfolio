import useContentDoc from "../hooks/useContentDoc";
import { Field, RowList, SaveBar } from "../components/Fields.jsx";

const DEFAULTS = { items: [] };

export default function ServicesEditor() {
  const { data, set, loading, saving, dirty, save } = useContentDoc("services", DEFAULTS);
  if (loading) return <p className="muted">Loading…</p>;
  const renumber = (items) => items.map((r, i) => ({ ...r, num: String(i + 1).padStart(2, "0") }));
  return (
    <form className="editor" onSubmit={save}>
      <h1>Services</h1>
      <section className="panel stack">
        <RowList title="Service" items={data.items} onChange={(v) => set("items", renumber(v))}
          blank={{ num: "", title: "", desc: "", cardDesc: "" }} addLabel="Add service"
          renderRow={(r, p) => (
            <div className="stack">
              <div className="row2e narrow">
                <Field label="Number" value={r.num} onChange={(v) => p("num", v)} />
                <Field label="Title" value={r.title} onChange={(v) => p("title", v)} />
              </div>
              <Field label="Short description" textarea rows={2} value={r.desc} onChange={(v) => p("desc", v)} />
              <Field label="Card description" textarea rows={3} value={r.cardDesc} onChange={(v) => p("cardDesc", v)} />
            </div>
          )} />
      </section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </form>
  );
}