import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, errorMessage } from '../lib/api';
import { useApi } from '../lib/use-api';
import { Loading, Notice } from '../components/Ui';

interface Source { id: string; title: string }
interface Turn { role: 'user' | 'assistant'; content: string; sources?: Source[] }
interface Conversation { _id: string; title: string; messages: Turn[]; updatedAt: string }
const messageSchema = z.object({ message: z.string().trim().min(2, 'Escribí al menos 2 caracteres.').max(1200, 'Máximo 1200 caracteres por mensaje.') });

export function Chat() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('conversation') ?? '';
  const [revision, setRevision] = useState(0);
  const { data: features, loading: featuresLoading } = useApi<{ data: { chat: boolean } }>('/features');
  const { data: conversations, loading, error } = useApi<{ data: Conversation[] }>('/chat/conversations', revision);
  const [target, setTarget] = useState<Conversation | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  function changed(id: string) { setRevision(v => v + 1); if (selectedId !== id) setParams({ conversation: id }); }
  async function remove() {
    if (!target) return;
    setDeleting(true); setDeleteError('');
    try { await api(`/chat/conversations/${target._id}`, { method: 'DELETE' }); if (selectedId === target._id) setParams({}); setTarget(null); setRevision(v => v + 1); }
    catch (error) { setDeleteError(errorMessage(error)); }
    finally { setDeleting(false); }
  }
  return <div className="container section"><p className="eyebrow">Una mano para elegir</p><h1>Tu próxima partida empieza acá<span className="accent">.</span></h1><p className="muted">Contame qué te gusta, tu plataforma o tu presupuesto. Consulto el catálogo y, si lo pedís, los juegos de tu biblioteca.</p><div className="chat-layout"><aside className="chat-sidebar"><button className="button full" onClick={() => setParams({})}>Nueva conversación</button><h2>Últimas conversaciones</h2>{loading ? <Loading /> : error ? <Notice error>{error}</Notice> : !conversations?.data.length ? <p className="muted">Tus conversaciones aparecerán acá.</p> : conversations.data.map(conversation => <div key={conversation._id} className={`conversation-item ${selectedId === conversation._id ? 'selected' : ''}`}><button className="conversation-title" onClick={() => setParams({ conversation: conversation._id })}>{conversation.title}</button><button className="conversation-delete" onClick={() => { setTarget(conversation); setDeleteError(''); }} aria-label={`Eliminar conversación ${conversation.title}`}>×</button></div>)}</aside>
      <section className="chat-main" aria-label="Asistente de videojuegos">{featuresLoading ? <Loading /> : selectedId ? <SavedConversation key={selectedId} id={selectedId} enabled={!!features?.data.chat} changed={changed} /> : <ChatPanel key="new" enabled={!!features?.data.chat} changed={changed} />}</section></div>
      {target && <div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-chat-title"><h2 id="delete-chat-title">¿Eliminar esta conversación?</h2><p>Se borrarán sus mensajes de tu historial.</p>{deleteError && <Notice error>{deleteError}</Notice>}<div className="form-actions"><button autoFocus className="button ghost" disabled={deleting} onClick={() => setTarget(null)}>Cancelar</button><button className="button danger-button" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</button></div></section></div>}
  </div>;
}
function SavedConversation({ id, enabled, changed }: { id: string; enabled: boolean; changed: (id: string) => void }) {
  const { data, loading, error } = useApi<{ data: Conversation }>(`/chat/conversations/${id}`);
  if (loading) return <Loading />;
  if (error) return <Notice error>{error}</Notice>;
  return data && <ChatPanel key={id} conversation={data.data} enabled={enabled} changed={changed} />;
}
function ChatPanel({ conversation, enabled, changed }: { conversation?: Conversation; enabled: boolean; changed: (id: string) => void }) {
  const [messages, setMessages] = useState<Turn[]>(conversation?.messages ?? []);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<{ message: string }>({ resolver: zodResolver(messageSchema), defaultValues: { message: '' } });
  useEffect(() => () => { controller.current?.abort(); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, isSubmitting]);
  async function submit({ message }: { message: string }) {
    setError(''); const abort = new AbortController(); controller.current = abort;
    try {
      const result = await api<{ data: { conversationId: string; reply: string; sources: Source[] } }>('/chat', { method: 'POST', body: JSON.stringify({ message, ...(conversation ? { conversationId: conversation._id } : {}) }), signal: abort.signal });
      setMessages(previous => [...previous, { role: 'user', content: message }, { role: 'assistant', content: result.data.reply, sources: result.data.sources }]);
      reset(); changed(result.data.conversationId);
    } catch (error) { setError(abort.signal.aborted ? 'Consulta cancelada. Podés volver a enviarla.' : errorMessage(error)); }
    finally { if (controller.current === abort) controller.current = null; }
  }
  return <><div className="chat-messages" role="log" aria-live="polite">{messages.length ? messages.map((turn, index) => <article key={index} className={`chat-turn ${turn.role}`}><span className="chat-author">{turn.role === 'user' ? 'Vos' : 'Checkpoint'}</span><p>{turn.content}</p>{turn.sources && turn.sources.length > 0 && <div className="chat-sources"><span>Juegos consultados</span>{turn.sources.filter(source => /^[a-f\d]{24}$/i.test(source.id)).map(source => <Link key={source.id} to={`/games/${source.id}`}>{source.title}</Link>)}</div>}</article>) : <div className="chat-welcome"><span className="chat-symbol">C+</span><h2>¿A qué jugamos hoy?</h2><p>Busquemos algo que te den ganas de jugar.</p><div className="chat-suggestions">{['Busco un indie por menos de USD 20', '¿Qué juegos tienen multijugador?', 'Recomendame algo según mi biblioteca'].map(text => <button key={text} disabled={!enabled} onClick={() => setValue('message', text, { shouldValidate: true })}>{text}</button>)}</div></div>}{isSubmitting && <div className="chat-thinking" role="status">Consultando los juegos…</div>}<div ref={bottom} /></div>
    {!enabled && <Notice>El asistente todavía no está disponible. Podés seguir explorando el catálogo y tu biblioteca.</Notice>}{error && <Notice error>{error}</Notice>}<form className="chat-composer" onSubmit={handleSubmit(submit)} noValidate><label className="sr-only" htmlFor="chat-message">Tu mensaje</label><textarea id="chat-message" rows={3} placeholder="Por ejemplo: quiero una aventura para jugar en PC…" disabled={!enabled || isSubmitting} {...register('message')} aria-invalid={!!errors.message} />{errors.message && <span className="field-error">{errors.message.message}</span>}<div className="composer-actions"><span>Las recomendaciones pueden contener errores. Revisá las fichas de los juegos.</span>{isSubmitting ? <button className="button ghost" type="button" onClick={() => controller.current?.abort()}>Cancelar consulta</button> : <button className="button" disabled={!enabled}>Enviar mensaje</button>}</div></form><p className="chat-privacy">Tu mensaje, el contexto de esta conversación y los datos de juegos consultados se procesan con un servicio de IA. Evitá incluir datos sensibles.</p></>;
}
