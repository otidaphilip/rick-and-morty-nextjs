"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

const GET_CHARACTERS = gql`
  query GetCharacters {
    characters {
      results {
        id
        name
        image
      }
    }
  }
`;

interface Character {
  id: string;
  name: string;
  image: string;
}

interface CharactersData {
  characters: {
    results: Character[];
  };
}

export default function HomePage() {
  const { data, loading, error } =
    useQuery<CharactersData>(GET_CHARACTERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading characters</p>;
  if (!data) return <p>No data</p>;

  return (
    <main>
      <h1>Rick and Morty Characters</h1>
      <div>
        {data.characters.results.map((char) => (
          <Link key={char.id} href={`/character/${char.id}`}>
            <img src={char.image} width={150} alt={char.name} />
            <p>{char.name}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
