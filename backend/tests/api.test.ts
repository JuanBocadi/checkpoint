import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { test } from 'node:test';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

test('API real: Better Auth, roles, validación y CRUD con MongoDB', { timeout: 180000 }, async t => {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongo.getUri('checkpoint_test');
  process.env.BETTER_AUTH_SECRET = randomBytes(48).toString('base64');
  process.env.BETTER_AUTH_URL = 'http://localhost:5173';
  process.env.GITHUB_CLIENT_ID = 'test-client';
  process.env.GITHUB_CLIENT_SECRET = 'test-secret';
  const { app } = await import('../src/app.js');
  const { auth } = await import('../src/lib/auth.js');
  const { client, connectDatabase, db } = await import('../src/config/db.js');
  await connectDatabase();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}`;
  const password = randomBytes(24).toString('base64url');
  const request = (path: string, method = 'GET', body?: unknown, cookie = '') => fetch(`${url}/api${path}`, {
    method,
    headers: { Origin: 'http://localhost:5173', 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const cookies = (response: Response) => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  let userCookie = '';
  let adminCookie = '';
  let id = '';
  const game = { title: 'Juego de integración', description: 'Descripción suficientemente extensa para probar la API.', genre: 'Indie', platform: 'PC', releaseDate: '2026-11-23', price: 19.99, multiplayer: true };
  try {
    await t.test('lectura pública y salud', async () => {
      assert.equal((await request('/health')).status, 200);
      const response = await request('/games');
      assert.equal(response.status, 200);
      assert.equal((await response.json()).pagination.total, 0);
    });
    await t.test('registro bloquea rol enviado por cliente, asigna user y persiste sesión', async () => {
      const attempt = await request('/auth/sign-up/email', 'POST', { email: 'reader@example.test', password, name: 'Lector', role: 'admin' });
      assert.equal(attempt.status, 400);
      assert.equal((await attempt.json()).code, 'FIELD_NOT_ALLOWED');
      const response = await request('/auth/sign-up/email', 'POST', { email: 'reader@example.test', password, name: 'Lector' });
      const payload = await response.json();
      assert.equal(response.status, 200, JSON.stringify(payload));
      assert.equal(payload.user.role, 'user');
      userCookie = cookies(response);
      assert.ok(userCookie.includes('session_token'));
      const session = await request('/auth/get-session', 'GET', undefined, userCookie);
      assert.equal((await session.json()).user.role, 'user');
      assert.equal(await db.collection('session').countDocuments(), 1);
    });
    await t.test('escritura 401 sin sesión, 403 con user y sin escalamiento de roles', async () => {
      for (const [path, method, body] of [['/games', 'POST', game], ['/games/000000000000000000000000', 'PATCH', { title: 'Cambio' }], ['/games/000000000000000000000000', 'DELETE', undefined]] as const) {
        assert.equal((await request(path, method, body)).status, 401);
        assert.equal((await request(path, method, body, userCookie)).status, 403);
      }
      assert.equal((await request('/auth/admin/set-role', 'POST', { userId: 'inventado', role: 'admin' }, userCookie)).status, 403);
    });
    await t.test('login admin y validaciones claras al crear', async () => {
      await auth.api.createUser({ body: { email: 'admin@example.test', password, name: 'Admin de prueba', role: 'admin' } });
      const login = await request('/auth/sign-in/email', 'POST', { email: 'admin@example.test', password });
      assert.equal(login.status, 200); adminCookie = cookies(login);
      const response = await request('/games', 'POST', { ...game, price: -1, releaseDate: '2026-02-30', multiplayer: 'sí' }, adminCookie);
      assert.equal(response.status, 400);
      const body = await response.json();
      assert.ok(body.error.issues.some((i: { field: string }) => i.field === 'price'));
      assert.ok(body.error.issues.some((i: { field: string }) => i.field === 'releaseDate'));
      assert.equal((await request('/games', 'POST', { ...game, unexpected: true }, adminCookie)).status, 400);
    });
    await t.test('crear 201, detalle y tipos persistidos', async () => {
      const response = await request('/games', 'POST', game, adminCookie);
      assert.equal(response.status, 201);
      const { data } = await response.json(); id = data._id;
      assert.equal(response.headers.get('location'), `/api/games/${id}`);
      assert.equal(typeof data.price, 'number'); assert.equal(typeof data.multiplayer, 'boolean');
      assert.equal((await (await request(`/games/${id}`)).json()).data.title, game.title);
      assert.ok((await db.collection('games').findOne({ title: game.title }))?.releaseDate instanceof Date);
    });
    await t.test('paginación, filtros y búsqueda literal sin inyección regex', async () => {
      assert.equal((await (await request('/games?q=integraci%C3%B3n&genre=Indie&platform=PC&limit=1')).json()).pagination.total, 1);
      assert.equal((await (await request('/games?q=.*')).json()).pagination.total, 0);
      assert.equal((await request('/games?page=0')).status, 400);
      assert.equal((await request('/games?limit=51')).status, 400);
    });
    await t.test('editar parcial, invalidar cuerpo vacío y campos incorrectos', async () => {
      assert.equal((await request(`/games/${id}`, 'PATCH', {}, adminCookie)).status, 400);
      assert.equal((await request(`/games/${id}`, 'PATCH', { price: '12' }, adminCookie)).status, 400);
      const response = await request(`/games/${id}`, 'PATCH', { title: 'Título actualizado', price: 0 }, adminCookie);
      assert.equal(response.status, 200);
      const { data } = await response.json();
      assert.equal(data.title, 'Título actualizado'); assert.equal(data.description, game.description);
    });
    await t.test('404 inexistentes, 400 ID inválido, borrar 204', async () => {
      assert.equal((await request('/games/no-es-id')).status, 400);
      for (const method of ['GET', 'PATCH', 'DELETE']) assert.equal((await request('/games/000000000000000000000000', method, method === 'PATCH' ? { price: 1 } : undefined, adminCookie)).status, 404);
      assert.equal((await request(`/games/${id}`, 'DELETE', undefined, adminCookie)).status, 204);
      assert.equal((await request(`/games/${id}`)).status, 404);
    });
    await t.test('plugin admin cambia roles y user no puede listar usuarios', async () => {
      assert.equal((await request('/auth/admin/list-users', 'GET', undefined, userCookie)).status, 403);
      const users = await (await request('/auth/admin/list-users', 'GET', undefined, adminCookie)).json();
      const user = users.users.find((u: { email: string }) => u.email === 'reader@example.test');
      assert.ok(user);
      assert.equal((await request('/auth/admin/set-role', 'POST', { userId: user.id, role: 'admin' }, adminCookie)).status, 200);
      const session = await (await request('/auth/get-session', 'GET', undefined, userCookie)).json();
      assert.equal(session.user.role, 'admin');
    });
    await t.test('logout revoca la sesión en Mongo; contraseña incorrecta 401', async () => {
      assert.equal((await request('/auth/sign-in/email', 'POST', { email: 'reader@example.test', password: 'incorrecta123' })).status, 401);
      assert.equal((await request('/auth/sign-out', 'POST', {}, userCookie)).status, 200);
      assert.equal(await (await request('/auth/get-session', 'GET', undefined, userCookie)).json(), null);
      assert.equal((await request('/games', 'POST', game, userCookie)).status, 401);
    });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await client.close(); await mongo.stop();
  }
});
