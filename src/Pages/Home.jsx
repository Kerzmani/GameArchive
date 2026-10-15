import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const Home = () => {
  const [games, setGames] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_KEY = "82ab795f807a433381bd1b7af6052836";

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      fetchGames(query, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

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
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
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
              <form className="flex gap-2" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/30"
                >
                  Search
                </button>
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
              {filteredGames.length} games shown
            </p>
          </div>
          {loading && <p className="text-sm text-muted">Loading games...</p>}
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGames.map((game) => (
              <article
                key={game.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-card shadow-lg shadow-black/20"
              >
                <img
                  src={game.background_image}
                  alt={`${game.name} cover`}
                  className="aspect-video w-full object-cover"
                />
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>
                      {(game.genres || [])
                        .map((genre) => genre.name)
                        .slice(0, 2)
                        .join(", ") || "Unknown Genre"}
                    </span>
                    <span>
                      {game.released ? game.released.slice(0, 4) : "N/A"}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold">{game.name}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-secondary">
                      {(game.parent_platforms || [])
                        .map((platformItem) => platformItem.platform?.name)
                        .filter(Boolean)
                        .slice(0, 1)
                        .join(" ") || "Platform N/A"}
                    </span>
                    <span className="font-semibold text-tertiary">
                      ★ {Number(game.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
