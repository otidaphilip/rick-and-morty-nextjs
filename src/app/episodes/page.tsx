import Link from "next/link";

/* ================= TYPES ================= */
type Episode = {
  id: string;
  name?: string | null;
  episode?: string | null;
};

type EpisodesResponse = {
  data: {
    episodes: {
      info: { next?: number | null };
      results: Episode[];
    };
  };
};

/* ================= SERVER FETCH ================= */
async function getEpisodes(page: number) {
  const res = await fetch("https://rickandmortyapi.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetEpisodes($page: Int!) {
          episodes(page: $page) {
            info { next }
            results { id name episode }
          }
        }
      `,
      variables: { page },
    }),
    cache: "no-store", // 🔥 Forces SSR
  });

  const json: EpisodesResponse = await res.json();
  return json.data.episodes;
}

/* ================= SSR PAGE ================= */
export default async function EpisodesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;

  const episodesData = await getEpisodes(currentPage);
  const episodes = episodesData.results;

  if (!episodes || episodes.length === 0) {
    return (
      <main className="page-episodes">
        <div className="container">
          <h1 className="title">Episodes</h1>
          <p className="title">No episodes found.</p>
        </div>
      </main>
    );
  }

  /* ---------- GROUP BY SEASON (SERVER SIDE) ---------- */
  const seasonsMap = episodes.reduce<Record<string, Episode[]>>((acc, ep) => {
    const season = ep.episode?.slice(0, 3) ?? "S00";
    acc[season] = acc[season] ?? [];
    acc[season].push(ep);
    return acc;
  }, {});

  const seasonKeys = Object.keys(seasonsMap).sort();

  return (
    <main className="page-episodes">
      <div className="container">
        <h1 className="title">Episodes (SSR)</h1>

        {/* BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Character List
          </Link>
        </div>

        {/* SEASONS */}
        {seasonKeys.map((season) => (
          <section key={season} style={{ marginBottom: "60px" }}>
            <h2 className="section-title">
              Season {season.replace("S", "")}
            </h2>

            <div className="episodes-grid">
              {seasonsMap[season].map((ep) => (
                <Link
                  key={ep.id}
                  href={`/episode/${ep.id}`}
                  className="episode-card"
                >
                  <div className="episode-code">{ep.episode ?? "N/A"}</div>
                  <div className="episode-name">{ep.name ?? "Untitled"}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* ✅ SSR LOAD MORE */}
        {episodesData.info.next && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link
              href={`?page=${episodesData.info.next}`}
              className="load-more-btn"
            >
              Load More Episodes →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
