"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

const GET_EPISODES = gql`
  query GetEpisodes {
    episodes {
      results {
        id
        name
        episode
      }
    }
  }
`;

type Episode = {
  id: string;
  name: string;
  episode: string;
};

type EpisodesData = {
  episodes: {
    results: Episode[];
  };
};

export default function EpisodesPage() {
  const { data, loading, error } = useQuery<EpisodesData>(GET_EPISODES);

  if (loading) return <p className="title">Loading...</p>;
  if (error) return <p className="title">Error loading episodes</p>;
  if (!data) return <p className="title">No data</p>;

  const episodes = data.episodes.results;

  // ✅ Separate by season
  const season1 = episodes.filter((ep) => ep.episode.startsWith("S01"));
  const season2 = episodes.filter((ep) => ep.episode.startsWith("S02"));

  return (
    <main className="page-episodes">
    <div className="container">
      <h1 className="title">Episodes</h1>

      {/* ===== SEASON 1 ===== */}
      <section>
        <h2 className="section-title">Season 1</h2>
        <div className="episodes-grid">
          {season1.map((ep) => (
            <Link
              key={ep.id}
              href={`/episode/${ep.id}`}
              className="episode-card"
            >
              <div className="episode-code">{ep.episode}</div>
              <div className="episode-name">{ep.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== SEASON 2 ===== */}
      <section style={{ marginTop: "60px" }}>
        <h2 className="section-title">Season 2</h2>
        <div className="episodes-grid">
          {season2.map((ep) => (
            <Link
              key={ep.id}
              href={`/episode/${ep.id}`}
              className="episode-card"
            >
              <div className="episode-code">{ep.episode}</div>
              <div className="episode-name">{ep.name}</div>
            </Link>
          ))}
        </div>
      </section>
      </div>
    </main>
  );
}
