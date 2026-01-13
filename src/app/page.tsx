"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useState } from "react";

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
  const { data, loading, error } = useQuery<CharactersData>(GET_CHARACTERS);
  const [search, setSearch] = useState("");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading characters</p>;
  if (!data) return <p>No data</p>;

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCharacters = data.characters.results.filter((char) =>
    char.name.toLowerCase().includes(normalizedSearch)
  );

  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        {/* Toolbar */}
<div className="characters-toolbar">
  <Link href="/episodes" className="view-episodes-btn">
    View Episodes
  </Link>

  <input
    type="text"
    value={search}
    placeholder="🔍 Search character..."
    onChange={(e) => setSearch(e.target.value)}
    className="search-input"
  />
</div>
        {/* GRID */}
        <div className="character-grid">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((char) => (
              <Link
                key={char.id}
                href={`/character/${char.id}`}
                className="character-card"
              >
                <img
                  src={char.image}
                  alt={char.name}
                  className="character-image"
                />
                <div className="character-name">{char.name}</div>
              </Link>
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
              No characters found
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
