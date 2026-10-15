import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import GameCard from "./GameCard";

const API_KEY = "82ab795f807a433381bd1b7af6052836";

function GameDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [game, setGame] = useState(location.state?.game || null);
  const [loading, setLoading] = useState(!location.state?.game);
  const [error, setError] = useState("");

  useEffect(() => {
    if (game) return;

    const controller = new AbortController();

    async function fetchGameById() {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(`https://api.rawg.io/api/games/${id}`, {
          params: { key: API_KEY },
          signal: controller.signal,
        });

        setGame(data || null);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to load game details.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchGameById();

    return () => controller.abort();
  }, [id, game]);

  return (
    <div className="min-h-screen bg-background text-text antialiased">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">GameVault</h1>
          <Link
            to="/"
            className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs text-on-surface-variant transition-colors hover:text-on-surface"
          >
            ← Back to archive
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading && <p className="text-sm text-muted">Loading game details...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!loading && !error && game && (
          <div className="mx-auto max-w-3xl">
            <GameCard game={game} />
          </div>
        )}
      </main>
    </div>
  );
}

export default GameDetails;
