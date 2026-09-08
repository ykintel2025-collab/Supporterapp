import { DonationGoal, Post } from "./types";

// Dit is voorbeelddata zodat de app direct werkt zonder Firestore in te richten.
// Vervang dit later door echte data uit Firestore (zie src/lib/firebase.ts).

export const mockPosts: Post[] = [
  {
    id: "1",
    type: "mededeling",
    title: "Nieuwe locatie clubhuis bekend",
    content:
      "Vanaf volgende maand komen we samen in het nieuwe clubhuis aan de Zuidas. Iedereen is welkom op de openingsavond.",
    author: "Bestuur",
    date: "2026-09-01",
    approved: true,
  },
  {
    id: "2",
    type: "sociaal",
    title: "Actie voor gezin uit onze supportersgroep",
    content:
      "Een van onze leden zit tijdelijk zonder inkomen. Via het Sociaal Fonds halen we geld op om te ondersteunen.",
    author: "Sociaal Fonds",
    date: "2026-08-28",
    approved: true,
  },
  {
    id: "3",
    type: "sponsor",
    title: "Café De Kroon nieuwe hoofdsponsor",
    content:
      "We heten Café De Kroon van harte welkom als nieuwe hoofdsponsor van het Amsterdams Supporters Fonds.",
    author: "Bestuur",
    date: "2026-08-20",
    approved: true,
  },
];

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
