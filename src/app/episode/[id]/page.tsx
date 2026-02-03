"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

/* ---------- STATES ---------- */
function LoadingState() {
  return <p>Loading episode...</p>;
}

function ErrorState({ message }: { message?: string }) {
  return <p style={{ color: "red" }}>{message ?? "Error loading episode"}</p>;
}

function EmptyState({ message }: { message?: string }) {
  return <p>{message ?? "No episode found"}</p>;
}

/* ---------- MAIN COMPONENT ---------- */
export default function EpisodePage() {
  const params = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) {
      setError("Invalid episode ID");
      setLoading(false);
      return;
    }

    const fetchEpisode = async () => {
      try {
        const res = await fetch("https://rickandmortyapi.com/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
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
            `,
            variables: { id: Number(params.id) },
          }),
        });

        const json = await res.json();
        if (!json.data?.episode) {
          setEpisode(null);
        } else {
          setEpisode(json.data.episode);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch episode");
      } finally {
        setLoading(false);
      }
    };

    fetchEpisode();
  }, [params?.id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!episode) return <EmptyState />;

  const { name, episode: epCode, air_date, characters } = episode;

  return (
    <main className="page-episode-detail">
      <div className="container">
        {/* BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/episodes">← Back to Episode List</Link>
        </div>

        {/* EPISODE HEADER */}
        <h1>{name ?? "Untitled Episode"}</h1>
        <p>
          Code: {epCode ?? "Unknown"} | Air Date: {air_date ?? "Unknown"}
        </p>

        {/* CHARACTERS */}
        <h2>Characters Appeared</h2>
        {characters.length === 0 ? (
          <EmptyState message="No characters appeared in this episode" />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "10px" }}>
            {characters.map((char) => (
              <div key={char.id} style={{ textAlign: "center" }}>
                <Image
                  src={char.image ?? "/placeholder-character.png"}
                  alt={char.name ?? "Unknown Character"}
                  width={140}
                  height={140}
                  style={{ borderRadius: "12px" }}
                />
                <p>{char.name ?? "Unknown Character"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
