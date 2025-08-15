import React, { useState } from "react";
import { UserPlus } from "lucide-react";

export default function Register({ onSubmit }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "owner" });
  const [err, setErr] = useState("");

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
          <UserPlus className="h-5 w-5" /> Create your account
        </div>
        <div className="p-4">
          <div className="grid gap-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input className="mt-1 w-full rounded-xl border px-3 py-2" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select className="mt-1 w-full rounded-xl border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="owner">Project Owner</option>
                <option value="provider">Provider</option>
              </select>
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <button
              className="mt-2 rounded-2xl bg-indigo-600 px-4 py-2 text-white"
              onClick={() => {
                if (!form.name || !form.email || !form.password) return setErr("Fill required fields");
                const { ok, error } = onSubmit({
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                  password: form.password,
                  role: form.role === "owner" ? "owner" : "provider",
                });
                if (!ok) setErr(error || "Registration failed");
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
