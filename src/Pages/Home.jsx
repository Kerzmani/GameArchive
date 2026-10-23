import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import GameCard from "./GameCard";

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "A-Z" },
];

const PLATFORM_OPTIONS = [
  { value: "all", label: "All Platforms" },
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "nintendo", label: "Nintendo" },
];

const SKELETON_CARD_COUNT = 8;
const MIN_SKELETON_MS = 1000;

const SKELETON_WAVE_STYLE = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%)",
  transform: "translateX(-100%)",
  animation: "skeleton-wave 1.35s ease-in-out infinite",
};

function SkeletonBlock({ className }) {
  return (
    <div className={`relative overflow-hidden bg-surface-container-high ${className}`}>
      <div className="absolute inset-0" style={SKELETON_WAVE_STYLE} />
    </div>
  );
}

function GameCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-lg shadow-black/20">
      <SkeletonBlock className="aspect-[16/9] w-full" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-3 w-20 rounded" />
        <SkeletonBlock className="h-5 w-3/4 rounded" />
        <SkeletonBlock className="h-3 w-1/2 rounded" />
        <SkeletonBlock className="h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-lg" />
          <SkeletonBlock className="h-6 w-16 rounded-lg" />
        </div>
      </div>
    </article>
  );
}

const Home = () => {
  const todayDateString = new Date().toISOString().slice(0, 10);
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("rating");
  const [genreOption, setGenreOption] = useState("all");
  const [platformOption, setPlatformOption] = useState("all");
  const [minReleaseDate, setMinReleaseDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(todayDateString);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [genreMenuOpen, setGenreMenuOpen] = useState(false);
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const sortMenuRef = useRef(null);
  const genreMenuRef = useRef(null);
  const platformMenuRef = useRef(null);
  const dateMenuRef = useRef(null);
  const fetchSequenceRef = useRef(0);
  const loadingTimeoutRef = useRef(null);
  const API_KEY = process.env.REACT_APP_RAWG_API_KEY;

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function fetchEarliestReleaseDate() {
      if (!API_KEY) {
        return;
      }

      try {
        const { data } = await axios.get("https://api.rawg.io/api/games", {
          params: {
            key: API_KEY,
            page_size: 1,
            ordering: "released",
          },
        });

        const earliestFromApi = data?.results?.[0]?.released;
        const normalizedEarliest = /^\d{4}-\d{2}-\d{2}$/.test(earliestFromApi || "")
          ? earliestFromApi
          : "1950-01-01";

        setMinReleaseDate(normalizedEarliest);
        setFromDate((previous) =>
          previous && previous >= normalizedEarliest ? previous : normalizedEarliest
        );
      } catch (error) {
        setMinReleaseDate("1950-01-01");
        setFromDate((previous) => (previous && previous >= "1950-01-01" ? previous : "1950-01-01"));
      }
    }

    fetchEarliestReleaseDate();
  }, [API_KEY]);

  useEffect(() => {
    setToDate((previous) => {
      if (!previous) {
        return todayDateString;
      }

      return previous > todayDateString ? todayDateString : previous;
    });
  }, [todayDateString]);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      fetchGames(query, controller.signal);
    }, 75);

    return () => {
      clearTimeout(timer);
      controller.abort();
    }; //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }

      if (
        genreMenuRef.current &&
        !genreMenuRef.current.contains(event.target)
      ) {
        setGenreMenuOpen(false);
      }

      if (
        platformMenuRef.current &&
        !platformMenuRef.current.contains(event.target)
      ) {
        setPlatformMenuOpen(false);
      }

      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target)) {
        setDateMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    fetchGames(query);
  }

  async function fetchGames(searchTerm = "", signal) {
    const requestId = ++fetchSequenceRef.current;
    const startedAt = Date.now();

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setLoading(true);
    setError("");

    if (!API_KEY) {
      setError("Missing RAWG API key. Add REACT_APP_RAWG_API_KEY to your .env file.");
      setGames([]);
      setLoading(false);
      return;
    }

    try {
      const term = searchTerm.trim();
      const params = {
        key: API_KEY,
        page_size: 20,
      };

      if (term) {
        params.search = term;
        params.search_precise = true;
      } else {
        params.ordering = "-rating";
      }
      const { data } = await axios.get("https://api.rawg.io/api/games", {
        params,
        signal,
      });
      if (requestId === fetchSequenceRef.current) {
        setGames(data.results || []);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        if (requestId === fetchSequenceRef.current) {
          setError("Failed to load games.");
          setGames([]);
        }
      }
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);

      loadingTimeoutRef.current = setTimeout(() => {
        if (requestId === fetchSequenceRef.current) {
          setLoading(false);
        }
      }, remaining);
    }
  }
  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return games;
    }

    return games.filter((game) => {
      const genreNames = (game.genres || [])
        .map((genre) => genre.name)
        .join(" ")
        .toLowerCase();
      const released = (game.released || "").toLowerCase();

      return (
        (game.name || "").toLowerCase().includes(normalized) ||
        genreNames.includes(normalized) ||
        released.includes(normalized)
      );
    });
  }, [query, games]);

  const genreOptions = useMemo(() => {
    const genreMap = new Map();

    games.forEach((game) => {
      (game.genres || []).forEach((genre) => {
        const value = (genre.slug || genre.name || "").trim().toLowerCase();
        const label = (genre.name || genre.slug || "").trim();

        if (value && label && !genreMap.has(value)) {
          genreMap.set(value, label);
        }
      });
    });

    const rawgGenres = Array.from(genreMap, ([value, label]) => ({
      value,
      label,
    })).sort((firstGenre, secondGenre) =>
      firstGenre.label.localeCompare(secondGenre.label)
    );

    return [{ value: "all", label: "All Genres" }, ...rawgGenres];
  }, [games]);

  useEffect(() => {
    if (
      genreOption !== "all" &&
      !genreOptions.some((option) => option.value === genreOption)
    ) {
      setGenreOption("all");
    }
  }, [genreOption, genreOptions]);

  const genreFilteredGames = useMemo(() => {
    if (genreOption === "all") {
      return filteredGames;
    }

    return filteredGames.filter((game) =>
      (game.genres || []).some(
        (genre) =>
          (genre.slug || genre.name || "").trim().toLowerCase() === genreOption
      )
    );
  }, [filteredGames, genreOption]);

  const dateFilteredGames = useMemo(() => {
    return genreFilteredGames.filter((game) => {
      const releaseDate = (game.released || "").slice(0, 10);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
        return false;
      }

      if (fromDate && releaseDate < fromDate) {
        return false;
      }

      if (toDate && releaseDate > toDate) {
        return false;
      }

      return true;
    });
  }, [genreFilteredGames, fromDate, toDate]);

  const platformFilteredGames = useMemo(() => {
    if (platformOption === "all") {
      return dateFilteredGames;
    }

    return dateFilteredGames.filter((game) => {
      const platformNames = (game.parent_platforms || [])
        .map((item) => item.platform?.name || "")
        .join(" ")
        .toLowerCase();

      return platformNames.includes(platformOption);
    });
  }, [dateFilteredGames, platformOption]);

  const sortedGames = useMemo(() => {
    const list = [...platformFilteredGames];

    if (sortOption === "newest") {
      return list.sort(
        (firstGame, secondGame) =>
          new Date(secondGame.released || 0).getTime() -
          new Date(firstGame.released || 0).getTime()
      );
    }

    if (sortOption === "name") {
      return list.sort((firstGame, secondGame) =>
        (firstGame.name || "").localeCompare(secondGame.name || "")
      );
    }

    return list.sort(
      (firstGame, secondGame) =>
        Number(secondGame.rating || 0) - Number(firstGame.rating || 0)
    );
  }, [platformFilteredGames, sortOption]);

  const sortLabel =
    SORT_OPTIONS.find((option) => option.value === sortOption)?.label ||
    "Top Rated";
  const genreLabel =
    genreOptions.find((option) => option.value === genreOption)?.label ||
    "All Genres";
  const platformLabel =
    PLATFORM_OPTIONS.find((option) => option.value === platformOption)?.label ||
    "All Platforms";
  const dateRangeLabel =
    fromDate && toDate ? `${fromDate} → ${toDate}` : "Release Range";

  return (
    <div className="min-h-screen bg-background text-text antialiased">
      <style>
        {`@keyframes skeleton-wave {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            40% {
              opacity: 0.35;
            }
            100% {
              transform: translateX(100%);
              opacity: 0;
            }
          }`}
      </style>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            GameVault
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section className="overflow-visible rounded-2xl border border-white/10 bg-surface">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="space-y-4 p-6 md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-secondary">
                GameVault Archive
              </p>
              <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
                Every Game. <span className="text-primary">One Archive.</span>
              </h2>
              <p className="max-w-xl text-muted">
                Discover your next favorite game or revisit a classic. <br /> Know it before you buy it.
              </p>
              <form className="relative z-40 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" onSubmit={handleSearchSubmit}>
                <div className="flex items-stretch gap-2">
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 rounded-lg border border-white/15 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-72"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/30"
                  >
                    Search
                  </button>
                </div>
                <div className="flex flex-col gap-3 items-end w-full lg:w-auto lg:min-w-[28rem]">
                  {/* Stack 1: Sort, Genre, Platform — horizontal row */}
                  <div className="grid w-full grid-cols-3 gap-2">
                  <div className="relative z-50" ref={sortMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setSortMenuOpen((previous) => !previous);
                      setGenreMenuOpen(false);
                      setPlatformMenuOpen(false);
                      setDateMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-haspopup="menu"
                    aria-expanded={sortMenuOpen}
                  >
                    <span className="truncate">{sortLabel}</span>
                    <span className="text-xs text-primary">▾</span>
                  </button>
                  {sortMenuOpen && (
                    <div className="absolute right-0 top-full z-[120] mt-2 w-full overflow-hidden rounded-lg bg-card border border-white/10 shadow-xl shadow-black/30">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortOption(option.value);
                            setSortMenuOpen(false);
                          }}
                          style={{ backgroundColor: '#1e1f25' }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                            sortOption === option.value
                              ? "text-white font-medium"
                              : "text-gray-300 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative z-50" ref={genreMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setGenreMenuOpen((previous) => !previous);
                      setSortMenuOpen(false);
                      setPlatformMenuOpen(false);
                      setDateMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-haspopup="menu"
                    aria-expanded={genreMenuOpen}
                  >
                    <span className="truncate">{genreLabel}</span>
                    <span className="text-xs text-primary">▾</span>
                  </button>
                  {genreMenuOpen && (
                    <div className="absolute right-0 top-full z-[120] mt-2 w-full overflow-hidden rounded-lg bg-card border border-white/10 shadow-xl shadow-black/30">
                      {genreOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setGenreOption(option.value);
                            setGenreMenuOpen(false);
                          }}
                          style={{ backgroundColor: '#1e1f25f' }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                            genreOption === option.value
                              ? "text-white font-medium"
                              : "text-gray-300 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative z-50" ref={platformMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setPlatformMenuOpen((previous) => !previous);
                      setSortMenuOpen(false);
                      setGenreMenuOpen(false);
                      setDateMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-haspopup="menu"
                    aria-expanded={platformMenuOpen}
                  >
                    <span className="truncate">{platformLabel}</span>
                    <span className="text-xs text-primary">▾</span>
                  </button>
                  {platformMenuOpen && (
                    <div className="absolute right-0 top-full z-[120] mt-2 w-full overflow-hidden rounded-lg bg-card border border-white/10 shadow-xl shadow-black/30">
                      {PLATFORM_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPlatformOption(option.value);
                            setPlatformMenuOpen(false);
                          }}
                          style={{ backgroundColor: '#1e1f25' }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                            platformOption === option.value
                              ? "text-white font-medium"
                              : "text-gray-300 hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                </div>
                {/* Stack 2: Date Range */}
                <div className="w-full">
                <div className="relative z-50 w-full" ref={dateMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setDateMenuOpen((previous) => !previous);
                      setSortMenuOpen(false);
                      setGenreMenuOpen(false);
                      setPlatformMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-haspopup="menu"
                    aria-expanded={dateMenuOpen}
                  >
                    <span className="truncate">{dateRangeLabel}</span>
                    <span className="text-xs text-primary">▾</span>
                  </button>
                  {dateMenuOpen && (
                    <div className="absolute right-0 top-full z-[120] mt-2 w-72 rounded-lg bg-card border border-white/10 p-3 shadow-xl shadow-black/30">
                      <div className="space-y-3">
                        <label className="block">
                          <span className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">From</span>
                          <input
                            type="date"
                            value={fromDate}
                            min={minReleaseDate || "1900-01-01"}
                            max={toDate || todayDateString}
                            onChange={(event) => {
                              const nextFromDate = event.target.value;
                              setFromDate(nextFromDate);

                              if (toDate && nextFromDate && nextFromDate > toDate) {
                                setToDate(nextFromDate);
                              }
                            }}
                            className="w-full rounded-lg border border-white/15 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs uppercase tracking-[0.1em] text-muted">To</span>
                          <input
                            type="date"
                            value={toDate}
                            min={fromDate || minReleaseDate || "1900-01-01"}
                            max={todayDateString}
                            onChange={(event) => {
                              const nextToDate = event.target.value;
                              setToDate(nextToDate);

                              if (fromDate && nextToDate && nextToDate < fromDate) {
                                setFromDate(nextToDate);
                              }
                            }}
                            className="w-full rounded-lg border border-white/15 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
                </div>
                {/* Stack 3: Reset */}
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSortOption("rating");
                    setGenreOption("all");
                    setPlatformOption("all");
                    setFromDate(minReleaseDate || "1900-01-01");
                    setToDate(todayDateString);
                    setSortMenuOpen(false);
                    setGenreMenuOpen(false);
                    setPlatformMenuOpen(false);
                    setDateMenuOpen(false);
                  }}
                  className="whitespace-nowrap rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/30"
                >
                  Reset
                </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold">Featured Games</h3>
            <p className="text-sm text-muted">
              {sortedGames.length} games shown
            </p>
          </div>
          {!loading && error && <p className="text-sm text-red-300">{error}</p>}

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
                <GameCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}

          {!loading && !error && sortedGames.length === 0 && (
            <p className="mt-4 text-sm text-muted">No games found for this search.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
