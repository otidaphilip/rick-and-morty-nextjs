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
  try {
    const res = await fetch("https://rickandmortyapi.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { page },
      }),
      // 👇 Important for SSR reliability
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const json = await res.json();
    return json.data.episodes;
  } catch (error) {
    console.error("SSR Fetch Episodes Error:", error);
    return {
      info: { next: null },
      results: [],
    };
  }
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
