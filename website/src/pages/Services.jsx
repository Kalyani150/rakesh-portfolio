import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AzFooter from "../components/AzFooter.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { PROFILE } from "../content";
import { Logo } from "../components/AzChrome.jsx";

gsap.registerPlugin(ScrollTrigger);

const GROUPS = [
  {
    title: "Research & structure",
    items: ["Goals and user research", "Competitor and product review", "Information architecture", "User flows and sitemaps", "Low-fidelity wireframes"],
  },
  {
    title: "Interface design",
    items: ["High-fidelity UI design", "Web and landing pages", "SaaS and dashboard screens", "Design systems and components", "Responsive layouts"],
  },
  {
    title: "Prototype & handoff",
    items: ["Clickable prototypes", "Usability review", "Motion direction", "Specs and assets for developers", "Support during build"],
  },
];

const WORK = [
  {
    title: "Corporate websites",
    desc: "I design clear, credible sites for businesses that need to explain what they do, quickly.",
    body: "Page structure, navigation, content hierarchy and responsive layouts, so visitors find what they need and trust what they see.",
    tag: "Structure first, polish second.",
    chips: ["Sitemaps", "Responsive UI", "Brand-led visuals"],
  },
  {
    title: "SaaS & dashboards",
    desc: "I work on dense, data-heavy tools: tables, forms, filters and charts, made calm.",
    body: "Flows for complex tasks, component libraries and handoff-ready screens that developers can build without guessing.",
    tag: "Complex tools that feel simple.",
    chips: ["Dashboards", "Design systems", "Data tables"],
  },
  {
    title: "Landing pages",
    desc: "I also build focused single pages meant to turn a visit into an enquiry.",
    body: "Message, layout and call to action shaped around one goal, tested on mobile first and ready for launch.",
    tag: "One page, one clear job.",
    chips: ["Conversion focus", "Mobile first", "Fast handoff"],
  },
];

const PHASES = [
  "Research & analysis",
  "Information architecture",
  "Wireframes & flows",
  "High-fidelity UI",
  "Prototyping",
  "Developer handoff",
];

const NAV = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Contact", "/contact"],
];

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A line-art wireframe cube, used by the loader.
function Cube({ className = "" }) {
  return (
    <img className={"az-cube az-loader-logo " + className} src="/logo.png" alt="" aria-hidden="true" />
  );
}

function Words({ as: Tag = "p", className, children }) {
  const words = String(children).split(" ");
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <span key={i} className="w">{w}{i < words.length - 1 ? " " : ""}</span>
      ))}
    </Tag>
  );
}

export default function Services() {
  const root = useRef(null);
  const [menu, setMenu] = useState(false);

  useLayoutEffect(() => {
    if (reduceMotion) {
      root.current?.classList.add("az-static");
      return;
    }

    const lenis = new Lenis({ lerp: 0.1 });
    lenis.stop(); // locked while the loader plays, like the reference
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const cleanups = [];

    const ctx = gsap.context(() => {
      // ---------------- loader: wireframe cube spins, colour shifts, panel lifts away ----------------
      gsap.set(".az-hero-card h1 .line > span", { yPercent: 115 });
      gsap.set(".az-hero-sub > *", { opacity: 0, y: 24 });
      gsap.set(".az-nav", { opacity: 0, y: -20 });
      gsap.set(".az-card-eye", { scale: 0 });

      gsap
        .timeline({ delay: 0.2 })
        .fromTo(".az-cube", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.6)" })
        .to(".az-loader", { backgroundColor: "#b91b4c", duration: 1.2, ease: "none" }, 0.9)
        .to(".az-cube", { scale: 0.2, opacity: 0, duration: 0.6, ease: "power3.in" }, 2.3)
        .to(".az-loader", { yPercent: -100, duration: 1, ease: "power4.inOut" }, 2.7)
        .add(() => lenis.start(), 3.4)
        .to(".az-hero-card h1 .line > span", { yPercent: 0, duration: 1.2, stagger: 0.12, ease: "power4.out" }, 3.0)
        .to(".az-hero-sub > *", { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }, 3.4)
        .to(".az-nav", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 3.4)
        .to(".az-card-eye", { scale: 1, duration: 0.7, ease: "back.out(1.8)" }, 3.6)
        .set(".az-loader", { display: "none" });

      // ---------------- hero card grows to full-bleed as you scroll ----------------
      gsap.to(".az-hero", {
        paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 0, ease: "none",
        scrollTrigger: { trigger: ".az-hero", start: "top top", end: "bottom 30%", scrub: true },
      });
      gsap.to(".az-hero-card", {
        borderRadius: 0, ease: "none",
        scrollTrigger: { trigger: ".az-hero", start: "top top", end: "bottom 30%", scrub: true },
      });
      gsap.to(".az-hero-card-in", {
        yPercent: -10, opacity: 0.35, ease: "none",
        scrollTrigger: { trigger: ".az-hero", start: "top top", end: "bottom top", scrub: true },
      });

      // ---------------- nav: links fade out, round menu button appears after the hero ----------------
      ScrollTrigger.create({
        start: () => window.innerHeight * 0.6,
        end: "max",
        onToggle: (self) => {
          gsap.to(".az-links", { opacity: self.isActive ? 0 : 1, y: self.isActive ? -10 : 0, duration: 0.35, pointerEvents: self.isActive ? "none" : "auto" });
          gsap.to(".az-burger", { scale: self.isActive ? 1 : 0, duration: 0.4, ease: "back.out(1.8)" });
        },
      });
      gsap.set(".az-burger", { scale: 0 });

      // ---------------- statement with dim -> bright words ----------------
      gsap.utils.toArray(".az-reveal").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".w"),
          { opacity: 0.25, y: 10 },
          {
            opacity: 1, y: 0, stagger: 0.05, ease: "none",
            scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 55%", scrub: true },
          }
        );
      });
      gsap.from(".az-how .az-label", {
        opacity: 0, x: 20, duration: 0.8,
        scrollTrigger: { trigger: ".az-how", start: "top 75%" },
      });

      // ---------------- background morphs violet -> cream; text goes grey -> black ----------------
      gsap.to(".az-morph", {
        backgroundColor: "#edebe6", ease: "none",
        scrollTrigger: { trigger: ".az-services", start: "top 90%", end: "top 30%", scrub: true },
      });
      gsap.to(".az-how, .az-how .az-big", {
        color: "#edebe6", ease: "none",
        scrollTrigger: { trigger: ".az-services", start: "top 95%", end: "top 70%", scrub: true },
      });
      gsap.fromTo(
        ".az-services h2, .az-services h3, .az-services li, .az-services .az-num",
        { color: "#f0a2b9" },
        {
          color: "#06130f", ease: "none", stagger: 0.01,
          scrollTrigger: { trigger: ".az-services", start: "top 80%", end: "top 25%", scrub: true },
        }
      );

      // ---------------- services: heading mask, then groups with line-by-line reveal ----------------
      gsap.from(".az-services h2", {
        y: 40, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".az-services h2", start: "top 85%" },
      });
      gsap.utils.toArray(".az-group").forEach((g) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: g, start: "top 82%" } });
        tl.from(g.querySelector(".az-rule"), { scaleX: 0, transformOrigin: "left", duration: 0.9, ease: "power3.inOut" })
          .from(g.querySelectorAll(".az-num, h3"), { y: 24, opacity: 0, stagger: 0.08, duration: 0.7, ease: "power3.out" }, 0.2)
          .from(g.querySelectorAll("li"), { yPercent: 100, opacity: 0, stagger: 0.07, duration: 0.7, ease: "power3.out" }, 0.4);
      });

      // ---------------- where I work: rows slide in ----------------
      gsap.utils.toArray(".az-work-row").forEach((row) => {
        gsap.from(row.children, {
          y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 86%" },
        });
        gsap.from(row.querySelector(".az-rule"), {
          scaleX: 0, transformOrigin: "left", duration: 1, ease: "power3.inOut",
          scrollTrigger: { trigger: row, start: "top 90%" },
        });
      });

      // ---------------- key phases: pinned horizontal progress, phases light up one by one ----------------
      const phases = gsap.utils.toArray(".az-phase");
      gsap.set(phases, { opacity: 0.2 });
      const ptl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".az-method", start: "top top", end: "+=240%", pin: ".az-method-stage", scrub: 0.6 },
      });
      ptl.fromTo(".az-progress", { scaleX: 0 }, { scaleX: 1, duration: phases.length }, 0);
      phases.forEach((p, i) => {
        ptl.to(p, { opacity: 1, duration: 0.5 }, i)
          .to(p.querySelector("b"), { color: "#c6f24e", duration: 0.5 }, i);
        if (i > 0) ptl.to(phases[i - 1].querySelector("b"), { color: "#f3efe7", duration: 0.4 }, i);
      });
      ptl.to({}, { duration: 0.6 });

      // ---------------- closing ----------------
      gsap.from(".az-cta .w", {
        y: 50, opacity: 0, stagger: 0.06, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".az-cta", start: "top 70%" },
      });

      // ---------------- lime badge: an eye in the hero that shrinks to a dot as you scroll, gone by the end ----------------
      gsap.to(".az-card-eye", {
        scale: 0.5, ease: "none",
        scrollTrigger: { trigger: ".az-hero", start: "top top", end: "bottom 40%", scrub: true },
      });
      gsap.to(".az-card-eye svg", {
        opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".az-hero", start: "top top", end: "bottom 40%", scrub: true },
      });
      gsap.to(".az-card-eye", {
        autoAlpha: 0, duration: 0.4,
        scrollTrigger: { trigger: ".az-method", start: "top 60%", toggleActions: "play none none reverse" },
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={root} className="az">
      {/* loader */}
      <div className="az-loader" aria-hidden="true"><Cube /></div>

      {/* nav */}
      <header className="az-nav">
        <Logo />
        <div className="az-nav-right">
          <nav className="az-links">
            {NAV.slice(0, 4).map(([t, to]) => (
              <Link key={to} to={to} className={to === "/services" ? "on" : ""}>{t}</Link>
            ))}
          </nav>
          <Link className="az-pill" to="/contact">Contact me</Link>
          <button className="az-burger" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <i /><i /><i />
          </button>
        </div>
      </header>

      <div className={"az-menu" + (menu ? " open" : "")} onClick={() => setMenu(false)}>
        {NAV.map(([t, to]) => (
          <Link key={to} to={to}>{t}</Link>
        ))}
      </div>

      {/* hero: inset card that grows to full-bleed on scroll */}
      <section className="az-hero">
        <div className="az-hero-card">
          <div className="az-hero-card-in">
            <h1>
              <span className="line"><span>The right design</span></span>
              <span className="line"><span>for your product</span></span>
            </h1>
            <div className="az-hero-sub">
              <p>
                Research, interface design, prototypes and developer handoff for websites, SaaS
                products and dashboards. One designer, from problem to launch.
              </p>
              <span className="az-label"><i />What I do</span>
            </div>
          </div>
          <span className="az-card-eye" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
            </svg>
          </span>
        </div>
      </section>

      {/* sections that share the morphing background */}
      <div className="az-morph">
        <section className="az-how">
          <div className="az-how-in">
            <h3>Designed, tested, handed off.</h3>
            <Words as="p" className="az-reveal az-big">
              Finding the right product to design, with you. Then shaping it and standing behind
              it, handoff included: the interface is where people meet the product, and the rest
              of the journey we shape together.
            </Words>
            <span className="az-label"><i />How I do it</span>
          </div>
        </section>

        <section className="az-services">
          <h2>What I can do for you</h2>
          <div className="az-groups">
            {GROUPS.map((g, i) => (
              <div key={g.title} className="az-group">
                <span className="az-rule" />
                <span className="az-num">0{i + 1}</span>
                <h3>{g.title}</h3>
                <ul>
                  {g.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* where I work */}
      <section className="az-work">
        <div className="az-work-intro">
          <Words as="p" className="az-reveal">
            I design digital products across business sectors, and I particularly love tools that
            put technology at the service of people.
          </Words>
          <span className="az-label"><i />Verticals</span>
        </div>
        <h3 className="az-work-h">My main fields of work are</h3>
        {WORK.map((w) => (
          <article key={w.title} className="az-work-row">
            <span className="az-rule" />
            <div className="aw-l">
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
            <div className="aw-r">
              <p>{w.body}</p>
              <b>{w.tag}</b>
              <div className="aw-chips">
                {w.chips.map((c) => <span key={c}>{c}</span>)}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* methodology: pinned, phases light up one by one */}
      <section className="az-method">
        <div className="az-method-stage">
          <span className="az-label"><i />Methodology</span>
          <h2>From problem<br />to solution</h2>
          <div className="az-phases-wrap">
            <div className="az-track"><span className="az-progress" /></div>
            <div className="az-phases">
              {PHASES.map((p, i) => (
                <div key={p} className="az-phase">
                  <span>0{i + 1}</span>
                  <b>{p}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="az-cta">
        <Words as="h2">Got an idea to share?</Words>
        <p>Tell me about your project — I’ll get back to you.</p>
        <Link className="az-pill big" to="/contact">Contact me</Link>
        <div className="az-cta-info">
          <span><i>Based in</i>{PROFILE.location}</span>
          <span><i>Phone</i>{PROFILE.phone}</span>
          <span><i>Role</i>{PROFILE.role}</span>
        </div>
      </section>

      <AzFooter />
    </div>
  );
}
