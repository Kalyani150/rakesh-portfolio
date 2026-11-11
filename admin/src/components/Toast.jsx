import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastCtx = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (message, kind = "ok") => {
      const id = nextId.current++;
      setItems((l) => [...l, { id, message, kind }]);
      setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3500);
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="toasts" role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className={"toast " + t.kind}>
            <span>{t.message}</span>
            <button type="button" className="toast-x" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}