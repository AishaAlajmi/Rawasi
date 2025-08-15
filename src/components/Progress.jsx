// src/components/Progress.jsx
import React from "react";
import { useLocation } from "react-router-dom";

/**
 * Flow progress chips
 * Steps:
 * 1) Add Project
 * 2) Recommendations (covers /recs and /compare; comparing is optional)
 * 3) Messages
 *
 * Shown only on flow routes (App controls visibility).
 */
export default function FlowProgress() {
  const { pathname } = useLocation();

  const steps = [
    { id: "project", label: "Add Project", routes: ["/project"] },
    { id: "picks", label: "Recommendations", routes: ["/recs", "/compare"] }, // compare optional
    { id: "messages", label: "Messages", routes: ["/messages"] },
  ];

  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.routes.some((r) => pathname.startsWith(r)))
  );

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 gap-3">
        {steps.map((s, i) => {
          const active = i === activeIndex;
          const done = i < activeIndex;
          const cls = active
            ? "bg-indigo-600 text-white"
            : done
            ? "bg-indigo-50 text-indigo-700"
            : "bg-slate-100 text-slate-400";
          return (
            <div
              key={s.id}
              className={`rounded-full px-5 py-2 text-center text-sm font-medium ${cls}`}
              title={s.id === "picks" ? "Compare is optional" : undefined}
            >
              {s.label}
              {s.id === "picks" && (
                <span className="hidden sm:inline"> (compare optional)</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
