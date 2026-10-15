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

const Home = () => {
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState("rating");
  const [platformOption, setPlatformOption] = useState("all");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [platformMenuOpen, setPlatformMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sortMenuRef = useRef(null);
  const platformMenuRef = useRef(null);
  const API_KEY = "82ab795f807a433381bd1b7af6052836";

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      fetchGames(query, controller.signal);
    }, 75);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }

      if (
        platformMenuRef.current &&
        !platformMenuRef.current.contains(event.target)
      ) {
        setPlatformMenuOpen(false);
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
    setLoading(true);
    setError("");

    try {
      const term = searchTerm.trim();
      const params = {
        key: API_KEY,
        page_size: 40,
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
      setGames(data.results || []);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError("Failed to load games.");
        setGames([]);
      }
    } finally {
      setLoading(false);
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

  const platformFilteredGames = useMemo(() => {
    if (platformOption === "all") {
      return filteredGames;
    }

    return filteredGames.filter((game) => {
      const platformNames = (game.parent_platforms || [])
        .map((item) => item.platform?.name || "")
        .join(" ")
        .toLowerCase();

      return platformNames.includes(platformOption);
    });
  }, [filteredGames, platformOption]);

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
  const platformLabel =
    PLATFORM_OPTIONS.find((option) => option.value === platformOption)?.label ||
    "All Platforms";

  return (
    <div className="min-h-screen bg-background text-text antialiased">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            GameVault
          </h1>
          <span className="text-xs text-muted md:text-sm">
            React Render · Stitch Migration
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section className="overflow-visible rounded-2xl border border-white/10 bg-surface">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="space-y-4 p-6 md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-secondary">
                GameVault Video Game Archive
              </p>
              <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
                Every Game. <span className="text-primary">One Archive.</span>
              </h2>
              <p className="max-w-xl text-muted">
                Discover your next favorite game. This React page now renders
                the Stitch-inspired UI and behavior directly in the CRA app.
              </p>
              <form className="relative z-40 flex gap-2" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-72 shrink-0 rounded-lg border border-white/15 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/30"
                >
                  Search
                </button>
                <div className="relative z-50 w-44 shrink-0" ref={sortMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setSortMenuOpen((previous) => !previous);
                      setPlatformMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-haspopup="menu"
                    aria-expanded={sortMenuOpen}
                  >
                    <span className="truncate">{sortLabel}</span>
                    <span className="text-xs text-primary">▾</span>
                  </button>
                  {sortMenuOpen && (
                    <div className="absolute right-0 top-full z-[120] mt-2 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-xl shadow-black/30">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortOption(option.value);
                            setSortMenuOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                            sortOption === option.value
                              ? "bg-primary/20 text-on-surface"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative z-50 w-44 shrink-0" ref={platformMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setPlatformMenuOpen((previous) => !previous);
                      setSortMenuOpen(false);
                    }}
                    className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-semibold text-on-surface hover:bg-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-haspopup="menu"
                    aria-expanded={platformMenuOpen}
                  >
                    <span className="truncate">{platformLabel}</span>
                    <span className="text-xs text-primary">▾</span>
                  </button>
                  {platformMenuOpen && (
                    <div className="absolute right-0 top-full z-[120] mt-2 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-xl shadow-black/30">
                      {PLATFORM_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setPlatformOption(option.value);
                            setPlatformMenuOpen(false);
                          }}
                          className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                            platformOption === option.value
                              ? "bg-primary/20 text-on-surface"
                              : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/30"
                >
                  Reset
                </button>
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
          {loading && <p className="text-sm text-muted">Loading games...</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
