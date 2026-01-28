"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CharacterFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("all");
  const [gender, setGender] = useState("all");
  const [status, setStatus] = useState("all");

  // Sync state with URL when page loads or changes
  useEffect(() => {
    setName(searchParams.get("name") || "");
    setSpecies(searchParams.get("species") || "all");
    setGender(searchParams.get("gender") || "all");
    setStatus(searchParams.get("status") || "all");
  }, [searchParams]);

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });

    params.delete("page"); // Reset pagination when filters change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="characters-toolbar">
      <div className="back-button-wrapper">
        <Link href="/episodes" className="view-episodes-btn">
          View Episodes →
        </Link>

        <div className="filters">
          <select value={species} onChange={(e) => updateURL({ species: e.target.value })}>
            <option value="all">All Species</option>
            <option value="Human">Human</option>
            <option value="Alien">Alien</option>
            <option value="Animal">Animal</option>
            <option value="Mythological Creature">Mythological Creature</option>
          </select>

          <select value={gender} onChange={(e) => updateURL({ gender: e.target.value })}>
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>

          <select value={status} onChange={(e) => updateURL({ status: e.target.value })}>
            <option value="all">All Status</option>
            <option value="Alive">Alive</option>
            <option value="Dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        value={name}
        placeholder="🔍 Search character..."
        className="search-input"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") updateURL({ name });
        }}
      />
    </div>
  );
}
