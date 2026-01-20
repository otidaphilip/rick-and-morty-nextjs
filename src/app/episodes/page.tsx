"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";

/* ================= GRAPHQL QUERY ================= */
const GET_EPISODES = gql`
  query GetEpisodes($page: Int!) {
    episodes(page: $page) {
      info {
        next
      }
      results {
        id
        name
        episode
      }
    }
  }
`;

/* ================= TYPES ================= */
type Episode = {
  id: string;
  name: string;
  episode: string;
};

type EpisodesData = {
  episodes: {
    info: {
      next: number | null;
    };
    results: Episode[];
  };
};

export default function EpisodesPage() {
  /* ---------- API STATE ---------- */
  const [graphqlPage, setGraphqlPage] = useState(1); // For API
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]); // Store all fetched episodes

  /* ---------- APOLLO QUERY ---------- */
  const { data, loading, error, fetchMore } = useQuery<EpisodesData>(
    GET_EPISODES,
    { variables: { page: graphqlPage }, notifyOnNetworkStatusChange: true }
  );

  /* ---------- UPDATE ALL EPISODES WHEN NEW PAGE LOADS ---------- */
  if (data && data.episodes.results.length > 0) {
    const merged = [...allEpisodes, ...data.episodes.results];
    const uniqueResults = Array.from(new Map(merged.map(e => [e.id, e])).values());
    if (uniqueResults.length !== allEpisodes.length) setAllEpisodes(uniqueResults);
  }

  /* ---------- LOAD MORE ---------- */
  const loadMoreEpisodes = () => {
    if (!data?.episodes.info.next) return;

    fetchMore({
      variables: { page: data.episodes.info.next },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const mergedResults = [
          ...prev.episodes.results,
          ...fetchMoreResult.episodes.results,
        ];

        return {
          episodes: {
            info: fetchMoreResult.episodes.info,
            results: mergedResults,
          },
        };
      },
    });

    setGraphqlPage(prev => prev + 1);
  };

  /* ---------- LOADING & ERROR ---------- */
  if (loading && allEpisodes.length === 0) return <p className="title">Loading...</p>;
  if (error) return <p className="title">Error loading episodes</p>;
  if (!allEpisodes || allEpisodes.length === 0) return <p className="title">No episodes found</p>;

  /* ---------- GROUP EPISODES BY SEASON ---------- */
  const seasonsMap = allEpisodes.reduce<Record<string, Episode[]>>((acc, ep) => {
    const season = ep.episode.slice(0, 3); // S01, S02...
    acc[season] = acc[season] || [];
    acc[season].push(ep);
    return acc;
  }, {});

  const seasonKeys = Object.keys(seasonsMap).sort();

  /* ---------- UI ---------- */
  return (
    <main className="page-episodes">
      <div className="container">
        <h1 className="title">Episodes</h1>

        {/* BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Character List
          </Link>
        </div>

        {/* SEASONS */}
        {seasonKeys.map(season => (
          <section key={season} style={{ marginBottom: "60px" }}>
            <h2 className="section-title">Season {season.replace("S", "")}</h2>
            <div className="episodes-grid">
              {seasonsMap[season].map(ep => (
                <Link key={ep.id} href={`/episode/${ep.id}`} className="episode-card">
                  <div className="episode-code">{ep.episode}</div>
                  <div className="episode-name">{ep.name}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* LOAD MORE (FETCH NEXT GRAPHQL PAGE) */}
        {data?.episodes.info.next && (
          <button onClick={loadMoreEpisodes} className="load-more-btn">
            Load More Episodes
          </button>
        )}
      </div>
    </main>
  );
}
