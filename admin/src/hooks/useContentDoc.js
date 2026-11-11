import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getContent, saveContent } from "../services/content";
import { useToast } from "../components/Toast.jsx";

// Loads content/{id}, merges over defaults, tracks unsaved changes.
export default function useContentDoc(id, defaults) {
  const { toast } = useToast();
  const [data, setData] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saved = useRef(JSON.stringify(defaults));
  const [savedStr, setSavedStr] = useState(saved.current);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const remote = await getContent(id);
        const merged = remote ? { ...defaults, ...stripMeta(remote) } : defaults;
        if (!alive) return;
        setData(merged);
        setSavedStr(JSON.stringify(merged));
        if (!remote) toast("No saved content yet - showing defaults. Save to publish.", "info");
      } catch (err) {
        console.error(err);
        toast("Couldn't load content - check Firestore is enabled.", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const dirty = useMemo(() => JSON.stringify(data) !== savedStr, [data, savedStr]);

  // warn on tab close when dirty
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = useCallback((field, value) => setData((d) => ({ ...d, [field]: value })), []);

  async function save(e) {
    e?.preventDefault();
    setSaving(true);
    try {
      await saveContent(id, data);
      setSavedStr(JSON.stringify(data));
      toast("Saved.");
    } catch (err) {
      console.error(err);
      toast("Save failed. Make sure you're signed in and rules allow writes.", "error");
    } finally {
      setSaving(false);
    }
  }

  return { data, set, setData, loading, saving, dirty, save };
}

function stripMeta(d) {
  const { updatedAt, ...rest } = d; // eslint-disable-line no-unused-vars
  return rest;
}