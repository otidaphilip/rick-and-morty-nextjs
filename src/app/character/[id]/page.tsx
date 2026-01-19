"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
      }
    }
  }
`;

interface Episode {
  id: string;
  name: string;
}

interface Location {
  name: string;
}

interface Character {
  name: string;
  status: string;
  species: string;
  image: string;
  location: Location;
  episode: Episode[];
}

interface CharacterData {
  character: Character;
}

const EPISODES_PER_LOAD = 6;

export default function CharacterPage() {
  const params = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<CharacterData>(GET_CHARACTER, {
    variables: { id: params.id },
  });

  const [visibleCount, setVisibleCount] = useState(EPISODES_PER_LOAD);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* =========================
     INFINITE SCROLL
  ========================= */
  useEffect(() => {
    if (!data || !scrollContainerRef.current || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + EPISODES_PER_LOAD, data.character.episode.length)
          );
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [data]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">Error loading character</p>;
  if (!data) return <p>No data</p>;

  const char = data.character;
  const visibleEpisodes = char.episode.slice(0, visibleCount);

  return (
    <main className="page-character-detail">
      <div className="container">

        {/* 🔙 BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Characters
          </Link>
        </div>

        {/* =========================
            CHARACTER CARD
        ========================= */}
        <div className="character-card1">
          <Image
            src={char.image}
            alt={char.name}
            width={260}
            height={260}
            className="character-image1"
            priority
          />

          <div className="character-info">
            <h1 className="character-name1">{char.name}</h1>

            <div className="character-meta">
              <p>
                <span className="label">Status:</span> {char.status}
              </p>
              <p>
                <span className="label">Species:</span> {char.species}
              </p>
              <p>
                <span className="label">Last known location:</span>{" "}
                {char.location?.name}
              </p>
            </div>

            <div className="seen-info">
              <p>
                <span className="label">First seen:</span>{" "}
                {char.episode[0]?.name}
              </p>
              <p>
                <span className="label">Last seen:</span>{" "}
                {char.episode[char.episode.length - 1]?.name}
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            EPISODES SECTION
        ========================= */}
        <section className="episodes-section">
          <h2 className="section-title">Episodes Appeared In</h2>

          {/* Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="episodes-scroll-container"
          >
            <div className="episodes-grid">
              {visibleEpisodes.map((ep, index) => (
                <div key={ep.id} className="episode-card">
                  <span className="episode-title">
                    E{String(index + 1).padStart(2, "0")}: {ep.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Sentinel */}
            {visibleCount < char.episode.length && (
              <div ref={loadMoreRef} style={{ height: 1 }} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
