import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-6xl font-bold text-white">Klyro</h1>

        <p className="mt-6 text-lg text-zinc-400">
          A Discord-inspired real-time chat application built with React,
          Express, Socket.IO, Prisma and PostgreSQL.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/login"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-500"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-200 transition hover:bg-zinc-800"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}