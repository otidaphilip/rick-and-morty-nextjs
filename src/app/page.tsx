"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

/* ================= GRAPHQL QUERY ================= */
const GET_CHARACTERS = gql`
  query GetCharacters($page: Int, $name: String) {
    characters(page: $page, filter: { name: $name }) {
      info {
        pages
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
  name?: string | null;
  image?: string | null;
  species?: string | null;
  gender?: string | null;
  status?: string | null;
}

interface CharactersData {
  characters: {
    info: {
      pages: number;
    };
    results: Character[];
  };
}

/* ================= COMPONENT ================= */
export default function HomePage() {
  /* ---------- UI STATE ---------- */
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---------- APOLLO QUERY ---------- */
  const { data, loading, error, fetchMore, refetch } =
    useQuery<CharactersData>(GET_CHARACTERS, {
      variables: {
        page: currentPage,
        name: debouncedSearch ?? "",
      },
      notifyOnNetworkStatusChange: true,
    });

  /* ---------- DEBOUNCE SEARCH ---------- */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  /* ---------- RESET PAGE ON SEARCH ---------- */
  useEffect(() => {
    setCurrentPage(1);
    refetch({ page: 1, name: debouncedSearch ?? "" });
  }, [debouncedSearch, refetch]);

  /* ---------- ERROR ---------- */
  if (error) {
    return <p className="title">Error loading characters</p>;
  }

  /* ---------- DATA ---------- */
  const charactersList: Character[] =
    data?.characters?.results ?? [];

  /* ---------- CLIENT-SIDE FILTERING ---------- */
  const filteredCharacters = charactersList.filter((char) => {
    const matchesSpecies =
      speciesFilter === "all" ||
      char.species === speciesFilter;

    const matchesGender =
      genderFilter === "all" ||
      char.gender === genderFilter;

    const matchesStatus =
      statusFilter === "all" ||
      char.status === statusFilter;

    return matchesSpecies && matchesGender && matchesStatus;
  });

  /* ---------- LOAD MORE ---------- */
  const loadMoreCharacters = () => {
    if (
      !data ||
      currentPage >= (data.characters.info.pages ?? 1)
    )
      return;

    const nextPage = currentPage + 1;

    fetchMore({
      variables: {
        page: nextPage,
        name: debouncedSearch ?? "",
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;

        const mergedResults = [
          ...previousResult.characters.results,
          ...fetchMoreResult.characters.results,
        ];

        const uniqueResults = Array.from(
          new Map(mergedResults.map((c) => [c.id, c])).values()
        );

        return {
          characters: {
            info: fetchMoreResult.characters.info,
            results: uniqueResults,
          },
        };
      },
    });

    setCurrentPage(nextPage);
  };

  /* ---------- UI ---------- */
  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        {/* TOOLBAR */}
        <div className="characters-toolbar">
          <div className="back-button-wrapper">
            <Link href="/episodes" className="view-episodes-btn">
              View Episodes →
            </Link>

            <div className="filters">
              <select
                value={speciesFilter}
                onChange={(e) => setSpeciesFilter(e.target.value)}
              >
                <option value="all">All Species</option>
                <option value="Human">Human</option>
                <option value="Alien">Alien</option>
                <option value="Animal">Animal</option>
                <option value="Mythological Creature">
                  Mythological Creature
                </option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Genderless">Genderless</option>
                <option value="unknown">Unknown</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
            value={searchInput}
            placeholder="🔍 Search character..."
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
        </div>

        {/* LOADING */}
        {loading && charactersList.length === 0 && (
          <p style={{ textAlign: "center" }}>Loading...</p>
        )}

        {/* CHARACTER GRID */}
        <div className="character-grid">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((char) => (
              <Link
                key={char.id}
                href={`/character/${char.id}`}
                className="character-card"
              >
                <Image
                  src={char.image ?? "/placeholder-character.png"}
                  alt={char.name ?? "Unknown character"}
                  width={170}
                  height={170}
                  className="character-image"
                />

                <div className="character-name">
                  {char.name ?? "Unknown"}
                </div>
              </Link>
            ))
          ) : (
            !loading && (
              <p
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                }}
              >
                No characters found
              </p>
            )
          )}
        </div>

        {/* LOAD MORE */}
        {debouncedSearch === "" &&
          currentPage <
            (data?.characters.info.pages ?? 1) && (
            <button
              onClick={loadMoreCharacters}
              className="load-more-btn"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Characters"}
            </button>
          )}
      </div>
    </main>
  );
}
