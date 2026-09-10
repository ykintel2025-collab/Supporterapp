import Link from "next/link";
import { mockDonationGoals } from "@/lib/mockData";

function formatEuro(amount: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compacte samenvatting van het Sociaal Fonds, bovenaan de Home Feed.
// De volledige lijst met acties en donatie-opties staat op /sociaal-fonds —
// deze widget laat direct zien waarom het fonds bestaat en wat het al heeft
// opgehaald, zodat het geen los eilandje meer is maar onderdeel van de
// dagelijkse ervaring in de app.
export default function SociaalFondsWidget() {
  const totalRaised = mockDonationGoals.reduce((sum, g) => sum + g.raisedAmount, 0);
  const totalTarget = mockDonationGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const percentage = Math.min(100, Math.round((totalRaised / totalTarget) * 100));
  const activeGoals = mockDonationGoals.filter(
    (g) => g.raisedAmount < g.targetAmount
  );
  const featuredGoal = activeGoals[0] ?? mockDonationGoals[0];

  return (
    <Link
      href="/sociaal-fonds"
      className="mb-4 block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-club-red/30 hover:shadow"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-club-red">
            Sociaal Fonds
          </p>
          <p className="text-sm text-gray-600">
            Samen zorgen we voor supporters die het nodig hebben
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-club-red px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
          Doneren
        </span>
      </div>

      <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-club-red transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {formatEuro(totalRaised)} opgehaald van {formatEuro(totalTarget)}
        </span>
        <span>{percentage}%</span>
      </div>

      {featuredGoal && (
        <p className="text-xs text-gray-500">
          Actief: <span className="font-medium text-gray-700">{featuredGoal.title}</span>{" "}
          — bekijk alle acties en doneer →
        </p>
      )}
    </Link>
  );
}
