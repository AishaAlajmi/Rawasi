import React from "react";
import { Gauge, Bell } from "lucide-react";
import { Section, Pill } from "../components/ui.jsx";
import { currency, pct } from "../lib/utils.js";

export default function Dashboard({ project, onStartProject }) {
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
          <Pill><Gauge className="h-4 w-4 text-indigo-600" /> Project Dashboard</Pill>
        </div>

        {isDemo && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            You are viewing a demo dashboard. Start a project to personalize metrics.
            <button onClick={onStartProject} className="ml-3 rounded-lg bg-indigo-600 px-3 py-1 text-white">Start a project</button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-lg font-semibold">{projectName}</div>
              <div className="mt-2 text-sm text-slate-600">Progress</div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded bg-white">
                <div className="h-3 bg-indigo-600" style={{ width: pct(progress) }} />
              </div>
              <div className="mt-1 text-xs text-slate-600">{pct(progress)} complete</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <div className="text-slate-600">Budget used</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
                    <div className="h-2 bg-indigo-600" style={{ width: pct(budgetUsed) }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{pct(budgetUsed)} of {currency(budgetVal)}</div>
                </div>
                <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <div className="text-slate-600">Timeline</div>
                  <div className="mt-1 text-slate-900 font-semibold">{timelineVal} months planned</div>
                  <div className="text-xs text-slate-600">Live updates from providers</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-sm font-medium text-slate-700">Milestones</div>
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {milestones.map((m) => (
                    <div key={m.name} className={`rounded-xl border p-3 text-center text-sm ${m.done ? "border-green-200 bg-green-50 text-green-800" : "border-slate-200 bg-white"}`}>
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-slate-700"><Bell className="h-4 w-4 text-indigo-600" /> Alerts</div>
              <ul className="space-y-3 text-sm">
                <li className="rounded-xl border border-amber-200 bg-amber-50 p-3">Permit office requested additional drawings.</li>
                <li className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">Provider proposed schedule acceleration (-2 weeks).</li>
                <li className="rounded-xl border border-green-200 bg-green-50 p-3">Budget currently under plan by 8%.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}
