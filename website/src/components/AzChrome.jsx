import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

const NAV = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Contact", "/contact"],
];

export function Cube() {
  return (
    <img className="az-cube az-loader-logo" src="/logo.png" alt="" aria-hidden="true" />
  );
}

export function Loader() {
  return (
    <div className="az-loader" aria-hidden="true">
      <Cube />
    </div>
  );
}

export function Logo() {
  return (
    <Link className="az-logo" to="/" aria-label="Rakesh Parvathneni — home">
      <img className="az-logo-img" src="/logo.png" alt="Rakesh Parvathneni" />
    </Link>
  );
}

// Fixed nav: logo + links + "Contact me"; after the hero the links fade and a round menu button appears.
export function AzNav({ current = "/" }) {
  const [menu, setMenu] = useState(false);
  return (
    <>
      <header className="az-nav">
        <Logo />
        <div className="az-nav-right">
          <nav className="az-links">
            {NAV.slice(0, 4).map(([t, to]) => (
              <Link key={to} to={to} className={to === current ? "on" : ""}>{t}</Link>
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
    </>
  );
}

// Big title that assembles itself from small tiles (pixel dissolve), triggered by the "az:ready" event.
export function PixelTitle({ lines, instant = false }) {
  const box = useRef(null);
  const canvas = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c.getContext("2d");
    const off = document.createElement("canvas");
    const octx = off.getContext("2d");
    let tiles = [];
    let W = 0;
    let H = 0;
    let dpr = 1;
    const prog = { v: 0 };
    let tween = null;
    let ready = false;
    let alive = true;

    const T = 10; // tile size in CSS px

    const build = async () => {
      try {
        await document.fonts.load('650 100px "Archivo"');
      } catch {
        /* fall back to the default font */
      }
      if (!alive) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = box.current.getBoundingClientRect();
      W = r.width;
      H = r.height;
      [c, off].forEach((cv) => {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      });
      c.style.width = W + "px";
      c.style.height = H + "px";
      const fs = Math.max(48, Math.min(W * 0.125, 190));
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.clearRect(0, 0, W, H);
      octx.fillStyle = "#fff";
      octx.textBaseline = "alphabetic";
      octx.font = `650 ${fs}px "Archivo", "Inter Tight", sans-serif`;
      lines.forEach((ln, i) => octx.fillText(ln, i === 0 ? 0 : fs * 0.55, fs * 0.92 + i * fs * 0.98));
      // find tiles that contain ink
      const data = octx.getImageData(0, 0, off.width, off.height).data;
      tiles = [];
      for (let y = 0; y < H; y += T) {
        for (let x = 0; x < W; x += T) {
          let ink = false;
          for (let sy = 0; sy < T && !ink; sy += 3) {
            for (let sx = 0; sx < T; sx += 3) {
              const px = Math.round((x + sx) * dpr);
              const py = Math.round((y + sy) * dpr);
              if (data[(py * off.width + px) * 4 + 3] > 10) { ink = true; break; }
            }
          }
          if (ink) tiles.push({ x, y, d: Math.random() * 0.65, ox: (Math.random() - 0.5) * 70, oy: (Math.random() - 0.5) * 70 });
        }
      }
      ready = true;
      draw();
    };

    const draw = () => {
      if (!ready) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      if (prog.v >= 1.0) {
        ctx.drawImage(off, 0, 0);
        return;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      for (const t of tiles) {
        const p = Math.min(1, Math.max(0, (prog.v - t.d) / 0.35));
        if (p <= 0) continue;
        ctx.globalAlpha = p;
        const e = 1 - p;
        ctx.drawImage(
          off,
          t.x * dpr, t.y * dpr, T * dpr, T * dpr,
          (t.x + t.ox * e) * dpr, (t.y + t.oy * e) * dpr, T * dpr, T * dpr
        );
      }
      ctx.globalAlpha = 1;
    };

    const play = () => {
      if (instant) {
        prog.v = 1;
        draw();
        return;
      }
      tween = gsap.to(prog, { v: 1, duration: 1.8, ease: "power2.inOut", onUpdate: draw, onComplete: draw });
    };

    build().then(() => {
      if (instant) play();
    });
    window.addEventListener("az:ready", play);
    const onResize = () => {
      build().then(() => { prog.v = 1; draw(); });
    };
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      tween && tween.kill();
      window.removeEventListener("az:ready", play);
      window.removeEventListener("resize", onResize);
    };
  }, [lines, instant]);

  return (
    <div ref={box} className="az-pixel" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
