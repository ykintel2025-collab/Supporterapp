export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "zojuist";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min geleden`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} uur geleden`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dag${days === 1 ? "" : "en"} geleden`;

  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
