import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import AzFooter from "../components/AzFooter.jsx";
import { AzNav } from "../components/AzChrome.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import { listProjects } from "../services/projects";
import { firebaseReady } from "../firebase";
import { FALLBACK_PROJECTS } from "../content";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Projects() {
  const root = useRef(null);
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | empty | error

  useEffect(() => {
    if (!firebaseReady) {
      setStatus("error");
      return;
    }
    listProjects()
      .then((rows) => {
        setProjects(rows);
        setStatus(rows.length ? "ready" : "empty");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(".pjs-hero h1 .line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.1)
        .from(".pjs-hero .lede", { y: 20, opacity: 0, duration: 0.9 }, 0.6);
    }, root);
    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  // Cards arrive after the data does, so animate them once the list is on screen.
  useEffect(() => {
    if (reduceMotion || status === "loading") return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".pjs-grid .card").forEach((card) => {
        gsap.from(card, {
          y: 50, opacity: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 92%" },
        });
      });
    }, root);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [status]);

  const list = status === "ready" ? projects : FALLBACK_PROJECTS;

  return (
    <div ref={root} className="home pj-page pjs">
      <AzNav current="/projects" />
      <section className="pjs-hero">
        <span className="eyebrow">Projects</span>
        <h1>
          <span className="line"><span>Selected work</span></span>
        </h1>
        <p className="lede">
          {status === "ready" ? `${projects.length} project${projects.length === 1 ? "" : "s"}. ` : ""}
          Hover a project to see its name, click it to read the story behind it.
        </p>
      </section>
      <section className="pjs-body">
        {status === "loading" && <p className="muted">Loading projects…</p>}
        {status !== "loading" && (
          <div className="grid pjs-grid">
            {list.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </section>
      <AzFooter />
    </div>
  );
}