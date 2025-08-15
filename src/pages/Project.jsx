
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Calculator, ChevronLeft, ChevronRight, ShieldCheck, Timer, Layers } from "lucide-react";
import { Section, Pill } from "../components/ui.jsx";
import { estimateCostAndTime } from "../lib/recommend.js";
import { clamp, currency, pct } from "../lib/utils.js";

export default function Project({ onComplete }) {
  return (
    <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <ProjectWizard onComplete={onComplete} />
    </motion.main>
  );
}

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
  const { estCost, estTimeMonths, risk } = useMemo(() => estimateCostAndTime(project), [project]);

  const next = () => {
    if (step === 0 && !project.name) return setError("Please name your project.");
    setError("");
    setStep((s) => clamp(s + 1, 0, 4));
  };
  const prev = () => {
    setError("");
    setStep((s) => clamp(s - 1, 0, 4));
  };
  const submit = () => {
    setError("");
    onComplete?.(project);
  };

  const TechChip = ({ value }) => {
    const active = project.techNeeds.includes(value);
    return (
      <button
        type="button"
        onClick={() =>
          setProject((p) => ({
            ...p,
            techNeeds: active ? p.techNeeds.filter((t) => t !== value) : [...p.techNeeds, value],
          }))
        }
        className={`rounded-xl border px-3 py-2 text-sm ${
          active ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700"
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
                <div className="text-sm text-slate-600">Step {step + 1} / 5</div>
              </div>

              <div className="mt-4 space-y-6">
                {step === 0 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-600">Project name</label>
                      <input
                        value={project.name}
                        onChange={(e) => setProject({ ...project, name: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                        placeholder="e.g., Al Rawasi Villas"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Type</label>
                      <select
                        value={project.type}
                        onChange={(e) => setProject({ ...project, type: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        {["Residential", "Commercial", "Industrial", "Mixed-Use"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="text-sm text-slate-600">Size (sqm)</label>
                      <input
                        type="number"
                        value={project.sizeSqm}
                        onChange={(e) => setProject({ ...project, sizeSqm: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Location</label>
                      <select
                        value={project.location}
                        onChange={(e) => setProject({ ...project, location: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        {["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Complexity</label>
                      <select
                        value={project.complexity}
                        onChange={(e) => setProject({ ...project, complexity: e.target.value })}
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
                      <label className="text-sm text-slate-600">Budget (SAR)</label>
                      <input
                        type="number"
                        value={project.budget}
                        onChange={(e) => setProject({ ...project, budget: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Timeline (months)</label>
                      <input
                        type="number"
                        value={project.timelineMonths}
                        onChange={(e) => setProject({ ...project, timelineMonths: Number(e.target.value) })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <label className="text-sm text-slate-600">Preferred technologies</label>
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
                      <div className="text-sm font-medium text-slate-700">Review</div>
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
                          <strong>Timeline:</strong> {project.timelineMonths} months
                        </div>
                        <div className="col-span-2">
                          <strong>Tech:</strong> {project.techNeeds.join(", ") || "Flexible"}
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
                          <div className="font-semibold text-slate-900">{currency(estCost)}</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Estimated time</div>
                          <div className="font-semibold text-slate-900">{estTimeMonths} months</div>
                        </div>
                        <div>
                          <div className="text-slate-600">Budget fit</div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white">
                            <div className="h-2 bg-indigo-600" style={{ width: pct(1 - risk) }} />
                          </div>
                          <div className="mt-1 text-xs text-slate-600">Higher bar = better fit</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
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
            {/* Show LiveEstimator ONLY on final step (displayed as Step 5) */}
            {step === 4 && <LiveEstimator est={{ estCost, estTimeMonths }} />}
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
          <div className="mt-1 text-2xl font-semibold text-slate-900">{currency(estCost)}</div>
        </div>
        <div className="rounded-xl bg-white p-4 text-center shadow-sm">
          <div className="text-slate-600">Estimated time</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{estTimeMonths} mo</div>
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
