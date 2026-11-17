import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import PasswordField from "../components/PasswordField";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";

// Static login screen: no validation and no credential check.
// Submitting goes straight to the dashboard.
export default function LoginPage({ brand = "Inkwell" }) {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <AuthLayout
      brand={brand}
      title="Sign in to your dashboard"
      subtitle="Manage posts, authors and comments."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="admin@example.com"
        />

        <PasswordField label="Password" name="password" autoComplete="current-password" />

        <div className="flex items-center justify-between">
          <Checkbox label="Keep me signed in" defaultChecked />
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth>
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Need access? Ask a site owner to invite you.
      </p>
    </AuthLayout>
  );
}