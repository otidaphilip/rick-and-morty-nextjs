"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ================= GRAPHQL QUERY ================= */
const GET_EPISODE = gql`
  query GetEpisode($id: ID!) {
    episode(id: $id) {
      name
      episode
      air_date
      characters {
        id
        name
        image
      }
    }
  }
`;

/* ================= TYPES ================= */
interface Character {
  id: string;
  name?: string | null;
  image?: string | null;
}

interface Episode {
  name?: string | null;
  episode?: string | null;
  air_date?: string | null;
  characters: Character[];
}

interface EpisodeData {
  episode: Episode | null;
}

/* ================= COMPONENT ================= */
export default function EpisodePage() {
  const params = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<EpisodeData>(GET_EPISODE, {
    variables: { id: params.id },
  });

  /* ---------- ERROR ---------- */
  if (error) {
    return <p className="title">Error loading episode</p>;
  }

  /* ---------- LOADING ---------- */
  if (loading && !data) {
    return <p className="title">Loading...</p>;
  }

  /* ---------- NO DATA ---------- */
  if (!data || !data.episode) {
    return <p className="title">Episode not found</p>;
  }

  /* ---------- DESTRUCTURE FIELDS ---------- */
  const { name, episode: epCode, air_date, characters } = data.episode;

  return (
    <main className="page-episode-detail">
      <div className="container">
        {/* BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/episodes" className="view-episodes-btn">
            ← Back to Episode List
          </Link>
        </div>

        {/* EPISODE HEADER */}
        <div className="episode-detail-card">
          <div className="episode-header">
            <span className="episode-badge">{epCode ?? "Unknown Episode"}</span>
            <h1 className="episode-title">{name ?? "Untitled Episode"}</h1>
            <p className="episode-airdate">Air Date: {air_date ?? "Unknown"}</p>
          </div>
        </div>

        {/* CHARACTERS */}
        <section className="episode-characters">
          <h2 className="section-title">Characters Appeared</h2>

          <div className="episode-character-grid">
            {characters.map((character) => (
              <div key={character.id} className="episode-character-card">
                <Image
                  src={character.image ?? "/placeholder-character.png"}
                  alt={character.name ?? "Unknown Character"}
                  width={140}
                  height={140}
                  className="episode-character-image"
                />
                <span className="episode-character-name">
                  {character.name ?? "Unknown Character"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
