import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AzFooter from "../components/AzFooter.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { listProjects } from "../services/projects";
import { firebaseReady } from "../firebase";
import { AzNav, Loader, PixelTitle } from "../components/AzChrome.jsx";

gsap.registerPlugin(ScrollTrigger);

const PAPER = "#ffffff";

const SERVICES = [
  "UI/UX design",
  "Web & landing page design",
  "SaaS & dashboard design",
  "Wireframes & user flows",
];

const PHASES = [
  ["01", "Research & analysis"],
  ["02", "Information architecture"],
  ["03", "Wireframes & flows"],
  ["04", "High-fidelity UI"],
  ["05", "Prototyping"],
  ["06", "Developer handoff"],
];

// Floating tiles for the parallax field: position (% of field), width (vw), scroll speed.
const FLOATS = [
  { top: 4, left: 6, w: 17, speed: 0.55, rot: -4 },
  { top: 9, left: 70, w: 20, speed: 0.9, rot: 3 },
  { top: 18, left: 36, w: 13, speed: 0.4, rot: 2 },
  { top: 22, left: 82, w: 12, speed: 1.15, rot: -3 },
  { top: 27, left: 12, w: 15, speed: 0.8, rot: 4 },
  { top: 34, left: 56, w: 18, speed: 0.6, rot: -2 },
  { top: 40, left: 28, w: 11, speed: 1.2, rot: 5 },
  { top: 44, left: 76, w: 14, speed: 0.45, rot: -5 },
  { top: 50, left: 3, w: 12, speed: 1.0, rot: 2 },
  { top: 55, left: 46, w: 16, speed: 0.7, rot: -3 },
  { top: 60, left: 66, w: 10, speed: 1.3, rot: 4 },
  { top: 64, left: 20, w: 14, speed: 0.5, rot: -2 },
];
const FLOAT_LABELS = ["Dashboard", "Landing", "SaaS", "Wireframe", "Flow", "Mobile", "Tables", "Forms"];

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Home() {
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

  // The work grid changes page height once projects arrive.
  useEffect(() => {
    if (status !== "loading") ScrollTrigger.refresh();
  }, [status]);

  useLayoutEffect(() => {
    if (reduceMotion) return;

    // Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync.
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.stop(); // locked while the loader plays, like the reference
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // ---- loader: wireframe cube spins, colour shifts, panel lifts away; then the name assembles ----
      gsap.set(".hero-tag p", { opacity: 0, y: 24 });
      gsap.set(".az-nav", { opacity: 0, y: -20 });
      gsap.set(".az-burger", { scale: 0 });
      gsap.set(".corr i", { opacity: 0 });

      gsap
        .timeline({ delay: 0.2 })
        .fromTo(".az-cube", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: "back.out(1.6)" })
        .to(".az-loader", { backgroundColor: "#b91b4c", duration: 1.2, ease: "none" }, 0.9)
        .to(".az-cube", { scale: 0.2, opacity: 0, duration: 0.6, ease: "power3.in" }, 2.3)
        .to(".az-loader", { yPercent: -100, duration: 1, ease: "power4.inOut" }, 2.7)
        .to(".corr i", { opacity: 1, duration: 1.2, stagger: 0.15, ease: "power2.out" }, 3.0)
        .add(() => window.dispatchEvent(new Event("az:ready")), 3.1)
        .add(() => lenis.start(), 3.4)
        .to(".hero-tag p", { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" }, 4.2)
        .to(".az-nav", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 3.4)
        .set(".az-loader", { display: "none" });

      // ---- nav: links fade out and the round menu button appears after the hero ----
      ScrollTrigger.create({
        start: () => window.innerHeight * 0.6,
        end: "max",
        onToggle: (self) => {
          gsap.to(".az-links", { opacity: self.isActive ? 0 : 1, y: self.isActive ? -10 : 0, duration: 0.35, pointerEvents: self.isActive ? "none" : "auto" });
          gsap.to(".az-burger", { scale: self.isActive ? 1 : 0, duration: 0.4, ease: "back.out(1.8)" });
        },
      });

      // corridor drifts a little as you scroll out of the hero
      gsap.to(".corr", {
        xPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".intro", start: "top top", end: "+=60%", scrub: true },
      });

      // ---- 1–3. Angled wipe → shrink to card → cube flip (one pinned timeline) ----
      gsap.set(".intro-panel", {
        xPercent: 58,
        rotationY: -22,
        transformPerspective: 1400,
        transformOrigin: "100% 50%",
        clipPath: "inset(0vh 0vw 0vh 0vw round 0px)",
      });
      gsap.set(".cube-wrap", { autoAlpha: 0 });
      gsap.set(".device", { autoAlpha: 0 });
      gsap.set(".device-b", { autoAlpha: 0 });

      const intro = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".intro",
          start: "top top",
          end: "+=520%",
          pin: ".intro-stage",
          scrub: 0.6,
        },
      });
      intro
        .to(".intro-panel", { xPercent: 0, rotationY: 0, duration: 1 }, 0)
        .to(".intro-hero", { opacity: 0.12, duration: 1 }, 0)
        .to(".intro-stage", { backgroundColor: PAPER, duration: 0.001 }, 1)
        .to(".corr", { autoAlpha: 0, duration: 0.5 }, 1)
        .fromTo(".panel-copy", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 1)
        .to(".intro-panel", { clipPath: "inset(6vh 5vw 6vh 5vw round 28px)", duration: 1 }, 1.7)
        .to(".device", { autoAlpha: 1, duration: 0.4 }, 2.4)
        // swap the flat panel for the identical front face of the 3D cube
        .set(".intro-panel", { autoAlpha: 0 }, 3.2)
        .set(".cube-wrap", { autoAlpha: 1 }, 3.2)
        .fromTo(".cube", { rotationX: 0 }, { rotationX: 90, ease: "power2.inOut", duration: 1.3 }, 3.2)
        .to(".device-a", { autoAlpha: 0, duration: 0.3 }, 3.7)
        .to(".device-b", { autoAlpha: 1, duration: 0.3 }, 3.7)
        .to(".device-card", { backgroundColor: "#ffffff", duration: 0.3 }, 3.7)
        .to({}, { duration: 1.2 }, 4.5); // hold on the grey card

      // ---- 5. Services: dim → bright word reveal, then the list ----
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll(".w"),
          { opacity: 0.15, y: 14 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
          }
        );
      });
      gsap.from(".svc-item", {
        y: 36,
        opacity: 0,
        stagger: 0.14,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: ".svc-list", start: "top 85%" },
      });
      gsap.from(".svc-cta", {
        y: 24,
        opacity: 0,
        duration: 0.6,
        scrollTrigger: { trigger: ".svc-cta", start: "top 92%" },
      });

      // ---- 6. Angled paper panel rises from the bottom-right ----
      gsap.set(".rise-panel", { xPercent: 38, yPercent: 105, rotation: 9, transformOrigin: "100% 100%" });
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".rise", start: "top top", end: "+=130%", pin: ".rise-stage", scrub: 0.6 },
        })
        .to(".rise-panel", { xPercent: 0, yPercent: 0, rotation: 0, duration: 1 }, 0)
        .fromTo(".rise-copy", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, 0.6);

      // ---- 7. Floating tiles at different speeds ----
      gsap.utils.toArray(".float-item").forEach((el) => {
        gsap.to(el, {
          y: () => -parseFloat(el.dataset.speed) * window.innerHeight * 0.9,
          ease: "none",
          scrollTrigger: { trigger: ".float-field", start: "top bottom", end: "bottom top", scrub: true },
        });
      });
      gsap.fromTo(
        ".float-copy",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: { trigger: ".float-field", start: "top 55%", end: "top top", scrub: true },
        }
      );

      // ---- 8. Key phases: card slides up and turns black, then the six boxes light up one by one ----
      gsap.set(".process-card", { yPercent: 60 });
      gsap.set(".pk-card", { opacity: 0.18 });
      const procTl = gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ".process", start: "top top", end: "+=420%", pin: ".process-stage", scrub: 0.6, invalidateOnRefresh: true },
        })
        // beige card rises with the methodology text, "Key phases" waiting at the bottom
        .to(".process-card", { yPercent: 0, duration: 1 }, 0)
        // then it turns black, the text above fades and slides away, "Key phases" rises to the top
        .to(".process-card", { backgroundColor: "#111", color: "#fff", duration: 1.2 }, 1.8)
        .to(".pm-inner", { y: () => -document.querySelector(".pk-head").offsetTop, duration: 1.2 }, 1.8)
        .to(".pm-top", { opacity: 0.2, duration: 1.2 }, 1.8);
      gsap.utils.toArray(".pk-card").forEach((c, i) => {
        procTl
          .to(c, { opacity: 1, duration: 0.5 }, 3.2 + i * 0.7)
          .fromTo(c.querySelector(".pk-dot"), { scale: 0.2 }, { scale: 1, duration: 0.5, ease: "back.out(2)" }, 3.2 + i * 0.7);
      });
      procTl.to({}, { duration: 0.8 });
      // ---- round lime badge that follows the page (Airbag): appears after the hero, gone at the methodology ----
      gsap.set(".home-eye", { autoAlpha: 0, scale: 0.4 });
      ScrollTrigger.create({
        trigger: ".services", start: "top 70%", endTrigger: ".process", end: "top 70%",
        onToggle: (self) => gsap.to(".home-eye", { autoAlpha: self.isActive ? 1 : 0, scale: self.isActive ? 1 : 0.4, duration: 0.5, ease: "back.out(1.7)" }),
      });
      gsap.to(".home-eye i", { scaleY: 0.45, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.18, transformOrigin: "50% 50%" });

      // ---- people section ----
      gsap.from(".ppl-stat", {
        y: 50, opacity: 0, stagger: 0.12, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".people", start: "top 65%" },
      });
    }, root);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  const tileProject = (i) => {
    const withImg = projects.filter((p) => p.imageUrl);
    return withImg.length ? withImg[i % withImg.length] : null;
  };

  return (
    <div ref={root} className={"home" + (reduceMotion ? " reduce" : "")}>
      <Loader />
      <AzNav current="/" />
      <span className="az-card-eye home-eye" aria-hidden="true"><i /><i /><i /></span>

      {/* 1–3 · angled wipe, shrink to card, cube flip */}
      <section id="top" className="intro">
        <div className="intro-stage">
          {/* 3D corridor behind the hero, like the reference */}
          <div className="corr" aria-hidden="true">
            <i className="corr-ceil" /><i className="corr-floor" /><i className="corr-wall" />
          </div>
          <div className="intro-hero">
            <h1 className="sr-only">Rakesh Parvathneni</h1>
            <PixelTitle lines={["Rakesh", "Parvathneni"]} instant={reduceMotion} />
            <div className="hero-tag">
              <p className="tag-1">UI/UX Designer</p>
              <p className="tag-2">Meaningful websites, products and experiences.</p>
            </div>
          </div>

          <div className="intro-panel">
            <PanelCopy />
          </div>

          <div className="cube-wrap">
            <div className="cube-pos">
              <div className="cube">
                <div className="face face-front">
                  <PanelCopy />
                </div>
                <div className="face face-next">
                  <AboutFace />
                </div>
              </div>
            </div>
          </div>

          <div className="device" aria-hidden="true">
            <i className="device-frame f1" />
            <i className="device-frame f2" />
            <div className="device-card">
              <span className="device-a"><b /><b /></span>
              <span className="device-b"><em><i /><i /><i /></em></span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · services */}
      <section className="services">
        <span className="side-label"><i /> My areas of focus</span>
        <Words as="p" className="reveal big-p">
          I work across different digital experiences, bringing ideas to life through thoughtful design. From websites to dashboards, I focus on making every interaction simple, clear and useful.
        </Words>
        <Words as="p" className="reveal lead-in">My main areas of design are</Words>
        <ul className="svc-list">
          {SERVICES.map((s) => (
            <li key={s} className="svc-item">
              <span className="circle-arrow">→</span>
              {s}
            </li>
          ))}
        </ul>
        <Link className="lime-btn svc-cta" to="/services">Discover what I can design for you</Link>
      </section>

      {/* 6 · angled panel reveal */}
      <section className="rise">
        <div className="rise-stage">
          <div className="rise-panel">
            <h2 className="rise-copy">A product is beautiful<br />when it works well.</h2>
          </div>
        </div>
      </section>

      {/* design principles */}
      <section className="craft">
        <Words as="h2" className="reveal craft-title">Simple, useful and intuitive experiences.</Words>
        <Words as="p" className="reveal craft-p">
          Design is at the heart of my work. I focus on understanding user needs and transforming complex ideas into clear, meaningful interfaces.
        </Words>
        <Words as="p" className="reveal craft-p">
          I believe great experiences come from thoughtful decisions, continuous learning and attention to detail.
        </Words>
      </section>

      {/* 7 · floating tiles */}
      <section className="float-field">
        {FLOATS.map((f, i) => {
          const proj = tileProject(i);
          const style = { top: `${f.top * 1.35}%`, left: `${f.left}%`, width: `${f.w}vw`, transform: `rotate(${f.rot}deg)` };
          return proj ? (
            <Link
              key={i}
              className="float-item has-proj"
              data-speed={f.speed}
              style={style}
              to={`/project/${proj.id}`}
              state={{ project: proj }}
              aria-label={proj.title}
            >
              <img src={proj.imageUrl} alt={proj.title} loading="lazy" />
              <span className="float-name">{proj.title}</span>
            </Link>
          ) : (
            <div key={i} className="float-item" data-speed={f.speed} style={style}>
              <span>{FLOAT_LABELS[i % FLOAT_LABELS.length]}</span>
            </div>
          );
        })}
        <div className="float-sticky">
          <div className="float-copy">
            <Link className="lime-btn" to="/projects">Works</Link>
          </div>
        </div>
      </section>

      {/* 8 · key phases (staggered boxes with icons) */}
      <section className="process">
        <div className="process-stage">
          <div className="process-card">
            <div className="pm-inner">
              <div className="pm-top">
                <h2 className="pm-title">From problem to solution</h2>
                <div className="pm-row">
                  <div className="pm-text">
                    <p>
                      Every project starts with understanding the problem, the users and the goals. Before designing, I explore the requirements and organise the experience.
                    </p>
                    <p>
                      I turn ideas into structured user flows, wireframes and high-fidelity interfaces, refining each detail through feedback and iteration.
                    </p>
                  </div>
                  <span className="side-label pm-label"><i /> My methodology</span>
                </div>
              </div>
              <div className="pk-head">
                <h2>Key phases</h2>
                <Link className="pk-more" to="/services">
                  <span>Learn more about my design process</span>
                  <i aria-hidden="true">→</i>
                </Link>
              </div>
              <div className="pk-grid">
                {PHASES.map(([n, t], i) => (
                  <div key={n} className={"pk-card pk-" + (i + 1)}>
                    <PhaseIcon i={i} />
                    <span className="pk-title">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* people, relations and trust */}
      <section className="people">
        <Words as="h2" className="reveal ppl-title">People, ideas and meaningful experiences.</Words>
        <Words as="p" className="reveal ppl-text">
          Every project brings a new opportunity to learn, explore and create something meaningful.
        </Words>
        <Words as="p" className="reveal ppl-text">
          I enjoy collaborating with teams, understanding different perspectives and turning creative ideas into practical digital experiences.
        </Words>
        <Link className="lime-btn" to="/about">About me</Link>
      </section>
      <AzFooter />
    </div>
  );
}

function PanelCopy() {
  return (
    <div className="panel-copy">
      <span className="panel-kicker">A UI/UX designer</span>
      <h2>The digital experience you imagine? I design it with purpose and clarity.</h2>
      <p>
        From the first idea, to the final interface, I focus on creating meaningful
        websites, products and experiences.
      </p>
    </div>
  );
}

function AboutFace() {
  return (
    <div className="about-face">
      <span className="eyebrow">The ground I know</span>
      <h2 className="about-lead">
        Since 2025, I’ve been exploring where creativity, technology and user experience meet;
        designing digital interfaces, websites and SaaS products.
      </h2>
      <p>That’s where I believe good design makes a difference.</p>
    </div>
  );
}

// Splits text into per-word spans so ScrollTrigger can reveal them one by one.
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

// Small line icons for the key phases, each with a lime dot.
function PhaseIcon({ i }) {
  const dot = <span className="pk-dot" />;
  if (i === 0) return <div className="pk-ico ico-toggle">{dot}<span className="pk-pill"><b /></span></div>;
  if (i === 1) return <div className="pk-ico ico-pair"><span>{dot}</span><span><b /></span></div>;
  if (i === 2) return <div className="pk-ico ico-frame">{dot}<span /></div>;
  if (i === 3) return <div className="pk-ico ico-dots">{Array.from({ length: 9 }).map((_, k) => (k === 4 ? <span key={k}>{dot}</span> : <span key={k} className="o" />))}</div>;
  if (i === 4) return <div className="pk-ico ico-over"><span className="a" /><span className="b" /><span className="c" />{dot}</div>;
  return <div className="pk-ico ico-globe"><span className="a" /><span className="b" /><span className="c" />{dot}</div>;
}