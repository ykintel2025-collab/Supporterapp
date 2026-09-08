import DonationCard from "@/components/DonationCard";
import { mockDonationGoals } from "@/lib/mockData";

export default function SociaalFondsPage() {
  const totalRaised = mockDonationGoals.reduce(
    (sum, goal) => sum + goal.raisedAmount,
    0
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-white">Sociaal Fonds</h1>
      <p className="mb-4 text-sm text-gray-400">
        Samen zorgen we voor supporters die het even moeilijk hebben. Bekijk
        de lopende acties en de voortgang.
      </p>

      <div className="mb-4 rounded-lg border border-club-red bg-club-gray p-4">
        <p className="text-sm text-gray-300">Totaal opgehaald dit jaar</p>
        <p className="text-2xl font-bold text-club-red">
          {new Intl.NumberFormat("nl-NL", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          }).format(totalRaised)}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {mockDonationGoals.map((goal) => (
          <DonationCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
}
