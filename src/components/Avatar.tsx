import { getInitials } from "@/lib/time";

export default function Avatar({
  name,
  photoURL,
  size = 40,
}: {
  name: string;
  photoURL?: string | null;
  size?: number;
}) {
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-club-red font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name) || "?"}
    </div>
  );
}
