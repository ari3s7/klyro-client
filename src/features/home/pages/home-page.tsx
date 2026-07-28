import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="scanline-overlay relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6">
      {/* Cyan radial glow */}
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[150px]" />
      <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-400/[0.03] blur-[120px]" />

      <div className="relative z-10 max-w-2xl">
        {/* Status badge */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.05] px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <span className="font-mono-body text-xs uppercase tracking-[0.2em] text-cyan-300">
            Real-time · Encrypted
          </span>
        </div>

        {/* Title */}
        <h1 className="animate-fade-in-up animate-cyber-glow font-heading text-5xl font-black uppercase tracking-wider text-white sm:text-6xl md:text-8xl">
          Klyro
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up-delay mt-4 font-heading text-base font-medium tracking-wide sm:text-lg">
          <span className="text-zinc-400">Instant communication, </span>
          <span className="text-cyan-400">zero latency</span>
        </p>

        {/* Description */}
        <p className="animate-fade-in-up-delay-2 mt-6 max-w-md text-sm leading-relaxed text-zinc-500">
          A next-gen real-time chat platform built with React, Express, Socket.IO,
          Prisma and PostgreSQL. Designed for speed.
        </p>

        {/* Buttons */}
        <div className="animate-fade-in-up-delay-3 mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            to="/login"
            className="group inline-flex items-center gap-2 rounded-sm bg-cyan-400 px-7 py-3 font-heading text-sm font-bold uppercase tracking-[0.15em] text-black transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
          >
            Get Started
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

          <Link
            to="/register"
            className="inline-flex items-center rounded-sm border border-zinc-700/60 px-7 py-3 font-heading text-sm font-medium uppercase tracking-[0.15em] text-zinc-400 transition-all duration-300 hover:border-cyan-500/30 hover:text-cyan-400"
          >
            Create Account
          </Link>
        </div>
      </div>

    </main>
  );
}