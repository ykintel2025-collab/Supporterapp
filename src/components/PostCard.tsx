import { Post } from "@/lib/types";

const typeLabels: Record<Post["type"], string> = {
  mededeling: "Mededeling",
  sociaal: "Sociaal Fonds",
  sponsor: "Sponsor",
};

const typeStyles: Record<Post["type"], string> = {
  mededeling: "bg-club-red text-white",
  sociaal: "bg-white text-club-black",
  sponsor: "bg-club-gray text-club-red border border-club-red",
};

export default function PostCard({ post }: { post: Post }) {
  const formattedDate = new Date(post.date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="rounded-lg border border-white/10 bg-club-gray p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${typeStyles[post.type]}`}
        >
          {typeLabels[post.type]}
        </span>
        <time className="text-xs text-gray-400">{formattedDate}</time>
      </div>
      <h3 className="mb-1 text-base font-bold text-white">{post.title}</h3>
      <p className="text-sm leading-relaxed text-gray-300">{post.content}</p>
      <p className="mt-2 text-xs text-gray-500">Geplaatst door {post.author}</p>
    </article>
  );
}
