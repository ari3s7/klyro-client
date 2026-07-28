import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { register } from "../api/auth-api";
import {
  registerSchema,
  type RegisterSchema,
} from "../validation/auth-schema";

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate("/login");
    },
  });

  const onSubmit = (data: RegisterSchema) => {
    mutation.mutate(data);
  };

  return (
    <div className="scanline-overlay relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[120px]" />

      <div className="cyber-card animate-fade-in-up relative z-10 w-full max-w-md rounded-lg p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="font-heading text-xs uppercase tracking-[0.2em] text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Klyro
          </Link>
          <h1 className="mt-4 font-heading text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Initialize your communication node
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block font-heading text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Username
            </label>
            <input
              type="text"
              placeholder="Choose a handle"
              {...registerField("username")}
              className="w-full rounded-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono-body text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.08)]"
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-heading text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@domain.com"
              {...registerField("email")}
              className="w-full rounded-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono-body text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.08)]"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-heading text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••"
              {...registerField("password")}
              className="w-full rounded-sm border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono-body text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/40 focus:shadow-[0_0_15px_rgba(0,229,255,0.08)]"
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {mutation.isError && (
            <div className="rounded-sm border border-red-500/20 bg-red-500/5 px-3 py-2">
              <p className="text-xs text-red-400">
                {axios.isAxiosError(mutation.error)
                  ? mutation.error.response?.data?.message ??
                    "Registration failed"
                  : "Connection error"}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-sm bg-cyan-400 py-3 font-heading text-sm font-bold uppercase tracking-[0.15em] text-black transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? "Initializing..." : "Create Account →"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-heading uppercase tracking-[0.1em] text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}