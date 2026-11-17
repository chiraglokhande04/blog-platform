import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import AdminLayout from "./components/AdminLayout";
import BlogsPage from "./pages/BlogsPage";

function NotFound() {
  return <div className="grid min-h-screen place-items-center text-slate-600">Page not found.</div>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
  {/* //  <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}

        {/* Pages that share the sidebar layout */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/categories" element={<PlaceholderPage title="Categories" />} />
          <Route path="/comments" element={<PlaceholderPage title="Comments" />} />
          <Route path="/users" element={<PlaceholderPage title="Users" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}