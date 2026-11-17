/** Reusable metric tile. `loading` renders a skeleton of the same size. */
export default function StatCard({ label, value, icon, hint, loading = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-700" aria-hidden="true">
          {icon}
        </span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2" aria-hidden="true">
          <div className="h-8 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {Number(value ?? 0).toLocaleString()}
          </p>
          {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
        </>
      )}
    </div>
  );
}