// Converts data/legacy-portfolio.json (dump of the old site's backend) into the project
// shape used by the Firestore `projects` collection. Output: admin/src/data/legacyProjects.json
import fs from "node:fs";

const src = JSON.parse(fs.readFileSync("data/legacy-portfolio.json", "utf8")).projects.data;
const clean = (v) => {
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) if (!["_id", "icon", "position"].includes(k)) o[k] = clean(x);
    return o;
  }
  return v;
};
// Real content only: headings (label/title) alone don't count.
const nonEmpty = (v, key) =>
  Array.isArray(v) ? v.length > 0 && v.some((x) => nonEmpty(x)) :
  v && typeof v === "object" ? Object.entries(v).some(([k, x]) => nonEmpty(x, k)) :
  key === "label" || key === "title" ? false :
  v !== "" && v != null;

const out = src
  .sort((a, b) => a.order - b.order)
  .map((p, i) => {
    const images = [p.heroImage, p.brandImage, p.editorialImage, ...(p.sectionImages || []), p.section7Image, p.section9Image]
      .filter(Boolean)
      .filter((u, j, a) => a.indexOf(u) === j && u !== p.image);
    const rich = {
      subtitle: p.subtitle, role: p.role, year: p.year, platform: p.platform, tools: p.tools,
      scope: p.scope, client: p.client,
      longDescription: [p.productDescription, p.productDescriptionTwo].filter(Boolean).join("\n\n"),
      images, experienceTitle: p.experienceTitle, achievements: p.achievements,
      ecosystem: p.ecosystem, challenge: p.challenge, approach: p.approach,
      strategicOverview: p.strategicOverview, challengeSection: p.challengeSection,
      outcome: p.outcome, footerTitle: p.footerTitle,
    };
    const o = {
      title: p.title, category: p.category || "", description: p.description || "",
      imageUrl: p.image || "", link: "", order: i + 1,
    };
    for (const [k, v] of Object.entries(rich)) if (nonEmpty(v)) o[k] = clean(v);
    return o;
  });

fs.writeFileSync("admin/src/data/legacyProjects.json", JSON.stringify(out, null, 2) + "\n");
console.log(out.map((p) => `${p.order} ${p.title}: ${Object.keys(p).length} keys, ${(p.images || []).length} extra images`).join("\n"));
