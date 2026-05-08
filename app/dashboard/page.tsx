import { requireAuth } from "@/app/lib/auth-helpers";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 56 56">
                <rect x="6" y="6" width="44" height="10" fill="var(--fg)" />
                <rect x="6" y="20" width="32" height="10" fill="var(--fg)" />
                <rect x="6" y="34" width="20" height="10" fill="var(--accent)" />
              </svg>
              <span className="text-display-md" style={{ color: "var(--fg)" }}>
                Workouter
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-body" style={{ color: "var(--fg-soft)" }}>
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="btn btn-ghost">
                SIGN OUT
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="text-utility mb-2" style={{ color: "var(--muted)" }}>
            DASHBOARD
          </div>
          <h1 className="text-display-lg mb-4" style={{ color: "var(--fg)" }}>
            Welcome back, {session.user.name || "athlete"}
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <p className="text-body-lg" style={{ color: "var(--fg-soft)" }}>
            Your workouts and training plans.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div
            className="p-6 rounded-lg"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-heading mb-2" style={{ color: "var(--fg)" }}>
              Build a workout
            </h3>
            <p className="text-body mb-4" style={{ color: "var(--fg-soft)" }}>
              Create a new structured workout from scratch.
            </p>
            <button className="btn btn-primary">NEW WORKOUT →</button>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-heading mb-2" style={{ color: "var(--fg)" }}>
              API Access
            </h3>
            <p className="text-body mb-4" style={{ color: "var(--fg-soft)" }}>
              Generate OAuth clients for external integrations.
            </p>
            <Link href="/dashboard/api-clients" className="btn btn-secondary">
              MANAGE CLIENTS
            </Link>
          </div>

          <div
            className="p-6 rounded-lg"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-heading mb-2" style={{ color: "var(--fg)" }}>
              Settings
            </h3>
            <p className="text-body mb-4" style={{ color: "var(--fg-soft)" }}>
              Customize theme and account preferences.
            </p>
            <Link href="/dashboard/settings" className="btn btn-secondary">
              PREFERENCES
            </Link>
          </div>
        </div>

        {/* Recent Workouts Section */}
        <div className="mb-8">
          <h2 className="text-display-md mb-6" style={{ color: "var(--fg)" }}>
            Your workouts
            <span style={{ color: "var(--accent)" }}>.</span>
          </h2>

          <div
            className="p-12 rounded-lg text-center"
            style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
          >
            <p className="text-body-lg mb-4" style={{ color: "var(--muted)" }}>
              No workouts yet. Build your first one →
            </p>
            <button className="btn btn-primary">NEW WORKOUT →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
