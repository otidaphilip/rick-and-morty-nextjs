"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      pages: number;
    };
    results: Character[];
  };
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearch = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const [species, setSpecies] = useState("all");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");

  const { data, loading, error, fetchMore, refetch } =
    useQuery<CharactersData>(GET_CHARACTERS, {
      variables: { page: 1, name: initialSearch },
      notifyOnNetworkStatusChange: true,
    });

  // debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  // update URL safely inside useEffect
  useEffect(() => {
    setPage(1);
    refetch({ page: 1, name: debouncedSearch || "" });

    // Update URL using router.push inside effect (safe for Vercel)
    const query = debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : "";
    router.replace("/" + query, { scroll: false });
  }, [debouncedSearch, refetch, router]);

  if (error) return <p>Error loading characters</p>;

  const characters = data?.characters.results ?? [];

  const filteredCharacters = characters.filter((char) => {
    const matchesSpecies = species === "all" || char.species === species;
    const matchesGender = gender === "all" || char.gender === gender;
    const matchesStatus = status === "all" || char.status === status;
    return matchesSpecies && matchesGender && matchesStatus;
  });

  const loadMoreCharacters = () => {
    if (!data || page >= data.characters.info.pages) return;

    const nextPage = page + 1;

    fetchMore({
      variables: { page: nextPage, name: debouncedSearch || "" },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const merged = [
          ...prev.characters.results,
          ...fetchMoreResult.characters.results,
        ];

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

    setPage(nextPage);
  };

  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        <div className="characters-toolbar">
          <div className="back-button-wrapper">
            <Link href="/episodes" className="view-episodes-btn">
              View Episodes
            </Link>

            <div className="filters">
              <select value={species} onChange={(e) => setSpecies(e.target.value)}>
                <option value="all">All Species</option>
                <option value="Human">Human</option>
                <option value="Alien">Alien</option>
                <option value="Animal">Animal</option>
                <option value="Mythological Creature">Mythological Creature</option>
              </select>

              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Genderless">Genderless</option>
                <option value="unknown">Unknown</option>
              </select>

              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Alive">Alive</option>
                <option value="Dead">Dead</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            value={search}
            placeholder="🔍 Search character..."
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {loading && characters.length === 0 && (
          <p style={{ textAlign: "center" }}>Loading...</p>
        )}

        <div className="character-grid">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((char) => (
              <Link key={char.id} href={`/character/${char.id}`} className="character-card">
                <img src={char.image} alt={char.name} className="character-image" />
                <div className="character-name">{char.name}</div>
              </Link>
            ))
          ) : (
            !loading && (
              <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
                No characters found
              </p>
            )
          )}
        </div>

        {!debouncedSearch && page < (data?.characters.info.pages ?? 1) && (
          <button onClick={loadMoreCharacters} className="load-more-btn" disabled={loading}>
            {loading ? "Loading..." : "Load More Characters"}
          </button>
        )}
      </div>
    </main>
  );
}
