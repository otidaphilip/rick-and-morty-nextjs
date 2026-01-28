import Link from "next/link";
import Image from "next/image";
import CharacterFilters from "@/components/CharacterFilters";

/* ================= SERVER FETCH ================= */
async function getCharacters(page: number, name: string) {
  const res = await fetch("https://rickandmortyapi.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
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
      `,
      variables: { page, name },
    }),
    cache: "no-store",
  });

  const json = await res.json();
  return json.data.characters;
}

/* ================= PAGE (SERVER) ================= */
export default async function HomePage({ searchParams }: any) {
  const currentPage = Number(searchParams.page) || 1;
  const searchName = searchParams.name || "";
  const speciesFilter = searchParams.species || "all";
  const genderFilter = searchParams.gender || "all";
  const statusFilter = searchParams.status || "all";

  const charactersData = await getCharacters(currentPage, searchName);

  const filteredCharacters = charactersData.results.filter((char: any) => {
    return (
      (speciesFilter === "all" || char.species === speciesFilter) &&
      (genderFilter === "all" || char.gender === genderFilter) &&
      (statusFilter === "all" || char.status === statusFilter)
    );
  });

  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters (SSR)</h1>

        {/* ✅ CLIENT FILTERS COMPONENT */}
        <CharacterFilters />

        <div className="character-grid">
          {filteredCharacters.map((char: any) => (
            <Link key={char.id} href={`/character/${char.id}`} className="character-card">
              <Image
                src={char.image}
                alt={char.name}
                width={170}
                height={170}
                className="character-image"
              />
              <div className="character-name">{char.name}</div>
            </Link>
          ))}
        </div>

        {currentPage < charactersData.info.pages && (
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Link
              href={`?page=${currentPage + 1}&name=${searchName}&species=${speciesFilter}&gender=${genderFilter}&status=${statusFilter}`}
              className="load-more-btn"
            >
              Load More Characters →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
