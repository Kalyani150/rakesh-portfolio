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

const SOCIALS = [
  {
    name: "Twitter",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.2 2.5h3.1l-6.8 7.7 8 11.3h-6.3l-4.9-6.8-5.8 6.8H2.4l7.3-8.3L2 2.5h6.4l4.4 6.2zm-1.1 17.1h1.7L7 4.3H5.2z" /></svg>
    ),
  },
  {
    name: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" /></svg>
    ),
  },
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
          {SOCIALS.map(({ name, icon }) => {
            const href = PROFILE.socials.find((s) => s.label.toLowerCase() === name.toLowerCase())?.href;
            return (
              <a
                key={name}
                href={href || "#"}
                aria-label={name}
                title={name}
                {...(href ? { target: "_blank", rel: "noreferrer" } : { onClick: (e) => e.preventDefault() })}
              >
                {icon}
              </a>
            );
          })}
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
