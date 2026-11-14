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

// Black footer laid out like the reference: logo + name, email, links on the right,
// orange column headings underneath, thin rule and a small legal row at the bottom.
export default function AzFooter() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const ctx = gsap.context(() => {
      gsap.from(".rf-anim", {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={root} className="rf">
      <div className="rf-grid">
        <Link to="/" className="rf-logo rf-anim" aria-label={`${PROFILE.name} — home`}>
          <img src="/logo.png" alt="" />
        </Link>
        <Link to="/" className="rf-brand rf-anim">
          <b>Rakesh</b> Parvathneni
        </Link>
        <a className="rf-mail rf-anim" href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
        <div className="rf-social rf-anim">
          {PROFILE.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
          ))}
        </div>

        <div className="rf-col rf-loc rf-anim">
          <span className="rf-h">Based in</span>
          <p>{PROFILE.location}</p>
        </div>
        <div className="rf-col rf-tel rf-anim">
          <span className="rf-h">Phone</span>
          <p>{PROFILE.phone}</p>
        </div>
        <nav className="rf-links rf-anim" aria-label="Footer">
          {LINKS.map(([t, to]) => (
            <Link key={to} to={to}>{t}</Link>
          ))}
        </nav>
      </div>

      <div className="rf-bottom">
        <span>© {new Date().getFullYear()} {PROFILE.name}</span>
        <span>{PROFILE.role}</span>
      </div>
    </footer>
  );
}
