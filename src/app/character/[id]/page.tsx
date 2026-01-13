"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Image from "next/image";

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

export default function CharacterPage() {
  const params = useParams<{ id: string }>();

  const { data, loading, error } = useQuery<CharacterData>(
    GET_CHARACTER,
    {
      variables: { id: params.id },
    }
  );

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">Error loading character</p>;
  if (!data) return <p>No data</p>;

  const char = data.character;

  return (
    <main className="page-character-detail">
      <div className="container">
        {/* CHARACTER CARD */}
        <div className="character-card1">
          {/* LEFT IMAGE */}
          <div className="character-image-wrapper">
            <Image
              src={char.image}
              alt={char.name}
              width={260}
              height={260}
              className="character-image1"
              priority
            />
          </div>

          {/* RIGHT INFO */}
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

        {/* EPISODES */}
        <section className="episodes-section">
          <h2 className="section-title">Episodes Appeared In</h2>

          <div className="episodes-grid">
            {char.episode.map((ep, index) => (
              <div key={ep.id} className="episode-card">
                <span className="episode-title">
                  S{String(Math.floor(index / 10) + 1).padStart(2, "0")}
                  E{String(index + 1).padStart(2, "0")}: {ep.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
