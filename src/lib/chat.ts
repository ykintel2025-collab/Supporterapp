// Hulpfunctie voor de onderlinge berichtenservice (DM).
//
// We gebruiken één voorspelbare conversatie-id per paar leden, opgebouwd uit
// hun beide user-id's op alfabetische volgorde. Zo hoeven we nooit te zoeken
// of er al een gesprek bestaat tussen twee mensen — we kunnen het altijd
// direct berekenen, aan beide kanten hetzelfde.
export function getConversationId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}
