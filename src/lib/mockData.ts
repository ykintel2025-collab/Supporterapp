import { DonationGoal } from "./types";

// Voorbeelddata voor het Sociaal Fonds. De feed op de homepage gebruikt
// inmiddels echte Firestore-data (zie src/components/Feed.tsx) — dit
// bestand is nu alleen nog voor de donatiedoelen. Vervang dit later door
// een Firestore-collectie zodra jullie dat willen (zie README, Fase 2).

export const mockDonationGoals: DonationGoal[] = [
  {
    id: "g1",
    title: "Noodfonds voor leden in nood",
    description:
      "Directe financiële steun voor supporters die onverwacht in de problemen komen.",
    targetAmount: 5000,
    raisedAmount: 3200,
  },
  {
    id: "g2",
    title: "Vervoer naar uitwedstrijden",
    description: "Bijdrage aan bussen voor leden die anders niet mee kunnen.",
    targetAmount: 2500,
    raisedAmount: 900,
  },
  {
    id: "g3",
    title: "Kerstactie voor gezinnen",
    description: "Pakketten voor gezinnen binnen onze supportersgemeenschap.",
    targetAmount: 1500,
    raisedAmount: 1500,
  },
];
