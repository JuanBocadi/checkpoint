import { useState } from 'react';
import { Link } from 'react-router';
import { api, errorMessage } from '../lib/api';
import { useSession } from '../lib/auth-client';
import { useApi } from '../lib/use-api';
import type { LibraryList } from '../schemas/library';
import { Notice } from './Ui';

export function AddToLibrary({ gameId }: { gameId: string }) {
  const { data: session } = useSession();
  if (!session) return <Link className="button" to="/login" state={{ from: '/library' }}>Ingresá para crear tu biblioteca</Link>;
  return <AddButton gameId={gameId} />;
}
function AddButton({ gameId }: { gameId: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const { data } = useApi<LibraryList>(`/library?gameId=${gameId}`);
  const exists = added || data?.data.some(entry => entry.gameId === gameId);
  async function add() {
    setBusy(true); setError('');
    try {
      await api('/library', { method: 'POST', body: JSON.stringify({ gameId, status: 'Pendiente', hoursPlayed: 0, rating: null, notes: '', favorite: false }) });
      setAdded(true);
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <div className="add-to-library">{exists ? <Link className="button light" to="/library">Ver en mi biblioteca</Link> : <button className="button" disabled={busy} onClick={() => void add()}>{busy ? 'Agregando…' : 'Agregar a mi biblioteca'}</button>}{error && <Notice error>{error}</Notice>}</div>;
}
