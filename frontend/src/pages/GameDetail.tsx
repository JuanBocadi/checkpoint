import { useState } from "react";
import { Link, useParams } from "react-router";
import { GameArt, GameCard, Loading, Notice, price } from "../components/Ui";
import { useApi } from "../lib/use-api";
import { useSession } from "../lib/auth-client";
import { getGameMedia, type GameMedia } from "../lib/game-media";
import type { Game, GameList } from "../schemas/game";
import { AddToLibrary } from "../components/AddToLibrary";
import { Icon } from "../components/Icons";

export function GameDetail() {
  const { id } = useParams();
  const { data, loading, error } = useApi<{ data: Game }>(`/games/${id}`);
  if (loading)
    return (
      <div className="container section">
        <Loading />
      </div>
    );
  if (error || !data)
    return (
      <div className="container section">
        <Link to="/" className="back-link">
          Volver al catálogo
        </Link>
        <Notice error>{error || "No encontramos ese videojuego."}</Notice>
      </div>
    );
  return <GameStory key={data.data._id} game={data.data} />;
}

function GameStory({ game }: { game: Game }) {
  const { data: session } = useSession();
  const media = getGameMedia(game.title);
  return (
    <div className="game-detail-page">
      {media && (
        <div className="detail-scenery" aria-hidden="true">
          <img src={media.hero} alt="" />
          <div />
        </div>
      )}
      <div className="container section detail-container">
        <Link to="/" className="back-link detail-breadcrumb">
          Explorar / {game.genre} / <span>{game.title}</span>
        </Link>
        <article className="detail-story">
          <aside className="detail-poster">
            <GameArt game={game} large />
            {media && (
              <p className="detail-studio">
                Desarrollado por <strong>{media.studio}</strong>
              </p>
            )}
          </aside>
          <div className="detail-information">
            <p className="eyebrow">Un nuevo mundo te espera</p>
            <h1>{game.title}</h1>
            <div className="game-tags">
              <span>{game.genre}</span>
              <span>
                <Icon name="gamepad" size={16} />
                {game.platform}
              </span>
              <span>
                <Icon
                  name={game.multiplayer ? "people" : "gamepad"}
                  size={16}
                />
                {game.multiplayer ? "Multijugador" : "Un jugador"}
              </span>
            </div>
            <p className="detail-description">{game.description}</p>
            {media && (
              <div className="editorial-tags">
                {media.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            <div className="library-purchase-panel">
              <div>
                <span className="muted">Precio de referencia</span>
                <strong className="detail-price">{price(game.price)}</strong>
              </div>
              <AddToLibrary gameId={game._id} />
            </div>
            <p className="reference-price-note">
              Precio informativo en USD. Puede variar según la tienda y la
              región.
            </p>
            <dl className="game-facts">
              <div>
                <dt>Lanzamiento</dt>
                <dd>
                  {new Date(game.releaseDate).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt>Modo de juego</dt>
                <dd>{game.multiplayer ? "Multijugador" : "Individual"}</dd>
              </div>
              <div>
                <dt>Plataforma</dt>
                <dd>{game.platform}</dd>
              </div>
              {media && (
                <div>
                  <dt>Estudio</dt>
                  <dd>{media.studio}</dd>
                </div>
              )}
            </dl>
            <div className="detail-secondary-actions">
              {media && (
                <a href={media.source} target="_blank" rel="noreferrer">
                  Ver en Steam <Icon name="external" size={15} />
                </a>
              )}
              {session?.user.role === "admin" && (
                <Link to={`/admin/games/${game._id}/edit`}>
                  Editar videojuego
                </Link>
              )}
            </div>
          </div>
        </article>
        {media && <GameGallery media={media} title={game.title} />}
        <RelatedGames game={game} />
      </div>
    </div>
  );
}

function GameGallery({ media, title }: { media: GameMedia; title: string }) {
  const [selected, setSelected] = useState(0);
  return (
    <section className="game-gallery" aria-label={`Capturas de ${title}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Dentro del juego</p>
          <h2>
            Un vistazo a la aventura<span className="accent">.</span>
          </h2>
        </div>
        <span className="muted">Capturas oficiales</span>
      </div>
      <div className="gallery-layout">
        <figure>
          <img
            src={media.screenshots[selected]}
            alt={`Captura de ${title}: escena ${selected + 1}`}
            loading="lazy"
          />
          <figcaption>{title} · Captura del juego</figcaption>
        </figure>
        <div
          className="gallery-thumbnails"
          role="group"
          aria-label="Elegir captura"
        >
          {media.screenshots.map((image, index) => (
            <button
              key={image}
              aria-label={`Ver captura ${index + 1} de ${title}`}
              aria-pressed={selected === index}
              className={selected === index ? "selected" : ""}
              onClick={() => setSelected(index)}
            >
              <img src={image} alt="" loading="lazy" />
              <span>Captura {index + 1}</span>
            </button>
          ))}
          <p>
            Arte e imágenes de sus respectivos creadores.{" "}
            <Link to="/credits">Ver créditos</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function RelatedGames({ game }: { game: Game }) {
  const { data } = useApi<GameList>("/games?limit=50");
  const related = data?.data
    .filter((item) => item._id !== game._id)
    .sort(
      (a, b) => Number(b.genre === game.genre) - Number(a.genre === game.genre),
    )
    .slice(0, 4);
  if (!related?.length) return null;
  return (
    <section className="related-games">
      <div className="section-heading">
        <div>
          <p className="eyebrow">La aventura no termina acá</p>
          <h2>
            Más juegos para descubrir<span className="accent">.</span>
          </h2>
        </div>
        <Link className="text-button" to="/">
          Ver el catálogo
        </Link>
      </div>
      <div className="related-grid">
        {related.map((item) => (
          <GameCard key={item._id} game={item} />
        ))}
      </div>
    </section>
  );
}
