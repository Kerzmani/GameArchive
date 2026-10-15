import { useMemo, useState, useEffect } from "react";
import axios from "axios";




// const games = [
//   {
//     name: "Elden Ring",
//     studio: "FromSoftware",
//     year: 2022,
//     genre: "Action RPG",
//     rating: 4.9,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuDlC1EGepB-312zihPX92kZ9YVV8BpxYcre0tUT7lNQgATTAMxPyItszz7L4MHWGSS8WANgyVSuvLMQZ5zuuTM6cR4b5OlFC4tG_Ik0UFo-IJ3_Fne5dhISp37Z1DSv6B_yh2fACO1x84IxoLC-qhVilt60xtZcgyKnwvuQXiiI9pBReDINNXqB6tCR-LCwplcTmByWlG8IdyUW1-rAamK97C8rN1J8jvZqU7gyr3ZPdZ_6lSf9-iox"
//   },
//   {
//     name: "Baldur's Gate 3",
//     studio: "Larian Studios",
//     year: 2023,
//     genre: "CRPG",
//     rating: 4.9,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuBu2JKcWyH9ouBbUirFgxt0qEwsG-u3uzRgQaAxcswuVjcfBAG2qhQ7VMpgv0_eI4ZUz4czbMhRybsmR3YHXzai2TTmblxwlWwQznGRhdnthdrz_gRA2Aedq410mnDW9F45EWtCI6N-i0URXBSV9SP38no0l1x3vTkvKQSN_IicoibTWiGrDrvZmcxpKzR06PdMg6OrLHFt8Z6WQxRc-muGA_9-mD7ksf4GeEM8mluhr6A2hm49CWuo"
//   },
//   {
//     name: "Alan Wake 2",
//     studio: "Remedy",
//     year: 2023,
//     genre: "Survival Horror",
//     rating: 4.7,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuCGpemcwlUW93QaRXlxSmYwZe7D5B2ykG5VTT0kw8jNDKM58YE0G7isoIWYbifXdbTkUpMPyii8yekaYZJ5bhAmc1vcsUI337yF-dFW4NfZH-0rqBtGFVcyCBUp4CVLXaAOsmjhXQM0UuGocJNrFle7SL3UJbNOv0xN43KTTQ8ahVHq8w57QIzSpEpaOXvwMJbn8MmRqZLjhU0Ih_d0TmmNRgCt7DtjzaBP1HZLWoJO6HgXSH0Gy0xI"
//   },
//   {
//     name: "Phantom Liberty",
//     studio: "CD Projekt RED",
//     year: 2023,
//     genre: "Sci-Fi RPG",
//     rating: 4.8,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuBo3baNjKoMQBasUDNGD7izC42OEWu-Y-EsMyA8yaLOMtR63L4NL4Z55sQDkq5a0_ozgTfPp0SxQwm37snkYe_DOejLHqCDKSyC65Czxphu21N3MJYpn_NjCGBxGregrFB83pqLqwBswIWfUaUxk7LyS83cpP8qunP6FRrb706C8eUKcpb1F7PBW4OvwG4eGQVhwu7J_7MOU2SUS3s4e-JXFr3J1rJHS1D_Jjon6U9w3H-Ryd4BTW6u"
//   },
//   {
//     name: "Hollow Knight",
//     studio: "Team Cherry",
//     year: 2017,
//     genre: "Metroidvania",
//     rating: 4.8,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuCNbhVBAeH0-vRFlZDCls7TvgPV4qmXVdzI2e3fvDGMRo3d5WUaPv9baDdHASdzfKAkxFletZKXb8ZGXGwccRta_p50NUmf5D2046DSiEq_hEK3QjTK50ACuDJydt9sM_AblpAQftmAWC7DVZ5CWKQNLb4uZTXxcmSzqXDpJSZogZWUOR3yti7fNx0djrm_o98G8kTa-_uQEHQTO6tR5llM6FnACbOC65P2ClDkB0pBo-0I878A1YGX"
//   },
//   {
//     name: "Persona 5 Royal",
//     studio: "ATLUS",
//     year: 2020,
//     genre: "JRPG",
//     rating: 4.8,
//     image:
//       "https://lh3.googleusercontent.com/aida-public/AB6AXuB68s3Oik4Kqh2avA-9GnuDqx8xzxTsWnxq6fvevxOSdQofJbMif4QM9ScWCkz9U8NdR_x6VqW8VmWq1rrNjJsTKIS9nvGYc_FKpiYJTuhet7HpL8k4e6UJk8OP5bDOiXqYqXvSoj2Iq4Chzx_RXZzzFtu7dYtFhdA5myh8xbmuHkEvY0IFu3R74q0B661exZU3sSVUx5uSK_sccXvZ2oAMyTEptnbPiTa9Mh9cP1SB3SZ6j1t8PYdZ"
//   }
// ];

function App() {
  const [games, setGames] = useState([]);

  async function fetchGames() {
    try {
      const { data } = await axios.get(
        "https://api.rawg.io/api/games?key=82ab795f807a433381bd1b7af6052836&dates=2019-09-01,2019-09-30&platforms=18,1,7"
      );
      setGames(data.results || []);
    } catch (error) {
      setGames([]);
    }
  }

  const [query, setQuery] = useState("");

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return games;
    }

    return games.filter((game) => {
      const genreNames = (game.genres || []).map((genre) => genre.name).join(" ").toLowerCase();
      const released = (game.released || "").toLowerCase();

      return (
        (game.name || "").toLowerCase().includes(normalized) ||
        genreNames.includes(normalized) ||
        released.includes(normalized)
      );
    });
  }, [query, games]);

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text antialiased">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">GameVault</h1>
          <span className="text-xs text-muted md:text-sm">React Render · Stitch Migration</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
          <div className="grid gap-0 lg:grid-cols-2">
            <div className="space-y-4 p-6 md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-secondary">GameVault Video Game Archive</p>
              <h2 className="text-3xl font-extrabold leading-tight md:text-5xl">
                Every Game. <span className="text-primary">One Archive.</span>
              </h2>
              <p className="max-w-xl text-muted">
                Discover your next favorite game. This React page now renders the Stitch-inspired UI and behavior directly in the CRA app.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-lg bg-primary/20 px-4 py-2 text-sm font-semibold hover:bg-primary/30"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-2xl font-bold">Featured Games</h3>
            <p className="text-sm text-muted">{filteredGames.length} games shown</p>
          </div>
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
                    <span>{(game.genres || []).map((genre) => genre.name).slice(0, 2).join(", ") || "Unknown Genre"}</span>
                    <span>{game.released ? game.released.slice(0, 4) : "N/A"}</span>
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
                    <span className="font-semibold text-tertiary">★ {Number(game.rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
