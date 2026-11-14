import { useEffect, useMemo, useState } from "react";
import { listProjects, createProject, updateProject, removeProject } from "../services/projects";
import { useToast } from "../components/Toast.jsx";
import { ConfirmButton, ImagePreview, RowList } from "../components/Fields.jsx";
import { getContent, saveContent } from "../services/content";
import legacyProjects from "../data/legacyProjects.json";

let autoImportStarted = false;

const BLANK = { title: "", category: "", description: "", imageUrl: "", link: "", role: "", year: "", tools: "", longDescription: "", images: [], order: 0 };
const isUrl = (v) => !v || /^https?:\/\//i.test(v.trim());

function validate(f) {
  const e = {};
  if (!f.title.trim()) e.title = "Title is required.";
  if (!isUrl(f.imageUrl)) e.imageUrl = "Must start with http:// or https://";
  if (!isUrl(f.link)) e.link = "Must start with http:// or https://";
  if ((f.images || []).some((u) => !isUrl(u))) e.images = "Every extra image must start with http:// or https://";
  return e;
}

export default function Projects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [base, setBase] = useState(BLANK); // last loaded/saved form state, for dirty check
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [q, setQ] = useState("");
  const [importing, setImporting] = useState(false);

  async function refresh() {
    try {
      setProjects(await listProjects());
    } catch (err) {
      console.error(err);
      toast("Couldn't load projects - check Firestore is enabled.", "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh().then(autoImportOnce);
    /* eslint-disable-next-line */
  }, []);

  // First sign-in only: if the collection is empty and we've never imported before,
  // load the projects from the old site automatically. A flag in content/_meta stops it
  // from re-running later (e.g. after you deliberately delete everything).
  async function autoImportOnce() {
    if (autoImportStarted) return; // also guards React StrictMode's double effect
    autoImportStarted = true;
    try {
      const meta = await getContent("_meta");
      if (meta?.legacyProjectsImported) return;
      const current = await listProjects();
      const have = new Set(current.map((p) => (p.title || "").trim().toLowerCase()));
      const todo = legacyProjects.filter((p) => !have.has(p.title.toLowerCase()));
      if (todo.length && current.length === 0) {
        for (const p of todo) await createProject(p);
        toast(`Imported ${todo.length} projects from your old site.`);
      }
      await saveContent("_meta", { legacyProjectsImported: true });
      await refresh();
    } catch (err) {
      console.error(err);
      autoImportStarted = false; // allow a retry on next visit
      toast("Automatic import failed - use the import button instead.", "error");
    }
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(base);
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return projects;
    return projects.filter((p) => `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(n));
  }, [projects, q]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function reset(nextOrder = 0) {
    const b = { ...BLANK, order: nextOrder };
    setEditingId(null); setForm(b); setBase(b); setErrors({});
  }

  function startEdit(p) {
    const f = {
      title: p.title || "", category: p.category || "", description: p.description || "",
      imageUrl: p.imageUrl || "", link: p.link || "", order: p.order ?? 0,
      role: p.role || "", year: p.year || "",
      tools: Array.isArray(p.tools) ? p.tools.join(", ") : p.tools || "",
      longDescription: p.longDescription || "",
      images: Array.isArray(p.images) ? p.images : [],
    };
    setEditingId(p.id); setForm(f); setBase(f); setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("title")?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateProject(editingId, form);
        toast("Project updated.");
      } else {
        const order = form.order === "" || Number(form.order) === 0 ? projects.length + 1 : form.order;
        await createProject({ ...form, order });
        toast("Project added.");
      }
      reset();
      await refresh();
    } catch (err) {
      console.error(err);
      toast("Save failed. Make sure you're signed in and rules allow writes.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    try {
      await removeProject(p.id);
      if (editingId === p.id) reset();
      toast("Project deleted.");
      await refresh();
    } catch (err) {
      console.error(err);
      toast("Delete failed.", "error");
    }
  }

  // One-click import of the projects from the old live site. Skips titles already present.
  const missingLegacy = useMemo(() => {
    const have = new Set(projects.map((p) => (p.title || "").trim().toLowerCase()));
    return legacyProjects.filter((p) => !have.has(p.title.toLowerCase()));
  }, [projects]);

  // Projects already here whose details (role, tools, images, case study…) are still empty
  // but the old site has them. Only empty fields are filled; your edits are never overwritten.
  const isEmpty = (v) => v == null || v === "" || (Array.isArray(v) && v.length === 0);
  const syncPlan = useMemo(() => {
    const byTitle = new Map(legacyProjects.map((p) => [p.title.toLowerCase(), p]));
    return projects.flatMap((p) => {
      const legacy = byTitle.get((p.title || "").trim().toLowerCase());
      if (!legacy) return [];
      const fill = {};
      for (const [k, v] of Object.entries(legacy)) {
        if (k === "order" || k === "title") continue;
        if (!isEmpty(v) && isEmpty(p[k])) fill[k] = v;
      }
      return Object.keys(fill).length ? [{ project: p, fill }] : [];
    });
  }, [projects]);

  async function importLegacy() {
    setImporting(true);
    try {
      for (const p of missingLegacy) await createProject(p);
      for (const { project, fill } of syncPlan) await updateProject(project.id, { ...project, ...fill });
      const n = missingLegacy.length, s = syncPlan.length;
      toast([n && `Imported ${n} project${n === 1 ? "" : "s"}`, s && `filled details on ${s}`].filter(Boolean).join(", ") + ".");
      await refresh();
    } catch (err) {
      console.error(err);
      toast("Import failed. Make sure you're signed in and rules allow writes.", "error");
      await refresh();
    } finally {
      setImporting(false);
    }
  }

  // Swap with neighbour in the full list; renumber so duplicate order values still work.
  async function move(p, dir) {
    const i = projects.findIndex((x) => x.id === p.id);
    const j = i + dir;
    if (j < 0 || j >= projects.length) return;
    const next = [...projects];
    [next[i], next[j]] = [next[j], next[i]];
    const changed = next.map((x, idx) => ({ x, order: idx + 1 })).filter(({ x, order }) => x.order !== order);
    setProjects(next.map((x, idx) => ({ ...x, order: idx + 1 })));
    try {
      await Promise.all(changed.map(({ x, order }) => updateProject(x.id, { ...x, order })));
      toast("Order updated.");
    } catch (err) {
      console.error(err);
      toast("Reorder failed.", "error");
      await refresh();
    }
  }

  const err = (k) => errors[k] && <span className="field-error" id={k + "-err"}>{errors[k]}</span>;
  const aria = (k) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? k + "-err" : undefined });

  return (
    <div className="projects-grid">
      <section className="panel">
        <h2>{editingId ? "Edit project" : "Add project"}</h2>
        <form className="proj-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="title">Title *</label>
            <input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} {...aria("title")} />
            {err("title")}
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="category">Category</label>
              <input id="category" placeholder="Corporate Website • UI/UX" value={form.category}
                onChange={(e) => set("category", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="order">Order</label>
              <input id="order" type="number" value={form.order} onChange={(e) => set("order", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows="3" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="imageUrl">Image URL</label>
            <input id="imageUrl" placeholder="https://…" value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)} {...aria("imageUrl")} />
            {err("imageUrl")}
            <ImagePreview url={form.imageUrl} />
          </div>
          <div className="field">
            <label htmlFor="longDescription">Full details (project page)</label>
            <textarea id="longDescription" rows="5" value={form.longDescription}
              onChange={(e) => set("longDescription", e.target.value)} />
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="role">Role</label>
              <input id="role" value={form.role} onChange={(e) => set("role", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="year">Year</label>
              <input id="year" value={form.year} onChange={(e) => set("year", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="tools">Tools</label>
            <input id="tools" placeholder="Figma, Photoshop" value={form.tools} onChange={(e) => set("tools", e.target.value)} />
          </div>
          <RowList title="Extra image" items={(form.images || []).map((url) => ({ url }))}
            onChange={(rows) => set("images", rows.map((r) => r.url))}
            blank={{ url: "" }} addLabel="Add extra image"
            renderRow={(r, patch) => (
              <>
                <input aria-label="Image URL" placeholder="https://…" value={r.url}
                  onChange={(e) => patch("url", e.target.value)} />
                <ImagePreview url={r.url} />
              </>
            )} />
          {err("images")}
          <div className="field">
            <label htmlFor="link">Project link</label>
            <input id="link" placeholder="https://…" value={form.link}
              onChange={(e) => set("link", e.target.value)} {...aria("link")} />
            {err("link")}
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add project"}
            </button>
            {(editingId || dirty) && (
              <button className="ghost-btn" type="button" onClick={() => reset()}>
                {editingId ? "Cancel" : "Clear"}
              </button>
            )}
            {dirty && <span className="dirty on">Unsaved changes</span>}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="list-head">
          <h2>Projects {!loading && <span className="count">({shown.length}{q ? ` of ${projects.length}` : ""})</span>}</h2>
          <input type="search" aria-label="Search projects" placeholder="Search projects…" value={q}
            onChange={(e) => setQ(e.target.value)} className="search" />
        </div>
        {!loading && (missingLegacy.length > 0 || syncPlan.length > 0) && (
          <div className="import-bar">
            <span className="muted">
              {missingLegacy.length > 0 &&
                `${missingLegacy.length} project${missingLegacy.length === 1 ? "" : "s"} from your old portfolio site ${missingLegacy.length === 1 ? "isn't" : "aren't"} here yet. `}
              {syncPlan.length > 0 &&
                `${syncPlan.length} existing project${syncPlan.length === 1 ? " has" : "s have"} details on the old site that are still empty here.`}
            </span>
            <button className="btn" type="button" onClick={importLegacy} disabled={importing}>
              {importing ? "Importing…" : "Import details from old site"}
            </button>
          </div>
        )}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="muted">No projects yet. Add one with the form.</p>
        ) : shown.length === 0 ? (
          <p className="muted">No projects match “{q}”.</p>
        ) : (
          <ul className="proj-list">
            {shown.map((p) => {
              const idx = projects.findIndex((x) => x.id === p.id);
              return (
                <li key={p.id} className="proj-row">
                  <div className="thumb">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" loading="lazy" /> : <span>–</span>}
                  </div>
                  <div className="proj-meta">
                    <strong>{p.title}</strong>
                    {p.category && <div className="muted small">{p.category}</div>}
                  </div>
                  <div className="proj-row-actions">
                    <span className="ord" title="Order">{p.order ?? 0}</span>
                    <button className="ghost-btn sm" onClick={() => move(p, -1)} disabled={idx === 0}
                      aria-label={`Move ${p.title} up`}>↑</button>
                    <button className="ghost-btn sm" onClick={() => move(p, 1)} disabled={idx === projects.length - 1}
                      aria-label={`Move ${p.title} down`}>↓</button>
                    <button className="ghost-btn sm" onClick={() => startEdit(p)}>Edit</button>
                    <ConfirmButton label="Delete" ariaLabel={`Delete ${p.title}`} onConfirm={() => handleDelete(p)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}