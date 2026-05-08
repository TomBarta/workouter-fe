import Link from "next/link";
import { auth } from "@/app/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <svg width="40" height="40" viewBox="0 0 56 56">
              <rect x="6" y="6" width="44" height="10" fill="var(--fg)" />
              <rect x="6" y="20" width="32" height="10" fill="var(--fg)" />
              <rect x="6" y="34" width="20" height="10" fill="var(--accent)" />
            </svg>
            <span className="text-display-md" style={{ color: "var(--fg)" }}>
              Workouter
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost">
                  DASHBOARD
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button type="submit" className="btn btn-secondary">
                    SIGN OUT
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">
                  SIGN IN
                </Link>
                <Link href="/register" className="btn btn-primary">
                  GET STARTED →
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6">
        <div className="pt-32 pb-24">
          <div className="text-utility mb-4" style={{ color: "var(--muted)" }}>
            STRUCTURED WORKOUTS
          </div>

          <h1 className="text-display-xl mb-6" style={{ color: "var(--fg)" }}>
            Build workouts
            <br />
            for your watch
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>

          <p className="text-body-lg max-w-2xl mb-8" style={{ color: "var(--fg-soft)" }}>
            Create structured training plans for Apple Watch and Garmin. Block-based
            builder for intervals, tempo runs, and custom workouts. No subscriptions.
            No shouting. Just workouts that work.
          </p>

          <div className="flex gap-4">
            {session ? (
              <Link href="/dashboard" className="btn btn-primary">
                GO TO DASHBOARD →
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary">
                  GET STARTED →
                </Link>
                <Link href="/login" className="btn btn-secondary">
                  SIGN IN
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-16 border-t" style={{ borderColor: "var(--border)" }}>
          <div>
            <h3 className="text-heading mb-2" style={{ color: "var(--fg)" }}>
              Block-based builder
            </h3>
            <p className="text-body" style={{ color: "var(--fg-soft)" }}>
              Stack steps like LEGO. Warmup → intervals → cooldown. Each block
              gets its own pace, heart rate, or power target.
            </p>
          </div>

          <div>
            <h3 className="text-heading mb-2" style={{ color: "var(--fg)" }}>
              Send to watch
            </h3>
            <p className="text-body" style={{ color: "var(--fg-soft)" }}>
              Works with Apple Watch and Garmin devices. One tap to sync your
              workout and start training.
            </p>
          </div>

          <div>
            <h3 className="text-heading mb-2" style={{ color: "var(--fg)" }}>
              Your data, always
            </h3>
            <p className="text-body" style={{ color: "var(--fg-soft)" }}>
              Export workouts anytime. API access for automation. No lock-in.
              Your training plans belong to you.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24 py-8" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-body" style={{ color: "var(--muted)" }}>
            © 2026 Workouter. Build better workouts.
          </p>
        </div>
      </footer>
    </div>
  );
}
