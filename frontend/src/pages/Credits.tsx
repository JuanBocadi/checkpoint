import { Link } from "react-router";
import { gameMedia } from "../lib/game-media";
import { Icon } from "../components/Icons";

export function Credits() {
  return (
    <article className="container section credits-page">
      <Link to="/" className="back-link">
        Volver al catálogo
      </Link>
      <p className="eyebrow">Detrás de cada mundo</p>
      <h1>
        Créditos visuales<span className="accent">.</span>
      </h1>
      <p className="credits-intro">
        Las portadas, ilustraciones y capturas pertenecen a sus respectivos
        creadores. Se utilizan para presentar los videojuegos en este proyecto
        académico independiente, sin afiliación con los estudios ni con Steam.
      </p>
      <div className="credits-grid">
        {Object.entries(gameMedia).map(([title, media]) => (
          <a
            key={title}
            href={media.source}
            target="_blank"
            rel="noreferrer"
            className="credit-game"
          >
            <img src={media.cover} alt="" loading="lazy" />
            <div>
              <h2>
                {title === "elden ring"
                  ? "Elden Ring"
                  : title.replace(/\b\w/g, (character) =>
                      character.toUpperCase(),
                    )}
              </h2>
              <p>{media.studio}</p>
              <span>
                Ficha oficial en Steam <Icon name="external" size={14} />
              </span>
            </div>
          </a>
        ))}
      </div>
      <p className="muted">
        Diseño de interfaz, identidad de Checkpoint e iconos: Juan Cruz Bocadi ·
        TP Full Stack 2026.
      </p>
    </article>
  );
}
