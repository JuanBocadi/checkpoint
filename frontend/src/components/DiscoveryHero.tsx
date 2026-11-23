import { useState } from "react";
import { Link } from "react-router";
import { getGameMedia } from "../lib/game-media";
import type { Game } from "../schemas/game";
import { Icon } from "./Icons";

export function DiscoveryHero({ games }: { games: Game[] }) {
  const [selectedTitle, setSelectedTitle] = useState("Elden Ring");
  const featured = ["Elden Ring", "Hollow Knight", "Hades"]
    .map((title) =>
      games.find((game) => game.title.toLowerCase() === title.toLowerCase()),
    )
    .filter((game): game is Game => !!game);
  if (!featured.length && games.length) featured.push(games[0]);
  const selected =
    featured.find((game) => game.title === selectedTitle) ?? featured[0];
  const media = selected && getGameMedia(selected.title);

  return (
    <section className="discovery-hero" aria-label="Juegos destacados">
      <img
        className="spotlight-image"
        src={media?.hero ?? "/images/games/elden-ring-hero.jpg"}
        alt=""
        fetchPriority="high"
      />
      <div className="spotlight-shade" />
      <div className="spotlight-copy">
        <p className="eyebrow">
          <span className="editorial-mark" /> La selección de Checkpoint
        </p>
        <h1>{media?.headline ?? "Tu próxima gran aventura empieza acá."}</h1>
        <p className="spotlight-description">
          {media?.copy ??
            "Encontrá nuevos mundos, armá tu biblioteca y llevá el registro de cada partida."}
        </p>
        <div className="spotlight-actions">
          {selected ? (
            <Link className="button light" to={`/games/${selected._id}`}>
              <Icon name="gamepad" /> Descubrir {selected.title}
            </Link>
          ) : (
            <a className="button light" href="#catalogo">
              Explorar videojuegos
            </a>
          )}
          <a href="#catalogo" className="spotlight-catalog-link">
            Ver todo el catálogo
          </a>
        </div>
      </div>
      {selected && (
        <div className="spotlight-game-label">
          <span>EN EL RADAR</span>
          <strong>{selected.title}</strong>
          <span>{media?.tags.slice(0, 2).join(" · ") ?? selected.genre}</span>
        </div>
      )}
      {!!featured.length && (
        <div
          className="spotlight-selector"
          role="group"
          aria-label="Elegir juego destacado"
        >
          {featured.map((game) => {
            const art = getGameMedia(game.title);
            return (
              <button
                key={game._id}
                className={selected?._id === game._id ? "selected" : ""}
                aria-pressed={selected?._id === game._id}
                onClick={() => setSelectedTitle(game.title)}
              >
                {art && (
                  <img
                    src={art.cover}
                    alt=""
                    width="36"
                    height="48"
                    loading="lazy"
                  />
                )}
                <span>
                  <strong>{game.title}</strong>
                  <small>{art?.tags[0] ?? game.genre}</small>
                </span>
                <span className="selection-line" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
