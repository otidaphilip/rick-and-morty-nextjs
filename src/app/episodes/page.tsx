"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

// GraphQL query
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

// TypeScript types
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading episodes</p>;

  return (
    <div>
      <h1>Episodes</h1>
      {data!.episodes.results.map((ep) => (
        <Link key={ep.id} href={`/episode/${ep.id}`}>
          <p>
            {ep.episode} - {ep.name}
          </p>
        </Link>
      ))}
    </div>
  );
}
