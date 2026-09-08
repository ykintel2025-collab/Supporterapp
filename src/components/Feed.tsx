import { Post } from "@/lib/types";
import PostCard from "./PostCard";

export default function Feed({ posts }: { posts: Post[] }) {
  const visiblePosts = posts.filter((post) => post.approved);

  if (visiblePosts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Nog geen berichten geplaatst.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {visiblePosts
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
    </div>
  );
}
