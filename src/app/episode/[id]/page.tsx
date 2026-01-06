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
    <div>
      <h1>{ep.name}</h1>
      <p>{ep.episode}</p>
      <p>Air Date: {ep.air_date}</p>

      <h2>Characters</h2>
      {ep.characters.map((char) => (
        <div key={char.id}>
          <img src={char.image} width={100} alt={char.name} />
          <p>{char.name}</p>
        </div>
      ))}
    </div>
  );
}
