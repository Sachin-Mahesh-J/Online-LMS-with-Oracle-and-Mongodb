import { useMemo } from "react";
import useToast from "../../hooks/useToast";

function toastStyles(variant) {
  switch (variant) {
    case "success":
      return "border-green-200 bg-green-50 text-green-900";
    case "error":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-slate-200 bg-white text-slate-900";
  }
}

export default function ToastViewport() {
  const { toasts, removeToast } = useToast();

  const visibleToasts = useMemo(() => {
    return (toasts || []).slice(0, 4);
  }, [toasts]);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {visibleToasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl border p-4 shadow-sm ${toastStyles(
            t.variant,
          )}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {t.title ? (
                <div className="text-sm font-semibold">{t.title}</div>
              ) : null}
              {t.message ? (
                <div className="mt-1 text-sm opacity-90">{t.message}</div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-black/5"
              aria-label="Dismiss"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
