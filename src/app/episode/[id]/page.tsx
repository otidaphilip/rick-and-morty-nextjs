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
  name: string;
  image: string;
}

interface Episode {
  name: string;
  episode: string;
  air_date: string;
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

  /* ---------- INITIAL LOADING ---------- */
  if (loading && !data) {
    return <p className="title">Loading...</p>;
  }

  /* ---------- NO DATA (IMPORTANT FIX) ---------- */
  if (!data || !data.episode) {
    return <p className="title">Episode not found</p>;
  }

  /* ---------- SAFE: episode is GUARANTEED here ---------- */
  const ep = data.episode;

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
            <span className="episode-badge">{ep.episode}</span>
            <h1 className="episode-title">{ep.name}</h1>
            <p className="episode-airdate">
              Air Date: {ep.air_date}
            </p>
          </div>
        </div>

        {/* CHARACTERS */}
        <section className="episode-characters">
          <h2 className="section-title">Characters Appeared</h2>

          <div className="episode-character-grid">
            {ep.characters.map((char) => (
              <div
                key={char.id}
                className="episode-character-card"
              >
                <Image
                  src={char.image}
                  alt={char.name}
                  width={140}
                  height={140}
                  className="episode-character-image"
                />
                <span className="episode-character-name">
                  {char.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
