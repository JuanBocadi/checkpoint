# Checkpoint · Tu próxima partida

Aplicación full stack de **Juan Cruz Bocadi** para el TP2 de Metodologías y Desarrollos Web. Checkpoint es un catálogo de videojuegos: cualquier visitante puede explorar, buscar y consultar detalles. Los administradores mantienen el catálogo y gestionan roles.

## Enlaces

| Recurso | URL |
| --- | --- |
| Repositorio GitHub | [JuanBocadi/checkpoint](https://github.com/JuanBocadi/checkpoint) |
| Frontend en Render | [checkpoint-juanbocadi.onrender.com](https://checkpoint-juanbocadi.onrender.com) |
| Backend en Render | [checkpoint-api-juanbocadi.onrender.com](https://checkpoint-api-juanbocadi.onrender.com) |

La API utiliza MongoDB Atlas, base `checkpoint`, con seis videojuegos iniciales. Los accesos con GitHub y Google están habilitados en producción.

## Funcionalidades

La interfaz incluye tema oscuro verde, portadas reales de los seis juegos iniciales, destacados seleccionables, filtros por género, fichas con galería de capturas y juegos relacionados, y una página pública de créditos en `/credits`. Las imágenes se sirven desde `frontend/public/images/games/`; procedencia y titulares en [docs/imagenes.md](docs/imagenes.md). Un título sin material asociado conserva una portada gráfica de respaldo.

- Catálogo público, detalle, búsqueda por título, filtros por género y plataforma y paginación.
- Registro, login con email/contraseña, login GitHub y cierre de sesión con Better Auth.
- Sesiones persistidas en MongoDB y consultadas desde React mediante `useSession()`.
- Cada registro público crea un `user`. El cliente no puede elegir su rol.
- `user`: lectura. `admin`: lectura, alta, modificación y baja de videojuegos.
- Panel `/admin` protegido por rol; el backend también comprueba sesión y rol en cada escritura.
- Panel `/admin/users` para cambiar roles con `authClient.admin.setRole`.
- Creación de usuarios desde el panel de administración con Better Auth.
- Biblioteca privada por usuario con estado, horas jugadas, puntuación, notas y favoritos; administración global en `/admin/library`.
- Login con Google además de GitHub, habilitado cuando se configuran sus credenciales.
- Chatbot con LangChain y Groq, herramientas de consulta del catálogo y biblioteca propia, fuentes enlazadas e historial persistente por usuario.
- Formularios de registro, login y videojuegos con React Hook Form y Zod.
- Validaciones de cuerpo y consultas, errores claros, estados vacíos y confirmación de eliminación.

En el catálogo de videojuegos, `user` solo lee y `admin` hace ABM. En la biblioteca personal, `user` crea, consulta, edita y elimina sus registros; `admin` puede gestionar todos. Las conversaciones del asistente son privadas para su dueño, incluso frente al administrador.

## Stack y estructura

Express 5 + TypeScript ESM, driver oficial de MongoDB, Better Auth con su adaptador Mongo y plugin admin; React 19 + Vite + TypeScript + React Router + React Hook Form + Zod. Node.js 24.

```text
backend/
  src/config/         Variables de entorno y conexión a MongoDB
  src/lib/            Configuración de Better Auth
  src/middlewares/    authMiddleware y requireRole
  src/routes/         API REST de videojuegos
  src/schemas/        Validaciones Zod
  src/agent/          Agente LangChain y herramientas de consulta
  src/scripts/        Carga inicial de cuentas y juegos
  scripts/preview.ts  Demo local con base temporal aislada
  tests/              Integración HTTP con Better Auth y MongoDB reales
frontend/
  src/components/     Layout, protección de rutas y componentes visuales
  src/lib/            Cliente de auth y acceso a /api
  src/pages/          Catálogo, detalle, autenticación y administración
  src/schemas/        Validación de formularios
render.yaml           Backend Web Service + frontend Static Site
```

Se utiliza el driver nativo de MongoDB tanto para la entidad como para Better Auth, compartiendo cliente y base. Atlas debe ser un replica set, como los clústeres de Atlas habituales, para las transacciones del adaptador.

## Entidad elegida: videojuegos (`games`)

| Campo | Tipo almacenado | Validación |
| --- | --- | --- |
| `title` | Texto | 2–100 caracteres |
| `description` | Texto | 20–3000 caracteres |
| `genre` | Texto enumerado | Acción, Aventura, RPG, Estrategia, Deportes o Indie |
| `platform` | Texto enumerado | PC, PlayStation, Xbox, Nintendo Switch o Multiplataforma |
| `releaseDate` | Fecha MongoDB | La API recibe `AAAA-MM-DD`, una fecha de calendario válida |
| `price` | Número | De 0 a 1000, USD; 0 significa gratis |
| `multiplayer` | Booleano | `true` o `false` |
| `createdAt`, `updatedAt` | Fecha MongoDB | Automáticas |

Los JSON de respuesta serializan las fechas como ISO 8601. `_id` es un ObjectId serializado a texto. El precio es informativo; la app no procesa compras.

## Correr en local con Atlas y GitHub

Requisitos: Node 24, npm, una base de MongoDB Atlas y una OAuth App de GitHub local.

1. Instalar y configurar el backend:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Completar `.env` con los valores de la tabla. `.env.example` enumera todas las variables sin credenciales reales.

| Variable | Uso / valor local |
| --- | --- |
| `NODE_ENV` | `development` (`production` en Render) |
| `PORT` | `3000` (Render la inyecta en producción) |
| `MONGODB_URI` | URI privada de Atlas con nombre de base, por ejemplo `checkpoint` |
| `BETTER_AUTH_SECRET` | Secreto aleatorio de al menos 32 caracteres, distinto por entorno |
| `BETTER_AUTH_URL` | `http://localhost:5173`; siempre el origen del **frontend** |
| `GITHUB_CLIENT_ID` | Client ID de la OAuth App local |
| `GITHUB_CLIENT_SECRET` | Client secret de esa OAuth App |
| `GOOGLE_CLIENT_ID` | Client ID OAuth de Google, opcional hasta su activación |
| `GOOGLE_CLIENT_SECRET` | Client secret de Google; debe configurarse junto al Client ID |
| `GROQ_API_KEY` | Clave privada del proveedor del chatbot; sin ella el chat responde 503 |
| `GROQ_MODEL` | Modelo Groq; si se omite o está vacío usa `openai/gpt-oss-20b` |
| `SEED_ADMIN_EMAIL` | Email de la cuenta admin de corrección |
| `SEED_ADMIN_PASSWORD` | Contraseña de esa cuenta, mínimo 8 caracteres |
| `SEED_USER_EMAIL` | Email de la cuenta user de corrección |
| `SEED_USER_PASSWORD` | Contraseña de esa cuenta, mínimo 8 caracteres |

Generar el secreto en una terminal local y copiarlo únicamente al `.env`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

2. Crear las cuentas de corrección y los seis juegos iniciales:

```powershell
npm run seed
npm run dev
```

El seed usa Better Auth para hashear contraseñas. Es idempotente: conserva cuentas y juegos existentes, no restablece contraseñas ni cambia roles silenciosamente. Falla si encuentra una cuenta de seed con otro rol. Las variables `SEED_*` solo las necesita ese comando; el servidor no crea usuarios automáticamente al arrancar.

3. En otra terminal, desde la raíz:

```powershell
cd frontend
npm ci
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173). Vite reenvía `/api` a `http://127.0.0.1:3000`. El frontend no necesita variables de entorno ni llama directamente al dominio del backend.

### Demo local sin cuentas externas

Para revisar el catálogo, el ABM y los roles antes de configurar Atlas:

```powershell
cd backend
npm ci
npm run dev:demo
```

En otra terminal ejecutar `npm run dev` en `frontend/`. La demo inicia un MongoDB temporal real en memoria y se borra al detenerla. La primera ejecución descarga el binario de MongoDB. No utiliza Atlas. Puede tomar las credenciales OAuth y Groq de un `.env` privado; sin ellas los accesos sociales y el chatbot muestran su indisponibilidad. No ejecutar esta demo en producción.

### Usuarios de prueba

Estas credenciales son **públicas y exclusivas de demostración/corrección**, no credenciales personales ni secretos de infraestructura.

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | `admin@checkpoint.test` | `AdminCheckpoint2026!` |
| user | `user@checkpoint.test` | `UserCheckpoint2026!` |

Las cuentas están disponibles en producción y en la demo temporal. Para crearlas en otra base, completar las cuatro variables `SEED_*` con estos valores y ejecutar `npm run seed`.

## API

Todas las rutas son relativas al mismo origen del frontend. Los ejemplos también pueden consultarse en el backend, salvo los flujos de autenticación del navegador, que deben pasar por el frontend.

| Método | Ruta | Rol requerido | Resultado |
| --- | --- | --- | --- |
| GET | `/api/health` | Público | Estado y ping a MongoDB |
| GET | `/api/games` | Público | Lista paginada |
| GET | `/api/games/:id` | Público | Detalle |
| POST | `/api/games` | admin | Crear, HTTP 201 y cabecera Location |
| PATCH | `/api/games/:id` | admin | Actualizar uno o más campos |
| DELETE | `/api/games/:id` | admin | Eliminar, HTTP 204 |
| GET | `/api/features` | Público | Disponibilidad de accesos sociales y chat, sin secretos |
| GET | `/api/library` | Sesión | Biblioteca propia; `scope=all` solo para admin |
| GET | `/api/library/:id` | Dueño o admin | Detalle de registro |
| POST | `/api/library` | Sesión | Agregar un juego a la biblioteca propia, 201 |
| PATCH | `/api/library/:id` | Dueño o admin | Editar progreso, puntuación y notas |
| DELETE | `/api/library/:id` | Dueño o admin | Quitar registro, 204 |
| POST | `/api/chat` | Sesión | Consultar al asistente, guardar respuesta e historial |
| GET | `/api/chat/conversations` | Sesión | Últimas 30 conversaciones propias |
| GET | `/api/chat/conversations/:id` | Dueño | Historial de conversación |
| DELETE | `/api/chat/conversations/:id` | Dueño | Eliminar conversación, 204 |
| POST | `/api/auth/sign-up/email` | Público | Registrar usuario con rol user |
| POST | `/api/auth/sign-in/email` | Público | Iniciar sesión |
| POST | `/api/auth/sign-in/social` | Público | Iniciar OAuth GitHub o Google |
| GET | `/api/auth/callback/github` | Flujo OAuth | Callback GitHub |
| GET | `/api/auth/callback/google` | Flujo OAuth | Callback Google |
| GET | `/api/auth/get-session` | Público | Sesión actual o null |
| POST | `/api/auth/sign-out` | Sesión | Cerrar sesión |
| GET | `/api/auth/admin/list-users` | admin | Listar usuarios |
| POST | `/api/auth/admin/set-role` | admin | Cambiar rol |
| POST | `/api/auth/admin/create-user` | admin | Crear usuario con rol |
| GET/POST | `/api/auth/*` | Según operación | Endpoints estándar de Better Auth y plugin admin |

Las tres rutas de escritura de videojuegos usan `authMiddleware` seguido de `requireRole('admin')`.

Todas las rutas de biblioteca y chat usan `authMiddleware`. Los filtros de propiedad se aplican en MongoDB usando el usuario de la sesión. El cuerpo del cliente nunca puede asignar `ownerId`, transferir propiedad o elegir otro usuario para el chat. El acceso a registros privados ajenos responde 404, para no revelar su existencia. `scope=all` por un user devuelve 403.

Consultas admitidas en el listado: `q` (título, hasta 100 caracteres), `genre`, `platform`, `page` (entero desde 1) y `limit` (1–50, por defecto 12). La búsqueda trata el texto de forma literal y no ejecuta expresiones regulares ingresadas por el cliente.

```http
GET /api/games?q=Hollow&genre=Indie&page=1&limit=12
```

Ejemplo de cuerpo para crear; en PATCH se puede enviar un subconjunto no vacío:

```json
{
  "title": "Hollow Knight",
  "description": "Explorá un reino subterráneo en una aventura de plataformas y acción.",
  "genre": "Indie",
  "platform": "Multiplataforma",
  "releaseDate": "2017-02-24",
  "price": 14.99,
  "multiplayer": false
}
```

Lista: `{ "data": [], "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 } }`. Detalle/alta/edición: `{ "data": { ... } }`.

Errores de la API propia: `{ "error": { "message": "…", "issues": [{ "field": "price", "message": "…" }] } }`; `issues` aparece cuando corresponde a validaciones. Better Auth utiliza su propio formato `{ "message": "…", "code": "…" }`.

- **400**: datos inválidos, PATCH vacío, ID mal formado o JSON inválido.
- **401**: sin sesión o contraseña incorrecta.
- **403**: sin rol permitido.
- **404**: recurso inexistente o ruta desconocida.
- **409**: juego duplicado en la biblioteca o conversación que ya está procesando una consulta.
- **413**: cuerpo superior a 32 KB.
- **429**: más de 10 consultas de chat por usuario en una ventana de 10 minutos.
- **503**: proveedor del chatbot sin configurar o temporalmente indisponible.
- **500**: error interno, sin detalles privados en la respuesta.

## Desplegar en Render

1. Crear un repositorio propio en GitHub y subir el historial local de commits. No subir `.env`, dependencias o archivos compilados.
2. En Atlas crear un clúster, una base `checkpoint` y un usuario de base con permisos sobre esa base. Autorizar en Network Access las IP de salida informadas por el servicio Render y la IP local necesaria para ejecutar el seed. Copiar la URI privada solamente a `.env` y Render. No incluirla en el README ni en commits.
3. Crear una **OAuth App de GitHub de producción** separada de la de desarrollo para mantener las credenciales y URLs de cada entorno independientes.
4. En Render, **New → Blueprint**, elegir el repo y revisar `render.yaml`. Alternativamente crear ambos servicios manualmente con esta tabla:

| Configuración | Backend | Frontend |
| --- | --- | --- |
| Tipo | Web Service | Static Site |
| Root Directory | `backend` | `frontend` |
| Build | `npm ci --include=dev && npm run build` | `npm ci --include=dev && npm run build` |
| Start | `npm start` | — |
| Publish Directory | — | `dist` |
| Node | 24 | 24 |
| Health check | `/api/health` | — |

5. En el backend definir `NODE_ENV=production`, `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GROQ_API_KEY`. El Blueprint genera un secreto; conservarlo entre despliegues. Las credenciales OAuth deben ser las de producción. Render proporciona `PORT`. `GROQ_MODEL` es configuración pública, no una clave.
6. `BETTER_AUTH_URL` debe ser la URL real del frontend, sin `/api`. Si Render asigna otros nombres, actualizar `render.yaml`, esa variable y las URLs documentadas.
7. En el Static Site, mantener estos **rewrites en este orden**:

| Source | Destination | Action |
| --- | --- | --- |
| `/api/*` | `https://<backend-real>.onrender.com/api/*` | Rewrite |
| `/*` | `/index.html` | Rewrite |

El primer rewrite mantiene autenticación y cookies bajo el dominio del frontend. El segundo permite F5 en `/games/:id`, `/login`, `/admin` y demás rutas de React.

8. Completar la OAuth App y ejecutar el seed contra Atlas con las cuentas de corrección. Puede ejecutarse desde local con un `.env` privado apuntando a la base de producción; el script no necesita crear un servicio adicional ni exponer contraseñas por HTTP.
9. Comprobar `/api/health`, el login y la recarga de las rutas internas desde la URL del frontend.

`npm start` da 2000 ms a cada intento de selección de familia de red de Node para reducir los cortes prematuros descritos en el [problema de conectividad de Node](https://github.com/nodejs/node/issues/54359). Conserva IPv4/IPv6 y la validación TLS.

### GitHub OAuth

En GitHub: Settings → Developer settings → OAuth Apps.

| Campo | Desarrollo | Producción |
| --- | --- | --- |
| Homepage URL | `http://localhost:5173` | URL real del frontend |
| Callback URL | `http://localhost:5173/api/auth/callback/github` | `https://<frontend-real>.onrender.com/api/auth/callback/github` |

El callback apunta al **frontend** y atraviesa el proxy `/api`. Guardar el Client Secret solo en `.env` o en Environment de Render. Better Auth guarda usuarios, cuentas OAuth, sesiones y verificaciones en las colecciones `user`, `account`, `session` y `verification` de MongoDB. El plugin admin agrega el campo de rol.

### Google OAuth para cualquier cuenta

En [Google Cloud Console](https://console.cloud.google.com/), configurar Google Auth Platform para usuarios **External** y crear un cliente OAuth de tipo **Web application**. Mantener proyectos y clientes separados para desarrollo y producción, como indica la política de Google. Configurar el origen y callback de cada entorno en su cliente correspondiente:

- Local: `http://localhost:5173/api/auth/callback/google`.
- Producción: `https://<frontend-real>.onrender.com/api/auth/callback/google`.

Se solicitan los datos de identidad openid, email y profile. Configurar Client ID/Secret en el backend y mantener Audience en **In production** con usuarios **External**. En Información de marca, usar la URL del frontend como página principal y `/privacy` como política de privacidad. La aplicación no tiene una lista de emails permitidos: las nuevas cuentas sociales reciben el rol `user`.

### Biblioteca personal

Desde la ficha de un juego, **Agregar a mi biblioteca** crea un registro pendiente para la persona autenticada. `/library` permite filtrar por estado y favoritos y editar horas, puntuación de 1 a 10, notas y favorito. Cada juego puede aparecer una sola vez por persona, protegido por un índice compuesto único (`ownerId`, `gameId`).

`/admin/library` muestra todas las bibliotecas y permite editar o quitar sus registros. El catálogo sigue siendo público. Si un administrador elimina un juego del catálogo, el progreso histórico personal se conserva y la interfaz lo identifica como juego eliminado.

### Asistente con LangChain

1. Crear una cuenta en [Groq Console](https://console.groq.com/) y una API key para este proyecto.
2. Guardar `GROQ_API_KEY` en `.env` y en Render; nunca en el frontend o en Git.
3. Opcionalmente elegir `GROQ_MODEL`, por defecto `openai/gpt-oss-20b`.
4. Iniciar sesión y abrir `/chat`.

El agente `createAgent` usa `ChatGroq` y dos herramientas de lectura: `search_catalog` consulta MongoDB con filtros de título, género, plataforma, precio y multijugador; `my_library` consulta solo la biblioteca del usuario que viene de la sesión. El modelo no puede elegir el dueño de una biblioteca, modificar juegos o cambiar roles. La recuperación de datos es mediante herramientas sobre MongoDB; no se utiliza un índice de embeddings.

El chat conserva hasta 40 mensajes por conversación y envía al modelo las últimas 12 intervenciones como contexto. Tiene timeout, cancelación al abandonar la página, bloqueo de envíos simultáneos por conversación y límite de 10 solicitudes cada 10 minutos por usuario, persistido en MongoDB con limpieza TTL. No registra claves ni contenido de mensajes en logs. Las notas personales de la biblioteca no se envían al modelo.

Sin clave o ante errores del proveedor devuelve 503 y la interfaz lo comunica. Los tests sustituyen el proveedor externo de manera explícita para verificar permisos, persistencia y errores sin consumir cuota; además prueban el ciclo de herramientas con el modelo de prueba oficial de LangChain.

## Compilación y pruebas

```powershell
cd backend
npm run build
npm test
```

```powershell
cd frontend
npm run build
```

La suite de integración crea replica sets MongoDB temporales, inicia Express y hace solicitudes HTTP reales. Comprueba lectura pública; registro y rol por defecto; rechazo de escalamiento; sesiones; HTTP 401/403; creación 201; validaciones; filtros/paginación; PATCH; 400/404; DELETE 204; creación de usuarios y roles; revocación al salir; bibliotecas privadas; aislamiento de conversaciones; callbacks OAuth; ciclo de herramientas de LangChain; errores y límites de chat. No usa datos de Atlas ni credenciales externas. Los logins OAuth reales, el proveedor Groq y los rewrites de Render deben probarse después de configurar y desplegar.

GitHub Actions compila ambos proyectos y ejecuta los tests del backend sin secretos de repositorio.

## Seguridad y referencia académica

`.gitignore` excluye `.env`, variantes privadas, dependencias y compilados. Ningún secreto de infraestructura pertenece al código: BETTER_AUTH_SECRET, Client Secret de GitHub y URI de Atlas se configuran por entorno. Nunca colocar secretos en variables `VITE_*`, ya que se publican en el navegador. Las contraseñas de prueba anteriores son intencionalmente públicas para la corrección.

Base de referencia: [T-Arias/mdw-2026](https://github.com/T-Arias/mdw-2026), especialmente [clase 13: Better Auth y Render](https://github.com/T-Arias/mdw-2026/tree/main/clase%2013). Se reutilizan el enfoque de autenticación, las capas de protección y el esquema de proxy; la entidad, interfaz y funcionalidad de catálogo se desarrollaron para Checkpoint. Las portadas, ilustraciones y capturas de los seis juegos iniciales proceden de sus fichas oficiales en Steam y conservan los derechos de sus respectivos titulares; se documentan en [docs/imagenes.md](docs/imagenes.md) y `/credits`. La interfaz, el icono de Checkpoint y los gráficos de respaldo son propios. Los títulos comerciales se usan como datos de ejemplo.

## Router: rutas públicas, privadas y protegidas por rol

Este repositorio también se utiliza para la actividad de implementación de los tres tipos de rutas, tanto en frontend como en backend.

| Tipo de ruta | Ejemplo en frontend | Ejemplo en backend | Acceso |
| --- | --- | --- | --- |
| Pública | `/` y `/games/:id` | `GET /api/games` y `GET /api/games/:id` | Cualquier visitante, sin iniciar sesión. |
| Privada | `/library` y `/chat` | `GET /api/library` y `GET /api/chat/conversations` | Cualquier usuario autenticado. Cada persona consulta sus propios registros. |
| Privada protegida por rol | `/admin` y `/admin/games/new` | `POST /api/games`, `PATCH /api/games/:id` y `DELETE /api/games/:id` | Solo usuarios autenticados con rol `admin`. |

En el frontend, [main.tsx](frontend/src/main.tsx) configura `BrowserRouter`, `Routes` y las rutas anidadas. [ProtectedRoute](frontend/src/components/ProtectedRoute.tsx) consulta la sesión de Better Auth: sin sesión redirige a `/login`; con `adminOnly={false}` permite usuarios autenticados; por defecto exige el rol `admin` y muestra **Sin permisos** al resto.

En el backend, [app.ts](backend/src/app.ts) monta los routers de Express. Las [lecturas de videojuegos](backend/src/routes/games.routes.ts) son públicas; el [router de biblioteca](backend/src/routes/library.routes.ts) exige `authMiddleware`; las escrituras de videojuegos exigen `authMiddleware` y `requireRole("admin")`. Ambos controles están en [auth.middleware.ts](backend/src/middlewares/auth.middleware.ts): sin sesión devuelve **401** y sin el rol requerido devuelve **403**.

Para probarlo, abrir el catálogo sin iniciar sesión; entrar a `/library`, que redirige al login; iniciar sesión con la cuenta `user` de prueba y acceder a su biblioteca; intentar `/admin`, que muestra **Sin permisos**; finalmente cerrar sesión e ingresar con la cuenta `admin` para acceder al panel de administración. Las credenciales están en la sección **Usuarios de prueba**.
