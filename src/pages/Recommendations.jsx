
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Search, ExternalLink } from "lucide-react";
import { Section } from "../components/ui.jsx";
import { PROVIDERS, PROVIDER_SOURCE } from "../lib/data.js";
import { scoreProvider } from "../lib/recommend.js";
import { currency } from "../lib/utils.js";
import { useLang } from "../context/lang";

export default function Recommendations({ project, onCompareToggle, selectedCompare, onProceed }) {
  const { lang } = useLang();
  const t = lang === "ar"
    ? {
        title: "التوصيات",
        subtitlePrefix: "مرتبة حسب الملاءمة لـ ",
        yourProject: "مشروعك",
        search: "ابحث عن مزودين",
        all: "الكل",
        estCost: "التكلفة المتوقعة",
        score: "النتيجة",
        experience: "الخبرة",
        compare: "مقارنة",
        compareSelected: (n) => `قارن المختار (${n})`,
        dataNote: "يتم عرض مزودين تجريبيين. شغّل أمر scrape:providers لجلب مزودي موماح.",
      //  profile: "الملف التعريفي",
        website: "الملف التعريفي",
      }
    : {
        title: "Recommendations",
        subtitlePrefix: "Ranked by fit for ",
        yourProject: "your project",
        search: "Search providers",
        all: "All",
        estCost: "Est. cost",
        score: "Score",
        experience: "Experience",
        compare: "Compare",
        compareSelected: (n) => `Compare selected (${n})`,
        dataNote: "Showing demo providers. Run scrape:providers to load MoMAH list.",
       // profile: "Profile"
         website: "Profile"
      };

  // Compute scored data (defaults handled in data.js normalization)
  const data = useMemo(() =>
    PROVIDERS.map((p) => ({
      ...p,
      tech: Array.isArray(p.tech) ? p.tech : [],
      photos: Array.isArray(p.photos) ? p.photos : [],
      location: p.location || (lang === "ar" ? "السعودية" : "KSA"),
      score: scoreProvider(p, project),
      estCost: (p.baseCost || 0) + (p.costPerSqm || 0) * (project?.sizeSqm || 0),
    })).sort((a, b) => b.score - a.score)
  , [project, lang]);

  // Derive tech options dynamically
  const techOptions = useMemo(() => {
    const set = new Set([t.all]);
    for (const p of data) (p.tech || []).forEach((tag) => set.add(tag));
    return Array.from(set);
  }, [data, t.all]);

  const [query, setQuery] = useState("");
  const [techFilter, setTechFilter] = useState(t.all);

  const filtered = data.filter((p) => {
    const techOk = techFilter === t.all || (p.tech || []).includes(techFilter);
    const nameOk = (p.name || "").toLowerCase().includes(query.toLowerCase());
    return techOk && nameOk;
  });

  return (
    <Section id="recs" className="bg-indigo-50/50">
      <div className="mx-auto max-w-7xl px-4">
        {PROVIDER_SOURCE === "fallback" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{t.dataNote}</div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">{t.title}</div>
            <div className="text-sm text-slate-600">
              {t.subtitlePrefix}<span className="font-medium">{project?.name || t.yourProject}</span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search}
                className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {techOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProviderCard
              key={p.id}
              p={p}
              selected={selectedCompare.includes(p.id)}
              onToggle={() => onCompareToggle(p.id)}
              t={t}
            />
          ))}
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-center">
          <button
            onClick={onProceed}
            disabled={selectedCompare.length === 0}
            className={`rounded-2xl px-6 py-3 text-sm font-medium shadow ${
              selectedCompare.length ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 text-slate-500"
            }`}
          >
            {t.compareSelected(selectedCompare.length)}
          </button>
        </div>
      </div>
    </Section>
  );
}

function ProviderCard({ p, selected, onToggle, t }) {
  const photo = p.logo || (p.photos && p.photos[0]) || null; // prefer scraped logo (may be data: URI)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="aspect-[16/9] overflow-hidden">
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.02]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <span className="text-xl font-semibold text-brand">{(p.name || "P").slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-slate-900" title={p.name}>{p.name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location || "KSA"}</span>
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-brand-600" />{p.rating ?? "—"} ({p.reviews ?? 0})</span>
            </div>
          </div>
          <label className="shrink-0 inline-flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {t.compare}
          </label>
        </div>

        {/* Tech tags */}
        {!!(p.tech && p.tech.length) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {p.tech.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Profile / Website actions */}
        {(p.url || p.website) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
           
            {p.website && (
              <a
                href={p.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 hover:border-brand-300 hover:text-brand-700"
              >
                <ExternalLink className="h-3 w-3" /> {t.website}
              </a>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-slate-600">{t.estCost}</div>
            <div className="font-semibold text-slate-900">{currency(p.estCost)}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-slate-600">{t.score}</div>
            <div className="font-semibold text-slate-900">{Math.round((p.score || 0) * 100)} / 100</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-slate-600">{t.experience}</div>
            <div className="font-semibold text-slate-900">{p.pastProjects ?? 0} {t.experience === "Experience" ? "proj." : "مشروع"}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
