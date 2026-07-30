import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { verifyEmail } from "../api/auth-api";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token was provided in the link.");
      return;
    }

    let isMounted = true;

    verifyEmail(token)
      .then(() => {
        if (isMounted) {
          setStatus("success");
        }
      })
      .catch((err) => {
        if (isMounted) {
          setStatus("error");
          if (axios.isAxiosError(err)) {
            setErrorMessage(
              err.response?.data?.message ?? "Failed to verify email token."
            );
          } else {
            setErrorMessage("An unexpected error occurred during verification.");
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="scanline-overlay relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-4">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.04] blur-[120px]" />

      <div className="cyber-card animate-fade-in-up relative z-10 w-full max-w-md rounded-lg p-6 sm:p-8 text-center">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="font-heading text-xs uppercase tracking-[0.2em] text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Klyro
          </Link>
        </div>

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="py-8 space-y-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-500/20 border-t-cyan-400" />
              <div className="h-8 w-8 rounded-full bg-cyan-500/10 animate-pulse" />
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                Verifying Email
              </h2>
              <p className="mt-2 text-xs font-mono text-cyan-400/80">
                Processing security token...
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="py-6 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-heading text-[10px] uppercase tracking-[0.15em] text-emerald-400">
                Email Verified // Access Granted
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-wider text-white">
                Identity Confirmed
              </h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Your email address has been successfully verified. You now have full access to your Klyro account.
              </p>
            </div>

            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-sm bg-cyan-400 py-3 font-heading text-sm font-bold uppercase tracking-[0.15em] text-black transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)]"
            >
              Proceed to Sign In →
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="py-6 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div>
              <span className="inline-block rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 font-heading text-[10px] uppercase tracking-[0.15em] text-red-400">
                Verification Failed
              </span>
              <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-wider text-white">
                Unable to Verify
              </h2>
              <p className="mt-2 text-sm text-red-400/90 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full rounded-sm bg-cyan-400 py-3 font-heading text-sm font-bold uppercase tracking-[0.15em] text-black transition-all duration-300 hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(0,229,255,0.25)]"
              >
                Go to Sign In →
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full rounded-sm border border-zinc-800 bg-zinc-900/60 py-2.5 font-heading text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
              >
                Create Account Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
