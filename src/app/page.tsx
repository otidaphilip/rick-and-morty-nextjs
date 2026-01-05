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

export default function HomePage() {
  const { data, loading, error } = useQuery(GET_CHARACTERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading characters</p>;

  return (
    <main>
      <h1>Rick and Morty Characters</h1>
      <div>
        {data.characters.results.map((char: any) => (
          <Link key={char.id} href={`/character/${char.id}`}>
            <img src={char.image} width={150} alt={char.name} />
            <p>{char.name}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
