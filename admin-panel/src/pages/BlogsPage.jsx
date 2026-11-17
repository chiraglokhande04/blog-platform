import { useEffect, useMemo, useState } from "react";
import { initialBlogs } from "../lib/blogs";
import StatusBadge from "../components/blogs/StatusBadge";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Button from "../components/Button";
import Alert from "../components/Alert";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function BlogsPage() {
  // Deleting only changes this in-memory list; a refresh restores the sample data.
  const [blogs, setBlogs] = useState(initialBlogs);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return blogs.filter(
      (b) => (status === "all" || b.status === status) && b.title.toLowerCase().includes(q)
    );
  }, [blogs, query, status]);

  function confirmDelete() {
    setBlogs((prev) => prev.filter((b) => b.id !== deleting.id));
    setNotice(`“${deleting.title}” was deleted.`);
    setDeleting(null);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Blogs</h1>
      <p className="mt-1 text-sm text-slate-600">View and manage every blog on the platform.</p>

      {notice && (
        <Alert variant="success" className="mt-6">
          {notice}
        </Alert>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="blog-search" className="sr-only">
            Search blogs by title
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div>
          <label htmlFor="blog-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="blog-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:w-44"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Title</th>
              <th scope="col" className="px-5 py-3 font-medium">Author</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3 font-medium">Date</th>
              <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((blog) => (
              <tr key={blog.id} className="hover:bg-slate-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900">{blog.title}</p>
                  <p className="mt-0.5 text-slate-500">{blog.category}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">{blog.author}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={blog.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatDate(blog.date)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setViewing(blog)}
                      aria-label={`View ${blog.title}`}
                      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(blog)}
                      aria-label={`Delete ${blog.title}`}
                      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-slate-500">
            {blogs.length === 0 ? "There are no blogs left." : "No blogs match your search."}
          </p>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        Showing {filtered.length} of {blogs.length} blogs
      </p>

      {/* View */}
      {viewing && (
        <Modal
          title={viewing.title}
          onClose={() => setViewing(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setDeleting(viewing);
                  setViewing(null);
                }}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                Delete
              </button>
              <Button variant="secondary" onClick={() => setViewing(null)}>
                Close
              </Button>
            </>
          }
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            <StatusBadge status={viewing.status} />
            <span>{viewing.category}</span>
            <span aria-hidden="true">·</span>
            <span>By {viewing.author}</span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(viewing.date)}</span>
          </div>
          <p className="mt-4 text-base font-medium text-slate-800">{viewing.excerpt}</p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
            {viewing.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <ConfirmDialog
          title="Delete this blog?"
          message={`“${deleting.title}” will be removed from the list. This can't be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </main>
  );
}