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
        species
        gender
        status
      }
    }
  }
`;

interface Character {
  id: string;
  name: string;
  image: string;
  species: string;
  gender: string;
  status: string;
}

interface CharactersData {
  characters: {
    results: Character[];
  };
}

export default function HomePage() {
  const { data, loading, error } = useQuery<CharactersData>(GET_CHARACTERS);

  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("all");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading characters</p>;
  if (!data) return <p>No data</p>;

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCharacters = data.characters.results.filter((char) => {
    const matchesSearch = char.name
      .toLowerCase()
      .includes(normalizedSearch);

    const matchesSpecies =
      species === "all" || char.species === species;

    const matchesGender =
      gender === "all" || char.gender === gender;

    const matchesStatus =
      status === "all" || char.status === status;

    return (
      matchesSearch &&
      matchesSpecies &&
      matchesGender &&
      matchesStatus
    );
  });

  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        {/* TOOLBAR */}
        <div className="characters-toolbar">
          {/* LEFT SIDE */}
          <div className="toolbar-left">
            <Link href="/episodes" className="view-episodes-btn">
              <center>View Episodes</center>
            </Link>

            {/* FILTER DROPDOWNS */}
            <div className="filters">
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="all">All Species</option>
                <option value="Human">Human</option>
                <option value="Alien">Alien</option>
              </select>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Genderless">Genderless</option>
                <option value="unknown">Unknown</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Alive">Alive</option>
                <option value="Dead">Dead</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* SEARCH */}
          <input
            type="text"
            value={search}
            placeholder="🔍 Search character..."
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* CHARACTER GRID */}
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
