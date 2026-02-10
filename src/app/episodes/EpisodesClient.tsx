"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState, useMemo } from "react";

const GET_EPISODES = gql`
  query GetEpisodes($page: Int!) {
    episodes(page: $page) {
      info { next }
      results { id name episode }
    }
  }
`;

type Episode = {
  id: string;
  name?: string | null;
  episode?: string | null;
};

type EpisodesResponse = {
  episodes: {
    info: { next: number | null };
    results: Episode[];
  };
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

  const { fetchMore, loading } = useQuery<EpisodesResponse>(GET_EPISODES, {
    variables: { page: 1 },
    skip: true,
  });

  const loadMoreEpisodes = async () => {
    if (!nextPage) return;

    const { data } = await fetchMore({ variables: { page: nextPage } });
    if (!data?.episodes) return;

    setAllEpisodes((prev) => [...prev, ...data.episodes.results]);
    setNextPage(data.episodes.info.next);
  };

  // 🔥 GROUP EPISODES BY SEASON
  const episodesBySeason = useMemo(() => {
    const groups: Record<string, Episode[]> = {};

    allEpisodes.forEach((ep) => {
      const seasonMatch = ep.episode?.match(/S(\d+)/);
      const season = seasonMatch ? `Season ${parseInt(seasonMatch[1])}` : "Unknown Season";

      if (!groups[season]) groups[season] = [];
      groups[season].push(ep);
    });

    return groups;
  }, [allEpisodes]);

  return (
    <main className="page-episodes">
      <div className="container">
        <h1 className="title">Episodes</h1>

        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Characters
          </Link>
        </div>

        {/* 🔥 SEASON GROUPS */}
        {Object.entries(episodesBySeason).map(([season, episodes]) => (
          <div key={season} className="season-block">
            <h2 className="season-title">{season}</h2>

            <div className="episodes-grid">
              {episodes.map((ep) => (
                <Link key={ep.id} href={`/episode/${ep.id}`} className="episode-card">
                  <div className="episode-code">{ep.episode ?? "N/A"}</div>
                  <div className="episode-name">{ep.name ?? "Untitled"}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {nextPage && (
          <div style={{ textAlign: "center" }}>
            <button onClick={loadMoreEpisodes} className="load-more-btn" disabled={loading}>
              {loading ? "Loading..." : "Load More Episodes →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}