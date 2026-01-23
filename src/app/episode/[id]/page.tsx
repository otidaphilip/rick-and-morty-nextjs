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

/* ================= LOADING COMPONENT ================= */
function LoadingState() {
  return (
    <div className="loading-state">
      <p className="title">Loading episode...</p>
      <div className="skeleton-grid">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-card"></div>
        ))}
      </div>
      <style jsx>{`
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .skeleton-card {
          height: 140px;
          border-radius: 12px;
          background: linear-gradient(
            90deg,
            rgba(200, 200, 200, 0.2) 25%,
            rgba(200, 200, 200, 0.35) 50%,
            rgba(200, 200, 200, 0.2) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ================= ERROR COMPONENT ================= */
function ErrorState({ message }: { message?: string }) {
  return <p className="title error">{message ?? "Error loading episode"}</p>;
}

/* ================= EMPTY COMPONENT ================= */
function EmptyState({ message }: { message?: string }) {
  return <p className="title empty">{message ?? "No episode found"}</p>;
}

/* ================= MAIN COMPONENT ================= */
export default function EpisodePage() {
  const params = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<EpisodeData>(GET_EPISODE, {
    variables: { id: params.id },
  });

  /* ---------- ERROR ---------- */
  if (error) return <ErrorState message="Failed to load episode" />;

  /* ---------- LOADING ---------- */
  if (loading && !data) return <LoadingState />;

  /* ---------- NO DATA ---------- */
  if (!data || !data.episode) return <EmptyState />;

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

          {characters.length === 0 ? (
            <EmptyState message="No characters appeared in this episode" />
          ) : (
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
          )}
        </section>
      </div>
    </main>
  );
}
