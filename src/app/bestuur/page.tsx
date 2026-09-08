"use client";

import { useState } from "react";
import { mockPosts } from "@/lib/mockData";
import { Post } from "@/lib/types";

// Let op: dit is een voorbeeld-dashboard met lokale state (mockdata).
// De goedkeur/afwijs-knoppen wijzigen alleen de data in de browser, niet in
// Firestore. Zodra je Firestore aansluit, vervang je dit door een update op
// het post-document (bijv. updateDoc(doc(db, "posts", post.id), { approved: true })).

export default function BestuurPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  function setApproval(id: string, approved: boolean) {
    setPosts((current) =>
      current.map((post) => (post.id === id ? { ...post, approved } : post))
    );
  }

  const pending = posts.filter((post) => !post.approved);
  const approved = posts.filter((post) => post.approved);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-white">Bestuur Dashboard</h1>
      <p className="mb-4 text-sm text-gray-400">
        Modereer binnenkomende berichten voordat ze in de Home Feed
        verschijnen.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-club-red">
          Te beoordelen ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500">Niets om te beoordelen.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((post) => (
              <div
                key={post.id}
                className="rounded-lg border border-white/10 bg-club-gray p-4"
              >
                <h3 className="mb-1 font-bold text-white">{post.title}</h3>
                <p className="mb-3 text-sm text-gray-300">{post.content}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setApproval(post.id, true)}
                    className="rounded-md bg-club-red px-3 py-1.5 text-sm font-semibold text-white hover:bg-club-red-dark"
                  >
                    Goedkeuren
                  </button>
                  <button
                    onClick={() =>
                      setPosts((current) =>
                        current.filter((p) => p.id !== post.id)
                      )
                    }
                    className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-semibold text-gray-300 hover:bg-white/10"
                  >
                    Afwijzen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Gepubliceerd ({approved.length})
        </h2>
        <div className="flex flex-col gap-2">
          {approved.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between rounded-md border border-white/10 bg-club-gray/50 px-3 py-2"
            >
              <span className="text-sm text-gray-200">{post.title}</span>
              <button
                onClick={() => setApproval(post.id, false)}
                className="text-xs text-gray-400 underline hover:text-club-red"
              >
                Intrekken
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
