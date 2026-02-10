import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ================= TYPES ================= */
interface Character {
  id: string;
  name?: string | null;
  image?: string | null;
}

interface Episode {
  name?: string | null;
  episode?: string | null;
  air_date?: string | null;
  characters: Character[];
}

/* ================= GRAPHQL QUERY ================= */
const GET_EPISODE = `
  query GetEpisode($id: ID!) {
    episode(id: $id) {
      name
      episode
      air_date
      characters {
        id
        name
        image
      }
    }
  }
`;

/* ================= SERVER FETCH ================= */
async function getEpisode(id: string): Promise<Episode | null> {
  try {
    const res = await fetch("https://rickandmortyapi.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GET_EPISODE,
        variables: { id: String(id) },
      }),
      cache: "no-store",
    });

    const json = await res.json();
    if (!json.data?.episode) return null;

    return json.data.episode;
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}

/* ================= PAGE ================= */
export default async function EpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const episode = await getEpisode(id);

  if (!episode) notFound();

  const { name, episode: epCode, air_date, characters } = episode;

  return (
    <main className="page-episode-detail">
      <div className="container">
        <div className="back-button-wrapper">
          <Link href="/episodes" className="view-episodes-btn">
            ← Back to Episodes
          </Link>
        </div>

        {/* ================= EPISODE HEADER ================= */}
        <div className="episode-hero-card">
          <h1 className="episode-hero-title">{name}</h1>

          <div className="episode-meta-grid">
            <div className="meta-pill">
              <span>Episode Code</span>
              <strong>{epCode}</strong>
            </div>

            <div className="meta-pill">
              <span>Air Date</span>
              <strong>{air_date}</strong>
            </div>

            <div className="meta-pill">
              <span>Duration</span>
              <strong>22 min</strong>
            </div>

            <div className="meta-pill">
              <span>Characters</span>
              <strong>{characters.length}</strong>
            </div>
          </div>
        </div>

        {/* ================= CHARACTERS SECTION ================= */}
        <h2 className="characters-section-title">Characters Appeared</h2>

        <div className="episode-character-grid">
          {characters.map((char) => (
            <Link
              key={char.id}
              href={`/character/${char.id}`}
              className="episode-character-card"
            >
              <Image
                src={char.image ?? "/placeholder-character.png"}
                alt={char.name ?? "Unknown Character"}
                width={170}
                height={170}
                className="episode-character-image"
              />
              <div className="episode-character-name">{char.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}