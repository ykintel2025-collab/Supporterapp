// Instellingen voor de lidmaatschapsbijdrage. Zolang er nog geen
// betaalprovider (Mollie/Stripe) is gekoppeld, wordt dit HANDMATIG
// bijgehouden: nieuwe leden zien deze instructies bij het aanmelden, maken
// zelf het bedrag over (bijv. bankoverschrijving of Tikkie), en het bestuur
// zet de betaling op "betaald" in het Bestuur-dashboard (tabblad Leden/
// Aanmeldingen) zodra het geld binnen is.
//
// PAS DIT AAN: vul hieronder je eigen IBAN/Tikkie-gegevens in.
export const MEMBERSHIP_FEE_EUR = 12;

export const MEMBERSHIP_PAYMENT_INSTRUCTIONS =
  "Maak €12 over naar NL00 BANK 0123456789 t.n.v. Amsterdams Supporters Fonds, onder vermelding van je naam — of vraag het bestuur naar de Tikkie-link.";
