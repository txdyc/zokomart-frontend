"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import styles from "./page.module.css";

type FormErrors = {
  identifier?: string;
  password?: string;
  submit?: string;
};

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/me";
  }

  if (value === "/profile") {
    return "/me";
  }

  return value;
}

export function LoginPageClient() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.phoneFrame}>
            <div className={styles.scrollArea}>Login</div>
          </div>
        </main>
      }
    >
      <LoginPageClientContent />
    </Suspense>
  );
}

function LoginPageClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = getSafeRedirect(searchParams.get("redirect"));

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const identifierHasError = Boolean(errors.identifier);
  const passwordHasError = Boolean(errors.password);

  function validate() {
    const nextErrors: FormErrors = {};

    if (!identifier.trim()) {
      nextErrors.identifier = "请输入手机号或邮箱";
    }

    if (!password.trim()) {
      nextErrors.password = "请输入密码";
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      localStorage.setItem("token", "mock_token");
      router.push(redirectTarget);
      return;
    } catch {
      setErrors({
        submit: "登录暂时不可用，请稍后重试。",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.phoneFrame}>
        <div className={styles.scrollArea}>
          <section className={styles.brandSection}>
            <div className={styles.flagStrip} aria-hidden="true">
              <span className={styles.flagRed} />
              <span className={styles.flagGold} />
              <span className={styles.flagGreen} />
            </div>

            <div className={styles.logoBlock}>
              <div className={styles.logoBadge} aria-hidden="true">
                <span className={styles.logoGlyphPrimary}>Z</span>
                <span className={styles.logoGlyphAccent}>_</span>
              </div>
              <h1 className={styles.logoWordmark}>
                <span>Zoko</span>
                <span>Mart</span>
              </h1>
              <p className={styles.logoTagline}>
                <span className={styles.logoTaglineDot} aria-hidden="true">
                  ●
                </span>
                <span>Shop Smart · Pay Easy · Ghana 🇬🇭</span>
              </p>
            </div>

            <div className={styles.welcomeCopy}>
              <p>Welcome back! Sign in to continue</p>
              <p>shopping the best deals in Ghana.</p>
            </div>
          </section>

          <section className={styles.loginSection}>
            <form className={styles.loginCard} onSubmit={handleSubmit} noValidate>
              <div className={styles.tabBar} aria-label="Login methods">
                <span className={`${styles.tabItem} ${styles.tabItemActive}`}>Password</span>
                <span className={styles.tabItem}>OTP Code</span>
                <span className={styles.tabItem}>Social</span>
              </div>

              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Phone Number or Email</span>
                <div
                  className={`${styles.inputField} ${identifierHasError ? styles.inputFieldError : ""}`}
                >
                  <span className={styles.fieldIcon} aria-hidden="true">
                    @
                  </span>
                  <input
                    aria-invalid={identifierHasError}
                    autoComplete="username"
                    className={styles.inputControl}
                    name="identifier"
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="024 000 0000 or you@example.com"
                    value={identifier}
                  />
                </div>
                {errors.identifier ? <p className={styles.fieldError}>{errors.identifier}</p> : null}
              </label>

              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Password</span>
                <div
                  className={`${styles.passwordField} ${passwordHasError ? styles.passwordFieldError : ""}`}
                >
                  <span className={styles.fieldIcon} aria-hidden="true">
                    #
                  </span>
                  <input
                    aria-invalid={passwordHasError}
                    autoComplete="current-password"
                    className={styles.inputControl}
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className={styles.visibilityToggle}
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password ? <p className={styles.fieldError}>{errors.password}</p> : null}
              </label>

              <div className={styles.formMeta}>
                <Link className={styles.secondaryLink} href="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button className={styles.primaryAction} disabled={isSubmitting} type="submit">
                {isSubmitting ? "Logging in…" : "Log In"}
              </button>

              {errors.submit ? <p className={styles.submitError}>{errors.submit}</p> : null}
            </form>

            <p className={styles.registerPrompt}>
              <span>New to ZokoMart?</span>
              <Link className={styles.registerLink} href="/register">
                Create Account
              </Link>
            </p>

            <div className={styles.trustRow}>
              <span>🔒 Secure Login</span>
              <span>🇬🇭 Ghana Trusted</span>
              <span>⚡ Instant Access</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
