"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* ================= GRAPHQL QUERY ================= */
const GET_CHARACTERS = gql`
  query GetCharacters($page: Int, $name: String) {
    characters(page: $page, filter: { name: $name }) {
      info { pages }
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
    info: { pages: number };
    results: Character[];
  };
}

/* ================= REUSABLE COMPONENTS ================= */

function LoadingSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="character-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="character-card skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-text" />
        </div>
      ))}
    </div>
  );
}

function ErrorMessage({ message }: { message?: string }) {
  return (
    <p className="title" style={{ textAlign: "center", color: "#f87171" }}>
      {message ?? "Something went wrong."}
    </p>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af" }}>
      {message ?? "No results found."}
    </p>
  );
}

/* ================= MAIN CONTENT ================= */
function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("name") ?? "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ FILTER STATES (RESTORED)
  const [speciesFilter, setSpeciesFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, loading, error, fetchMore } = useQuery<CharactersData>(
    GET_CHARACTERS,
    {
      variables: { page: currentPage, name: debouncedSearch },
      notifyOnNetworkStatusChange: true,
    }
  );

  /* 🔍 DEBOUNCE SEARCH + URL UPDATE */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchInput);

      const params = new URLSearchParams(searchParams.toString());
      searchInput ? params.set("name", searchInput) : params.delete("name");

      router.replace(`?${params.toString()}`, { scroll: false });
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput, router, searchParams]);

  if (error) return <ErrorMessage message="Error loading characters." />;

  const charactersList: Character[] = data?.characters?.results ?? [];

  /* ✅ FILTER LOGIC (RESTORED) */
  const filteredCharacters = charactersList.filter((char) => {
    return (
      (speciesFilter === "all" || char.species === speciesFilter) &&
      (genderFilter === "all" || char.gender === genderFilter) &&
      (statusFilter === "all" || char.status === statusFilter)
    );
  });

  /* 📄 LOAD MORE */
  const loadMoreCharacters = () => {
    if (!data || currentPage >= data.characters.info.pages) return;

    const nextPage = currentPage + 1;

    fetchMore({
      variables: { page: nextPage, name: debouncedSearch },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          characters: {
            info: fetchMoreResult.characters.info,
            results: [
              ...prev.characters.results,
              ...fetchMoreResult.characters.results,
            ],
          },
        };
      },
    });

    setCurrentPage(nextPage);
  };

  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        {/* 🔧 TOOLBAR WITH FILTERS RESTORED */}
        <div className="characters-toolbar">
          <div className="back-button-wrapper">
            <Link href="/episodes" className="view-episodes-btn">
              View Episodes →
            </Link>

            <div className="filters">
              <select value={speciesFilter} onChange={(e) => setSpeciesFilter(e.target.value)}>
                <option value="all">All Species</option>
                <option value="Human">Human</option>
                <option value="Alien">Alien</option>
                <option value="Animal">Animal</option>
                <option value="Mythological Creature">Mythological Creature</option>
              </select>

              <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Genderless">Genderless</option>
                <option value="unknown">Unknown</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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

        {/* CHARACTER GRID */}
        {loading && charactersList.length === 0 ? (
          <LoadingSkeleton />
        ) : filteredCharacters.length > 0 ? (
          <div className="character-grid">
            {filteredCharacters.map((char) => (
              <Link key={char.id} href={`/character/${char.id}`} className="character-card">
                <Image
                  src={char.image ?? "/placeholder-character.png"}
                  alt={char.name ?? "Unknown character"}
                  width={170}
                  height={170}
                  className="character-image"
                />
                <div className="character-name">{char.name ?? "Unknown"}</div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState message="No characters found matching your filters." />
        )}

        {/* LOAD MORE */}
        {debouncedSearch === "" &&
          currentPage < (data?.characters.info.pages ?? 1) && (
            <button onClick={loadMoreCharacters} className="load-more-btn" disabled={loading}>
              {loading ? "Loading..." : "Load More Characters"}
            </button>
          )}
      </div>
    </main>
  );
}

/* ================= PAGE EXPORT WITH SUSPENSE ================= */
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
