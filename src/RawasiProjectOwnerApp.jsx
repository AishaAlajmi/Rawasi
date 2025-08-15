// src/RawasiProjectOwnerApp.jsx
import "./index.css";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Sparkles,
  Calculator,
  Search,
  MessageSquare,
  Gauge,
  Star,
  CheckCircle2,
  Building2,
  ArrowRight,
  MapPin,
  Bell,
  Timer,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";

/**
 * Router-based flow for Project Owners → /project → /recs → /compare → /messages → /dashboard.
 * Minimal comments focus on "why" decisions.
 */

// Logo fallback as inline SVG; replace `logoUrl` prop to use your brand asset.
const DEFAULT_LOGO_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'>
  <defs>
    <linearGradient id='g' x1='0' x2='1'>
      <stop offset='0' stop-color='#3b82f6'/>
      <stop offset='1' stop-color='#1e40af'/>
    </linearGradient>
  </defs>
  <rect width='160' height='160' rx='20' fill='white'/>
  <path d='M50 125 L80 35 L110 125' fill='none' stroke='url(#g)' stroke-width='10'/>
  <text x='80' y='140' text-anchor='middle' font-family='Inter,Segoe UI,Arial' font-size='22' fill='#111827'>RAWASI</text>
</svg>`);
const FALLBACK_LOGO_URL = `data:image/svg+xml;utf8,${DEFAULT_LOGO_SVG}`;

// ---- Utilities -------------------------------------------------------------
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const currency = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);
const pct = (n) => `${Math.round((n || 0) * 100)}%`;

// Steps → paths
const STAGES = Object.freeze({
  PROJECT: "project",
  RECS: "recs",
  COMPARE: "compare",
  MESSAGES: "messages",
  DASHBOARD: "dashboard",
});
const ROUTE_FOR = Object.freeze({
  [STAGES.PROJECT]: "/project",
  [STAGES.RECS]: "/recs",
  [STAGES.COMPARE]: "/compare",
  [STAGES.MESSAGES]: "/messages",
  [STAGES.DASHBOARD]: "/dashboard",
});
const LABELS = {
  project: "Add Project",
  recs: "Recommendations",
  compare: "Compare",
  messages: "Messages",
  dashboard: "Dashboard",
};

// ---- Sample Providers (mock data) -----------------------------------------
const PROVIDERS = [
  {
    id: "prv-neo",
    name: "NeoBuild Technologies",
    location: "Riyadh",
    rating: 4.7,
    reviews: 128,
    baseCost: 1200000,
    costPerSqm: 4500,
    timelineSpeed: 0.9,
    tech: ["3D Printing", "Prefabrication", "AI QC"],
    pastProjects: 42,
    photos: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  {
    id: "prv-sky",
    name: "SkyRise Modular",
    location: "Jeddah",
    rating: 4.5,
    reviews: 94,
    baseCost: 900000,
    costPerSqm: 3800,
    timelineSpeed: 0.8,
    tech: ["Modular", "Prefabrication", "BIM"],
    pastProjects: 51,
    photos: [
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  {
    id: "prv-zen",
    name: "Zenith Construct AI",
    location: "Dammam",
    rating: 4.8,
    reviews: 201,
    baseCost: 1500000,
    costPerSqm: 5200,
    timelineSpeed: 0.75,
    tech: ["AI Scheduling", "Robotics", "BIM"],
    pastProjects: 67,
    photos: [
      "https://images.unsplash.com/photo-1487956382158-bb926046304a?q=80&w=1400&auto=format&fit=crop",
    ],
  },
  {
    id: "prv-ora",
    name: "Orion Smart Build",
    location: "Mecca",
    rating: 4.2,
    reviews: 61,
    baseCost: 700000,
    costPerSqm: 3200,
    timelineSpeed: 1.0,
    tech: ["Green Concrete", "BIM"],
    pastProjects: 23,
    photos: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1400&auto=format&fit=crop",
    ],
  },
];

// ---- Scoring & Estimator ---------------------------------------------------
function scoreProvider(provider, project) {
  if (!project) return 0;
  const {
    sizeSqm = 0,
    budget = 0,
    location = "Riyadh",
    techNeeds = [],
  } = project;
  const cost = provider.baseCost + provider.costPerSqm * sizeSqm;
  const budgetFit = clamp(
    1 - Math.abs(cost - budget) / Math.max(budget, 1),
    0,
    1
  );
  const techMatch = techNeeds.length
    ? clamp(
        techNeeds.filter((t) => provider.tech.includes(t)).length /
          techNeeds.length,
        0,
        1
      )
    : 0.6;
  const locationAffinity = provider.location === location ? 1 : 0.6;
  const rating = provider.rating / 5;
  const speed = clamp(1 / provider.timelineSpeed - 0.5, 0, 1);
  const experience = clamp(provider.pastProjects / 80, 0, 1);
  return Number(
    (
      0.28 * budgetFit +
      0.22 * techMatch +
      0.18 * rating +
      0.14 * speed +
      0.1 * locationAffinity +
      0.08 * experience
    ).toFixed(4)
  );
}

function estimateCostAndTime(project) {
  const { sizeSqm = 0, complexity = "medium", budget = 0 } = project || {};
  const baseRate = { low: 2800, medium: 4000, high: 5200 }[complexity];
  const estCost =
    sizeSqm *
    baseRate *
    (project?.techNeeds?.includes("3D Printing") ? 0.95 : 1);
  const timeMonths = Math.ceil(
    (sizeSqm / 1000) *
      (complexity === "high" ? 2.2 : complexity === "low" ? 1.3 : 1.7)
  );
  const risk = clamp(Math.abs(estCost - budget) / Math.max(budget, 1), 0, 1);
  return { estCost: Math.round(estCost), estTimeMonths: timeMonths, risk };
}

// ---- Small atoms -----------------------------------------------------------
const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`scroll-mt-24 py-12 md:py-20 ${className}`}>
    {children}
  </section>
);

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-slate-600 border-slate-200 bg-white/60 backdrop-blur">
    {children}
  </span>
);

const Stat = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
    <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
  </div>
);

// ---- Header + Stepper (Router-aware) --------------------------------------
function Header({ logoUrl = FALLBACK_LOGO_URL, activeStage, canSee, goTo }) {
  const nav = [
    ["Add Project", STAGES.PROJECT],
    ["Recommendations", STAGES.RECS],
    ["Compare", STAGES.COMPARE],
    ["Messages", STAGES.MESSAGES],
    ["Dashboard", STAGES.DASHBOARD],
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button
          onClick={() => goTo(STAGES.PROJECT)}
          className="flex items-center gap-3"
        >
          <img
            src={logoUrl}
            alt="Rawasi logo"
            className="h-10 w-10 rounded-md"
          />
          <div className="leading-tight text-left">
            <div className="text-base font-semibold tracking-wide text-slate-900">
              RAWASI
            </div>
            <div className="text-xs text-slate-500">Build with Confidence</div>
          </div>
        </button>
        <nav className="hidden items-center gap-5 md:flex">
          {nav.map(([label, id]) => {
            const enabled = canSee(id);
            const active = activeStage === id;
            return enabled ? (
              <button
                key={id}
                onClick={() => goTo(id)}
                className={`text-sm ${
                  active
                    ? "text-indigo-700"
                    : "text-slate-700 hover:text-indigo-600"
                }`}
              >
                {label}
              </button>
            ) : (
              <span
                key={id}
                className="text-sm text-slate-400 cursor-not-allowed"
              >
                {label}
              </span>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => goTo(STAGES.PROJECT)}
            className="hidden rounded-xl border border-indigo-200 px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 md:inline"
          >
            Create account
          </button>
          <button
            onClick={() => goTo(STAGES.PROJECT)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Start your project
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto grid max-w-7xl grid-cols-5 gap-3 px-4 py-2 text-xs">
          {[
            STAGES.PROJECT,
            STAGES.RECS,
            STAGES.COMPARE,
            STAGES.MESSAGES,
            STAGES.DASHBOARD,
          ].map((s, i) => {
            const active = activeStage === s;
            const enabled = canSee(s);
            return (
              <button
                key={s}
                onClick={() => enabled && goTo(s)}
                title={enabled ? LABELS[s] : "Locked"}
                className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 ${
                  active
                    ? "bg-indigo-600 text-white"
                    : enabled
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-50 text-slate-400"
                }`}
              >
                <span className="hidden sm:inline">{LABELS[s]}</span>
                <span className="sm:hidden">Step {i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

// ---- Hero -----------------------------------------------------------------
function Hero({ logoUrl = FALLBACK_LOGO_URL, start }) {
  return (
    <Section id="home" className="bg-gradient-to-b from-white to-indigo-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <Pill>
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Smarter provider matching with ML
          </Pill>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Find the <span className="text-indigo-600">right team</span> for
            your build
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            For Project Owners: add your project once, then move step-by-step
            from estimates to matched providers and collaboration.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={start}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Start your project <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/project"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-slate-700 hover:bg-white"
            >
              Add details
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Stat label="Providers" value="250+" icon={Building2} />
            <Stat label="Avg. rating" value="4.6/5" icon={Star} />
            <Stat label="Matched projects" value="2,100+" icon={CheckCircle2} />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-indigo-100 via-transparent to-indigo-200 blur-2xl" />
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl">
            <img src={logoUrl} alt="Rawasi" className="mx-auto w-36" />
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-indigo-50/60 p-4">
                <div className="font-medium">Cost estimator</div>
                <div className="text-xs text-slate-600">
                  Forecast budget & time
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium">ML ranking</div>
                <div className="text-xs text-slate-600">Best-fit providers</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium">Compare</div>
                <div className="text-xs text-slate-600">Side-by-side picks</div>
              </div>
              <div className="rounded-2xl bg-indigo-50/60 p-4">
                <div className="font-medium">Track</div>
                <div className="text-xs text-slate-600">
                  Budget & milestones
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ---- Project Wizard --------------------------------------------------------
function ProjectWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [project, setProject] = useState({
    name: "",
    type: "Residential",
    sizeSqm: 1500,
    location: "Riyadh",
    budget: 2000000,
    timelineMonths: 12,
    complexity: "medium",
    techNeeds: [],
  });
  const [error, setError] = useState("");
  const { estCost, estTimeMonths, risk } = useMemo(
    () => estimateCostAndTime(project),
    [project]
  );

  function next() {
    if (step === 0 && !project.name)
      return setError("Please name your project.");
    setError("");
    setStep((s) => clamp(s + 1, 0, 4));
  }
  function prev() {
    setError("");
    setStep((s) => clamp(s - 1, 0, 4));
  }
  function submit() {
    setError("");
    onComplete?.(project);
  }

  const TechChip = ({ value }) => {
    const active = project.techNeeds.includes(value);
    return (
      <button
        type="button"
        onClick={() =>
          setProject((p) => ({
            ...p,
            techNeeds: active
              ? p.techNeeds.filter((t) => t !== value)
              : [...p.techNeeds, value],
          }))
        }
        className={`rounded-xl border px-3 py-2 text-sm ${
          active
            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
            : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        {value}
      </button>
    );
  };

  return (
    <Section id="project" className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <Pill>
            <ClipboardList className="h-4 w-4 text-indigo-600" /> Add Project
          </Pill>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Project details</div>
                <div className="text-sm text-slate-600">
                  Step {step + 1} / 5
                </div>
              </div>
              <div className="mt-4 space-y-6">
                {step === 0 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-600">
                        Project name
                      </label>
                      <input
                        value={project.name}
                        onChange={(e) =>
                          setProject({ ...project, name: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="e.g., Al Rawasi Villas"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Type</label>
                      <select
                        value={project.type}
                        onChange={(e) =>
                          setProject({ ...project, type: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        {[
                          "Residential",
                          "Commercial",
                          "Industrial",
                          "Mixed-Use",
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {step === 1 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm text-slate-600">
                        Size (sqm)
                      </label>
                      <input
                        type="number"
                        value={project.sizeSqm}
                        onChange={(e) =>
                          setProject({
                            ...project,
                            sizeSqm: Number(e.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Location</label>
                      <select
                        value={project.location}
                        onChange={(e) =>
                          setProject({ ...project, location: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        {["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"].map(
                          (c) => (
                            <option key={c}>{c}</option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">
                        Complexity
                      </label>
                      <select
                        value={project.complexity}
                        onChange={(e) =>
                          setProject({ ...project, complexity: e.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        {["low", "medium", "high"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-600">
                        Budget (USD)
                      </label>
                      <input
                        type="number"
                        value={project.budget}
                        onChange={(e) =>
                          setProject({
                            ...project,
                            budget: Number(e.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">
                        Timeline (months)
                      </label>
                      <input
                        type="number"
                        value={project.timelineMonths}
                        onChange={(e) =>
                          setProject({
                            ...project,
                            timelineMonths: Number(e.target.value),
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <label className="text-sm text-slate-600">
                      Preferred technologies
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        "BIM",
                        "Prefabrication",
                        "3D Printing",
                        "AI Scheduling",
                        "Robotics",
                        "Green Concrete",
                        "AI QC",
                        "Modular",
                      ].map((t) => (
                        <TechChip key={t} value={t} />
                      ))}
                    </div>
                  </div>
                )}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-sm font-medium text-slate-700">
                        Review
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-slate-600">
                        <div>
                          <strong>Name:</strong> {project.name || "—"}
                        </div>
                        <div>
                          <strong>Type:</strong> {project.type}
                        </div>
                        <div>
                          <strong>Size:</strong> {project.sizeSqm} sqm
                        </div>
                        <div>
                          <strong>Location:</strong> {project.location}
                        </div>
                        <div>
                          <strong>Budget:</strong> {currency(project.budget)}
                        </div>
                        <div>
                          <strong>Timeline:</strong> {project.timelineMonths}{" "}
                          months
                        </div>
                        <div className="col-span-2">
                          <strong>Tech:</strong>{" "}
                          {project.techNeeds.join(", ") || "Flexible"}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                      <div className="flex items-center gap-2 text-indigo-800">
                        <Calculator className="h-4 w-4" /> Estimate
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-slate-600">Estimated cost</div>
                          <div className="text-slate-900 font-semibold">
                            {currency(estCost)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600">Estimated time</div>
                          <div className="text-slate-900 font-semibold">
                            {estTimeMonths} months
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-600">Budget fit</div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white">
                            <div
                              className="h-2 bg-indigo-600"
                              style={{ width: pct(1 - risk) }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-slate-600">
                            Higher bar = better fit
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={prev}
                    className="flex items-center gap-2 rounded-xl border px-4 py-2 text-slate-700 disabled:opacity-50"
                    disabled={step === 0}
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  {step < 4 ? (
                    <button
                      onClick={next}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={submit}
                      className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                    >
                      Get recommendations
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="md:col-span-2">
            <LiveEstimator est={{ estCost, estTimeMonths }} />
          </aside>
        </div>
      </div>
    </Section>
  );
}

function LiveEstimator({ est }) {
  const { estCost, estTimeMonths } = est;
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-800">
        <Calculator className="h-4 w-4" /> Live estimator
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <div className="text-slate-600">Estimated cost</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {currency(estCost)}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <div className="text-slate-600">Estimated time</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">
            {estTimeMonths} mo
          </div>
        </div>
        <div className="col-span-2">
          <ul className="list-inside list-disc text-slate-600">
            <li>Adjust size, complexity, or preferred tech to see impact.</li>
          </ul>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600" /> Private & secure
        </li>
        <li className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-indigo-600" /> Fast provider responses
        </li>
        <li className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" /> Modern tech options
        </li>
      </ul>
    </div>
  );
}

// ---- Recommendations -------------------------------------------------------
function Recommendations({
  project,
  onCompareToggle,
  selectedCompare,
  onProceed,
}) {
  const [query, setQuery] = useState("");
  const [techFilter, setTechFilter] = useState("All");
  const data = useMemo(
    () =>
      PROVIDERS.map((p) => ({
        ...p,
        score: scoreProvider(p, project),
        estCost: p.baseCost + p.costPerSqm * (project?.sizeSqm || 0),
      })).sort((a, b) => b.score - a.score),
    [project]
  );
  const filtered = data.filter(
    (p) =>
      (techFilter === "All" || p.tech.includes(techFilter)) &&
      p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Section id="recs" className="bg-indigo-50/50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              Recommendations
            </div>
            <div className="text-sm text-slate-600">
              Ranked by fit for{" "}
              <span className="font-medium">
                {project?.name || "your project"}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search providers"
                className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {[
                "All",
                "BIM",
                "Prefabrication",
                "3D Printing",
                "AI Scheduling",
                "Robotics",
                "Green Concrete",
                "AI QC",
                "Modular",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={p.photos[0]}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {p.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {p.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        {p.rating} ({p.reviews})
                      </span>
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={selectedCompare.includes(p.id)}
                      onChange={() => onCompareToggle(p.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Compare
                  </label>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <div className="text-slate-600">Est. cost</div>
                    <div className="font-semibold text-slate-900">
                      {currency(p.estCost)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <div className="text-slate-600">Score</div>
                    <div className="font-semibold text-slate-900">
                      {Math.round(p.score * 100)} / 100
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <div className="text-slate-600">Experience</div>
                    <div className="font-semibold text-slate-900">
                      {p.pastProjects} proj.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="sticky bottom-4 mt-6 flex justify-center">
          <button
            onClick={onProceed}
            disabled={selectedCompare.length === 0}
            className={`rounded-2xl px-6 py-3 text-sm font-medium shadow ${
              selectedCompare.length
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            Compare selected ({selectedCompare.length})
          </button>
        </div>
      </div>
    </Section>
  );
}

// ---- Compare ---------------------------------------------------------------
function Compare({ selectedIds, project, onProceed }) {
  const items = PROVIDERS.filter((p) => selectedIds.includes(p.id)).map(
    (p) => ({
      ...p,
      score: scoreProvider(p, project),
      estCost: p.baseCost + p.costPerSqm * (project?.sizeSqm || 0),
    })
  );
  if (!items.length) return null;
  return (
    <Section id="compare" className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">
            Compare providers
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-white p-3 text-left text-sm text-slate-600">
                  Attribute
                </th>
                {items.map((p) => (
                  <th key={p.id} className="p-3 text-left">
                    <div className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-600">{p.location}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Score", (p) => `${Math.round(p.score * 100)}/100`],
                ["Est. cost", (p) => currency(p.estCost)],
                ["Rating", (p) => `${p.rating} (${p.reviews})`],
                ["Experience", (p) => `${p.pastProjects} projects`],
                ["Tech", (p) => p.tech.join(", ")],
              ].map(([label, fn]) => (
                <tr key={label} className="border-t">
                  <td className="sticky left-0 z-10 bg-white p-3 text-sm text-slate-600">
                    {label}
                  </td>
                  {items.map((p) => (
                    <td key={p.id + label} className="p-3 text-sm">
                      {fn(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onProceed}
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700"
          >
            Proceed to Messages
          </button>
        </div>
      </div>
    </Section>
  );
}

// ---- Messages --------------------------------------------------------------
function Messages({ onProceed }) {
  const [messages, setMessages] = useState([
    {
      from: "NeoBuild",
      text: "Thanks for your interest! Could you share drawings?",
      time: "09:12",
    },
    {
      from: "You",
      text: "Uploading shortly. What is current lead time?",
      time: "09:14",
    },
  ]);
  const [text, setText] = useState("");
  function send() {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      {
        from: "You",
        text: text.trim(),
        time: new Date().toLocaleTimeString().slice(0, 5),
      },
    ]);
    setText("");
  }
  return (
    <Section id="messages" className="bg-indigo-50/50">
      <div className="mx-auto max-w-5xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-600 p-2 text-white">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <div className="font-semibold">Chat with provider</div>
                <div className="text-slate-600">Secure messaging</div>
              </div>
            </div>
            <button className="rounded-xl border px-3 py-2 text-sm">
              Attach
            </button>
          </div>
          <div className="h-72 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.from === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      m.from === "You"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-800"
                    } max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow`}
                  >
                    <div className="text-xs opacity-70">{m.from}</div>
                    <div>{m.text}</div>
                    <div className="text-[10px] opacity-60">{m.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <button
              onClick={send}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Send
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={onProceed}
              className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-indigo-700"
            >
              Mark as engaged → Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ---- Dashboard -------------------------------------------------------------
function Dashboard({ project, onStartProject }) {
  const progress = 0.35;
  const budgetUsed = 0.28;
  const milestones = [
    { name: "Design", done: true },
    { name: "Permits", done: true },
    { name: "Groundwork", done: false },
    { name: "Structure", done: false },
  ];
  const isDemo = !project;
  const projectName = project?.name ?? "Demo project";
  const budgetVal = project?.budget ?? 2000000;
  const timelineVal = project?.timelineMonths ?? 12;
  return (
    <Section id="dashboard" className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <Pill>
            <Gauge className="h-4 w-4 text-indigo-600" /> Project Dashboard
          </Pill>
        </div>

        {isDemo && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            You are viewing a demo dashboard. Start a project to personalize
            metrics.
            <button
              onClick={onStartProject}
              className="ml-3 rounded-lg bg-indigo-600 px-3 py-1 text-white"
            >
              Start a project
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-lg font-semibold">{projectName}</div>
              <div className="mt-2 text-sm text-slate-600">Progress</div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded bg-white">
                <div
                  className="h-3 bg-indigo-600"
                  style={{ width: pct(progress) }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {pct(progress)} complete
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <div className="text-slate-600">Budget used</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-2 bg-indigo-600"
                      style={{ width: pct(budgetUsed) }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    {pct(budgetUsed)} of {currency(budgetVal)}
                  </div>
                </div>
                <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <div className="text-slate-600">Timeline</div>
                  <div className="mt-1 text-slate-900 font-semibold">
                    {timelineVal} months planned
                  </div>
                  <div className="text-xs text-slate-600">
                    Live updates from providers
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-sm font-medium text-slate-700">
                  Milestones
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {milestones.map((m) => (
                    <div
                      key={m.name}
                      className={`rounded-xl border p-3 text-center text-sm ${
                        m.done
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-slate-700">
                <Bell className="h-4 w-4 text-indigo-600" /> Alerts
              </div>
              <ul className="space-y-3 text-sm">
                <li className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  Permit office requested additional drawings.
                </li>
                <li className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">
                  Provider proposed schedule acceleration (-2 weeks).
                </li>
                <li className="rounded-xl border border-green-200 bg-green-50 p-3">
                  Budget currently under plan by 8%.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}

// ---- Footer ----------------------------------------------------------------
function Footer({ logoUrl }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Rawasi" className="h-8 w-8 rounded" />
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} Rawasi. All rights reserved.
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <Link to="/project" className="hover:text-indigo-600">
            Start
          </Link>
          <Link to="/recs" className="hover:text-indigo-600">
            Recommendations
          </Link>
          <Link to="/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}

// ---- Router Guards & Shell -------------------------------------------------
const RequireProject = ({ project, children }) =>
  project ? children : <Navigate to="/project" replace />;
const RequireCompare = ({ compare, children }) =>
  compare?.length ? children : <Navigate to="/recs" replace />;

function AppShell({ logoUrl }) {
  const [project, setProject] = useState(null);
  const [compare, setCompare] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Active stage from path
  const path = location.pathname;
  const activeStage = path.includes("recs")
    ? STAGES.RECS
    : path.includes("compare")
    ? STAGES.COMPARE
    : path.includes("messages")
    ? STAGES.MESSAGES
    : path.includes("dashboard")
    ? STAGES.DASHBOARD
    : STAGES.PROJECT;

  // Gate logic per route
  const canSee = (target) => {
    if (target === STAGES.DASHBOARD) return true; // always visible
    if (target === STAGES.PROJECT) return true;
    if (target === STAGES.RECS) return !!project;
    if (target === STAGES.COMPARE) return compare.length > 0;
    if (target === STAGES.MESSAGES) return compare.length > 0;
    return false;
  };

  const goTo = (stage) => navigate(ROUTE_FOR[stage] || "/project");
  const onCompareToggle = (id) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-3)
    );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header
        logoUrl={logoUrl || FALLBACK_LOGO_URL}
        activeStage={activeStage}
        canSee={canSee}
        goTo={goTo}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route index element={<Navigate to="/project" replace />} />

          <Route
            path="/project"
            element={
              <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Hero
                  logoUrl={logoUrl || FALLBACK_LOGO_URL}
                  start={() => goTo(STAGES.PROJECT)}
                />
                <ProjectWizard
                  onComplete={(p) => {
                    setProject(p);
                    navigate("/recs");
                  }}
                />
              </motion.main>
            }
          />

          <Route
            path="/recs"
            element={
              <RequireProject project={project}>
                <motion.main
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Recommendations
                    project={project}
                    selectedCompare={compare}
                    onCompareToggle={onCompareToggle}
                    onProceed={() => {
                      if (compare.length) navigate("/compare");
                    }}
                  />
                </motion.main>
              </RequireProject>
            }
          />

          <Route
            path="/compare"
            element={
              <RequireProject project={project}>
                <RequireCompare compare={compare}>
                  <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Compare
                      selectedIds={compare}
                      project={project}
                      onProceed={() => navigate("/messages")}
                    />
                  </motion.main>
                </RequireCompare>
              </RequireProject>
            }
          />

          <Route
            path="/messages"
            element={
              <RequireCompare compare={compare}>
                <motion.main
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Messages onProceed={() => navigate("/dashboard")} />
                </motion.main>
              </RequireCompare>
            }
          />

          <Route
            path="/dashboard"
            element={
              <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Dashboard
                  project={project}
                  onStartProject={() => navigate("/project")}
                />
              </motion.main>
            }
          />

          <Route path="*" element={<Navigate to="/project" replace />} />
        </Routes>
      </AnimatePresence>

      <Footer logoUrl={logoUrl || FALLBACK_LOGO_URL} />
    </div>
  );
}

// ---- Default export wraps Router ------------------------------------------
export default function RawasiProjectOwnerApp({ logoUrl }) {
  return (
    <BrowserRouter>
      <AppShell logoUrl={logoUrl} />
    </BrowserRouter>
  );
}
