"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

type Episode = {
  id: string;
  name?: string | null;
  episode?: string | null;
};

export default function EpisodesClient({
  initialEpisodes,
  nextPage: initialNextPage,
}: {
  initialEpisodes: Episode[];
  nextPage: number | null;
}) {
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>(initialEpisodes);
  const [nextPage, setNextPage] = useState<number | null>(initialNextPage);
  const [loading, setLoading] = useState(false);

  const loadMoreEpisodes = async () => {
    if (!nextPage || loading) return;
    setLoading(true);

    try {
      const res = await fetch("https://rickandmortyapi.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query GetEpisodes($page: Int!) {
              episodes(page: $page) {
                info { next }
                results { id name episode }
              }
            }
          `,
          variables: { page: nextPage },
        }),
      });

      const json = await res.json();
      const data = json.data.episodes;

      // Append new episodes to the existing list
      setAllEpisodes((prev) => [...prev, ...data.results]);
      setNextPage(data.info.next);
    } catch (err) {
      console.error("Failed to load more episodes:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Grouping logic: Automatically re-runs when allEpisodes changes
  const episodesBySeason = useMemo(() => {
    const groups: Record<string, Episode[]> = {};

    allEpisodes.forEach((ep) => {
      const seasonMatch = ep.episode?.match(/S(\d+)/);
      const seasonNum = seasonMatch ? parseInt(seasonMatch[1]) : null;
      const seasonLabel = seasonNum ? `Season ${seasonNum}` : "Unknown Season";

      if (!groups[seasonLabel]) groups[seasonLabel] = [];
      groups[seasonLabel].push(ep);
    });

    return groups;
  }, [allEpisodes]);

  return (
    <main className="page-episodes">
      <div className="container">
        <h1 className="title">Episodes</h1>

        <div className="back-button-wrapper" style={{ marginBottom: '20px' }}>
          <Link href="/" className="view-episodes-btn">
            ← Back to Characters
          </Link>
        </div>

        {/* Render Seasons */}
        {Object.entries(episodesBySeason).map(([season, episodes]) => (
          <div key={season} className="season-block" style={{ marginBottom: '40px' }}>
            <h2 className="season-title" style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              {season}
            </h2>

            <div className="episodes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
              {episodes.map((ep) => (
                <Link key={ep.id} href={`/episode/${ep.id}`} className="episode-card">
                  <div className="episode-code" style={{ fontWeight: 'bold', color: '#000000' }}>
                    {ep.episode ?? "N/A"}
                  </div>
                  <div className="episode-name">{ep.name ?? "Untitled"}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Load More Button */}
        {nextPage && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <button 
              onClick={loadMoreEpisodes} 
              className="load-more-btn" 
              disabled={loading}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? "Loading..." : "Load More Episodes →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}