import useContentDoc from "../hooks/useContentDoc";
import { Field, ImagePreview, RowList, SaveBar } from "../components/Fields.jsx";

const DEFAULTS = {
  role: "UI/UX DESIGNER",
  firstName: "",
  lastName: "",
  location: "",
  imageUrl: "",
  experienceYears: "01+",
  clientsCount: "10+",
  totalProjectsCount: "+20",
  tickerText: "Let's Create Something Meaningful",
  ctaHeading: "Let's work together.",
  services: [{ title: "UI/UX DESIGN" }, { title: "WEB & LANDING" }, { title: "SAAS & APPS" }, { title: "WIREFRAMES" }],
};

export default function HomeEditor() {
  const { data, set, loading, saving, dirty, save } = useContentDoc("home", DEFAULTS);
  if (loading) return <p className="muted">Loading…</p>;
  const f = (k, label, extra) => <Field label={label} value={data[k]} onChange={(v) => set(k, v)} {...extra} />;
  return (
    <form className="editor" onSubmit={save}>
      <h1>Home page</h1>
      <section className="panel stack">
        <h2>Hero</h2>
        <div className="row2e">{f("firstName", "First name")}{f("lastName", "Last name")}</div>
        {f("role", "Role")}
        {f("location", "Intro / location line", { textarea: true, rows: 2 })}
        {f("imageUrl", "Profile image URL", { placeholder: "https://…" })}
        <ImagePreview url={data.imageUrl} />
      </section>
      <section className="panel stack">
        <h2>Stats</h2>
        <div className="row3e">
          {f("experienceYears", "Years of experience")}
          {f("clientsCount", "Clients")}
          {f("totalProjectsCount", "Total projects")}
        </div>
      </section>
      <section className="panel stack">
        <h2>Text</h2>
        {f("tickerText", "Ticker text")}
        {f("ctaHeading", "Call-to-action heading")}
        <RowList title="Service" items={data.services} onChange={(v) => set("services", v)}
          blank={{ title: "" }} addLabel="Add service"
          renderRow={(r, p) => <Field label="Title" value={r.title} onChange={(v) => p("title", v)} />} />
      </section>
      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </form>
  );
}