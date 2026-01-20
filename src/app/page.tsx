"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ================= GRAPHQL QUERY ================= */
const GET_CHARACTERS = gql`
  query GetCharacters($page: Int, $name: String) {
    characters(page: $page, filter: { name: $name }) {
      info {
        next
      }
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

/* ================= TYPES ================= */
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
    info: {
      next: number | null;
    };
    results: Character[];
  };
}

/* ================= COMPONENT ================= */
export default function HomePage() {
  /* ---------- UI STATE ---------- */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [species, setSpecies] = useState("all");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");

  /* ---------- APOLLO QUERY ---------- */
  const { data, loading, error, fetchMore, refetch } =
    useQuery<CharactersData>(GET_CHARACTERS, {
      variables: {
        page: 1,
        name: "",
      },
      notifyOnNetworkStatusChange: true,
    });

  /* ---------- DEBOUNCE EFFECT ---------- */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // debounce delay (ms)

    return () => clearTimeout(timeout);
  }, [search]);

  /* ---------- TRIGGER SEARCH AFTER DEBOUNCE ---------- */
  useEffect(() => {
    refetch({
      page: 1,
      name: debouncedSearch || "",
    });
  }, [debouncedSearch, refetch]);

  if (loading && !data) return <p>Loading...</p>;
  if (error) return <p>Error loading characters</p>;

  const characters = data?.characters.results ?? [];

  /* ---------- CLIENT-SIDE FILTERS ---------- */
  const filteredCharacters = characters.filter((char) => {
    const matchesSpecies =
      species === "all" || char.species === species;

    const matchesGender =
      gender === "all" || char.gender === gender;

    const matchesStatus =
      status === "all" || char.status === status;

    return matchesSpecies && matchesGender && matchesStatus;
  });

  /* ---------- LOAD MORE ---------- */
  const loadMoreCharacters = () => {
    if (!data?.characters.info.next) return;

    fetchMore({
      variables: {
        page: data.characters.info.next,
        name: debouncedSearch || "",
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const merged = [
          ...prev.characters.results,
          ...fetchMoreResult.characters.results,
        ];

        // Deduplicate by ID
        const uniqueResults = Array.from(
          new Map(merged.map((c) => [c.id, c])).values()
        );

        return {
          characters: {
            info: fetchMoreResult.characters.info,
            results: uniqueResults,
          },
        };
      },
    });
  };

  /* ---------- UI ---------- */
  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        {/* TOOLBAR */}
        <div className="characters-toolbar">
          <div className="toolbar-left">
            <Link href="/episodes" className="view-episodes-btn">
              View Episodes
            </Link>

            <div className="filters">
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="all">All Species</option>
                <option value="Human">Human</option>
                <option value="Alien">Alien</option>
                <option value="Animal">Animal</option>
                <option value="Mythological Creature">Mythological Creature</option>
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

        {/* LOAD MORE (DISABLED DURING SEARCH) */}
        {!debouncedSearch && data?.characters.info.next && (
          <button
            onClick={loadMoreCharacters}
            className="load-more-btn"
          >
            Load More Characters
          </button>
        )}
      </div>
    </main>
  );
}
