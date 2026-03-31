"use client";

import { TimeEntry } from "@/lib/types";

interface DashboardProps {
  entries: TimeEntry[];
}

export default function Dashboard({ entries }: DashboardProps) {
  const totalHours = entries.reduce((sum, e) => {
    const h = parseFloat(e.duration);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const hoursPerProject: Record<string, number> = {};
  entries.forEach((e) => {
    const h = parseFloat(e.duration) || 0;
    const proj = e.project || "Övrigt";
    hoursPerProject[proj] = (hoursPerProject[proj] || 0) + h;
  });

  const maxHours = Math.max(...Object.values(hoursPerProject), 1);

  return (
    <div className="p-5 border rounded-xl bg-gray-50 space-y-4">
      <h2 className="font-bold text-lg">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Totala timmar</div>
          <div className="text-3xl font-bold text-blue-600">
            {totalHours.toFixed(1)}h
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Antal poster</div>
          <div className="text-3xl font-bold text-green-600">
            {entries.length}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-sm text-gray-600 mb-2">
          Timmar per projekt
        </h3>
        <div className="space-y-2">
          {Object.entries(hoursPerProject)
            .sort(([, a], [, b]) => b - a)
            .map(([project, hours]) => (
              <div key={project}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{project}</span>
                  <span className="font-medium">{hours.toFixed(1)}h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(hours / maxHours) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
