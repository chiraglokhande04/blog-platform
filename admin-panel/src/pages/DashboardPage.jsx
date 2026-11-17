import StatCard from "../components/dashboard/StatCard";
import {
  UsersIcon,
  DocumentIcon,
  CheckCircleIcon,
  PencilIcon,
  TagIcon,
  ChatIcon,
} from "../components/dashboard/icons";

// Static dashboard data. Edit these numbers and rebuild.
const stats = {
  totalUsers: 1284,
  totalBlogs: 342,
  publishedBlogs: 276,
  draftBlogs: 66,
  totalCategories: 18,
  totalComments: 4731,
};

const percentOf = (part = 0, whole = 0) => (whole ? Math.round((part / whole) * 100) : 0);

const cards = [
  { key: "totalUsers", label: "Total users", icon: <UsersIcon /> },
  { key: "totalBlogs", label: "Total blogs", icon: <DocumentIcon /> },
  {
    key: "publishedBlogs",
    label: "Published blogs",
    icon: <CheckCircleIcon />,
    hint: `${percentOf(stats.publishedBlogs, stats.totalBlogs)}% of all blogs`,
  },
  {
    key: "draftBlogs",
    label: "Draft blogs",
    icon: <PencilIcon />,
    hint: `${percentOf(stats.draftBlogs, stats.totalBlogs)}% of all blogs`,
  },
  { key: "totalCategories", label: "Categories", icon: <TagIcon /> },
  { key: "totalComments", label: "Comments", icon: <ChatIcon /> },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">A snapshot of your blog platform.</p>

      <section aria-label="Platform statistics" className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, label, icon, hint }) => (
          <StatCard key={key} label={label} icon={icon} hint={hint} value={stats[key]} />
        ))}
      </section>
    </main>
  );
}