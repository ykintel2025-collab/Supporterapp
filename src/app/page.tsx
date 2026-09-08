import Feed from "@/components/Feed";
import { mockPosts } from "@/lib/mockData";

export default function HomePage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-white">Home Feed</h1>
      <p className="mb-4 text-sm text-gray-400">
        Mededelingen, nieuws over het Sociaal Fonds en sponsoracties van het
        Amsterdams Supporters Fonds.
      </p>
      <Feed posts={mockPosts} />
    </div>
  );
}
