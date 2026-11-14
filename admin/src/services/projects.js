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
function normalize(data) {
  return {
    title: (data.title || "").trim(),
    category: (data.category || "").trim(),
    description: (data.description || "").trim(),
    imageUrl: (data.imageUrl || "").trim(),
    link: (data.link || "").trim(),
    role: (data.role || "").trim(),
    year: (data.year || "").trim(),
    tools: (data.tools || "").trim(),
    longDescription: (data.longDescription || "").trim(),
    images: (Array.isArray(data.images) ? data.images : []).map((u) => (u || "").trim()).filter(Boolean),
    order: Number(data.order) || 0,
  };
}
