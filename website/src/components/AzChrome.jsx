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
  const glCanvas = useRef(null);

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

    // ---- cursor distortion (WebGL) ----
    // A grid of 2D offsets covers the title. Moving the cursor pushes the offsets in the direction of motion,
    // and every frame they relax back to zero. The shader reads the title from the offset-shifted position,
    // so letters smear like liquid around the pointer and then settle again.
    const canHover = !instant && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const gl = canHover ? glCanvas.current.getContext("webgl", { alpha: true, premultipliedAlpha: true }) : null;
    const ROWS = 40;
    const RANGE = 12; // max stored offset
    const RADIUS = 8; // pointer radius in grid cells
    const STRENGTH = 45;
    const RELAX = 0.9;
    let glOK = false;
    let glProg = null;
    let texTitle = null;
    let texData = null;
    let glBuf = null;
    let cols = 0;
    let data = null;
    let bytes = null;
    let raf = 0;
    let energy = 0;
    const mouse = { x: 0, y: 0, px: null, py: null, vx: 0, vy: 0, inside: false };

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const setupGL = () => {
      if (!gl) return;
      const g = glCanvas.current;
      g.width = c.width;
      g.height = c.height;
      g.style.width = W + "px";
      g.style.height = H + "px";
      if (!glProg) {
        glProg = gl.createProgram();
        gl.attachShader(glProg, compile(gl.VERTEX_SHADER, "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}"));
        gl.attachShader(
          glProg,
          compile(
            gl.FRAGMENT_SHADER,
            `precision mediump float;
             uniform sampler2D uTex; uniform sampler2D uData; uniform float uRange; varying vec2 v;
             void main(){
               vec2 o = (texture2D(uData, v).rg * 255.0 - 128.0) / 127.0 * uRange;
               gl_FragColor = texture2D(uTex, v - 0.02 * o);
             }`
          )
        );
        gl.linkProgram(glProg);
        glBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        texTitle = gl.createTexture();
        texData = gl.createTexture();
      }
      gl.viewport(0, 0, g.width, g.height);
      // title texture (the off-screen white text)
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texTitle);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, off);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      // offset grid
      cols = Math.max(2, Math.round((ROWS * W) / H));
      data = new Float32Array(cols * ROWS * 2);
      bytes = new Uint8Array(cols * ROWS * 4);
      for (let i = 0; i < bytes.length; i += 4) { bytes[i] = 128; bytes[i + 1] = 128; bytes[i + 2] = 128; bytes[i + 3] = 255; }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texData);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, ROWS, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      glOK = gl.getError() === gl.NO_ERROR;
    };

    const glDraw = () => {
      gl.useProgram(glProg);
      gl.uniform1i(gl.getUniformLocation(glProg, "uTex"), 0);
      gl.uniform1i(gl.getUniformLocation(glProg, "uData"), 1);
      gl.uniform1f(gl.getUniformLocation(glProg, "uRange"), RANGE);
      const loc = gl.getAttribLocation(glProg, "p");
      gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const step = () => {
      raf = 0;
      if (!glOK || prog.v < 1) return;
      // relax, then let the pointer push nearby cells along its direction of travel
      for (let i = 0; i < data.length; i++) data[i] *= RELAX;
      if (mouse.inside) {
        const mx = mouse.x * cols;
        const my = (1 - mouse.y) * ROWS;
        for (let a = Math.max(0, Math.floor(mx - RADIUS)); a <= Math.min(cols - 1, Math.ceil(mx + RADIUS)); a++) {
          for (let l = Math.max(0, Math.floor(my - RADIUS)); l <= Math.min(ROWS - 1, Math.ceil(my + RADIUS)); l++) {
            const dx = a + 0.5 - mx;
            const dy = l + 0.5 - my;
            const d2 = dx * dx + dy * dy;
            if (d2 < RADIUS * RADIUS) {
              const f = Math.min(100, 4 / Math.max(0.5, Math.sqrt(d2)));
              const i = (l * cols + a) * 2;
              data[i] += STRENGTH * mouse.vx * f;
              data[i + 1] -= STRENGTH * mouse.vy * f;
            }
          }
        }
      }
      mouse.vx *= 0.9;
      mouse.vy *= 0.9;
      energy = 0;
      for (let i = 0, j = 0; i < data.length; i += 2, j += 4) {
        const x = Math.max(-RANGE, Math.min(RANGE, data[i]));
        const y = Math.max(-RANGE, Math.min(RANGE, data[i + 1]));
        energy = Math.max(energy, Math.abs(x), Math.abs(y));
        bytes[j] = Math.round((x / RANGE) * 127 + 128);
        bytes[j + 1] = Math.round((y / RANGE) * 127 + 128);
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texData);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, cols, ROWS, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      glDraw();
      if (energy > 0.02 || mouse.inside) raf = requestAnimationFrame(step);
    };

    const onMove = (e) => {
      if (!glOK || prog.v < 1 || !box.current) return;
      const r = box.current.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      mouse.inside = mouse.x > -0.05 && mouse.x < 1.05 && mouse.y > -0.05 && mouse.y < 1.05;
      if (mouse.px !== null) {
        mouse.vx = (e.clientX - mouse.px) / window.innerWidth;
        mouse.vy = (e.clientY - mouse.py) / window.innerWidth;
      }
      mouse.px = e.clientX;
      mouse.py = e.clientY;
      if (!raf && (mouse.inside || energy > 0.02)) raf = requestAnimationFrame(step);
    };

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
      setupGL();
      ready = true;
      draw();
    };

    const draw = () => {
      if (!ready) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      if (prog.v >= 1.0) {
        if (glOK) {
          // hand over to the WebGL layer (same pixels, now reacting to the cursor)
          ctx.clearRect(0, 0, c.width, c.height);
          glDraw();
        } else {
          ctx.drawImage(off, 0, 0);
        }
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
    if (gl) window.addEventListener("mousemove", onMove);

    return () => {
      alive = false;
      tween && tween.kill();
      window.removeEventListener("az:ready", play);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      if (gl && glProg) {
        gl.deleteProgram(glProg);
        gl.deleteTexture(texTitle);
        gl.deleteTexture(texData);
        gl.deleteBuffer(glBuf);
      }
    };
  }, [lines, instant]);

  return (
    <div ref={box} className="az-pixel" aria-hidden="true">
      <canvas ref={canvas} />
      <canvas ref={glCanvas} className="az-pixel-gl" />
    </div>
  );
}
