"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";

const GET_EPISODE = gql`
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

interface Character {
  id: string;
  name: string;
  image: string;
}

interface Episode {
  name: string;
  episode: string;
  air_date: string;
  characters: Character[];
}

interface EpisodeData {
  episode: Episode;
}

export default function EpisodePage() {
  const params = useParams();

  const { data, loading, error } = useQuery<EpisodeData>(GET_EPISODE, {
    variables: { id: params.id },
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading episode</p>;
  if (!data) return <p>No data</p>;

  const ep = data.episode;

  return (
  <main className="page-episode-detail">
    <div className="container">
      {/* Episode Header */}
      <div className="episode-detail-card">
        <div className="episode-header">
          <span className="episode-badge">{ep.episode}</span>
          <h1 className="episode-title">{ep.name}</h1>
          <p className="episode-airdate">Air Date: {ep.air_date}</p>
        </div>
      </div>

      {/* Characters Section */}
      <section className="episode-characters">
        <h2 className="section-title">Characters Appeared</h2>

        <div className="episode-character-grid">
          {ep.characters.map((char) => (
            <div key={char.id} className="episode-character-card">
              <img
                src={char.image}
                alt={char.name}
                className="episode-character-image"
              />
              <span className="episode-character-name">
                {char.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  </main>
);


}
