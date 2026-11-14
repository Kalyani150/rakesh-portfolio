import { Field, RowList } from "./Fields.jsx";

// Editable "case study" details shown on each project's page. Every part is optional;
// sections left empty simply don't appear on the website.

const card = { title: "", description: "" };

export function caseDefaults(p = {}) {
  const arr = (v) => (Array.isArray(v) ? v : []);
  const block = (v, base) => ({ ...base, ...(v || {}) });
  const three = (v, titles) =>
    Object.fromEntries(["goal", "process", "impact"].map((k, i) => [k, { title: titles[i], description: "", ...((v || {})[k] || {}) }]));
  return {
    subtitle: p.subtitle || "",
    client: p.client || "",
    platform: p.platform || "",
    scope: p.scope || "",
    experienceTitle: p.experienceTitle || "",
    footerTitle: p.footerTitle || "",
    achievements: arr(p.achievements),
    ecosystem: arr(p.ecosystem).map((c) => ({ title: c.title || "", description: c.description || "" })),
    challenge: block(p.challenge, { title: "THE CHALLENGE", paragraphs: [] }),
    approach: block(p.approach, { title: "THE APPROACH", paragraphs: [] }),
    strategicOverview: {
      label: "STRATEGIC OVERVIEW", title: "",
      ...(p.strategicOverview || {}),
      ...three(p.strategicOverview, ["GOAL", "PROCESS", "THE IMPACT"]),
    },
    challengeSection: block(p.challengeSection, { label: "THE CHALLENGE", title: "", cards: [] }),
    outcome: block(p.outcome, { title: "THE OUTCOME", description: "", cards: [] }),
  };
}

const toParas = (t) => t.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);

export default function CaseStudyFields({ form, set }) {
  const patch = (key, field, value) => set(key, { ...form[key], [field]: value });
  const so = form.strategicOverview;
  const setSo = (k, field, v) => set("strategicOverview", { ...so, [k]: { ...so[k], [field]: v } });

  const para = (key, label) => (
    <Field
      label={label}
      textarea rows={4}
      value={(form[key].paragraphs || []).join("\n\n")}
      onChange={(v) => patch(key, "paragraphs", toParas(v))}
      hint="Separate paragraphs with a blank line."
    />
  );
  const cardRows = (title, items, onChange) => (
    <RowList title={title} items={items} onChange={onChange} blank={card} addLabel={`Add ${title.toLowerCase()}`}
      renderRow={(r, p) => (
        <>
          <Field label="Title" value={r.title} onChange={(v) => p("title", v)} />
          <Field label="Description" textarea rows={3} value={r.description} onChange={(v) => p("description", v)} />
        </>
      )} />
  );

  return (
    <details className="case-fields">
      <summary>Project page details (case study)</summary>
      <div className="stack">
        <div className="row2">
          <Field label="Subtitle" value={form.subtitle} onChange={(v) => set("subtitle", v)} />
          <Field label="Client" value={form.client} onChange={(v) => set("client", v)} />
        </div>
        <div className="row2">
          <Field label="Platform" value={form.platform} onChange={(v) => set("platform", v)} />
          <Field label="Scope" value={form.scope} onChange={(v) => set("scope", v)} />
        </div>

        <Field label="Ecosystem heading" value={form.experienceTitle} onChange={(v) => set("experienceTitle", v)} />
        {cardRows("Ecosystem card", form.ecosystem, (v) => set("ecosystem", v))}

        <div className="row2">
          <Field label="Challenge heading" value={form.challenge.title} onChange={(v) => patch("challenge", "title", v)} />
          <Field label="Approach heading" value={form.approach.title} onChange={(v) => patch("approach", "title", v)} />
        </div>
        {para("challenge", "Challenge text")}
        {para("approach", "Approach text")}

        <Field label="Strategic overview heading" value={so.title} onChange={(v) => set("strategicOverview", { ...so, title: v })} />
        {[["goal", "Goal"], ["process", "Process"], ["impact", "Impact"]].map(([k, label]) => (
          <div className="row2" key={k}>
            <Field label={`${label} title`} value={so[k].title} onChange={(v) => setSo(k, "title", v)} />
            <Field label={`${label} text`} textarea rows={2} value={so[k].description} onChange={(v) => setSo(k, "description", v)} />
          </div>
        ))}

        <Field label="Challenge section heading" value={form.challengeSection.title}
          onChange={(v) => patch("challengeSection", "title", v)} />
        {cardRows("Challenge card", form.challengeSection.cards, (v) => patch("challengeSection", "cards", v))}

        <RowList title="Highlight" items={form.achievements.map((text) => ({ text }))}
          onChange={(rows) => set("achievements", rows.map((r) => r.text))}
          blank={{ text: "" }} addLabel="Add highlight"
          renderRow={(r, p) => <Field label="Highlight" textarea rows={2} value={r.text} onChange={(v) => p("text", v)} />} />

        <Field label="Outcome heading" value={form.outcome.title} onChange={(v) => patch("outcome", "title", v)} />
        <Field label="Outcome text" textarea rows={3} value={form.outcome.description}
          onChange={(v) => patch("outcome", "description", v)} />
        {cardRows("Outcome card", form.outcome.cards, (v) => patch("outcome", "cards", v))}

        <Field label="Closing statement" value={form.footerTitle} onChange={(v) => set("footerTitle", v)} />
      </div>
    </details>
  );
}
