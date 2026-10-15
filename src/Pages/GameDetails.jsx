import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import GameCard from "./GameCard";

const API_KEY = process.env.REACT_APP_RAWG_API_KEY;
const MIN_CARD_SKELETON_MS = 1000;

const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

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

function GameDetails() {
  const { id } = useParams();
  const location = useLocation();
  const initialGame = location.state?.game || null;
  const [game, setGame] = useState(initialGame);
  const [loading, setLoading] = useState(!initialGame);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsResolved, setDetailsResolved] = useState(false);
  const [error, setError] = useState("");
  const detailsRequestIdRef = useRef(0);

  useEffect(() => {
    const stateGame = location.state?.game || null;
    setGame(stateGame);
    setLoading(!stateGame);
    setDetailsLoading(false);
    setDetailsResolved(false);
    setError("");
  }, [id, location.state]);

  useEffect(() => {
    const hasDescription = Boolean(
      (game?.description_raw && game.description_raw.trim()) ||
        (game?.description && game.description.trim())
    );
    const wrongGameLoaded = game && String(game.id) !== String(id);
    const shouldFetchDetails =
      Boolean(id) &&
      !detailsResolved &&
      (!game || wrongGameLoaded || !hasDescription);

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
    const requestId = ++detailsRequestIdRef.current;

    async function fetchGameById() {
      const startedAt = Date.now();

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
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MIN_CARD_SKELETON_MS - elapsed);

        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }

        if (requestId !== detailsRequestIdRef.current) {
          return;
        }

        setDetailsResolved(true);
        setLoading(false);
        setDetailsLoading(false);
      }
    }

    fetchGameById();

    return () => controller.abort();
  }, [id, game, detailsResolved]);

  const descriptionText = useMemo(() => {
    if (!game) return "";
    if (game.description_raw) return game.description_raw;
    if (game.description) return stripHtml(game.description);
    return "";
  }, [game]);

  const showCardSkeleton = loading || detailsLoading;

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
        {showCardSkeleton && (
          <div className="mx-auto max-w-3xl">
            <GameCardSkeleton />
          </div>
        )}
        {error && <p className="text-sm text-red-300">{error}</p>}

        {!showCardSkeleton && game && (
          <div className="mx-auto max-w-3xl space-y-6">
            <GameCard game={game} />

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
