import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

// Content docs live in collection `content`: home, about, services.
export async function getContent(id) {
  const snap = await getDoc(doc(db, "content", id));
  return snap.exists() ? snap.data() : null;
}

export async function saveContent(id, data) {
  return setDoc(
    doc(db, "content", id),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}