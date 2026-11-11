import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AzFooter from "../components/AzFooter.jsx";
import { Logo } from "../components/AzChrome.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, firebaseReady } from "../firebase";
import { PROFILE } from "../content";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Contact() {
  const root = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState("idle"); // idle | sending | sent | error | offline
  const [copied, setCopied] = useState("");

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
        .from(".sv-hero h1 .line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 }, 0.1)
        .from(".sv-hero .eyebrow, .sv-hero .lede", { y: 20, opacity: 0, duration: 0.9, stagger: 0.15 }, 0.6)
        .from(".nav", { opacity: 0, y: -16, duration: 0.8 }, 0.8);
      gsap.from(".ct-row, .cf-field, .cf-submit", {
        y: 40, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".contact-body", start: "top 80%" },
      });
    }, root);
    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard unavailable — value is still visible on screen */
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!firebaseReady) return setState("offline");
    setState("sending");
    try {
      await addDoc(collection(db, "messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        createdAt: serverTimestamp(),
      });
      setForm({ name: "", email: "", message: "" });
      setState("sent");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  };

  return (
    <div ref={root} className={"home svcpage" + (reduceMotion ? " reduce" : "")}>
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

      <section className="sv-hero">
        <div className="sv-hero-inner">
          <span className="eyebrow">Contact</span>
          <h1>
            <span className="line"><span>Let’s talk</span></span>
            <span className="line"><span>about it.</span></span>
          </h1>
          <p className="lede">New project, new challenge? Send a message and I’ll get back to you.</p>
        </div>
      </section>

      <section className="contact-body">
        <div className="contact-info">
          <span className="side-label dark"><i /> Details</span>
          <div className="ct-list">
            <button type="button" className="ct-row" onClick={() => copy("Email", PROFILE.email)}>
              <span>Email</span>
              <b>{PROFILE.email}</b>
              <em>{copied === "Email" ? "Copied ✓" : "Click to copy"}</em>
            </button>
            <button type="button" className="ct-row" onClick={() => copy("Phone", PROFILE.phone)}>
              <span>Phone</span>
              <b>{PROFILE.phone}</b>
              <em>{copied === "Phone" ? "Copied ✓" : "Click to copy"}</em>
            </button>
            <div className="ct-row">
              <span>Based in</span>
              <b>{PROFILE.location}</b>
              <em />
            </div>
            {PROFILE.socials.map((s) => (
              <a key={s.label} className="ct-row" href={s.href} target="_blank" rel="noreferrer">
                <span>{s.label}</span><b>{s.href.replace(/^https?:\/\//, "")}</b><em>↗</em>
              </a>
            ))}
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <span className="side-label dark"><i /> Message</span>
          <label className="cf-field">
            <span>Your name</span>
            <input required maxLength={100} value={form.name} onChange={set("name")} autoComplete="name" />
          </label>
          <label className="cf-field">
            <span>Your email</span>
            <input required type="email" maxLength={200} value={form.email} onChange={set("email")} autoComplete="email" />
          </label>
          <label className="cf-field">
            <span>Project details</span>
            <textarea required rows={5} maxLength={3000} value={form.message} onChange={set("message")} />
          </label>
          <button className="lime-btn cf-submit" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Send message"}
          </button>
          {state === "sent" && <p className="cf-note">Thanks — your message was sent.</p>}
          {state === "error" && <p className="cf-note err">Couldn’t send. Please try again, or copy my email on the left.</p>}
          {state === "offline" && <p className="cf-note err">The form isn’t connected yet. Please copy my email on the left.</p>}
        </form>
      </section>

      <AzFooter />
    </div>
  );
}
