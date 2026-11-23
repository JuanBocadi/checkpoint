import { Link } from 'react-router';
import type { Game } from '../schemas/game';

export function Notice({ children, error = false }: { children: React.ReactNode; error?: boolean }) {
  return <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div>;
}
export function Loading() { return <Notice>Cargando Checkpoint…</Notice>; }
export function GameArt({ game, large = false }: { game: Game; large?: boolean }) {
  const variant = game.title.split('').reduce((n, c) => n + c.charCodeAt(0), 0) % 6;
  return <div className={`game-art art-${variant} ${large ? 'large' : ''}`} aria-hidden="true">
    <span className="art-orbit" /><span className="art-orbit second" /><span className="art-shape" />
    <span className="art-top">CHECKPOINT COLLECTION</span><span className="art-title">{game.title}</span>
    <span className="art-bottom">{game.genre} / {new Date(game.releaseDate).getUTCFullYear()}</span>
  </div>;
}
export function GameCard({ game }: { game: Game }) {
  return <Link to={`/games/${game._id}`} className="game-card">
    <GameArt game={game} />
    <div className="card-meta"><span>{game.genre}</span><span>{game.multiplayer ? 'Multijugador' : 'Un jugador'}</span></div>
    <h3>{game.title}</h3>
    <div className="card-bottom"><span>{game.platform}</span><strong>{price(game.price)}</strong></div>
  </Link>;
}
export function price(value: number) { return value === 0 ? 'Gratis' : `USD ${value.toFixed(2)}`; }
