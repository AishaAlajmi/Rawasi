import React, { useState } from "react";
import { LogIn } from "lucide-react";

export default function Login({ onSubmit, onForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
          <LogIn className="h-5 w-5" /> Welcome back
        </div>
        <div className="p-4">
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="flex items-center justify-between">
              <button
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-white"
                onClick={() => {
                  const { ok, error } = onSubmit({ email, password });
                  if (!ok) setErr(error || "Login failed");
                }}
              >
                Login
              </button>
              <button className="text-sm underline" onClick={onForgot}>Forgot Password?</button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-neutral-500">Or quick-fill:</span>
              <button className="rounded-xl border px-3 py-1.5 text-xs" onClick={() => { setEmail("owner@demo.app"); setPassword("owner123"); }}>Demo Owner</button>
              <button className="rounded-xl border px-3 py-1.5 text-xs" onClick={() => { setEmail("provider@demo.app"); setPassword("provider123"); }}>Demo Provider</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
