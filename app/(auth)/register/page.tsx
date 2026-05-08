import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email || !password || password.length < 6) {
      redirect("/register?error=InvalidInput");
    }

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        redirect("/register?error=UserExists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Redirect to login
      redirect("/login?registered=true");
    } catch (error) {
      console.error("Registration failed:", error);
      redirect("/register?error=RegistrationFailed");
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
            Get started
            <span style={{ color: "var(--accent)" }}>.</span>
          </h1>
          <p className="text-body" style={{ color: "var(--fg-soft)" }}>
            Create your account and start building workouts.
          </p>
        </div>

        <div
          className="p-6 rounded-lg mb-6"
          style={{ background: "var(--panel)", border: "1px solid var(--border)" }}
        >
          <form action={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-label block mb-1" style={{ color: "var(--fg)" }}>
                NAME
              </label>
              <input
                id="name"
                name="name"
                type="text"
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
                minLength={6}
                className="w-full px-3 py-2 rounded text-body"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              />
              <p className="text-label mt-1" style={{ color: "var(--muted)" }}>
                Minimum 6 characters
              </p>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              CREATE ACCOUNT →
            </button>
          </form>
        </div>

        <p className="text-center text-body" style={{ color: "var(--fg-soft)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
