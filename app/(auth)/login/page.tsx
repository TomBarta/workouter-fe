import Link from "next/link";
import { signIn } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleGoogleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  async function handleGitHubSignIn() {
    "use server";
    await signIn("github", { redirectTo: "/dashboard" });
  }

  async function handleCredentialsSignIn(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      // Handle error - in production, you'd show a message to the user
      console.error("Sign in failed:", error);
      redirect("/login?error=CredentialsSignin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <svg width="32" height="32" viewBox="0 0 56 56">
              <rect x="6" y="6" width="44" height="10" fill="var(--fg)" />
              <rect x="6" y="20" width="32" height="10" fill="var(--fg)" />
              <rect x="6" y="34" width="20" height="10" fill="var(--accent)" />
            </svg>
            <span className="text-display-md" style={{ color: "var(--fg)" }}>
              Workouter
            </span>
          </Link>

          <h1 className="text-display-lg mb-2" style={{ color: "var(--fg)" }}>
            Welcome back
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <p className="text-body" style={{ color: "var(--fg-soft)" }}>
            Sign in to continue building workouts.
          </p>
        </div>

        <div
          className="p-6 rounded-lg mb-6"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          {/* OAuth Providers */}
          <div className="space-y-3 mb-6">
            <form action={handleGoogleSignIn}>
              <button type="submit" className="btn btn-secondary w-full">
                CONTINUE WITH GOOGLE
              </button>
            </form>

            <form action={handleGitHubSignIn}>
              <button type="submit" className="btn btn-secondary w-full">
                CONTINUE WITH GITHUB
              </button>
            </form>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid var(--border)" }}></div>
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-2 text-label"
                style={{ background: "var(--panel)", color: "var(--muted)" }}
              >
                OR
              </span>
            </div>
          </div>

          {/* Credentials Form */}
          <form action={handleCredentialsSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-label block mb-1" style={{ color: "var(--fg)" }}>
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 rounded text-body"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-label block mb-1" style={{ color: "var(--fg)" }}>
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 rounded text-body"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              SIGN IN →
            </button>
          </form>
        </div>

        <p className="text-center text-body" style={{ color: "var(--fg-soft)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
