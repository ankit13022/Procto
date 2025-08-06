"use client";
import React, { useRef, useEffect, useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 150;

export default function SearchForm() {
  const router = useRouter();

  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);

  // input values
  const [locationQuery, setLocationQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // selected values used for search params
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");

  // dropdown controls
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // filtered suggestions & keyboard index
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredSearchSuggestions, setFilteredSearchSuggestions] = useState(
    []
  );
  const [locHighlightIndex, setLocHighlightIndex] = useState(-1);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState(-1);

  // refs for click-outside
  const locationRef = useRef(null);
  const searchRef = useRef(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  useEffect(() => {
    // fetch data on mount
    const fetchData = async () => {
      try {
        const [specRes, locRes] = await Promise.all([
          fetch(`${backendUrl}/api/specialties`),
          fetch(`${backendUrl}/api/locations`),
        ]);
        const specData = await specRes.json();
        const locData = await locRes.json();
        setSpecialties(Array.isArray(specData) ? specData : []);
        setLocations(Array.isArray(locData) ? locData : []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };
    fetchData();
  }, []);

  // Debounced filtering for locations
  useEffect(() => {
    const t = setTimeout(() => {
      if (!locationQuery) {
        setFilteredLocations(locations.slice(0, 6));
      } else {
        const q = locationQuery.toLowerCase();
        const filtered = locations.filter((l) => l.toLowerCase().includes(q));
        setFilteredLocations(filtered.slice(0, 8));
      }
      setLocHighlightIndex(-1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [locationQuery, locations]);

  // Debounced filtering for search suggestions
  useEffect(() => {
    const t = setTimeout(() => {
      const suggestions = [];
      const sq = (searchQuery || "").trim().toLowerCase();
      if (!sq) {
        suggestions.push(...specialties.slice(0, 6));
      } else {
        suggestions.push(
          ...specialties.filter((s) => s.toLowerCase().includes(sq)).slice(0, 6)
        );
      }
      const unique = Array.from(new Set(suggestions)).slice(0, 8);
      setFilteredSearchSuggestions(unique);
      setSearchHighlightIndex(-1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchQuery, specialties]);

  // Click outside handlers to close dropdowns
  useEffect(() => {
    const onDocClick = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // keyboard navigation for locations
  const onLocationKeyDown = (e) => {
    if (!showLocationDropdown) return;
    const last = filteredLocations.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setLocHighlightIndex((i) => (i < last ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLocHighlightIndex((i) => (i > 0 ? i - 1 : last));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (locHighlightIndex >= 0) {
        selectLocation(filteredLocations[locHighlightIndex]);
      } else if (filteredLocations.length === 1) {
        selectLocation(filteredLocations[0]);
      }
    } else if (e.key === "Escape") {
      setShowLocationDropdown(false);
    }
  };

  // keyboard navigation for search suggestions
  const onSearchKeyDown = (e) => {
    if (!showSearchDropdown) return;
    const last = filteredSearchSuggestions.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSearchHighlightIndex((i) => (i < last ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSearchHighlightIndex((i) => (i > 0 ? i - 1 : last));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchHighlightIndex >= 0) {
        selectSearchSuggestion(filteredSearchSuggestions[searchHighlightIndex]);
      } else if (filteredSearchSuggestions.length === 1) {
        selectSearchSuggestion(filteredSearchSuggestions[0]);
      } else {
        submitSearch();
      }
    } else if (e.key === "Escape") {
      setShowSearchDropdown(false);
    }
  };

  // select handlers
  const selectLocation = (loc) => {
    setLocation(loc);
    setLocationQuery(loc);
    setShowLocationDropdown(false);
  };

  const selectSearchSuggestion = (s) => {
    setSpecialty(s);
    setSearchQuery(s);
    setShowSearchDropdown(false);
    submitSearch({ specialty: s, location });
  };

  const submitSearch = (overrides = {}) => {
    const params = new URLSearchParams();
    const s = overrides.specialty ?? specialty;
    const l = overrides.location ?? location;
    const q = (searchQuery || "").trim();

    if (q) params.set("search", q);
    if (s) params.set("specialty", s);
    if (l) params.set("location", l);

    router.push(`/doctors?${params.toString()}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    submitSearch();
  };

  return (
    <>
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
        <div className="flex bg-white rounded-md overflow-visible shadow-lg">
          <div className="flex flex-1">
            <div ref={locationRef} className="relative w-full md:w-1/3">
              <div
                className="flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 cursor-text"
                onClick={() => {
                  setShowLocationDropdown(true);
                  const el = locationRef.current?.querySelector("input");
                  el?.focus();
                }}
              >
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setShowLocationDropdown(true);
                    setLocation("");
                  }}
                  onFocus={() => setShowLocationDropdown(true)}
                  onKeyDown={onLocationKeyDown}
                  placeholder="Select location"
                  className="w-full text-gray-800 outline-none bg-transparent"
                  aria-autocomplete="list"
                  aria-expanded={showLocationDropdown}
                  aria-controls="location-listbox"
                />
                <FiChevronDown className="text-gray-500 ml-2" />
              </div>

              {showLocationDropdown && filteredLocations.length > 0 && (
                <ul
                  id="location-listbox"
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 z-40 max-h-52 overflow-auto text-gray-800"
                >
                  {filteredLocations.map((loc, idx) => (
                    <li
                      key={loc}
                      role="option"
                      aria-selected={idx === locHighlightIndex}
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        selectLocation(loc);
                      }}
                      onMouseEnter={() => setLocHighlightIndex(idx)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        idx === locHighlightIndex ? "bg-gray-100" : ""
                      }`}
                    >
                      {loc}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              ref={searchRef}
              className="relative flex items-center px-4 py-3 w-full md:w-2/3 text-gray-800 border-t md:border-t-0"
            >
              <FiSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search doctors, clinics, hospitals, specialties..."
                className="w-full outline-none"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                  setSpecialty("");
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onKeyDown={onSearchKeyDown}
                aria-autocomplete="list"
                aria-controls="search-listbox"
              />
              <FiChevronDown className="text-gray-500 ml-2" />

              {showSearchDropdown && filteredSearchSuggestions.length > 0 && (
                <ul
                  id="search-listbox"
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 z-40 max-h-52 overflow-auto text-gray-800 shadow"
                >
                  {filteredSearchSuggestions.map((s, idx) => (
                    <li
                      key={s}
                      role="option"
                      aria-selected={idx === searchHighlightIndex}
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        selectSearchSuggestion(s);
                      }}
                      onMouseEnter={() => setSearchHighlightIndex(idx)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        idx === searchHighlightIndex ? "bg-gray-100" : ""
                      }`}
                    >
                      <div className="text-sm font-medium">{s}</div>
                      <div className="text-xs text-gray-500">Specialty</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              className="ml-auto px-3 py-1 bg-[#00a0dc] text-white rounded"
              onClick={submitSearch}
            >
              Search
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 text-sm text-gray-200">
        Popular searches:
        {specialties.slice(0, 4).map((sp) => (
          <button
            key={sp}
            className="ml-2 hover:underline cursor-pointer"
            onClick={() => {
              setSpecialty(sp);
              setSearchQuery(sp);
              setShowSearchDropdown(false);
              submitSearch({ specialty: sp, location });
            }}
          >
            {sp}
          </button>
        ))}
        <button
          className="ml-2 hover:underline cursor-pointer"
          onClick={() => {
            setSpecialty("");
            setShowSearchDropdown(true);
          }}
        >
          Others
        </button>
      </div>
    </>
  );
}
