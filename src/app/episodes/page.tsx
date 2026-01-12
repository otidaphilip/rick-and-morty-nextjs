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

type EpisodesData = {
  episodes: {
    results: {
      id: string;
      name: string;
      episode: string;
    }[];
  };
};

export default function EpisodesPage() {
  const { data, loading, error } = useQuery<EpisodesData>(GET_EPISODES);

  if (loading) return <p className="title">Loading...</p>;
  if (error) return <p className="title">Error loading episodes</p>;
  if (!data) return <p className="title">No data found</p>;

  return (
    <main className="container">
      <h1 className="title">Episodes</h1>

      <div className="episodes-grid">
        {data.episodes.results.map((ep) => (
          <Link
            key={ep.id}
            href={`/episode/${ep.id}`}
            className="episode-card"
          >
            {/* Episode code badge */}
            <span className="episode-badge">{ep.episode}</span>

            {/* Episode name */}
            <h3 className="episode-title">{ep.name}</h3>
          </Link>
        ))}
      </div>
    </main>
  );
}
