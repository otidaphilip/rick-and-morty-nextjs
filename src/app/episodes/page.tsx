import EpisodesClient from "./EpisodesClient";

const QUERY = `
  query GetEpisodes($page: Int!) {
    episodes(page: $page) {
      info { next }
      results { id name episode }
    }
  }
`;

async function getEpisodes(page: number) {
  const res = await fetch("https://rickandmortyapi.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { page } }),
    cache: "no-store",
  });

  const json = await res.json();
  return json.data.episodes;
}

export default async function EpisodesPage() {
  const episodesData = await getEpisodes(1);

  return (
    <EpisodesClient
      initialEpisodes={episodesData.results}
      nextPage={episodesData.info.next}
    />
  );
}
