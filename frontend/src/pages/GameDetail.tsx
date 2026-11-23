import { Link, useParams } from "react-router";
import { GameArt, Loading, Notice, price } from "../components/Ui";
import { useApi } from "../lib/use-api";
import { useSession } from "../lib/auth-client";
import type { Game } from "../schemas/game";
import { AddToLibrary } from "../components/AddToLibrary";

export function GameDetail() {
  const { id } = useParams();
  const { data, loading, error } = useApi<{ data: Game }>(`/games/${id}`);
  const { data: session } = useSession();
  return (
    <div className="container section">
      <Link to="/" className="back-link">
        Volver al catálogo
      </Link>
      {loading ? (
        <Loading />
      ) : error ? (
        <Notice error>{error}</Notice>
      ) : (
        data && (
          <article className="detail-layout">
            <GameArt game={data.data} large />
            <div className="detail-copy">
              <p className="eyebrow">
                {data.data.genre} / {data.data.platform}
              </p>
              <h1>{data.data.title}</h1>
              <p className="detail-description">{data.data.description}</p>
              <dl className="game-facts">
                <div>
                  <dt>Lanzamiento</dt>
                  <dd>
                    {new Date(data.data.releaseDate).toLocaleDateString(
                      "es-AR",
                      { timeZone: "UTC" },
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Modo de juego</dt>
                  <dd>
                    {data.data.multiplayer ? "Multijugador" : "Un jugador"}
                  </dd>
                </div>
                <div>
                  <dt>Plataforma</dt>
                  <dd>{data.data.platform}</dd>
                </div>
                <div>
                  <dt>Precio de referencia</dt>
                  <dd>{price(data.data.price)}</dd>
                </div>
              </dl>
              <p className="muted">
                Catálogo informativo. Los precios están expresados en dólares y
                pueden variar por tienda.
              </p>
              <div className="detail-actions">
                <AddToLibrary gameId={data.data._id} />
                {session?.user.role === "admin" && (
                  <Link className="button ghost" to={`/admin/games/${id}/edit`}>
                    Editar videojuego
                  </Link>
                )}
              </div>
            </div>
          </article>
        )
      )}
    </div>
  );
}
