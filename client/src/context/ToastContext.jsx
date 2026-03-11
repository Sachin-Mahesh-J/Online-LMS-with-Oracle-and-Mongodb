import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./toastContext";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => (prev || []).filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, variant = "info", durationMs = 3000 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = { id, title, message, variant };
      setToasts((prev) => [toast, ...(prev || [])]);

      if (durationMs && durationMs > 0) {
        window.setTimeout(() => removeToast(id), durationMs);
      }

      return id;
    },
    [removeToast],
  );

  const value = useMemo(() => {
    return { toasts, addToast, removeToast };
  }, [addToast, removeToast, toasts]);

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}
