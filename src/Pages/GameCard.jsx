import { Link } from "react-router-dom";

const fallbackImage =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=60";

const formatDate = (dateValue) => {
  if (!dateValue) return "Release date unknown";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Release date unknown";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function GameCard({ game }) {
  const genreNames = (game.genres || []).map((genre) => genre.name).filter(Boolean);
  const primaryGenre = genreNames[0] || "Unknown Genre";
  const secondaryGenre = genreNames[1] || null;

  const platformNames = (game.parent_platforms || [])
    .map((item) => item.platform?.name)
    .filter(Boolean)
    .slice(0, 3);

  const screenshots = (game.short_screenshots || [])
    .map((screenshot) => screenshot.image)
    .filter(Boolean)
    .slice(0, 4);

  const imageSource = game.background_image || screenshots[0] || fallbackImage;
  const releaseLabel = formatDate(game.released);
  const ratingValue = Number(game.rating || 0).toFixed(1);
  const votes = game.ratings_count || game.reviews_count || 0;

  return (
    <Link
      to={`/game/${game.id}`}
      state={{ game }}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      <article className="group overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:border-primary/40">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
          <img
            src={imageSource}
            alt={`${game.name || "Game"} cover`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
              {primaryGenre}
            </span>
            {secondaryGenre && (
              <span className="rounded-full bg-surface/90 px-2.5 py-1 text-[10px] text-on-surface-variant">
                {secondaryGenre}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-2">
            <h4 className="line-clamp-1 text-lg font-bold tracking-tight text-on-surface">
              {game.name || "Untitled Game"}
            </h4>
            <p className="text-xs text-on-surface-variant">{releaseLabel}</p>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container px-3 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Community Rating
              </p>
              <p className="text-xs text-on-surface-variant">{votes.toLocaleString()} votes</p>
            </div>
            <div className="rounded-lg border border-primary/40 bg-primary/15 px-2.5 py-1.5 text-base font-bold text-primary">
              {ratingValue}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {platformNames.length > 0 ? (
              platformNames.map((platform) => (
                <span
                  key={`${game.id}-${platform}`}
                  className="rounded-lg border border-outline-variant bg-surface-container-high px-2.5 py-1 text-[11px] font-medium text-on-surface"
                >
                  {platform}
                </span>
              ))
            ) : (
              <span className="rounded-lg border border-outline-variant bg-surface-container-high px-2.5 py-1 text-[11px] font-medium text-on-surface-variant">
                Platform unknown
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

export default GameCard;
