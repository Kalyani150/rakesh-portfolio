import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const projectsCol = collection(db, "projects");

export async function listProjects() {
  const q = query(projectsCol, orderBy("order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Writes require an authenticated user per firestore.rules.
export async function createProject(data) {
  return addDoc(projectsCol, {
    ...normalize(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProject(id, data) {
  return updateDoc(doc(db, "projects", id), {
    ...normalize(data),
    updatedAt: serverTimestamp(),
  });
}

export async function removeProject(id) {
  return deleteDoc(doc(db, "projects", id));
}

// Keep the shape consistent and coerce "order" to a number.
// Case-study sections from the old site. The form doesn't edit these, but they're passed
// through when present (import / sync) and left untouched in Firestore otherwise.
export const CASE_KEYS = [
  "subtitle", "platform", "scope", "client", "experienceTitle", "footerTitle",
  "achievements", "ecosystem", "challenge", "approach", "strategicOverview",
  "challengeSection", "outcome",
];

const str = (v) => (Array.isArray(v) ? v.join(", ") : v || "").toString().trim();

function normalize(data) {
  const out = {
    title: str(data.title),
    category: str(data.category),
    description: str(data.description),
    imageUrl: str(data.imageUrl),
    link: str(data.link),
    role: str(data.role),
    year: str(data.year),
    tools: str(data.tools),
    longDescription: str(data.longDescription),
    images: (Array.isArray(data.images) ? data.images : []).map(str).filter(Boolean),
    order: Number(data.order) || 0,
  };
  for (const k of CASE_KEYS) if (data[k] !== undefined) out[k] = data[k];
  return out;
}
