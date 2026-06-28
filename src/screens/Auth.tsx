import React, { useState } from "react";
import { createUser, findUserByEmail, setSession } from "../storage";
import { cn } from "../utils/cn";

export function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    fullName: "", email: "", password: "", confirm: "", city: "", bio: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      if (mode === "register") {
        if (!form.fullName.trim()) throw new Error("Please enter your full name.");
        if (!/^\S+@\S+\.\S+$/.test(form.email)) throw new Error("Please enter a valid email.");
        if (form.password.length < 6) throw new Error("Password must be at least 6 characters.");
        if (form.password !== form.confirm) throw new Error("Passwords do not match.");
        const user = await createUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          city: form.city.trim() || "Unknown",
          bio: form.bio.trim() || "Collecting moments.",
        });
        await setSession({ userId: user.id, email: user.email });
        onAuthed();
      } else {
        const u = await findUserByEmail(form.email.trim());
        if (!u || u.password !== form.password) throw new Error("Invalid email or password.");
        await setSession({ userId: u.id, email: u.email });
        onAuthed();
      }
    } catch (e: any) {
      setErr(e.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const quickDemo = async () => {
    setBusy(true);
    try {
      let u = await findUserByEmail("guest@memoryticket.app");
      if (!u) {
        u = await createUser({
          fullName: "Guest Explorer",
          email: "guest@memoryticket.app",
          password: "demo1234",
          city: "Lisbon",
          bio: "Here for the ride ✨",
        });
      }
      await setSession({ userId: u.id, email: u.email });
      onAuthed();
    } finally { setBusy(false); }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-aurora overflow-y-auto">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/30 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-purple text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"/><path d="M9 7v10M15 7v10"/></svg>
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">Memory Ticket</div>
            <div className="text-[11px] text-white/45">Sign in to start collecting</div>
          </div>
        </div>

        <h1 className="animate-fade-up text-3xl font-extrabold leading-tight">
          {mode === "login" ? "Welcome back." : "Create your collection."}
        </h1>
        <p className="mt-1 animate-fade-up text-sm text-white/55" style={{ animationDelay: "0.1s" }}>
          {mode === "login" ? "Your ticket stub is waiting." : "A few details and you're in the show."}
        </p>

        {/* Tabs */}
        <div className="mt-6 flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {(["login", "register"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(null); }}
              className={cn(
                "flex-1 rounded-xl py-2 text-sm font-semibold transition",
                mode === m ? "bg-gradient-purple text-white shadow-md shadow-purple-900/40" : "text-white/55 hover:text-white"
              )}
            >
              {m === "login" ? "Sign in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          {mode === "register" && (
            <Field label="Full name" value={form.fullName} onChange={update("fullName")} placeholder="Ada Lovelace" />
          )}
          <Field label="Email" type="email" value={form.email} onChange={update("email")} placeholder="you@memory.app" />
          <Field label="Password" type="password" value={form.password} onChange={update("password")} placeholder="••••••••" />
          {mode === "register" && (
            <>
              <Field label="Confirm password" type="password" value={form.confirm} onChange={update("confirm")} placeholder="••••••••" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={form.city} onChange={update("city")} placeholder="Lisbon" />
                <Field label="Bio" value={form.bio} onChange={update("bio")} placeholder="Collecting moments" />
              </div>
            </>
          )}

          {err && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-2xl bg-gradient-purple py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-purple-900/40 transition active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div className="relative my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={quickDemo}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.07]"
          >
            ✨ Continue as guest
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-white/40">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/50">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-[var(--color-purple)] focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/15"
      />
    </label>
  );
}
