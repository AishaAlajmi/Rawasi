import { clamp } from "./utils.js";

export function scoreProvider(provider, project) {
  if (!project) return 0;
  const { sizeSqm = 0, budget = 0, location = "Riyadh", techNeeds = [] } = project;
  const cost = provider.baseCost + provider.costPerSqm * sizeSqm;
  const budgetFit = clamp(1 - Math.abs(cost - budget) / Math.max(budget, 1), 0, 1);
  const techMatch = techNeeds.length
    ? clamp(techNeeds.filter((t) => provider.tech.includes(t)).length / techNeeds.length, 0, 1)
    : 0.6;
  const locationAffinity = provider.location === location ? 1 : 0.6;
  const rating = provider.rating / 5;
  const speed = clamp(1 / provider.timelineSpeed - 0.5, 0, 1);
  const experience = clamp(provider.pastProjects / 80, 0, 1);
  return Number((0.28 * budgetFit + 0.22 * techMatch + 0.18 * rating + 0.14 * speed + 0.1 * locationAffinity + 0.08 * experience).toFixed(4));
}

export function estimateCostAndTime(project) {
  const { sizeSqm = 0, complexity = "medium", budget = 0 } = project || {};
  const baseRate = { low: 2800, medium: 4000, high: 5200 }[complexity];
  const estCost = sizeSqm * baseRate * (project?.techNeeds?.includes("3D Printing") ? 0.95 : 1);
  const timeMonths = Math.ceil((sizeSqm / 1000) * (complexity === "high" ? 2.2 : complexity === "low" ? 1.3 : 1.7));
  const risk = clamp(Math.abs(estCost - budget) / Math.max(budget, 1), 0, 1);
  return { estCost: Math.round(estCost), estTimeMonths: timeMonths, risk };
}
