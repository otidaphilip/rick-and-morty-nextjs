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

    // 🔍 Filter characters by name
  const filteredCharacters = data.characters.results.filter((char) =>
    char.name.toLowerCase().includes(search.toLowerCase())
  );

return (
  <main className="page-characters">
    <div className="container">
      <h1 className="title">Rick and Morty Characters</h1>

      {/* View Episodes Button */}
      <div className="view-episodes-wrapper">
        <Link href="/episodes" className="view-episodes-btn">
          View Episodes
        </Link>
      </div>

      {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Search character..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        {/* Character Grid */}
      <div className="character-grid">
        {data.characters.results.map((char) => (
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
            <div className="character-name">
              {char.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  </main>
);
}
