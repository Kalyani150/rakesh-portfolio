import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const projectsCol = collection(db, "projects");

// Public read — ordered by the numeric "order" field (lower = shown first).
// Writes live in the separate admin app.
export async function listProjects() {
  const q = query(projectsCol, orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
