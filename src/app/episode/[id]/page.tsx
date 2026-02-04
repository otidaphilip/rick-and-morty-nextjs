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
      cache: "no-store", // safer for dynamic pages
    });

    const json = await res.json();

    if (!json.data?.episode) return null;

    return json.data.episode;
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}

/* ================= PAGE (SSR) ================= */
export default async function EpisodePage({
  params,
}: {
  params: Promise<{ id: string }>; // ⚠️ IMPORTANT FIX
}) {
  const { id } = await params; // ⚠️ MUST AWAIT PARAMS

  const episode = await getEpisode(id);

  if (!episode) notFound();

  const { name, episode: epCode, air_date, characters } = episode;

  return (
    <main className="page-episode-detail">
      <div className="container">
        <div className="back-button-wrapper">
          <Link href="/episodes">← Back to Episode List</Link>
        </div>

        <h1>{name}</h1>
        <p>
          Code: {epCode} | Air Date: {air_date}
        </p>

        <h2>Characters Appeared</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          {characters.map((char) => (
            <div key={char.id} style={{ textAlign: "center" }}>
              <Image
                src={char.image ?? "/placeholder-character.png"}
                alt={char.name ?? "Unknown Character"}
                width={140}
                height={140}
                style={{ borderRadius: "12px" }}
              />
              <p>{char.name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
