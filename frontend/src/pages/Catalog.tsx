import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useApi } from '../lib/use-api';
import { genres, platforms, type GameList } from '../schemas/game';
import { GameCard, Loading, Notice } from '../components/Ui';

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const { data, loading, error } = useApi<GameList>(`/games?${params.toString()}`);
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params); next.delete('page');
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  return <div className="container">
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="tiny-cross">+</span> Un nuevo punto de partida</p><h1>Tu próximo<br />gran <span>juego.</span></h1><p>Historias para perderse. Mundos por descubrir.<br />Encontrá la próxima aventura que vale tu tiempo.</p><a className="button light" href="#catalogo">Explorar el catálogo</a><div className="hero-caption">PARA QUIENES SIEMPRE QUIEREN UNA PARTIDA MÁS</div></div>
      <div className="hero-visual" aria-hidden="true"><span className="visual-label">PLAYER ONE / READY</span><div className="portal"><div className="portal-inner" /><span className="portal-person" /></div><span className="visual-cross cross-one">+</span><span className="visual-cross cross-two">+</span><span className="visual-bottom">DISCOVER. PLAY. REPEAT.</span></div>
    </section>
    <section className="catalog section" id="catalogo"><div className="section-heading"><div><p className="eyebrow">Elegí tu próxima aventura</p><h2>El catálogo<span className="accent">.</span></h2></div><span className="muted">{data ? `${data.pagination.total} videojuegos para descubrir` : 'Tu próximo checkpoint empieza acá'}</span></div>
      <div className="filters"><form className="search" onSubmit={event => { event.preventDefault(); filter('q', query); }}><label className="sr-only" htmlFor="search">Buscar videojuegos</label><span aria-hidden="true">⌕</span><input id="search" placeholder="Buscar un videojuego…" value={query} maxLength={100} onChange={e => setQuery(e.target.value)} /><button type="submit">Buscar</button></form>
      <label className="select-filter"><span className="sr-only">Filtrar por género</span><select value={params.get('genre') ?? ''} onChange={e => filter('genre', e.target.value)}><option value="">Todos los géneros</option>{genres.map(g => <option key={g}>{g}</option>)}</select></label>
      <label className="select-filter"><span className="sr-only">Filtrar por plataforma</span><select value={params.get('platform') ?? ''} onChange={e => filter('platform', e.target.value)}><option value="">Todas las plataformas</option>{platforms.map(p => <option key={p}>{p}</option>)}</select></label>
      {params.size > 0 && <button className="text-button" onClick={() => { setParams({}); setQuery(''); }}>Limpiar filtros</button>}</div>
      {loading ? <Loading /> : error ? <Notice error>{error} Comprobá que el backend esté disponible.</Notice> : !data?.data.length ? <Notice>No encontramos juegos con esos filtros. Probá otra búsqueda.</Notice> : <><div className="game-grid">{data.data.map(game => <GameCard key={game._id} game={game} />)}</div><div className="pagination"><button className="button ghost" disabled={data.pagination.page <= 1} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(data.pagination.page - 1)); setParams(next); }}>Anterior</button><span>Página {data.pagination.page} de {data.pagination.pages}</span><button className="button ghost" disabled={data.pagination.page >= data.pagination.pages} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(data.pagination.page + 1)); setParams(next); }}>Siguiente</button></div></>}
    </section>
    <aside className="catalog-note"><span className="note-icon">+</span><div><h3>Jugar también es descubrir.</h3><p>Desde pequeños indies hasta aventuras enormes. Tu próximo favorito puede estar a un clic.</p></div><span className="note-stamp">EST. 2026</span></aside>
  </div>;
}
