import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useApi } from "../lib/use-api";
import { genres, platforms, type GameList } from "../schemas/game";
import { GameCard, Loading, Notice } from "../components/Ui";
import { DiscoveryHero } from "../components/DiscoveryHero";
import { Icon } from "../components/Icons";

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const { data: discovery } = useApi<GameList>("/games?limit=50");
  const { data, loading, error } = useApi<GameList>(
    `/games?${params.toString()}`,
  );
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }
  return (
    <div className="container discovery-page">
      <div className="discovery-intro">
        <p>Descubrí. Elegí. Jugá.</p>
        <span>Tu lugar entre partidas.</span>
      </div>
      <DiscoveryHero games={discovery?.data ?? []} />
      <section className="catalog section" id="catalogo">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Siempre hay algo por descubrir</p>
            <h2>
              Encontrá tu próxima partida<span className="accent">.</span>
            </h2>
          </div>
          <span className="muted">
            {data
              ? `${data.pagination.total} videojuegos para descubrir`
              : "Tu próximo checkpoint empieza acá"}
          </span>
        </div>
        <div className="genre-chips" role="group" aria-label="Explorar géneros">
          <button
            className={!params.get("genre") ? "active" : ""}
            aria-pressed={!params.get("genre")}
            onClick={() => filter("genre", "")}
          >
            <Icon name="grid" size={16} /> Todos los juegos
          </button>
          {genres.map((genre) => (
            <button
              key={genre}
              className={params.get("genre") === genre ? "active" : ""}
              aria-pressed={params.get("genre") === genre}
              onClick={() => filter("genre", genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        <div className="filters">
          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              filter("q", query);
            }}
          >
            <label className="sr-only" htmlFor="search">
              Buscar videojuegos
            </label>
            <Icon name="search" />
            <input
              id="search"
              placeholder="Buscar un videojuego…"
              value={query}
              maxLength={100}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>
          <label className="select-filter">
            <span className="sr-only">Filtrar por plataforma</span>
            <select
              value={params.get("platform") ?? ""}
              onChange={(e) => filter("platform", e.target.value)}
            >
              <option value="">Todas las plataformas</option>
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          {params.size > 0 && (
            <button
              className="text-button"
              onClick={() => {
                setParams({});
                setQuery("");
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <Notice error>
            {error} Comprobá que el backend esté disponible.
          </Notice>
        ) : !data?.data.length ? (
          <Notice>
            No encontramos juegos con esos filtros. Probá otra búsqueda.
          </Notice>
        ) : (
          <>
            <div className="game-grid" aria-label="Videojuegos del catálogo">
              {data.data.map((game) => (
                <GameCard key={game._id} game={game} />
              ))}
            </div>
            <div className="pagination">
              <button
                className="button ghost"
                disabled={data.pagination.page <= 1}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(data.pagination.page - 1));
                  setParams(next);
                }}
              >
                Anterior
              </button>
              <span>
                Página {data.pagination.page} de {data.pagination.pages}
              </span>
              <button
                className="button ghost"
                disabled={data.pagination.page >= data.pagination.pages}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(data.pagination.page + 1));
                  setParams(next);
                }}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>
      <aside className="discovery-assistant">
        <div className="assistant-art" aria-hidden="true" />
        <div className="assistant-callout-icon">
          <Icon name="sparkles" size={27} />
        </div>
        <div className="assistant-callout-copy">
          <p className="eyebrow">Una recomendación a tu medida</p>
          <h2>Menos buscar. Más jugar.</h2>
          <p>
            Contale al asistente qué te gusta y descubrí tu próximo favorito.
          </p>
        </div>
        <Link className="button light" to="/chat">
          <Icon name="sparkles" size={18} /> Encontrar mi próximo juego
        </Link>
      </aside>
    </div>
  );
}
