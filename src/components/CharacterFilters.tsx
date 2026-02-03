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

  // Sync local state with URL
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

    params.delete("page"); // reset pagination when filters change
    router.push(`?${params.toString()}`);
  };

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      updateURL({ name });
    }, 400);

    return () => clearTimeout(delay);
  }, [name]);

  return (
    <div className="characters-toolbar">
      <div className="back-button-wrapper">
        <Link href="/episodes" className="view-episodes-btn">
          View Episodes →
        </Link>

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
      />
    </div>
  );
}
