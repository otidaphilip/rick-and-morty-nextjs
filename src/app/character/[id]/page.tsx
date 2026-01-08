"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";

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
  const params = useParams();

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
<div className="character-page">
  {/* CHARACTER CARD */}
  <div className="character-card">
    {/* LEFT: IMAGE */}
    <div className="character-image-wrapper">
      <img
        src={char.image}
        alt={char.name}
        className="character-image"
      />
    </div>

    {/* RIGHT: INFO */}
    <div className="character-info">
      <h1 className="character-name">{char.name}</h1>

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
    <h2>Episodes Appeared In</h2>

    <div className="episodes-grid">
      {char.episode.map((ep) => (
        <div key={ep.id} className="episode-card">
          <span className="episode-title">{ep.name}</span>
        </div>
      ))}
    </div>
  </section>
</div>

);

}
