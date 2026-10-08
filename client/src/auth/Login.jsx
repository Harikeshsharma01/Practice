import React, { useState } from "react";
import { Link } from "react-router-dom";
import { offline } from "./runtime";
import "./login.css";
export default function Login({ api, status, refresh }) {
  const [mode, setMode] = useState("login"),
    [form, setForm] = useState({ name: "", email: "", password: "" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(
      new URLSearchParams(window.location.search).has("signin")
        ? "Google sign-in was not completed. Try again or use email/password."
        : "",
    );
  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(mode === "teacher" ? "/auth/login" : `/student/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ ...form, password: "" });
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="account-page">
      <section className="account-card">
        <Link className="account-brand" to="/">
          ✦ sewestian.
        </Link>
        <span className="overline">YOUR NEXT DISCOVERY STARTS HERE</span>
        <h1>
          {mode === "signup"
            ? "Create your learning account."
            : mode === "teacher"
              ? "Welcome back, teacher."
              : "Sign in to your universe."}
        </h1>
        <p>
          {offline
            ? "Your account and lessons stay on this phone. Learn without hosting or Wi-Fi."
            : "Sign in before opening your lessons, notes and visual labs."}
        </p>
        <div className="segmented" aria-label="Account options">
          <button
            className={mode === "login" ? "selected" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>
          <button
            className={mode === "signup" ? "selected" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Sign up
          </button>
          {!offline && (
            <button
              className={mode === "teacher" ? "selected" : ""}
              onClick={() => {
                setMode("teacher");
                setError("");
              }}
            >
              Teacher sign-in
            </button>
          )}
        </div>
        <form onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Your name
              <input
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
                value={form.name}
                onChange={update("name")}
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="username"
              value={form.email}
              onChange={update("email")}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              minLength={12}
              maxLength={128}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={form.password}
              onChange={update("password")}
            />
          </label>
          <p className="account-hint">
            Use a Sewestian password with at least 12 characters. Do not enter
            your Google password here.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : mode === "teacher"
                  ? "Enter teacher workspace"
                  : "Log in to Sewestian"}
          </button>
        </form>
        <div className="account-divider">or</div>
        {status?.googleEnabled && !offline ? (
          <a className="button google-button" href="/api/student/google/start">
            Continue with Google
          </a>
        ) : (
          <>
            <button className="button google-button" disabled>
              Continue with Google · unavailable
            </button>
            <p className="account-hint">
              {offline
                ? "Google sign-in needs internet and a configured connected service. This offline APK uses local email/password accounts."
                : "Your teacher needs to configure Google sign-in before it can be used."}
            </p>
          </>
        )}
        <p className="account-hint">
          {offline
            ? "Accounts are saved on this device with salted password hashes. They do not sync with the website. Uninstalling or clearing app data removes them; there is no email password reset."
            : "Email/password accounts are saved on this server with salted password hashes. Google is a separate sign-in method. Email verification and self-service password recovery are not available yet."}
        </p>
        {!offline && <Link to="/mobile">Download the offline Android app</Link>}
      </section>
    </main>
  );
}
