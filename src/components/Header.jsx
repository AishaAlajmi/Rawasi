
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import rawasiLogo from "../assets/photo_2025-08-13_21-03-51.jpg";
import { useLang } from "../context/lang";

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { lang, setLang } = useLang();

  const L = lang === "ar"
    ? { home: "الرئيسية", why: "لماذا رواسي", how: "كيف تعمل", dash: "لوحة التحكم", login: "تسجيل الدخول", register: "إنشاء حساب" }
    : { home: "Home",       why: "Why Rawasi",    how: "How it works", dash: "Dashboard",        login: "Login",         register: "Create account" };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <img src={rawasiLogo} alt="Rawasi" className="h-8 w-8 rounded" />
          <div className="leading-tight text-left">
            <div className="text-base font-semibold tracking-wide text-slate-900">RAWASI</div>
            <div className="text-xs text-slate-500">Build with Confidence</div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link className={`hover:text-black/70 ${pathname === "/" ? "text-black" : ""}`} to="/">{L.home}</Link>
          <a className="hover:text-black/70" href="#about-why">{L.why}</a>
          <a className="hover:text-black/70" href="#about-how">{L.how}</a>
          <Link className={`hover:text-black/70 ${pathname.startsWith("/dashboard") ? "text-black" : ""}`} to="/dashboard">{L.dash}</Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Lang toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
            <button className={`px-3 py-1.5 text-sm rounded-lg ${lang === "en" ? "bg-slate-100 text-brand-600" : "text-slate-700"}`} onClick={() => setLang("en")}>EN</button>
            <button className={`px-3 py-1.5 text-sm rounded-lg ${lang === "ar" ? "bg-slate-100 text-brand-600" : "text-slate-700"}`} onClick={() => setLang("ar")}>العربية</button>
          </div>

          <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-indigo-600 text-white">{L.login}</button>
          <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 border">{L.register}</button>
        </div>
      </div>
    </header>
  );
}
