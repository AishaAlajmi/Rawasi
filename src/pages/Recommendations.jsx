import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Star,
  Search,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Section } from "../components/ui.jsx";
import { PROVIDERS, PROVIDER_SOURCE } from "../lib/data.js";
import { scoreProvider } from "../lib/recommend.js";
import { currency } from "../lib/utils.js";
import { useLang } from "../context/lang";
import { Link, useNavigate } from "react-router-dom";

export default function Recommendations({
  project,
  onCompareToggle,
  selectedCompare,
}) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";
  const t = isAr
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
        comparePanelTitle: "مقارنة المزودين",
        dataNote:
          "يتم عرض مزودين تجريبيين. شغّل أمر scrape:providers لجلب مزودي موماح.",
        // profile: "الملف التعريفي",
        website: "الملف التعريفي",
        attrLabel: "السمة",
        select: "اعتماد المزود",
        selectedBanner: (n) => `تم اعتماد المزود: ${n}`,
        message: "مراسلة",
        attr: {
          score: "النتيجة",
          cost: "التكلفة المتوقعة",
          rating: "التقييم",
          exp: "الخبرة",
          tech: "التقنيات",
        },
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
        comparePanelTitle: "Compare providers",
        dataNote:
          "Showing demo providers. Run scrape:providers to load MoMAH list.",
        // profile: "Profile",
        website: "Profile",
        attrLabel: "Attribute",
        select: "Select provider",
        selectedBanner: (n) => `Selected provider: ${n}`,
        message: "Message",
        attr: {
          score: "Score",
          cost: "Est. cost",
          rating: "Rating",
          exp: "Experience",
          tech: "Tech",
        },
      };

  // ----- selected provider (persisted) -----
  const [picked, setPicked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("selectedProvider") || "null");
    } catch (_) {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "selectedProvider") {
        try {
          setPicked(JSON.parse(e.newValue || "null"));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveSelection = (prov) => {
    const payload = {
      id: prov.id,
      name: prov.name,
      projectName: project?.name || null,
      selectedAt: Date.now(),
      phone: prov.phone || null,
      location: prov.location || null,
      url: prov.url || null,
      website: prov.website || null,
      logo: prov.logo || prov.photos?.[0] || null,
    };
    localStorage.setItem("selectedProvider", JSON.stringify(payload));
    setPicked(payload);
  };

  const goToMessages = (prov) => {
    const lite = {
      id: prov.id,
      name: prov.name,
      logo: prov.logo || prov.photos?.[0] || null,
    };
    localStorage.setItem("lastChatProvider", JSON.stringify(lite));
    navigate("/messages", { state: { provider: prov } });
  };

  // ----- score + enrich data -----
  const data = useMemo(
    () =>
      PROVIDERS.map((p) => ({
        ...p,
        tech: Array.isArray(p.tech) ? p.tech : [],
        photos: Array.isArray(p.photos) ? p.photos : [],
        location: p.location || (isAr ? "السعودية" : "KSA"),
        score: scoreProvider(p, project),
        estCost:
          (p.baseCost || 0) + (p.costPerSqm || 0) * (project?.sizeSqm || 0),
      })).sort((a, b) => b.score - a.score),
    [project, isAr]
  );

  // ----- filters -----
  const techOptions = useMemo(() => {
    const set = new Set([t.all]);
    for (const p of data) (p.tech || []).forEach((tag) => set.add(tag));
    return Array.from(set);
  }, [data, t.all]);

  const [query, setQuery] = useState("");
  const [techFilter, setTechFilter] = useState(t.all);

  // ----- local compare state (uncontrolled by default) -----
  const [localCompare, setLocalCompare] = useState([]);
  const isControlled = Array.isArray(selectedCompare);
  const compareIds = isControlled ? selectedCompare : localCompare;

  const toggleCompare = (id) => {
    const next = compareIds.includes(id)
      ? compareIds.filter((x) => x !== id)
      : [...compareIds, id];
    onCompareToggle?.(id, next);
    if (!isControlled) setLocalCompare(next);
  };

  const filtered = data.filter((p) => {
    const techOk = techFilter === t.all || (p.tech || []).includes(techFilter);
    const nameOk = (p.name || "").toLowerCase().includes(query.toLowerCase());
    return techOk && nameOk;
  });

  return (
    <Section id="recs" className="bg-indigo-50/50">
      <div className="mx-auto max-w-7xl px-4">
        {picked && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />{" "}
              {t.selectedBanner(picked.name)}
            </div>
            <button
              onClick={() => goToMessages(picked)}
              className="rounded-lg bg-indigo-600 px-3 py-1 text-white"
            >
              {t.message}
            </button>
          </div>
        )}

        {PROVIDER_SOURCE === "fallback" && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t.dataNote}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">{t.title}</div>
            <div className="text-sm text-slate-600">
              {t.subtitlePrefix}
              <span className="font-medium">
                {project?.name || t.yourProject}
              </span>
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
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProviderCard
              key={p.id}
              p={p}
              checked={compareIds.includes(p.id)}
              onToggle={() => toggleCompare(p.id)}
              onSelect={() => saveSelection(p)}
              onMessage={() => goToMessages(p)}
              picked={picked?.id === p.id}
              t={t}
            />
          ))}
        </div>

        {compareIds.length > 0 && (
          <div className="mt-10">
            <CompareInline
              selectedIds={compareIds}
              project={project}
              labels={t}
              onSelect={(p) => saveSelection(p)}
              onMessage={(p) => goToMessages(p)}
            />
          </div>
        )}
      </div>
    </Section>
  );
}

function ProviderCard({
  p,
  checked,
  onToggle,
  onSelect,
  onMessage,
  picked,
  t,
}) {
  const photo = p.logo || (p.photos && p.photos[0]) || null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="aspect-[16/9] overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-full w-full bg-white object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <span className="text-xl font-semibold text-brand">
              {(p.name || "P").slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="truncate text-lg font-semibold text-slate-900"
              title={p.name}
            >
              {p.name}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {p.location || "KSA"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3 text-brand-600" />
                {p.rating ?? "—"} ({p.reviews ?? 0})
              </span>
            </div>
          </div>
          <label className="shrink-0 inline-flex cursor-pointer items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={checked}
              onChange={onToggle}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            {t.compare}
          </label>
        </div>

        {!!(p.tech && p.tech.length) && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {p.tech.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

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
            <div className="font-semibold text-slate-900">
              {currency(p.estCost)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-slate-600">{t.score}</div>
            <div className="font-semibold text-slate-900">
              {Math.round((p.score || 0) * 100)} / 100
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-slate-600">{t.experience}</div>
            <div className="font-semibold text-slate-900">
              {p.pastProjects ?? 0}{" "}
              {t.experience === "Experience" ? "proj." : "مشروع"}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onSelect}
            disabled={picked}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              picked
                ? "opacity-60"
                : "hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />{" "}
            {picked ? t.selectedBanner(p.name) : t.select}
          </button>

          {/* Use a plain button and navigate via parent callback to avoid Label/Link conflicts */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMessage();
            }}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:border-brand-300 hover:text-brand-700"
          >
            <MessageSquare className="h-4 w-4" /> {t.message}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------- Inline Compare panel -------------------------- */
function CompareInline({ selectedIds, project, labels, onSelect, onMessage }) {
  const items = useMemo(
    () =>
      PROVIDERS.filter((p) => selectedIds.includes(p.id)).map((p) => ({
        ...p,
        score: scoreProvider(p, project),
        estCost:
          (p.baseCost || 0) + (p.costPerSqm || 0) * (project?.sizeSqm || 0),
      })),
    [selectedIds, project]
  );

  if (!items.length) return null;

  const attrs = [
    [labels.attr.score, (p) => `${Math.round((p.score || 0) * 100)}/100`],
    [labels.attr.cost, (p) => currency(p.estCost)],
    [labels.attr.rating, (p) => `${p.rating ?? "—"} (${p.reviews ?? 0})`],
    [labels.attr.exp, (p) => `${p.pastProjects ?? 0}`],
    [
      labels.attr.tech,
      (p) => (Array.isArray(p.tech) ? p.tech.join(", ") : "—"),
    ],
  ];

  return (
    <Section id="compare" className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">
            {labels.comparePanelTitle}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white p-3 text-left text-sm text-slate-600">
                  {labels.attrLabel}
                </th>
                {items.map((p) => (
                  <th key={p.id} className="p-3 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {p.logo ? (
                          <img
                            src={p.logo}
                            alt=""
                            className="h-6 w-auto object-contain"
                          />
                        ) : null}
                        <div>
                          <div
                            className="max-w-[220px] truncate text-sm font-semibold text-slate-900"
                            title={p.name}
                          >
                            {p.name}
                          </div>
                          <div className="max-w-[220px] truncate text-xs text-slate-600">
                            {p.location || "KSA"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onSelect?.(p)}
                          className="rounded-lg border px-2 py-1 text-xs hover:border-brand-300"
                        >
                          {labels.select || "Select"}
                        </button>
                        <Link
                          to="/messages"
                          state={{ provider: p }}
                          onClick={() => onMessage?.(p)}
                          className="rounded-lg border px-2 py-1 text-xs hover:border-brand-300"
                        >
                          {labels.message || "Message"}
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attrs.map(([label, render]) => (
                <tr key={label} className="border-t">
                  <td className="sticky left-0 z-10 bg-white p-3 text-sm text-slate-600">
                    {label}
                  </td>
                  {items.map((p) => (
                    <td key={p.id + label} className="p-3 align-top text-sm">
                      {render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
