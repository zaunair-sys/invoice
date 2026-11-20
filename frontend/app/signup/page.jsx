"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginStyles } from "@/assets/dummyStyles";
import { useAuth } from "@/context/AuthContext";
import { useGsapAnimations } from "@/lib/animations";

const Signup = () => {
  const router = useRouter();
  const { register } = useAuth();
  const scopeRef = useRef(null);

  useGsapAnimations(scopeRef);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.ok) {
      router.replace("/app/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div ref={scopeRef} className="pti-auth">
      <div className={loginStyles.container}>
        <div className={`${loginStyles.formContainer} pti-card pti-card-pad`} data-animate="fade-up">
          <div className="pti-eyebrow" data-animate="fade-up">Get started</div>
          <h1 className={loginStyles.title}>Create your account</h1>
          <p className={loginStyles.subtitle}>Start generating invoices in seconds</p>

          {error && <div className={loginStyles.error}>{error}</div>}

          <form className={loginStyles.form} onSubmit={onSubmit}>
            <div className={loginStyles.formGroup}>
              <label className={loginStyles.label} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={loginStyles.input}
                value={form.name}
                onChange={onChange}
              />
            </div>

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
                  autoComplete="new-password"
                  required
                  minLength={8}
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
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <div className={loginStyles.signupContainer}>
            Already have an account?{" "}
            <Link href="/login" className={loginStyles.signupLink}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="pti-auth-aside">
        <div data-animate="hero">
          <div className="pti-badge pti-badge--pill">Built for speed</div>
          <h2 className="text-4xl font-extrabold mt-6 tracking-tight">Everything you need to bill confidently.</h2>
          <p className="mt-4 text-white/80 max-w-md leading-relaxed">Generate branded invoices, keep business details ready, and stay on top of every payment.</p>
        </div>
        <div className="pti-hero-card text-[var(--text)]" data-animate="hero-visual">
          <div className="pti-demo-row"><span>Professional templates</span><strong>Ready</strong></div>
          <div className="pti-demo-row"><span>Client records</span><strong>Organized</strong></div>
          <div className="pti-demo-row border-0"><span>Reminders & tracking</span><strong>Built-in</strong></div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
