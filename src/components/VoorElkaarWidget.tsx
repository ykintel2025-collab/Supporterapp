"use client";

import { useState } from "react";
import { mockDonationGoals } from "@/lib/mockData";

function formatEuro(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// "Voor Elkaar": het vroegere Sociaal Fonds, nu geen los eilandje meer maar
// vast bovenaan de Home Feed geplakt (sticky), met een dropdown die in één
// keer alle lopende acties toont — precies waar leden dagelijks toch al
// komen, in plaats van een aparte pagina die je zelf moet opzoeken.
export default function VoorElkaarWidget() {
  const [open, setOpen] = useState(false);
  const totalRaised = mockDonationGoals.reduce((sum, g) => sum + g.raisedAmount, 0);
  const totalTarget = mockDonationGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const percentage = Math.min(100, Math.round((totalRaised / totalTarget) * 100));

  return (
    <div className="sticky top-[88px] z-[5] mb-4 rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-club-red">
            Voor Elkaar
          </p>
          <p className="truncate text-sm text-gray-600">
            We staan voor elkaar klaar — {formatEuro(totalRaised)} opgehaald
            van {formatEuro(totalTarget)}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-club-red transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border border-gray-200 p-1.5 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-2.5 border-t border-gray-100 p-4 pt-3.5">
          {mockDonationGoals.map((goal) => {
            const goalPercentage = Math.min(
              100,
              Math.round((goal.raisedAmount / goal.targetAmount) * 100)
            );
            const isComplete = goalPercentage >= 100;
            return (
              <div key={goal.id} className="rounded-xl bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-gray-900">{goal.title}</h3>
                  {isComplete && (
                    <span className="shrink-0 rounded-full bg-club-red px-2 py-0.5 text-[10px] font-semibold text-white">
                      Doel bereikt
                    </span>
                  )}
                </div>
                <p className="mb-2 text-xs text-gray-600">{goal.description}</p>
                <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-club-red transition-all"
                    style={{ width: `${goalPercentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>
                    {formatEuro(goal.raisedAmount)} van {formatEuro(goal.targetAmount)}
                  </span>
                  <span>{goalPercentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
