import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import GameCard from "./GameCard";

const API_KEY = process.env.REACT_APP_RAWG_API_KEY;

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

function GameDetails() {
  const { id } = useParams();
  const location = useLocation();
  const initialGame = location.state?.game || null;
  const [game, setGame] = useState(initialGame);
  const [loading, setLoading] = useState(!initialGame);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stateGame = location.state?.game || null;
    setGame(stateGame);
    setLoading(!stateGame);
    setDetailsLoading(false);
    setError("");
  }, [id, location.state]);

  useEffect(() => {
    const hasDescription = Boolean(
      (game?.description_raw && game.description_raw.trim()) ||
        (game?.description && game.description.trim())
    );
    const wrongGameLoaded = game && String(game.id) !== String(id);
    const shouldFetchDetails = Boolean(id) && (!game || wrongGameLoaded || !hasDescription);

    if (!shouldFetchDetails) {
      return;
    }

    if (!API_KEY) {
      setError("Missing RAWG API key. Add REACT_APP_RAWG_API_KEY to your .env file.");
      setLoading(false);
      setDetailsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchGameById() {
      if (game) {
        setDetailsLoading(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const { data } = await axios.get(`https://api.rawg.io/api/games/${id}`, {
          params: { key: API_KEY },
          signal: controller.signal,
        });

        setGame((previous) => ({
          ...(previous || {}),
          ...(data || {}),
        }));
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to load game details.");
        }
      } finally {
        setLoading(false);
        setDetailsLoading(false);
      }
    }

    fetchGameById();

    return () => controller.abort();
  }, [id, game]);

  const descriptionText = useMemo(() => {
    if (!game) return "";
    if (game.description_raw) return game.description_raw;
    if (game.description) return stripHtml(game.description);
    return "";
  }, [game]);

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
        {loading && !game && <p className="text-sm text-muted">Loading game details...</p>}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {game && (
          <div className="mx-auto max-w-3xl space-y-6">
            <GameCard game={game} />

            {detailsLoading && <p className="text-sm text-muted">Loading full description...</p>}

            <section className="rounded-2xl border border-outline-variant bg-surface p-5">
              <h2 className="text-lg font-semibold text-on-surface">About the Game</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
                {descriptionText || "Description not available."}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default GameDetails;
