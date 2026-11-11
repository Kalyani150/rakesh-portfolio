import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Layout from "./components/Layout.jsx";
import Projects from "./pages/Projects.jsx";
import HomeEditor from "./pages/HomeEditor.jsx";
import AboutEditor from "./pages/AboutEditor.jsx";
import ServicesEditor from "./pages/ServicesEditor.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { firebaseReady } from "./firebase";

export default function App() {
  return (
    <>
      {!firebaseReady && (
        <div className="banner">
          Firebase isn’t configured yet. Add your config to <code>.env.local</code> and
          restart the dev server — see <strong>README.md</strong>, step 2.
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<Projects />} />
          <Route path="home" element={<HomeEditor />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="services" element={<ServicesEditor />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
