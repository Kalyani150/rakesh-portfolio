import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROFILE } from "../content";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const LINKS = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Contact", "/contact"],
];

export default function AzFooter() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%" } });
      tl.from(".azf-col", { y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer ref={root} className="azf">

      <div className="azf-grid">
        <div className="azf-col">
          <span className="azf-h">Navigate</span>
          {LINKS.map(([t, to]) => (
            <Link key={to} to={to}>{t}</Link>
          ))}
        </div>
        <div className="azf-col">
          <span className="azf-h">Details</span>
          <p>{PROFILE.role}</p>
          <p>{PROFILE.location}</p>
          <p>{PROFILE.phone}</p>
        </div>
        {PROFILE.socials.length > 0 && (
          <div className="azf-col">
            <span className="azf-h">Elsewhere</span>
            {PROFILE.socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label} ↗</a>
            ))}
          </div>
        )}
        <div className="azf-col azf-end">
          <button type="button" className="azf-top" onClick={toTop}>Back to top <i>↑</i></button>
        </div>
      </div>

      <div className="azf-legal">
        <span>© {new Date().getFullYear()} {PROFILE.name}. All rights reserved.</span>
        <span>Designed &amp; built by Rakesh</span>
      </div>
    </footer>
  );
}
