import { useState } from "react";
import { Link } from "react-router";
import type { Game } from "../schemas/game";
import { getGameMedia } from "../lib/game-media";
import { Icon } from "./Icons";

export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Loading() {
  return <Notice>Cargando Checkpoint…</Notice>;
}
export function GameArt({
  game,
  large = false,
  landscape = false,
}: {
  game: Game;
  large?: boolean;
  landscape?: boolean;
}) {
  const media = getGameMedia(game.title);
  const image = media && (landscape ? media.hero : media.cover);
  const [failedImage, setFailedImage] = useState("");
  if (image && failedImage !== image) {
    return (
      <div
        className={`game-art real-art ${large ? "large" : ""} ${landscape ? "landscape-art" : ""}`}
      >
        <img
          src={image}
          alt={`Portada de ${game.title}`}
          loading={large ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailedImage(image)}
        />
        <span className="poster-shine" aria-hidden="true" />
      </div>
    );
  }
  const variant =
    game.title.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % 6;
  return (
    <div
      className={`game-art art-${variant} ${large ? "large" : ""} ${landscape ? "landscape-art" : ""}`}
      aria-hidden="true"
    >
      <span className="art-orbit" />
      <span className="art-orbit second" />
      <span className="art-shape" />
      <span className="art-top">CHECKPOINT COLLECTION</span>
      <span className="art-title">{game.title}</span>
      <span className="art-bottom">
        {game.genre} / {new Date(game.releaseDate).getUTCFullYear()}
      </span>
    </div>
  );
}
export function GameCard({ game }: { game: Game }) {
  const media = getGameMedia(game.title);
  return (
    <Link
      to={`/games/${game._id}`}
      className="game-card"
      aria-label={`Ver ficha de ${game.title}`}
    >
      <div className="poster-wrap">
        <GameArt game={game} />
        <span className="poster-cta">Ver ficha del juego</span>
      </div>
      <div className="card-meta">
        <span>{game.genre}</span>
        <span title={game.multiplayer ? "Incluye multijugador" : "Un jugador"}>
          <Icon name={game.multiplayer ? "people" : "gamepad"} size={16} />
          <span className="sr-only">
            {game.multiplayer ? "Multijugador" : "Un jugador"}
          </span>
        </span>
      </div>
      <h3>{game.title}</h3>
      {media && (
        <p className="card-studio" title={media.studio}>
          {media.studio}
        </p>
      )}
      <div className="card-bottom">
        <span>{game.platform}</span>
        <strong>{price(game.price)}</strong>
      </div>
    </Link>
  );
}
export function price(value: number) {
  return value === 0 ? "Gratis" : `USD ${value.toFixed(2)}`;
}
