"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ================= GRAPHQL QUERY ================= */
const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      name
      status
      species
      image
      location {
        name
      }
      episode {
        id
        name
        episode
      }
    }
  }
`;

/* ================= TYPES ================= */
interface Episode {
  id: string;
  name: string;
  episode: string; // e.g. "S01E01"
}

interface Location {
  name?: string | null;
}

interface Character {
  name?: string | null;
  status?: string | null;
  species?: string | null;
  image?: string | null;
  location?: Location | null;
  episode?: Episode[] | null;
}

interface CharacterData {
  character: Character | null;
}

/* ================= STATE COMPONENTS ================= */
const LoadingState = () => (
  <div className="title">
    {/* Simple skeleton placeholder */}
    <p>Loading character details...</p>
  </div>
);

const ErrorState = () => (
  <div className="title">
    <p>Error loading character. Please try again.</p>
  </div>
);

const EmptyState = ({ message }: { message?: string }) => (
  <div className="title">
    <p>{message ?? "No data available."}</p>
  </div>
);

/* ================= COMPONENT ================= */
export default function CharacterPage() {
  const params = useParams<{ id: string }>();
  const { data, loading, error } = useQuery<CharacterData>(GET_CHARACTER, {
    variables: { id: params.id },
  });

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState />;

  const character = data?.character;
  if (!character) return <EmptyState message="Character not found" />;

  const episodesAppeared = character.episode ?? [];

  return (
    <main className="page-character-detail">
      <div className="container">
        {/* BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Character List
          </Link>
        </div>

        {/* CHARACTER & EPISODES LAYOUT */}
        <div className="character-layout">
          {/* LEFT SIDE – CHARACTER DETAILS */}
          <div className="character-left">
            <div className="character-card1">
              <Image
                src={character.image ?? "/placeholder-character.png"}
                alt={character.name ?? "Unknown Character"}
                width={260}
                height={260}
                className="character-image1"
                priority
              />

              <div className="character-info">
                <h1 className="character-name1">
                  {character.name ?? "Unknown Character"}
                </h1>

                <div className="character-meta">
                  <p>
                    <span className="label">Status:</span>{" "}
                    {character.status ?? "Unknown"}
                  </p>
                  <p>
                    <span className="label">Species:</span>{" "}
                    {character.species ?? "Unknown"}
                  </p>
                  <p>
                    <span className="label">Last known location:</span>{" "}
                    {character.location?.name ?? "Unknown"}
                  </p>
                </div>

                <div className="seen-info">
                  <p>
                    <span className="label">First seen:</span>{" "}
                    {episodesAppeared[0]?.name ?? "Unknown"}
                  </p>
                  <p>
                    <span className="label">Last seen:</span>{" "}
                    {episodesAppeared[episodesAppeared.length - 1]?.name ?? "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – EPISODES */}
          <div className="character-right">
            <section className="episodes-section">
              <h2 className="section-title">Episodes Appeared In</h2>

              {episodesAppeared.length === 0 ? (
                <EmptyState message="This character has not appeared in any episodes." />
              ) : (
                <div className="episodes-grid">
                  {episodesAppeared.map((ep) => {
                    const episodeCode = ep.episode ?? "??";
                    const seasonNumber = episodeCode.match(/S(\d+)E\d+/)?.[1] ?? "??";

                    return (
                      <div key={ep.id} className="episode-card">
                        <span className="episode-title">{ep.name ?? "Unknown Episode"}</span>
                        <span className="episode-season">
                          Season {seasonNumber} – {episodeCode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
