"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ================= GRAPHQL QUERY ================= */
const GET_EPISODES = gql`
  query GetEpisodes($page: Int!) {
    episodes(page: $page) {
      info {
        next
      }
      results {
        id
        name
        episode
      }
    }
  }
`;

/* ================= TYPES ================= */
type Episode = {
  id: string;
  name?: string | null;
  episode?: string | null;
};

type EpisodesData = {
  episodes?: {
    info?: {
      next?: number | null;
    };
    results?: Episode[] | null;
  } | null;
};

/* ================= LOADING / ERROR / EMPTY COMPONENTS ================= */
const LoadingState = () => (
  <div className="loading-state">
    <p className="title">Loading episodes...</p>
    <div className="episodes-grid">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="episode-card skeleton">
          <div className="episode-code skeleton-box"></div>
          <div className="episode-name skeleton-box"></div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ message }: { message?: string }) => (
  <div className="error-state">
    <p className="title">{message ?? "Error loading data"}</p>
  </div>
);

const EmptyState = ({ message }: { message?: string }) => (
  <div className="empty-state">
    <p className="title">{message ?? "No data available"}</p>
  </div>
);

/* ================= COMPONENT ================= */
export default function EpisodesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);

  const { data, loading, error, fetchMore } = useQuery<EpisodesData>(
    GET_EPISODES,
    {
      variables: { page: currentPage },
      notifyOnNetworkStatusChange: true,
    }
  );

  /* ---------- MERGE EPISODES SAFELY ---------- */
  useEffect(() => {
    const results = data?.episodes?.results ?? [];
    if (results.length === 0) return;

    setAllEpisodes((prev) => {
      const merged = [...prev, ...results];
      // Remove duplicates by episode ID
      return Array.from(new Map(merged.map((e) => [e.id, e])).values());
    });
  }, [data]);

  /* ---------- LOAD MORE ---------- */
  const loadMoreEpisodes = () => {
    const nextPageNumber = data?.episodes?.info?.next ?? null;
    if (nextPageNumber == null) return;

    fetchMore({
      variables: { page: nextPageNumber },
    });

    setCurrentPage(nextPageNumber);
  };

  /* ---------- HANDLE STATES ---------- */
  if (error) return <ErrorState message="Failed to load episodes" />;
  if (loading && allEpisodes.length === 0) return <LoadingState />;
  if (!loading && allEpisodes.length === 0)
    return <EmptyState message="No episodes found" />;

  /* ---------- GROUP BY SEASON ---------- */
  const seasonsMap = allEpisodes.reduce<Record<string, Episode[]>>(
    (acc, ep) => {
      const season = ep.episode?.slice(0, 3) ?? "S00";
      acc[season] = acc[season] ?? [];
      acc[season].push(ep);
      return acc;
    },
    {}
  );

  const seasonKeys = Object.keys(seasonsMap).sort();

  /* ---------- UI ---------- */
  return (
    <main className="page-episodes">
      <div className="container">
        <h1 className="title">Episodes</h1>

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

        {/* LOAD MORE */}
        {data?.episodes?.info?.next != null && (
          <button
            onClick={loadMoreEpisodes}
            className="load-more-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Episodes"}
          </button>
        )}
      </div>
    </main>
  );
}
