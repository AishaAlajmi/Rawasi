
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import rawasiLogo from "../assets/photo_2025-08-13_21-03-51.jpg";
import { useLang } from "../context/lang";

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { lang, setLang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);

  // Observe sections to highlight nav while scrolling on landing
  useEffect(() => {
    const ids = ["home", "about-why", "about-how", "royal-quote"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setCurrentSection(visible.target.id);
      },
      { root: null, rootMargin: "0px 0px -40% 0px", threshold: [0.25, 0.5, 0.75] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  const navItems = useMemo(
    () => [
      { key: "home", type: "route", to: "/", label: lang === "ar" ? "الرئيسية" : "Home" },
      { key: "about-why", type: "hash", href: "/#about-why", label: lang === "ar" ? "لماذا رَواسي" : "Why Rawasi" },
      { key: "about-how", type: "hash", href: "/#about-how", label: lang === "ar" ? "كيف تعمل رَواسي" : "How it works" },
    ],
    [lang]
  );

  const isActive = (key) => {
    if (key === "home") return pathname === "/" && (!currentSection || currentSection === "home");
    return currentSection === key;
  };

  const LinkItem = ({ item, onClick }) => {
    const cls = `hover:text-black/70 ${isActive(item.key) ? "text-brand-700 font-semibold" : ""}`;
    if (item.type === "route")
      return (
        <Link className={cls} to={item.to} aria-current={isActive(item.key) ? "page" : undefined} onClick={onClick}>
          {item.label}
        </Link>
      );
    return (
      <a className={cls} href={item.href} onClick={onClick} aria-current={isActive(item.key) ? "page" : undefined}>
        {item.label}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <img src={rawasiLogo} alt="Rawasi" className="h-8 w-8 rounded" />
          <div className="leading-tight text-left">
            <div className="text-base font-semibold tracking-wide text-slate-900">RAWASI</div>
            <div className="text-xs text-slate-500">Build with Confidence</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <LinkItem key={item.key} item={item} />
          ))}
          <Link className={`hover:text-black/70 ${pathname === "/login" ? "text-brand-700 font-semibold" : ""}`} to="/login">
            {lang === "ar" ? "تسجيل الدخول" : "Login"}
          </Link>
          <Link className={`hover:text-black/70 ${pathname === "/register" ? "text-brand-700 font-semibold" : ""}`} to="/register">
            {lang === "ar" ? "إنشاء حساب" : "Register"}
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageToggleInline lang={lang} onChange={setLang} />
          <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 btn-brand">
            {lang === "ar" ? "تسجيل الدخول" : "Login"}
          </button>
          <button onClick={() => navigate("/register")} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 border">
            {lang === "ar" ? "إنشاء حساب" : "Create account"}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageToggleInline lang={lang} onChange={setLang} />
          <button
            className="inline-flex items-center justify-center rounded-xl border px-3 py-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white shadow-lg">
          <div className="mx-auto max-w-7xl px-4 py-3 space-y-2">
            <div className="flex flex-col gap-2 text-sm">
              {navItems.map((item) => (
                <LinkItem key={item.key} item={item} onClick={() => setMobileOpen(false)} />
              ))}
              <Link className="hover:text-black/70" to="/login" onClick={() => setMobileOpen(false)}>
                {lang === "ar" ? "تسجيل الدخول" : "Login"}
              </Link>
              <Link className="hover:text-black/70" to="/register" onClick={() => setMobileOpen(false)}>
                {lang === "ar" ? "إنشاء حساب" : "Register"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageToggleInline({ lang, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
      <button
        className={`px-3 py-1.5 text-sm rounded-lg ${lang === "en" ? "bg-slate-100 text-brand-600" : "text-slate-700"}`}
        onClick={() => onChange("en")}
      >
        EN
      </button>
      <button
        className={`px-3 py-1.5 text-sm rounded-lg ${lang === "ar" ? "bg-slate-100 text-brand-600" : "text-slate-700"}`}
        onClick={() => onChange("ar")}
      >
        العربية
      </button>
    </div>
  );
}
