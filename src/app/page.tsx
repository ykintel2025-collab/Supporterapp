import Feed from "@/components/Feed";
import PostComposer from "@/components/PostComposer";

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-white">Home Feed</h1>
      <p className="mb-4 text-sm text-gray-400">
        Deel updates, foto&apos;s en video&apos;s met de andere supporters.
      </p>
      <PostComposer />
      <Feed />
    </div>
  );
}
