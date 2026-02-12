"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CharacterFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for the input field (to allow typing without instant navigation)
  const [name, setName] = useState(searchParams.get("name") || "");

  // Derived state for selects (read directly from URL for single source of truth)
  const species = searchParams.get("species") || "all";
  const gender = searchParams.get("gender") || "all";
  const status = searchParams.get("status") || "all";

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete("page"); // Always reset to page 1 on filter change
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Debounced search for the name input
  useEffect(() => {
    const delay = setTimeout(() => {
      if (name !== (searchParams.get("name") || "")) {
        updateURL({ name });
      }
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
            onChange={(e) => updateURL({ species: e.target.value })}
          >
            <option value="all">All Species</option>
            <option value="Human">Human</option>
            <option value="Alien">Alien</option>
            <option value="Robot">Robot</option>
            <option value="Humanoid">Humanoid</option>
          </select>

          <select
            value={gender}
            onChange={(e) => updateURL({ gender: e.target.value })}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Genderless">Genderless</option>
            <option value="unknown">Unknown</option>
          </select>

          <select
            value={status}
            onChange={(e) => updateURL({ status: e.target.value })}
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