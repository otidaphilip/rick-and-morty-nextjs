import Link from "next/link";
import Image from "next/image";
import CharacterFilters from "@/components/CharacterFilters";

// Updated fetcher to include all filter parameters
async function getCharacters(page: number, name: string, species: string, gender: string, status: string) {
  const res = await fetch("https://rickandmortyapi.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetCharacters($page: Int, $filter: FilterCharacter) {
          characters(page: $page, filter: $filter) {
            info { pages }
            results { id name image species gender status }
          }
        }
      `,
      variables: { 
        page, 
        filter: { 
          name: name || null,
          species: species === "all" ? null : species,
          gender: gender === "all" ? null : gender,
          status: status === "all" ? null : status
        } 
      },
    }),
    cache: "no-store",
  });

  const json = await res.json();
  // Handle cases where no characters are found (API returns null)
  return json.data?.characters || { info: { pages: 0 }, results: [] };
}

export default async function HomePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ name?: string, species?: string, gender?: string, status?: string, page?: string }> 
}) {
  const params = await searchParams;
  const currentPage = Number(params.page ?? "1");
  const searchName = params.name ?? "";
  const speciesFilter = params.species ?? "all";
  const genderFilter = params.gender ?? "all";
  const statusFilter = params.status ?? "all";

  // Fetch only the relevant data from the server
  const charactersData = await getCharacters(
    currentPage, 
    searchName, 
    speciesFilter, 
    genderFilter, 
    statusFilter
  );

  return (
    <main className="page-characters">
      <div className="container">
        <h1 className="title">Rick and Morty Characters</h1>

        <CharacterFilters />

        <div className="character-grid">
          {charactersData.results.length > 0 ? (
            charactersData.results.map((char: any) => (
              <Link key={char.id} href={`/character/${char.id}`} className="character-card">
                <Image 
                  src={char.image} 
                  alt={char.name} 
                  width={170} 
                  height={170} 
                  priority={currentPage === 1} 
                />
                <div className="character-name">{char.name}</div>
              </Link>
            ))
          ) : (
            <p className="no-results">No characters found matching your criteria.</p>
          )}
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