"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CharacterFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState(searchParams.get("name") || "");
  const [species, setSpecies] = useState(searchParams.get("species") || "all");
  const [gender, setGender] = useState(searchParams.get("gender") || "all");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  const updateURL = (newValues: {
    name?: string;
    species?: string;
    gender?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newValues).forEach(([key, value]) => {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    });

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="characters-toolbar">
      <div className="back-button-wrapper">
        <div className="filters">
          <select
            value={species}
            onChange={(e) => {
              setSpecies(e.target.value);
              updateURL({ species: e.target.value });
            }}
          >
            <option value="all">All Species</option>
            <option value="Human">Human</option>
            <option value="Alien">Alien</option>
            <option value="Animal">Animal</option>
            <option value="Mythological Creature">Mythological Creature</option>
          </select>

          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              updateURL({ gender: e.target.value });
            }}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              updateURL({ status: e.target.value });
            }}
          >
            <option value="all">All Status</option>
            <option value="Alive">Alive</option>
            <option value="Dead">Dead</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
      </div>

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
