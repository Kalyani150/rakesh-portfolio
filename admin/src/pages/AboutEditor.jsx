import useContentDoc from "../hooks/useContentDoc";
import { Field, ImagePreview, RowList, SaveBar } from "../components/Fields.jsx";

const DEFAULTS = {
  fullName: "",
  title: "UI/UX Designer",
  bio: "",
  imageUrl: "",
  experiences: [],
  education: [],
};

export default function AboutEditor() {
  const { data, set, loading, saving, dirty, save } = useContentDoc("about", DEFAULTS);
  if (loading) return <p className="muted">Loading…</p>;
  const f = (k, label, extra) => <Field label={label} value={data[k]} onChange={(v) => set(k, v)} {...extra} />;
  return (
    <form className="editor" onSubmit={save}>
      <h1>About page</h1>
      <section className="panel stack">
        <h2>Profile</h2>
        <div className="row2e">{f("fullName", "Full name")}{f("title", "Title")}</div>
        {f("bio", "Bio", { textarea: true, rows: 4 })}
        {f("imageUrl", "Image URL", { placeholder: "https://…" })}
        <ImagePreview url={data.imageUrl} />
      </section>
      <section className="panel stack">
        <h2>Experience</h2>
        <RowList title="Experience" items={data.experiences} onChange={(v) => set("experiences", v)}
          blank={{ period: "", role: "", company: "", points: "" }} addLabel="Add experience"
          renderRow={(r, p) => (
            <div className="stack">
              <div className="row2e">
                <Field label="Period" value={r.period} onChange={(v) => p("period", v)} placeholder="June 2025 – Present" />
                <Field label="Role" value={r.role} onChange={(v) => p("role", v)} />
              </div>
              <Field label="Company" value={r.company} onChange={(v) => p("company", v)} />
              <Field label="Points" textarea rows={5} value={r.points} onChange={(v) => p("points", v)} hint="One point per line." />
            </div>
          )} />
      </section>
      <section className="panel stack">
        <h2>Education</h2>
        <RowList title="Education" items={data.education} onChange={(v) => set("education", v)}
          blank={{ degree: "", institution: "" }} addLabel="Add education"
          renderRow={(r, p) => (
            <div className="row2e">
              <Field label="Degree" value={r.degree} onChange={(v) => p("degree", v)} />
              <Field label="Institution" value={r.institution} onChange={(v) => p("institution", v)} />
            </div>
          )} />
      </section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </form>
  );
}