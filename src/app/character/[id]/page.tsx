import Image from "next/image";
import Link from "next/link";

/* ================= GRAPHQL QUERY ================= */
const GET_CHARACTER = `
  query GetCharacter($id: ID!) {
    character(id: $id) {
      name
      status
      species
      image
      location {
        name
      }
      episode {
        id
        name
        episode
      }
    }
  }
`;

/* ================= TYPES ================= */
interface Episode {
  id: string;
  name: string;
  episode: string;
}

interface Location {
  name?: string | null;
}

interface Character {
  name?: string | null;
  status?: string | null;
  species?: string | null;
  image?: string | null;
  location?: Location | null;
  episode?: Episode[] | null;
}

/* ================= SERVER FETCH ================= */
async function getCharacter(id: string): Promise<Character | null> {
  try {
    const res = await fetch("https://rickandmortyapi.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GET_CHARACTER,
        variables: { id: Number(id) }, // ✅ important: numeric ID
      }),
      next: { revalidate: 60 }, // ISR (re-fetch every 60s)
    });

    const json = await res.json();
    return json.data?.character ?? null;
  } catch (err) {
    console.error("Character fetch error:", err);
    return null;
  }
}

/* ================= PAGE (SSR) ================= */
export default async function CharacterPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  if (!id || isNaN(Number(id))) {
    return (
      <div className="title">
        <p>Invalid character ID.</p>
        <Link href="/">← Back to Character List</Link>
      </div>
    );
  }

  const character = await getCharacter(id);

  if (!character) {
    return (
      <div className="title">
        <p>Character not found.</p>
        <Link href="/">← Back to Character List</Link>
      </div>
    );
  }

  const episodesAppeared = character.episode ?? [];

  return (
    <main className="page-character-detail">
      <div className="container">
        {/* BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Character List
          </Link>
        </div>

        <div className="character-layout">
          {/* LEFT SIDE */}
          <div className="character-left">
            <div className="character-card1">
              <Image
                src={character.image ?? "/placeholder-character.png"}
                alt={character.name ?? "Unknown Character"}
                width={260}
                height={260}
                className="character-image1"
                priority
              />

              <div className="character-info">
                <h1 className="character-name1">
                  {character.name ?? "Unknown Character"}
                </h1>

                <div className="character-meta">
                  <p><span className="label">Status:</span> {character.status ?? "Unknown"}</p>
                  <p><span className="label">Species:</span> {character.species ?? "Unknown"}</p>
                  <p><span className="label">Last known location:</span> {character.location?.name ?? "Unknown"}</p>
                </div>

                <div className="seen-info">
                  <p><span className="label">First seen:</span> {episodesAppeared[0]?.name ?? "Unknown"}</p>
                  <p><span className="label">Last seen:</span> {episodesAppeared[episodesAppeared.length - 1]?.name ?? "Unknown"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="character-right">
            <section className="episodes-section">
              <h2 className="section-title">Episodes Appeared In</h2>

              {episodesAppeared.length === 0 ? (
                <p className="title">This character has not appeared in any episodes.</p>
              ) : (
                <div className="episodes-grid">
                  {episodesAppeared.map((ep) => {
                    const episodeCode = ep.episode ?? "??";
                    const seasonNumber =
                      episodeCode.match(/S(\d+)E\d+/)?.[1] ?? "??";

                    return (
                      <div key={ep.id} className="episode-card">
                        <span className="episode-title">{ep.name}</span>
                        <span className="episode-season">
                          Season {seasonNumber} – {episodeCode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}