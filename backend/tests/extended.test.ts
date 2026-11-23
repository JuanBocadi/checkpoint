import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { ObjectId } from 'mongodb';

test('Opcionales: propiedad de registros, OAuth y chat persistente', { timeout: 180000 }, async t => {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  Object.assign(process.env, {
    NODE_ENV: 'test', MONGODB_URI: mongo.getUri('checkpoint_extended'),
    BETTER_AUTH_SECRET: randomBytes(48).toString('base64'), BETTER_AUTH_URL: 'http://localhost:5173',
    GITHUB_CLIENT_ID: 'test-client', GITHUB_CLIENT_SECRET: 'test-secret',
    GOOGLE_CLIENT_ID: 'test-google-client', GOOGLE_CLIENT_SECRET: 'test-google-secret', GROQ_API_KEY: 'test-key-no-network',
  });
  const { createApp } = await import('../src/app.js');
  const { auth } = await import('../src/lib/auth.js');
  const { client, connectDatabase, db } = await import('../src/config/db.js');
  const { env } = await import('../src/config/env.js');
  const { createCatalogTools } = await import('../src/agent/catalog-agent.js');
  await connectDatabase();
  let calledUser = '';
  let historyLength = 0;
  // Solo el proveedor externo se reemplaza. Auth, DB, rutas y herramientas son reales.
  const app = createApp({ assistant: async ({ userId, history, message }) => {
    calledUser = userId; historyLength = history.length;
    if (message === 'simular error') throw new Error('ProviderUnavailable');
    return { reply: 'Respuesta del proveedor de prueba.', sources: [] };
  } });
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const address = server.address(); assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}/api`;
  const request = (path: string, method = 'GET', body?: unknown, cookie = '') => fetch(`${url}${path}`, {
    method, headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json', Cookie: cookie },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const password = randomBytes(24).toString('base64url');
  const accounts: Record<string, { id: string; cookie: string }> = {};
  let gameId = '';
  let entryId = '';
  let conversationId = '';
  const entry = { status: 'Jugando', hoursPlayed: 12, rating: 8, notes: 'Notas privadas de prueba.', favorite: true };
  try {
    for (const name of ['alice', 'bob', 'admin']) {
      await auth.api.createUser({ body: { email: `${name}@example.test`, name, password, role: name === 'admin' ? 'admin' : 'user' } });
      const response = await request('/auth/sign-in/email', 'POST', { email: `${name}@example.test`, password });
      assert.equal(response.status, 200);
      const payload = await response.json();
      accounts[name] = { id: payload.user.id, cookie: response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ') };
    }
    const game = await request('/games', 'POST', { title: 'Indie cooperativo', description: 'Una aventura cooperativa para integrar las pruebas.', genre: 'Indie', platform: 'PC', releaseDate: '2026-11-23', price: 12, multiplayer: true }, accounts.admin.cookie);
    assert.equal(game.status, 201); gameId = (await game.json()).data._id;

    await t.test('biblioteca requiere sesión y crea propiedad desde la sesión', async () => {
      assert.equal((await request('/library')).status, 401);
      assert.equal((await request('/library', 'POST', { ...entry, gameId })).status, 401);
      assert.equal((await request('/library', 'POST', { ...entry, gameId, ownerId: accounts.bob.id }, accounts.alice.cookie)).status, 400);
      const response = await request('/library', 'POST', { ...entry, gameId }, accounts.alice.cookie);
      assert.equal(response.status, 201);
      const { data } = await response.json(); entryId = data._id;
      assert.equal(data.ownerId, accounts.alice.id);
      assert.equal((await request('/library', 'POST', { ...entry, gameId }, accounts.alice.cookie)).status, 409);
    });
    await t.test('cada user ve solo lo propio y no puede leer, editar o borrar otro registro', async () => {
      assert.equal((await (await request('/library', 'GET', undefined, accounts.alice.cookie)).json()).pagination.total, 1);
      assert.equal((await (await request('/library', 'GET', undefined, accounts.bob.cookie)).json()).pagination.total, 0);
      for (const method of ['GET', 'PATCH', 'DELETE']) assert.equal((await request(`/library/${entryId}`, method, method === 'PATCH' ? { hoursPlayed: 999 } : undefined, accounts.bob.cookie)).status, 404);
      assert.equal((await request('/library?scope=all', 'GET', undefined, accounts.bob.cookie)).status, 403);
      assert.equal((await request(`/library/${entryId}`, 'PATCH', { ownerId: accounts.bob.id }, accounts.alice.cookie)).status, 400);
      assert.equal((await request(`/library/${entryId}`, 'PATCH', { hoursPlayed: -1 }, accounts.alice.cookie)).status, 400);
    });
    await t.test('dueño edita progreso; filtros y admin ve y edita registros ajenos', async () => {
      const changed = await request(`/library/${entryId}`, 'PATCH', { hoursPlayed: 20, status: 'Completado' }, accounts.alice.cookie);
      assert.equal(changed.status, 200);
      const list = await (await request(`/library?status=Completado&favorite=true&gameId=${gameId}`, 'GET', undefined, accounts.alice.cookie)).json();
      assert.equal(list.pagination.total, 1); assert.equal(list.data[0].game.title, 'Indie cooperativo');
      assert.equal((await request('/library?status=incorrecto', 'GET', undefined, accounts.alice.cookie)).status, 400);
      assert.equal((await (await request('/library?scope=all', 'GET', undefined, accounts.admin.cookie)).json()).pagination.total, 1);
      assert.equal((await request(`/library/${entryId}`, 'PATCH', { hoursPlayed: 21 }, accounts.admin.cookie)).status, 200);
      assert.equal((await request(`/library/${entryId}`, 'GET', undefined, accounts.admin.cookie)).status, 200);
    });
    await t.test('herramientas del agente consultan catálogo y solo la biblioteca del usuario capturado', async () => {
      const sources = new Map();
      const toolsAlice = createCatalogTools(accounts.alice.id, sources);
      const catalog = JSON.parse(await toolsAlice[0].invoke({ search: null, genre: 'Indie', platform: 'PC', maxPrice: 20, multiplayer: true }));
      assert.equal(catalog.total, 1); assert.ok(sources.has(gameId));
      const alice = JSON.parse(await toolsAlice[1].invoke({}));
      assert.equal(alice.records.length, 1); assert.equal(alice.records[0].hoursPlayed, 21);
      assert.equal(JSON.stringify(alice).includes(entry.notes), false);
      const toolsBob = createCatalogTools(accounts.bob.id, new Map());
      assert.equal(JSON.parse(await toolsBob[1].invoke({})).records.length, 0);
    });
    await t.test('LangChain completa el ciclo modelo-herramientas y respeta el usuario capturado', async () => {
      const { createAgent, FakeToolCallingModel } = await import('langchain');
      const sources = new Map();
      const model = new FakeToolCallingModel({ toolCalls: [[
        { id: 'catalog-1', name: 'search_catalog', args: { search: null, genre: null, platform: null, maxPrice: null, multiplayer: null } },
        { id: 'library-1', name: 'my_library', args: {} },
      ], []] });
      const agent = createAgent({ model, tools: createCatalogTools(accounts.bob.id, sources) });
      const result = await agent.invoke({ messages: [{ role: 'user', content: 'Buscá un juego y consultá mi biblioteca.' }] }, { recursionLimit: 8 });
      const toolMessages = result.messages.filter(message => message.type === 'tool');
      assert.equal(toolMessages.length, 2);
      assert.equal(JSON.parse(toolMessages[0].text).total, 1);
      assert.equal(JSON.parse(toolMessages[1].text).records.length, 0);
      assert.ok(sources.has(gameId));
    });
    await t.test('OAuth genera callbacks del frontend para GitHub y Google', async () => {
      for (const provider of ['github', 'google']) {
        const response = await request('/auth/sign-in/social', 'POST', { provider, callbackURL: '/library' });
        assert.equal(response.status, 200);
        const payload = await response.json();
        const authorization = new URL(payload.url);
        assert.equal(authorization.searchParams.get('redirect_uri'), `http://localhost:5173/api/auth/callback/${provider}`);
      }
    });
    await t.test('admin crea usuarios; user no puede crear cuentas con rol', async () => {
      const body = { email: 'newuser@example.test', password, name: 'Usuario creado por admin', role: 'user' };
      assert.equal((await request('/auth/admin/create-user', 'POST', body, accounts.bob.cookie)).status, 403);
      assert.equal((await request('/auth/admin/create-user', 'POST', body, accounts.admin.cookie)).status, 200);
    });
    await t.test('chat exige sesión, valida entrada y persiste conversación propia', async () => {
      assert.equal((await request('/chat', 'POST', { message: 'Hola' })).status, 401);
      assert.equal((await request('/chat', 'POST', { message: '' }, accounts.alice.cookie)).status, 400);
      assert.equal((await request('/chat', 'POST', { message: 'Hola', ownerId: accounts.bob.id }, accounts.alice.cookie)).status, 400);
      const response = await request('/chat', 'POST', { message: 'Busco un juego indie' }, accounts.alice.cookie);
      assert.equal(response.status, 200);
      conversationId = (await response.json()).data.conversationId;
      assert.equal(calledUser, accounts.alice.id); assert.equal(historyLength, 0);
      const saved = await (await request(`/chat/conversations/${conversationId}`, 'GET', undefined, accounts.alice.cookie)).json();
      assert.equal(saved.data.messages.length, 2);
      assert.equal((await request('/chat', 'POST', { message: '¿Y para jugar de a dos?', conversationId }, accounts.alice.cookie)).status, 200);
      assert.equal(historyLength, 2);
    });
    await t.test('conversaciones privadas incluso frente a admin; no hay lectura ni escritura cruzada', async () => {
      for (const name of ['bob', 'admin']) {
        assert.equal((await request(`/chat/conversations/${conversationId}`, 'GET', undefined, accounts[name].cookie)).status, 404);
        assert.equal((await request(`/chat/conversations/${conversationId}`, 'DELETE', undefined, accounts[name].cookie)).status, 404);
        assert.equal((await request('/chat', 'POST', { message: 'Continuar chat ajeno', conversationId }, accounts[name].cookie)).status, 404);
      }
      assert.equal((await (await request('/chat/conversations', 'GET', undefined, accounts.bob.cookie)).json()).data.length, 0);
    });
    await t.test('errores de proveedor liberan el bloqueo; sin API key devuelve 503', async () => {
      assert.equal((await request('/chat', 'POST', { message: 'simular error', conversationId }, accounts.alice.cookie)).status, 503);
      assert.equal((await request('/chat', 'POST', { message: 'Volver a intentar', conversationId }, accounts.alice.cookie)).status, 200);
      const key = env.GROQ_API_KEY; env.GROQ_API_KEY = undefined;
      try { assert.equal((await request('/chat', 'POST', { message: 'Otra consulta' }, accounts.bob.cookie)).status, 503); }
      finally { env.GROQ_API_KEY = key; }
    });
    await t.test('límite de consultas, eliminación propia y aislamiento al borrar', async () => {
      const window = Math.floor(Date.now() / 600000);
      await db.collection<{ _id: string; count: number; expiresAt: Date }>('chat_limits').updateOne({ _id: `${accounts.bob.id}:${window}` }, { $set: { count: 10, expiresAt: new Date(Date.now() + 1200000) } }, { upsert: true });
      const response = await request('/chat', 'POST', { message: 'Prueba del límite' }, accounts.bob.cookie);
      assert.equal(response.status, 429); assert.ok(response.headers.get('retry-after'));
      assert.equal((await request(`/chat/conversations/${conversationId}`, 'DELETE', undefined, accounts.alice.cookie)).status, 204);
      assert.equal((await request(`/chat/conversations/${conversationId}`, 'GET', undefined, accounts.alice.cookie)).status, 404);
      assert.equal((await request(`/library/${entryId}`, 'DELETE', undefined, accounts.admin.cookie)).status, 204);
      assert.equal((await request(`/library/${entryId}`, 'GET', undefined, accounts.alice.cookie)).status, 404);
      const created = await request('/library', 'POST', { ...entry, gameId }, accounts.bob.cookie);
      assert.equal(created.status, 201);
      const id = (await created.json()).data._id;
      assert.equal((await request(`/library/${id}`, 'DELETE', undefined, accounts.bob.cookie)).status, 204);
      assert.equal(await db.collection('library_entries').countDocuments({ gameId: new ObjectId(gameId) }), 0);
    });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await client.close(); await mongo.stop();
  }
});
