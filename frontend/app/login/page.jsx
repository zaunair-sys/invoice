"use client";

import React, { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginStyles } from "@/assets/dummyStyles";
import { useAuth } from "@/context/AuthContext";
import { useGsapAnimations } from "@/lib/animations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const scopeRef = useRef(null);

  useGsapAnimations(scopeRef);

  const redirectTo = searchParams.get("from") || "/app/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (result.ok) {
      router.replace(redirectTo);
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div ref={scopeRef} className="pti-auth">
      <div className={loginStyles.container}>
        <div className={`${loginStyles.formContainer} pti-card pti-card-pad`} data-animate="fade-up">
          <div className="pti-eyebrow" data-animate="fade-up">PromptToInvoice</div>
          <h1 className={loginStyles.title}>Welcome back</h1>
          <p className={loginStyles.subtitle}>Sign in to your account</p>

          {error && <div className={loginStyles.error}>{error}</div>}

          <form className={loginStyles.form} onSubmit={onSubmit}>
            <div className={loginStyles.formGroup}>
              <label className={loginStyles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={loginStyles.input}
                value={form.email}
                onChange={onChange}
              />
            </div>

            <div className={loginStyles.formGroup}>
              <label className={loginStyles.label} htmlFor="password">
                Password
              </label>
              <div className={loginStyles.passwordContainer}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={loginStyles.passwordInput}
                  value={form.password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className={loginStyles.passwordToggle}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={loginStyles.submitButton}
              disabled={submitting}
              data-hover="magnetic"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className={loginStyles.signupContainer}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className={loginStyles.signupLink}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="pti-auth-aside">
        <div data-animate="hero">
          <div className="pti-badge pti-badge--pill">Invoice smarter</div>
          <h2 className="text-4xl font-extrabold mt-6 tracking-tight">Create polished invoices in minutes.</h2>
          <p className="mt-4 text-white/80 max-w-md leading-relaxed">Manage clients, track payments, and send professional invoices from one workspace.</p>
        </div>
        <div className="pti-hero-card text-[var(--text)]" data-animate="hero-visual">
          <div className="pti-demo-row"><span>Drafts ready</span><strong>12</strong></div>
          <div className="pti-demo-row"><span>Collected this month</span><strong>$8,420</strong></div>
          <div className="pti-demo-row border-0"><span>Overdue follow-ups</span><strong>3</strong></div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
