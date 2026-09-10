"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirestorePost } from "@/lib/types";
import PostCard from "./PostCard";

export default function Feed() {
  const [posts, setPosts] = useState<FirestorePost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setError(
        "Firebase is niet correct geconfigureerd. Controleer de environment variables (zie README)."
      );
      return;
    }
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setPosts(
          snapshot.docs
            .map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                authorId: data.authorId,
                authorName: data.authorName,
                authorPhotoURL: data.authorPhotoURL ?? null,
                text: data.text ?? "",
                mediaUrl: data.mediaUrl ?? null,
                mediaType: data.mediaType ?? null,
                likes: data.likes ?? [],
                status: data.status ?? "published",
                postedAsBestuur: data.postedAsBestuur ?? false,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
              } as FirestorePost;
            })
            // Gefilterd in de client (i.p.v. een Firestore where-query) zodat
            // we geen samengestelde index nodig hebben voor status + datum.
            .filter((post) => post.status === "published")
        );
        setError(null);
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("Feed onSnapshot error:", err.code, err.message);
        setError(
          `Kan berichten niet laden (${err.code}). Controleer of Firestore is ingericht (zie README).`
        );
      }
    );
    return unsubscribe;
  }, []);

  if (error) {
    return <p className="py-8 text-center text-sm text-club-red">{error}</p>;
  }

  if (posts === null) {
    return <p className="py-8 text-center text-sm text-gray-500">Laden...</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Nog geen berichten. Wees de eerste die iets deelt!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
