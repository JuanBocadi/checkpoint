import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { authClient, useSession } from '../lib/auth-client';
import { errorMessage } from '../lib/api';
import { Loading, Notice } from '../components/Ui';

type User = { id: string; name: string; email: string; role?: string | null };
export function Users() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    authClient.admin.listUsers({ query: { limit: 10, offset: page * 10, sortBy: 'createdAt', sortDirection: 'desc' } }).then(result => {
      if (!active) return;
      if (result.error) setError(result.error.message ?? 'No pudimos cargar los usuarios.');
      else { setUsers(result.data.users); setTotal(result.data.total); }
    }).catch(error => { if (active) setError(errorMessage(error)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, revision]);
  async function setRole(user: User, role: 'user' | 'admin') {
    setBusy(user.id); setError(''); setSuccess('');
    try {
      const result = await authClient.admin.setRole({ userId: user.id, role });
      if (result.error) setError(result.error.message ?? 'No se pudo cambiar el rol.');
      else { setSuccess(`Rol de ${user.name} actualizado a ${role}.`); setRevision(v => v + 1); }
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(''); }
  }
  return <div className="container section"><p className="eyebrow">Panel de administración</p><h1>La comunidad<span className="accent">.</span></h1><div className="admin-tabs"><Link to="/admin">Videojuegos</Link><span className="active">Usuarios y roles</span></div><p className="muted">Los registros nuevos reciben el rol user. Tu propio rol se conserva desde este panel.</p>{error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}{loading ? <Loading /> : <><div className="table-scroll"><table><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td>{user.name}{user.id === session?.user.id && <span className="badge">Vos</span>}</td><td>{user.email}</td><td><label><span className="sr-only">Rol de {user.name}</span><select value={user.role ?? 'user'} disabled={!!busy || user.id === session?.user.id} onChange={e => void setRole(user, e.target.value as 'user' | 'admin')}><option value="user">user</option><option value="admin">admin</option></select></label></td></tr>)}</tbody></table></div><div className="pagination"><button className="button ghost" disabled={page === 0 || !!busy} onClick={() => setPage(v => v - 1)}>Anterior</button><span>Página {page + 1} de {Math.max(1, Math.ceil(total / 10))}</span><button className="button ghost" disabled={(page + 1) * 10 >= total || !!busy} onClick={() => setPage(v => v + 1)}>Siguiente</button></div></>}</div>;
}
