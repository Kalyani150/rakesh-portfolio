import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import AzFooter from "../components/AzFooter.jsx";
import { AzNav } from "../components/AzChrome.jsx";
import { FALLBACK_PROJECTS } from "../content";

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
        ["Role", project.role],
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
              <p>{project.longDescription || project.details || project.description || "More details coming soon."}</p>
              {project.link && (
                <a className="lime-btn" href={project.link} target="_blank" rel="noreferrer">Visit live project ↗</a>
              )}
            </div>
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
