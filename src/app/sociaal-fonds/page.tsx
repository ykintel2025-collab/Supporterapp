import DonationCard from "@/components/DonationCard";
import { mockDonationGoals } from "@/lib/mockData";

export default function SociaalFondsPage() {
  const totalRaised = mockDonationGoals.reduce(
    (sum, goal) => sum + goal.raisedAmount,
    0
  );

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-gray-900">
        Sociaal Fonds
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        Samen zorgen we voor supporters die het even moeilijk hebben. Bekijk
        de lopende acties en de voortgang.
      </p>

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Totaal opgehaald dit jaar</p>
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
