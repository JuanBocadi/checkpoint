import { Link, useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { gameSchema, genres, platforms, type Game, type GameInput } from '../schemas/game';
import { useApi } from '../lib/use-api';
import { api, ApiError, errorMessage } from '../lib/api';
import { Loading, Notice } from '../components/Ui';

export function GameEditor() {
  const { id } = useParams();
  return <div className="container section editor-container"><Link className="back-link" to="/admin">Volver a administración</Link><p className="eyebrow">Panel de administración</p><h1>{id ? 'Editar videojuego' : 'Una nueva aventura'}<span className="accent">.</span></h1>{id ? <ExistingGame id={id} /> : <GameForm />}</div>;
}
function ExistingGame({ id }: { id: string }) {
  const { data, loading, error } = useApi<{ data: Game }>(`/games/${id}`);
  if (loading) return <Loading />;
  if (error) return <Notice error>{error}</Notice>;
  return data && <GameForm key={id} game={data.data} />;
}
function GameForm({ game }: { game?: Game }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<GameInput>({
    resolver: zodResolver(gameSchema),
    defaultValues: game ? { title: game.title, description: game.description, genre: game.genre, platform: game.platform, releaseDate: game.releaseDate.slice(0, 10), price: game.price, multiplayer: game.multiplayer } : { title: '', description: '', genre: 'Indie', platform: 'PC', releaseDate: '', price: 0, multiplayer: false },
  });
  async function submit(values: GameInput) {
    setError('');
    try {
      await api(game ? `/games/${game._id}` : '/games', { method: game ? 'PATCH' : 'POST', body: JSON.stringify(values) });
      navigate('/admin');
    } catch (error) {
      if (error instanceof ApiError) error.issues.forEach(issue => { if (issue.field in gameSchema.shape) setFieldError(issue.field as keyof GameInput, { message: issue.message }); });
      setError(errorMessage(error));
    }
  }
  return <form className="editor-card" onSubmit={handleSubmit(submit)} noValidate><h2>Información del juego</h2><p className="muted">Todos los campos son obligatorios. Precio de referencia en USD.</p>{error && <Notice error>{error}</Notice>}
    <label>Título<input {...register('title')} aria-invalid={!!errors.title} />{errors.title && <span className="field-error">{errors.title.message}</span>}</label>
    <label>Descripción<textarea rows={5} {...register('description')} aria-invalid={!!errors.description} />{errors.description && <span className="field-error">{errors.description.message}</span>}</label>
    <div className="form-grid"><label>Género<select {...register('genre')}>{genres.map(g => <option key={g}>{g}</option>)}</select>{errors.genre && <span className="field-error">{errors.genre.message}</span>}</label><label>Plataforma<select {...register('platform')}>{platforms.map(p => <option key={p}>{p}</option>)}</select>{errors.platform && <span className="field-error">{errors.platform.message}</span>}</label><label>Fecha de lanzamiento<input type="date" {...register('releaseDate')} aria-invalid={!!errors.releaseDate} />{errors.releaseDate && <span className="field-error">{errors.releaseDate.message}</span>}</label><label>Precio (USD)<input type="number" min="0" max="1000" step="0.01" {...register('price', { valueAsNumber: true })} aria-invalid={!!errors.price} />{errors.price && <span className="field-error">{errors.price.message}</span>}</label></div>
    <label className="checkbox-label"><input type="checkbox" {...register('multiplayer')} />Incluye modo multijugador</label><div className="form-actions"><Link className="button ghost" to="/admin">Cancelar</Link><button className="button" disabled={isSubmitting}>{isSubmitting ? 'Guardando…' : game ? 'Guardar cambios' : 'Crear videojuego'}</button></div>
  </form>;
}
