import Spinner from "./Spinner";

export default function PageLoader({ label = "Loading..." }) {
  return (
    <div className="py-10 text-center text-slate-600">
      <div className="inline-flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
        <Spinner />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
