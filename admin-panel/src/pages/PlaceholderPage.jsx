// Stand-in for sections you haven't built yet (Posts, Categories, ...).
export default function PlaceholderPage({ title }) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">This section is coming soon.</p>
    </main>
  );
}