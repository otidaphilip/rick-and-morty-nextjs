"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

type Episode = {
  id: string;
  name: string;
  episode: string;
};

type EpisodesData = {
  episodes: {
    info: {
      next: number | null;
    };
    results: Episode[];
  };
};

const SEASONS_PER_PAGE = 2;

export default function EpisodesPage() {
  const { data, loading, error, fetchMore } = useQuery<EpisodesData>(
    GET_EPISODES,
    {
      variables: { page: 1 },
    }
  );

  const [currentPage, setCurrentPage] = useState(1);

  /*FETCH ALL API PAGES*/
  useEffect(() => {
    if (!data?.episodes.info.next) return;

    fetchMore({
      variables: { page: data.episodes.info.next },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          episodes: {
            info: fetchMoreResult.episodes.info,
            results: [
              ...prev.episodes.results,
              ...fetchMoreResult.episodes.results,
            ],
          },
        };
      },
    });
  }, [data, fetchMore]);

  if (loading && !data) return <p className="title">Loading...</p>;
  if (error) return <p className="title">Error loading episodes</p>;
  if (!data) return <p className="title">No data</p>;

  /*GROUP BY SEASON*/
  const episodes = data.episodes.results;

  const seasonsMap = episodes.reduce<Record<string, Episode[]>>((acc, ep) => {
    const season = ep.episode.slice(0, 3); // S01, S02...
    acc[season] = acc[season] || [];
    acc[season].push(ep);
    return acc;
  }, {});

  const seasonKeys = Object.keys(seasonsMap).sort();
  const totalPages = Math.ceil(seasonKeys.length / SEASONS_PER_PAGE);

  const start = (currentPage - 1) * SEASONS_PER_PAGE;
  const visibleSeasons = seasonKeys.slice(start, start + SEASONS_PER_PAGE);

  return (
    <main className="page-episodes">
      <div className="container">

        <h1 className="title">Episodes</h1>

        {/* 🔙 BACK BUTTON */}
        <div className="back-button-wrapper">
          <Link href="/" className="view-episodes-btn">
            ← Back to Character List
          </Link>
        </div>

        {/*SEASONS (2 PER PAGE)*/}
        {visibleSeasons.map((season) => (
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
                  <div className="episode-code">{ep.episode}</div>
                  <div className="episode-name">{ep.name}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/*PAGINATION*/}
        <div className="pagination">
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`pagination-btn ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

      </div>
    </main>
  );
}
