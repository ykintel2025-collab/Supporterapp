import { DonationGoal } from "@/lib/types";

function formatEuro(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DonationCard({ goal }: { goal: DonationGoal }) {
  const percentage = Math.min(
    100,
    Math.round((goal.raisedAmount / goal.targetAmount) * 100)
  );
  const isComplete = percentage >= 100;

  return (
    <div className="rounded-lg border border-white/10 bg-club-gray p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">{goal.title}</h3>
        {isComplete && (
          <span className="rounded-full bg-club-red px-2 py-0.5 text-xs font-semibold text-white">
            Doel bereikt
          </span>
        )}
      </div>
      <p className="mb-3 text-sm text-gray-300">{goal.description}</p>

      <div className="mb-1 h-3 w-full overflow-hidden rounded-full bg-black/50">
        <div
          className="h-full rounded-full bg-club-red transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {formatEuro(goal.raisedAmount)} van {formatEuro(goal.targetAmount)}
        </span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
}
