"use client";

import { doc, arrayRemove, arrayUnion, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { FirestorePost } from "@/lib/types";
import { formatRelativeTime } from "@/lib/time";
import Avatar from "./Avatar";

export default function PostCard({ post }: { post: FirestorePost }) {
  const { user, profile } = useAuth();

  const liked = user ? post.likes.includes(user.uid) : false;
  const canDelete =
    !!user && (user.uid === post.authorId || profile?.role === "bestuur");

  async function toggleLike() {
    if (!user || !db) return;
    const postRef = doc(db, "posts", post.id);
    await updateDoc(postRef, {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  }

  async function handleDelete() {
    if (!canDelete || !db) return;
    if (!confirm("Weet je zeker dat je dit bericht wilt verwijderen?")) return;
    // Verwijdert het bericht uit Firestore. De media zelf blijft (onschadelijk)
    // in Cloudinary staan — dat verwijderen vereist een ondertekend verzoek
    // met je Cloudinary API-secret, wat niet veilig kan vanuit de browser.
    // Zie README (Fase 2) voor een opzet met een klein backend-functie hiervoor.
    await deleteDoc(doc(db, "posts", post.id));
  }

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2.5 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.authorName} size={36} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
            <p className="text-xs text-gray-500">
              {post.createdAt ? formatRelativeTime(post.createdAt) : "zojuist"}
            </p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="text-xs font-medium text-gray-400 hover:text-club-red"
          >
            Verwijderen
          </button>
        )}
      </div>

      {post.text && (
        <p className="mb-3 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">
          {post.text}
        </p>
      )}

      {post.mediaUrl && post.mediaType === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.mediaUrl}
          alt=""
          className="mb-3 max-h-[480px] w-full rounded-xl border border-gray-100 object-cover"
        />
      )}
      {post.mediaUrl && post.mediaType === "video" && (
        <video
          src={post.mediaUrl}
          controls
          className="mb-3 max-h-[480px] w-full rounded-xl border border-gray-100 bg-black"
        />
      )}

      <button
        onClick={toggleLike}
        disabled={!user}
        className={`flex items-center gap-1.5 text-sm font-medium ${
          liked ? "text-club-red" : "text-gray-500 hover:text-club-red"
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <span className="text-base">{liked ? "♥" : "♡"}</span>
        <span>
          {post.likes.length > 0
            ? `${post.likes.length} vind${post.likes.length === 1 ? "t" : "en"} dit leuk`
            : "Vind ik leuk"}
        </span>
      </button>
    </article>
  );
}
