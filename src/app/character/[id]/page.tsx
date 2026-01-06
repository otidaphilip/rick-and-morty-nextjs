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

interface Character {
  name: string;
  status: string;
  species: string;
  image: string;
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading character</p>;
  if (!data) return <p>No data</p>;

  const char = data.character;

  return (
    <div>
      <h1>{char.name}</h1>
      <img src={char.image} width={200} alt={char.name} />
      <p>Status: {char.status}</p>
      <p>Species: {char.species}</p>

      <h2>Episodes</h2>
      <ul>
        {char.episode.map((ep) => (
          <li key={ep.id}>{ep.name}</li>
        ))}
      </ul>
    </div>
  );
}
