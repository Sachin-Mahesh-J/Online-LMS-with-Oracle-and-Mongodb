function alertStyles(variant) {
  switch (variant) {
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    case "error":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

export default function Alert({ variant = "info", children, className = "" }) {
  if (!children) return null;

  return (
    <div
      className={`rounded-2xl border p-4 text-sm ${alertStyles(
        variant,
      )} ${className}`}
    >
      {children}
    </div>
  );
}
