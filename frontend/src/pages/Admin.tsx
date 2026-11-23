import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api, errorMessage } from '../lib/api';
import { useApi } from '../lib/use-api';
import { Loading, Notice, price } from '../components/Ui';
import type { Game, GameList } from '../schemas/game';

export function Admin() {
  const [params, setParams] = useSearchParams();
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<Game | null>(null);
  const page = Math.max(1, Number(params.get('page')) || 1);
  const { data, loading, error: loadError } = useApi<GameList>(`/games?limit=10&page=${page}`, revision);
  async function remove() {
    if (!target) return;
    setDeleting(true); setError(''); setSuccess('');
    try {
      await api(`/games/${target._id}`, { method: 'DELETE' });
      setSuccess(`Se eliminó ${target.title}.`); setTarget(null);
      if (data?.data.length === 1 && page > 1) setParams({ page: String(page - 1) });
      else setRevision(v => v + 1);
    } catch (error) { setError(errorMessage(error)); }
    finally { setDeleting(false); }
  }
  return <div className="container section"><div className="section-heading"><div><p className="eyebrow">Panel de administración</p><h1>Tu catálogo, al día<span className="accent">.</span></h1></div><Link className="button" to="/admin/games/new">Agregar videojuego</Link></div><div className="admin-tabs"><span className="active">Videojuegos</span><Link to="/admin/users">Usuarios y roles</Link><Link to="/admin/library">Bibliotecas</Link></div>
    {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
    {loading ? <Loading /> : loadError ? <Notice error>{loadError}</Notice> : !data?.data.length ? <Notice>El catálogo está vacío. Agregá el primer videojuego.</Notice> : <><div className="table-scroll"><table><thead><tr><th>Videojuego</th><th>Género</th><th>Plataforma</th><th>Precio</th><th>Acciones</th></tr></thead><tbody>{data.data.map(game => <tr key={game._id}><td><Link className="table-title" to={`/games/${game._id}`}>{game.title}</Link></td><td>{game.genre}</td><td>{game.platform}</td><td>{price(game.price)}</td><td><div className="table-actions"><Link to={`/admin/games/${game._id}/edit`}>Editar</Link><button className="text-button danger" onClick={() => { setTarget(game); setError(''); }}>Eliminar<span className="sr-only"> {game.title}</span></button></div></td></tr>)}</tbody></table></div><div className="pagination"><button className="button ghost" disabled={page <= 1} onClick={() => setParams({ page: String(page - 1) })}>Anterior</button><span>Página {page} de {Math.max(1, data.pagination.pages)}</span><button className="button ghost" disabled={page >= data.pagination.pages} onClick={() => setParams({ page: String(page + 1) })}>Siguiente</button></div></>}
    {target && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><p className="eyebrow">Eliminar videojuego</p><h2 id="delete-title">¿Eliminar {target.title}?</h2><p>Se quitará del catálogo. Esta acción no se puede deshacer.</p><div className="form-actions"><button autoFocus className="button ghost" disabled={deleting} onClick={() => setTarget(null)}>Cancelar</button><button className="button danger-button" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button></div></section></div>}
  </div>;
}
