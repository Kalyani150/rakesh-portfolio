import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import AzFooter from "../components/AzFooter.jsx";
import { AzNav } from "../components/AzChrome.jsx";
import { FALLBACK_PROJECTS } from "../content";

const splitParas = (t) => String(t || "").split(/\n+/).filter(Boolean);
const paras = (b) => (b && Array.isArray(b.paragraphs) ? b.paragraphs.filter(Boolean) : []);
const cards = (b) => (b && Array.isArray(b.cards) ? b.cards.filter((c) => c && (c.title || c.description)) : []);
const list = (a) => (Array.isArray(a) ? a.filter(Boolean) : []);

// Detail page for one project. Uses the project passed from the Home grid when available,
// otherwise loads it from Firestore (so direct links and refreshes work).
export default function Project() {
  const { id } = useParams();
  const { state } = useLocation();
  const [project, setProject] = useState(state?.project || null);
  const [status, setStatus] = useState(state?.project ? "ready" : "loading");

  useEffect(() => {
    if (state?.project && state.project.id === id) return;
    let alive = true;
    const fallback = FALLBACK_PROJECTS.find((p) => p.id === id);
    if (!firebaseReady) {
      setProject(fallback || null);
      setStatus(fallback ? "ready" : "missing");
      return;
    }
    getDoc(doc(db, "projects", id))
      .then((snap) => {
        if (!alive) return;
        if (snap.exists()) {
          setProject({ id: snap.id, ...snap.data() });
          setStatus("ready");
        } else {
          setProject(fallback || null);
          setStatus(fallback ? "ready" : "missing");
        }
      })
      .catch(() => {
        if (!alive) return;
        setProject(fallback || null);
        setStatus(fallback ? "ready" : "missing");
      });
    return () => { alive = false; };
  }, [id, state]);

  const gallery = project && Array.isArray(project.images) ? project.images.filter(Boolean) : [];
  const facts = project
    ? [
        ["Category", project.category],
        ["Client", project.client],
        ["Role", project.role],
        ["Platform", project.platform],
        ["Scope", project.scope],
        ["Year", project.year],
        ["Tools", Array.isArray(project.tools) ? project.tools.join(", ") : project.tools],
      ].filter(([, v]) => v)
    : [];

  return (
    <div className="home pj-page">
      <AzNav current="/" />
      <main className="pj">
        <Link className="pj-back" to="/projects">← All projects</Link>
        {status === "loading" && <p className="muted">Loading…</p>}
        {status === "missing" && <p className="muted">Project not found.</p>}
        {project && (
          <>
            <h1 className="pj-title">{project.title}</h1>
            {facts.length > 0 && (
              <dl className="pj-facts">
                {facts.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            )}
            {project.imageUrl && <img className="pj-cover" src={project.imageUrl} alt={project.title} />}
            <div className="pj-body">
              <h2>About this project</h2>
              {(splitParas(project.longDescription || project.details || project.description).length
                ? splitParas(project.longDescription || project.details || project.description)
                : ["More details coming soon."]
              ).map((t, i) => <p key={i}>{t}</p>)}
              {project.link && (
                <a className="lime-btn" href={project.link} target="_blank" rel="noreferrer">Visit live project ↗</a>
              )}
            </div>
            {list(project.ecosystem).length > 0 && (
              <section className="pj-sec">
                <h2>{project.experienceTitle || "The ecosystem"}</h2>
                <div className="pj-cards">
                  {list(project.ecosystem).map((c, i) => (
                    <div key={i} className="pj-card"><b>{c.title}</b><p>{c.description}</p></div>
                  ))}
                </div>
              </section>
            )}
            {(paras(project.challenge).length > 0 || paras(project.approach).length > 0) && (
              <section className="pj-sec pj-two">
                {[project.challenge, project.approach].map((b, i) =>
                  paras(b).length > 0 && (
                    <div key={i}>
                      <h2>{b.title}</h2>
                      {paras(b).map((t, j) => <p key={j}>{t}</p>)}
                    </div>
                  )
                )}
              </section>
            )}
            {project.strategicOverview && (project.strategicOverview.goal?.description || project.strategicOverview.process?.description) && (
              <section className="pj-sec">
                <span className="pj-label">{project.strategicOverview.label}</span>
                <h2>{project.strategicOverview.title}</h2>
                <div className="pj-cards">
                  {["goal", "process", "impact"].map((k) => {
                    const c = project.strategicOverview[k];
                    return c && c.description ? (
                      <div key={k} className="pj-card"><b>{c.title}</b><p>{c.description.replace(/\n/g, " ")}</p></div>
                    ) : null;
                  })}
                </div>
              </section>
            )}
            {cards(project.challengeSection).length > 0 && (
              <section className="pj-sec">
                <span className="pj-label">{project.challengeSection.label}</span>
                <h2>{project.challengeSection.title}</h2>
                <div className="pj-cards">
                  {cards(project.challengeSection).map((c, i) => (
                    <div key={i} className="pj-card"><b>{c.title}</b><p>{c.description}</p></div>
                  ))}
                </div>
              </section>
            )}
            {list(project.achievements).length > 0 && (
              <section className="pj-sec">
                <h2>Highlights</h2>
                <ul className="pj-list">
                  {list(project.achievements).map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </section>
            )}
            {project.outcome && (project.outcome.description || cards(project.outcome).length > 0) && (
              <section className="pj-sec">
                <h2>{project.outcome.title}</h2>
                {project.outcome.description && <p className="pj-lead">{project.outcome.description}</p>}
                <div className="pj-cards">
                  {cards(project.outcome).map((c, i) => (
                    <div key={i} className="pj-card"><b>{c.title}</b><p>{c.description}</p></div>
                  ))}
                </div>
              </section>
            )}
            {project.footerTitle && <p className="pj-closing">{project.footerTitle}</p>}
            {gallery.length > 0 && (
              <div className="pj-gallery">
                {gallery.map((src, i) => <img key={i} src={src} alt={`${project.title} ${i + 1}`} loading="lazy" />)}
              </div>
            )}
          </>
        )}
      </main>
      <AzFooter />
    </div>
  );
}
