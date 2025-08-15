
import React, { useMemo } from "react";
import { Gauge, Bell, CalendarDays, Wallet, Activity, Clock, Flag } from "lucide-react";
import { Section, Pill } from "../components/ui.jsx";
import { currency, pct } from "../lib/utils.js";
import { useLang } from "../context/lang";

export default function Dashboard({ project, onStartProject }) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const t = isAr
    ? {
        title: "لوحة التحكم",
        demoMsg: "أنت تشاهد لوحة تحكم تجريبية. ابدأ مشروعًا لتخصيص المؤشرات.",
        start: "ابدأ مشروعًا",
        progress: "التقدم",
        budgetUsed: "الميزانية المستخدمة",
        timeline: "الجدول الزمني",
        monthsPlanned: (m) => `${m} شهرًا مخططًا`,
        milestones: "المعالم",
        alerts: "التنبيهات",
        kpiBudget: "الميزانية",
        kpiRisk: "المخاطر",
        kpiTime: "المدة",
        upcoming: "المعلم القادم",
      }
    : {
        title: "Project Dashboard",
        demoMsg: "You are viewing a demo dashboard. Start a project to personalize metrics.",
        start: "Start a project",
        progress: "Progress",
        budgetUsed: "Budget used",
        timeline: "Timeline",
        monthsPlanned: (m) => `${m} months planned` ,
        milestones: "Milestones",
        alerts: "Alerts",
        kpiBudget: "Budget",
        kpiRisk: "Risk",
        kpiTime: "Duration",
        upcoming: "Next milestone",
      };

  // Demo/defaults
  const progress = 0.42;
  const budgetUsed = 0.31;
  const projectName = project?.name ?? (isAr ? "مشروع تجريبي" : "Demo project");
  const budgetVal = project?.budget ?? 2_000_000;
  const timelineMonths = project?.timelineMonths ?? 12;
  const totalWeeks = timelineMonths * 4;

  const tasks = useMemo(() => {
    // startWeek and durationWeeks across totalWeeks
    const base = [
      { name: isAr ? "التصميم" : "Design", startWeek: 0, durationWeeks: 4 },
      { name: isAr ? "التراخيص" : "Permits", startWeek: 2, durationWeeks: 6 },
      { name: isAr ? "الأعمال التمهيدية" : "Groundwork", startWeek: 6, durationWeeks: 6 },
      { name: isAr ? "الهيكل" : "Structure", startWeek: 12, durationWeeks: 10 },
      { name: isAr ? "الأعمال الكهروميكانيكية" : "MEP", startWeek: 18, durationWeeks: 8 },
      { name: isAr ? "التشطيبات" : "Finishes", startWeek: 24, durationWeeks: 8 },
      { name: isAr ? "التسليم" : "Handover", startWeek: 32, durationWeeks: 4 },
    ];
    // Ensure bars fit within chart
    return base.map((t) => ({
      ...t,
      startWeek: Math.min(t.startWeek, Math.max(0, totalWeeks - 1)),
      durationWeeks: Math.min(t.durationWeeks, Math.max(1, totalWeeks - t.startWeek)),
    }));
  }, [isAr, totalWeeks]);

  const nextMilestone = useMemo(() => tasks.find((t) => t.startWeek + t.durationWeeks > totalWeeks * progress) || tasks[0], [tasks, totalWeeks, progress]);

  return (
    <Section id="dashboard" className="bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center gap-3">
          <Pill><Gauge className="h-4 w-4 text-indigo-600" /> {t.title}</Pill>
        </div>

        {!project && (
          <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
            {t.demoMsg}
            <button onClick={onStartProject} className="ml-3 rounded-lg bg-indigo-600 px-3 py-1 text-white">
              {t.start}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Main card */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-lg font-semibold">{projectName}</div>

              {/* KPIs */}
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Kpi icon={Wallet} label={t.kpiBudget} value={currency(budgetVal)} sub={`${t.budgetUsed}: ${pct(budgetUsed)}`} />
                <Kpi icon={Activity} label={t.kpiRisk} value={isAr ? "منخفض" : "Low"} sub={isAr ? "مؤشرات سليمة" : "Healthy indicators"} />
                <Kpi icon={Clock} label={t.kpiTime} value={`${timelineMonths} ${isAr ? "شهر" : "mo"}`} sub={isAr ? "حسب الخطة" : "On plan"} />
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="text-sm text-slate-600">{t.progress}</div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded bg-white">
                  <div className="h-3 bg-indigo-600" style={{ width: pct(progress) }} />
                </div>
                <div className="mt-1 text-xs text-slate-600">{pct(progress)} {isAr ? "منجز" : "complete"}</div>
              </div>

              {/* Timeline */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <div className="mb-1 text-slate-600">{t.timeline}</div>
                  <div className="text-slate-900 font-semibold">{t.monthsPlanned(timelineMonths)}</div>
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-600" />{t.upcoming}: {nextMilestone.name}</div>
                </div>
                <div className="rounded-xl bg-white p-4 text-sm shadow-sm">
                  <div className="text-slate-600">{t.budgetUsed}</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
                    <div className="h-2 bg-indigo-600" style={{ width: pct(budgetUsed) }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{pct(budgetUsed)} {isAr ? "من" : "of"} {currency(budgetVal)}</div>
                </div>
              </div>

              {/* Gantt */}
              <div className="mt-6">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"><Flag className="h-4 w-4 text-indigo-600" /> {isAr ? "مخطط جانت" : "Gantt"}</div>
                <Gantt tasks={tasks} totalWeeks={totalWeeks} rtl={isAr} />
              </div>

              {/* Milestones badges */}
              <div className="mt-6">
                <div className="text-sm font-medium text-slate-700">{t.milestones}</div>
                <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {tasks.slice(0, 4).map((m) => (
                    <div key={m.name} className="rounded-xl border border-slate-200 bg-white p-3 text-center text-sm">
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-slate-700"><Bell className="h-4 w-4 text-indigo-600" /> {t.alerts}</div>
              <ul className="space-y-3 text-sm">
                <li className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">{isAr ? "طلب مكتب التراخيص رسومات إضافية." : "Permit office requested additional drawings."}</li>
                <li className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">{isAr ? "اقتراح مزود الخدمة تسريع الجدول (-أسبوعين)." : "Provider proposed schedule acceleration (-2 weeks)."}</li>
                <li className="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">{isAr ? "الميزانية أقل من الخطة بنسبة 8%." : "Budget currently under plan by 8%."}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </Section>
  );
}

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-600"><Icon className="h-4 w-4 text-indigo-600" /> {label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-600">{sub}</div>
    </div>
  );
}

function Gantt({ tasks, totalWeeks, rtl = false }) {
  const weeks = Array.from({ length: Math.min(totalWeeks, 36) }, (_, i) => i + 1); // cap to keep it compact
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      {/* Header scale */}
      <div className={`grid ${rtl ? "[direction:rtl]" : ""}`} style={{ gridTemplateColumns: `160px repeat(${weeks.length}, minmax(16px, 1fr))` }}>
        <div className="text-xs text-slate-600 px-2">{rtl ? "المهمة" : "Task"}</div>
        {weeks.map((w) => (
          <div key={w} className="text-center text-[10px] text-slate-400">{w}</div>
        ))}
      </div>
      {/* Rows */}
      <div className="mt-2 space-y-2">
        {tasks.map((t) => (
          <GanttRow key={t.name} task={t} totalWeeks={weeks.length} rtl={rtl} />
        ))}
      </div>
    </div>
  );
}

function GanttRow({ task, totalWeeks, rtl }) {
  const leftPct = `${(task.startWeek / totalWeeks) * 100}%`;
  const widthPct = `${(task.durationWeeks / totalWeeks) * 100}%`;
  const posStyle = rtl ? { right: leftPct, width: widthPct } : { left: leftPct, width: widthPct };
  return (
    <div className="relative grid items-center" style={{ gridTemplateColumns: `160px 1fr` }}>
      <div className="truncate px-2 text-xs text-slate-700">{task.name}</div>
      <div className="relative h-6 rounded bg-slate-100">
        <div className="absolute top-1/2 -translate-y-1/2 rounded-md bg-indigo-500/90" style={{ height: "14px", ...posStyle }} />
      </div>
    </div>
  );
}
