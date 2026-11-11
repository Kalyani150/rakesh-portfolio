import { useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Project from "./pages/Project.jsx";
import Projects from "./pages/Projects.jsx";
import { firebaseReady } from "./firebase";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      {!firebaseReady && (
        <div className="banner">
          Firebase isn’t configured yet. Add your config to <code>.env.local</code> and
          restart the dev server — see <strong>README.md</strong>, step 2.
        </div>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<Project />} />
        <Route
          path="*"
          element={
            <div className="center">
              <p className="muted">Page not found.</p>
              <Link className="btn" to="/">Back home</Link>
            </div>
          }
        />
      </Routes>
    </>
  );
}
