import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api, errorMessage } from '../lib/api';
import { useApi } from '../lib/use-api';
import { GameArt, Loading, Notice } from '../components/Ui';
import { statuses, type LibraryEntry, type LibraryList } from '../schemas/library';

export function Library({ all = false }: { all?: boolean }) {
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [target, setTarget] = useState<LibraryEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const query = new URLSearchParams(params); query.set('scope', all ? 'all' : 'mine');
  const { data, loading, error: loadError } = useApi<LibraryList>(`/library?${query}`, revision);
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params); next.delete('page');
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }
  async function remove() {
    if (!target) return;
    setBusy(true); setError('');
    try {
      await api(`/library/${target._id}`, { method: 'DELETE' });
      setSuccess('Se quitó el juego de la biblioteca.'); setTarget(null);
      if (data?.data.length === 1 && data.pagination.page > 1) { const next = new URLSearchParams(params); next.set('page', String(data.pagination.page - 1)); setParams(next); }
      else setRevision(v => v + 1);
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  const base = all ? '/admin/library' : '/library';
  return <div className="container section"><div className="section-heading"><div><p className="eyebrow">{all ? 'Panel de administración' : 'Tu recorrido como jugador'}</p><h1>{all ? 'Todas las bibliotecas' : 'Mi biblioteca'}<span className="accent">.</span></h1></div><Link to="/" className="button">Descubrir juegos</Link></div>
    {all ? <div className="admin-tabs"><Link to="/admin">Videojuegos</Link><Link to="/admin/users">Usuarios y roles</Link><span className="active">Bibliotecas</span></div> : <p className="muted">Tu lista, tus partidas, tu progreso. Agregá juegos desde el catálogo y llevá el registro a tu manera.</p>}
    <div className="filters"><label className="select-filter"><span className="sr-only">Filtrar por estado</span><select value={params.get('status') ?? ''} onChange={e => filter('status', e.target.value)}><option value="">Todos los estados</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><button className={`button ${params.get('favorite') === 'true' ? '' : 'ghost'}`} aria-pressed={params.get('favorite') === 'true'} onClick={() => filter('favorite', params.get('favorite') ? '' : 'true')}>Solo favoritos</button>{data && <span className="muted">{data.pagination.total} registros</span>}</div>
    {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}{loading ? <Loading /> : loadError ? <Notice error>{loadError}</Notice> : !data?.data.length ? <Notice>Todavía no hay juegos en esta vista. Explorá el catálogo o cambiá los filtros.</Notice> : <><div className="library-grid">{data.data.map(entry => <article key={entry._id} className="library-card">{entry.game && <Link to={`/games/${entry.gameId}`}><GameArt game={entry.game} /></Link>}<div className="library-copy"><div className="library-meta"><span className="badge">{entry.status}</span>{entry.favorite && <span className="favorite-label">Favorito</span>}</div><h2>{entry.game?.title ?? 'Juego eliminado'}</h2><p className="muted">{entry.hoursPlayed} horas · {entry.rating ? `${entry.rating}/10` : 'Sin puntuar'}</p>{all && <p className="muted">Usuario: …{entry.ownerId.slice(-8)}</p>}{entry.notes && <p className="library-notes">{entry.notes}</p>}<div className="table-actions"><Link to={`${base}/${entry._id}/edit`}>Editar registro</Link><button className="text-button danger" onClick={() => { setTarget(entry); setError(''); }}>Quitar<span className="sr-only"> {entry.game?.title}</span></button></div></div></article>)}</div><div className="pagination"><button className="button ghost" disabled={data.pagination.page <= 1} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(data.pagination.page - 1)); setParams(next); }}>Anterior</button><span>Página {data.pagination.page} de {Math.max(1, data.pagination.pages)}</span><button className="button ghost" disabled={data.pagination.page >= data.pagination.pages} onClick={() => { const next = new URLSearchParams(params); next.set('page', String(data.pagination.page + 1)); setParams(next); }}>Siguiente</button></div></>}
    {target && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="remove-title"><h2 id="remove-title">¿Quitar {target.game?.title ?? 'este registro'}?</h2><p>Se eliminarán las notas y el progreso de este registro.</p><div className="form-actions"><button autoFocus className="button ghost" disabled={busy} onClick={() => setTarget(null)}>Cancelar</button><button className="button danger-button" disabled={busy} onClick={() => void remove()}>{busy ? 'Quitando…' : 'Sí, quitar'}</button></div></section></div>}
  </div>;
}
