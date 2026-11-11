import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AzFooter from "../components/AzFooter.jsx";
import { Logo } from "../components/AzChrome.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { PROFILE, EXPERIENCE, SKILLS, PRINCIPLES } from "../content";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  [1, "+", "Years of experience"],
  [10, "+", "Happy clients"],
  [20, "+", "Projects delivered"],
];

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

export default function About() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const cleanups = [];

    const ctx = gsap.context(() => {
      // hero intro
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .from(".ab-hero h1 .line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.1)
        .from(".ab-hero .eyebrow, .ab-hero .lede", { y: 20, opacity: 0, duration: 0.9, stagger: 0.15 }, 0.6)
        .from(".ab-badge", { scale: 0.4, rotation: -90, opacity: 0, duration: 1.2, ease: "back.out(1.6)" }, 0.5)
        .from(".nav", { opacity: 0, y: -16, duration: 0.8 }, 0.8);

      // badge spins forever, and a bit faster while scrolling
      const spin = gsap.to(".ab-badge-ring", { rotation: 360, ease: "none", duration: 18, repeat: -1, transformOrigin: "50% 50%" });
      ScrollTrigger.create({
        trigger: ".ab-hero",
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          spin.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 300, 6));
        },
      });

      // hero drifts away on scroll
      gsap.to(".ab-hero-inner", {
        yPercent: -14, opacity: 0.1, ease: "none",
        scrollTrigger: { trigger: ".ab-hero", start: "top top", end: "bottom top", scrub: true },
      });

      // intro statement: dim -> bright words
      gsap.fromTo(
        ".ab-intro .w",
        { opacity: 0.15, y: 12 },
        {
          opacity: 1, y: 0, stagger: 0.05, ease: "none",
          scrollTrigger: { trigger: ".ab-intro", start: "top 75%", end: "bottom 55%", scrub: true },
        }
      );

      // bento tiles rise in with a stagger
      gsap.from(".bento > *", {
        y: 70, opacity: 0, scale: 0.94, stagger: 0.1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".bento", start: "top 80%" },
      });

      // count-ups
      gsap.utils.toArray(".stat-num").forEach((el) => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: Number(el.dataset.to), duration: 1.6, ease: "power2.out",
          onUpdate: () => (el.textContent = String(Math.round(obj.v)).padStart(2, "0")),
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      // 3D tilt on bento tiles that follow the cursor
      gsap.utils.toArray(".tilt").forEach((el) => {
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });
        const move = (e) => {
          const r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        };
        const leave = () => { rx(0); ry(0); };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });

      // experience card slides in from the side
      gsap.from(".ab-exp-card", {
        xPercent: 12, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".ab-exp", start: "top 75%" },
      });
      gsap.from(".ab-exp-head > *", {
        y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".ab-exp", start: "top 80%" },
      });

      // two marquees running in opposite directions, both react to scroll velocity
      const rowA = gsap.to(".mq-a", { xPercent: -50, ease: "none", duration: 36, repeat: -1 });
      const rowB = gsap.fromTo(".mq-b", { xPercent: -50 }, { xPercent: 0, ease: "none", duration: 36, repeat: -1 });
      ScrollTrigger.create({
        trigger: ".ab-skills", start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);
          [rowA, rowB].forEach((l) => {
            gsap.to(l, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
            gsap.to(l, { timeScale: self.direction, delay: 0.25, duration: 0.8, overwrite: "auto" });
          });
        },
      });

      // closing CTA
      gsap.from(".cta-title .w", {
        y: 50, opacity: 0, stagger: 0.06, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".cta", start: "top 70%" },
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  const rowA = [...SKILLS, ...SKILLS];
  const rowB = [...SKILLS].reverse().concat([...SKILLS].reverse());

  return (
    <div ref={root} className={"home svcpage about" + (reduceMotion ? " reduce" : "")}>
      <header className="nav">
        <Logo />
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>

      {/* hero: dark, big type, spinning badge */}
      <section className="ab-hero">
        <div className="ab-hero-inner">
          <span className="eyebrow">About me</span>
          <h1>
            <span className="line"><span>Designing for</span></span>
            <span className="line"><span>people, not</span></span>
            <span className="line"><span>pixels.</span></span>
          </h1>
          <p className="lede">
            I’m {PROFILE.name.split(" ")[0]}, a {PROFILE.role} based in Hyderabad, shaping useful,
            simple and ergonomic digital products.
          </p>
        </div>
        <div className="ab-badge" aria-hidden="true">
          <svg className="ab-badge-ring" viewBox="0 0 200 200">
            <defs>
              <path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text>
              <textPath href="#circ">UI/UX DESIGNER • HYDERABAD • OPEN TO WORK • </textPath>
            </text>
          </svg>
          <span className="ab-badge-core">✦</span>
        </div>
      </section>

      {/* intro statement */}
      <section className="ab-intro">
        <span className="side-label"><i /> Who I am</span>
        <Words as="p" className="ab-intro-p">
          I’m a UI/UX Designer at KBK Business Solutions, designing web interfaces, SaaS
          dashboards and landing pages. I turn requirements into user flows and wireframes,
          then into polished, production-ready UI.
        </Words>
      </section>

      {/* bento grid: stats + principles + location */}
      <section className="ab-bento-wrap">
        <div className="bento">
          {STATS.map(([n, suffix, label], i) => (
            <div key={label} className={`tile tilt stat-tile s${i}`}>
              <b>
                <span className="stat-num" data-to={n}>{String(n).padStart(2, "0")}</span>
                {suffix}
              </b>
              <span>{label}</span>
            </div>
          ))}

          {PRINCIPLES.map(([t, d], i) => (
            <div key={t} className={`tile tilt pr-tile p${i}`}>
              <span className="tile-n">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}

          <div className="tile tilt loc-tile">
            <span className="tile-n">Based in</span>
            <h3>Hyderabad,<br />India</h3>
            <p>Working with teams and clients anywhere.</p>
          </div>
        </div>
      </section>

      {/* experience */}
      <section className="ab-exp">
        <div className="ab-exp-head">
          <span className="side-label dark"><i /> Experience</span>
          <h2>Where I’ve<br />worked</h2>
        </div>
        <div className="ab-exp-list">
          {EXPERIENCE.map((e) => (
            <article key={e.company} className="ab-exp-card">
              <div className="ab-exp-top">
                <span className="pill">{e.period}</span>
                <span className="ab-exp-place">{e.place}</span>
              </div>
              <h3>{e.role}</h3>
              <b className="ab-exp-co">{e.company}</b>
              <p>{e.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* skills: two opposite marquees */}
      <section className="ab-skills" aria-label="Skills">
        <span className="side-label"><i /> Skills</span>
        <div className="mq-row"><div className="mq-track mq-a">
          {rowA.map((s, i) => <span key={i} className="mq-skill">{s}<i>✦</i></span>)}
        </div></div>
        <div className="mq-row"><div className="mq-track mq-b">
          {rowB.map((s, i) => <span key={i} className="mq-skill outline">{s}<i>✦</i></span>)}
        </div></div>
      </section>

      <section className="cta">
        <Words as="h2" className="cta-title">Let’s build something useful.</Words>
        <Link className="lime-btn big" to="/contact">Get in touch</Link>
      </section>

      <AzFooter />
    </div>
  );
}
