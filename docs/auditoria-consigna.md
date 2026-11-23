# Auditoría de la consigna del TP2

Revisión del 23/11/2026 de la consigna y las aclaraciones del profesor compartidas por Juan. Incluye los mínimos, los cuatro opcionales y el agente/chat mencionado en las clases. Se contrastaron el código, el README, Git, MongoDB Atlas y el despliegue público.

**Resultado: no se encontraron requisitos de implementación faltantes.** Las tablas distinguen la evidencia de código, las pruebas automatizadas, las comprobaciones HTTP en producción y las observaciones en navegador. Los límites de la verificación se detallan al final.

Versión funcional publicada: `293bd7b`, incluido el rediseño visual. La [ejecución de GitHub Actions de esa versión](https://github.com/JuanBocadi/checkpoint/actions/runs/45217419455) terminó correctamente: compilación del backend, sus 23 pruebas y compilación del frontend. Los commits posteriores documentan las comprobaciones.

## Repositorio y documentación

| Punto solicitado | Estado y evidencia |
| --- | --- |
| Aplicación propia, repositorio GitHub, `backend/` y `frontend/` | Cumplido. [JuanBocadi/checkpoint](https://github.com/JuanBocadi/checkpoint), entidad e interfaz propias de videojuegos; cada carpeta tiene su `package.json`. |
| Tomar como referencia el repositorio de la materia | Cumplido. La [clase 13](https://github.com/T-Arias/mdw-2026/tree/main/clase%2013) se cita en el [README](../README.md); se aplican Better Auth, protección por roles y proxy del mismo origen. |
| README raíz: descripción de la app y entidad | Cumplido. Secciones de introducción, funcionalidades y entidad `games`, con campos y tipos. |
| README: URLs reales de frontend y backend en Render | Cumplido. Ambas URLs aparecen en la tabla inicial y fueron comprobadas. |
| README: comandos y variables para correr localmente | Cumplido. Instalación, `.env`, configuración OAuth, seed y ejecución en dos terminales; alternativa de demo aislada. |
| README: tabla de endpoints, método, ruta y rol | Cumplido. Incluye CRUD, autenticación, bibliotecas, chat y administración de usuarios. |
| README: usuarios de prueba admin y común, con email y contraseña | Cumplido. Ambas cuentas existen en Atlas y el login fue comprobado a través del frontend de producción. |
| `backend/.env.example` con todas las variables, sin valores reales | Cumplido. [Archivo de ejemplo](../backend/.env.example): 15 variables, incluidas OAuth, Groq y seed; valores vacíos. Se comparó con las variables usadas por la aplicación. |
| Sin secretos en archivos versionados ni historial | Verificado dentro del alcance del escaneo: 195 blobs del historial alcanzable revisados, sin coincidencias con secretos privados configurados ni patrones de credenciales buscados. `.env` y `.local/` no están versionados; [`.gitignore`](../.gitignore) los excluye. Las contraseñas de corrección son públicas por requisito. |
| Commits chicos y descriptivos, no un único commit final | Cumplido. El historial contiene commits separados `feat:`, `fix:` y `docs:` para backend, autenticación, frontend, extras, despliegue y diseño. |

## Backend

| Punto solicitado | Estado y evidencia |
| --- | --- |
| Express + TypeScript + MongoDB | Cumplido. [Dependencias y scripts](../backend/package.json), [aplicación Express](../backend/src/app.ts) y [conexión MongoDB](../backend/src/config/db.ts). Conexión real a Atlas comprobada. |
| Entidad propia distinta de students y subjects | Cumplido. `games`: videojuegos. No se usa la entidad académica del ejemplo. |
| Mínimo 4 campos y 3 tipos | Cumplido. Siete campos de negocio: `title`, `description`, `genre`, `platform` (texto), `price` (número), `multiplayer` (booleano), `releaseDate` (fecha BSON). Se verificaron los tipos almacenados en Atlas. Además tiene fechas de creación/edición. |
| GET `/api/<recurso>` | Cumplido. `GET /api/games`, lectura pública, lista paginada con búsqueda y filtros. |
| GET `/api/<recurso>/:id` | Cumplido. `GET /api/games/:id`, detalle público. |
| POST `/api/<recurso>` | Cumplido. `POST /api/games`, solo admin, devuelve 201. |
| PUT / PATCH `/api/<recurso>/:id` | Cumplido mediante `PATCH /api/games/:id`, solo admin. La consigna admite cualquiera de los dos métodos. |
| DELETE `/api/<recurso>/:id` | Cumplido. `DELETE /api/games/:id`, solo admin, devuelve 204. |
| Zod al crear y editar, errores 400 claros | Cumplido. [Schemas](../backend/src/schemas/game.schema.ts) y [rutas](../backend/src/routes/games.routes.ts): validan campos, fechas y edición no vacía; errores identifican campo y mensaje. Comprobado por tests y HTTP en producción. |
| HTTP 201, 404, 401 y 403 según corresponda | Cumplido. Alta 201, recurso inexistente 404, escritura sin sesión 401 y escritura de user 403. Probado en producción; también se distingue ID mal formado con 400. |
| Better Auth email/contraseña y GitHub | Cumplido. [Configuración](../backend/src/lib/auth.ts), registro/login/logout y OAuth real. Juan confirmó login GitHub local y en producción. |
| Usuarios y sesiones en MongoDB | Cumplido. `mongodbAdapter` comparte el cliente de la aplicación. Se verificaron colecciones de usuarios y sesiones y cuentas con proveedores `credential`, `github` y `google` en Atlas. |
| `user` por defecto; solo lectura del recurso principal | Cumplido. Plugin admin con `defaultRole: "user"`. Registro comprobado con ese rol y rechazo de escalamiento desde el cuerpo del cliente. User no puede escribir en el catálogo. |
| Admin puede crear, editar y eliminar | Cumplido. CRUD completo comprobado con la cuenta admin en producción. |
| Escrituras protegidas por `authMiddleware` y `requireRole("admin")` | Cumplido. Ambas capas aparecen en las tres [rutas de escritura](../backend/src/routes/games.routes.ts); [middleware](../backend/src/middlewares/auth.middleware.ts) obtiene sesión y rol desde Better Auth. |

## Frontend

| Punto solicitado | Estado y evidencia |
| --- | --- |
| React + Vite + TypeScript | Cumplido. [Dependencias y build](../frontend/package.json), configuración Vite y componentes TypeScript. |
| Listado y detalle de videojuegos | Cumplido. [Catálogo](../frontend/src/pages/Catalog.tsx) y [detalle](../frontend/src/pages/GameDetail.tsx), conectados a la API. Incluyen imágenes reales y galerías. |
| Login email y GitHub, registro y logout | Cumplido. [Pantalla de autenticación](../frontend/src/pages/Auth.tsx) y salida en [Layout](../frontend/src/components/Layout.tsx). API de email y logout probada; OAuth GitHub confirmado por Juan. |
| Panel admin con ABM | Cumplido. [Listado admin](../frontend/src/pages/Admin.tsx), alta y edición en [GameEditor](../frontend/src/pages/GameEditor.tsx), baja con confirmación. |
| Ruta protegida por rol, user no accede | Cumplido. [Rutas](../frontend/src/main.tsx) y [ProtectedRoute](../frontend/src/components/ProtectedRoute.tsx). Se abrió `/admin` en producción con la cuenta de jugador de Juan: mostró **Sin permisos** antes y después de F5. La API aplica la protección de forma independiente. |
| React Hook Form + Zod y errores de validación visibles | Cumplido en login, registro, videojuegos, creación de usuarios, edición de biblioteca y chat. Revisados `useForm`, `zodResolver` y mensajes por campo. Validaciones del backend cubiertas por tests y HTTP. |
| Sesión con `useSession()` y persistencia al recargar | Cumplido. [Cliente Better Auth](../frontend/src/lib/auth-client.ts) exporta `useSession`, usado en Layout y protección de rutas. En producción F5 recuperó la sesión de Juan y mantuvo el rol de jugador. |

## Render y OAuth en producción

| Punto solicitado | Estado y evidencia |
| --- | --- |
| Backend como Web Service | Cumplido. `checkpoint-api-juanbocadi`, activo; [salud pública](https://checkpoint-api-juanbocadi.onrender.com/api/health) responde 200 y comprueba MongoDB. Configuración en [render.yaml](../render.yaml). |
| Frontend como Static Site | Cumplido. `checkpoint-juanbocadi`, activo; build estático publicado en `dist`. |
| Frontend llama por `/api`, sin URL directa del backend | Cumplido. [Cliente API](../frontend/src/lib/api.ts) usa rutas relativas y Better Auth usa el mismo origen. Vite tiene proxy local. |
| Rewrite `/api/*` al backend | Cumplido. Primera regla del Static Site. Login, catálogo, CRUD y extras se comprobaron desde el origen del frontend. |
| Fallback `/*` a `/index.html`, F5 en rutas internas | Cumplido. Segunda regla; se solicitaron directamente rutas públicas y protegidas y devolvieron la SPA. F5 en `/admin` se comprobó en navegador. |
| GitHub OAuth App de producción con callback correcto y login funcionando | Cumplido. Callback `https://checkpoint-juanbocadi.onrender.com/api/auth/callback/github`; credenciales separadas de local y configuradas en Render. Flujo real confirmado por Juan. |

## Opcionales y aclaraciones del profesor

| Punto solicitado o mencionado | Estado y evidencia |
| --- | --- |
| Paginación, filtros o búsqueda | Implementados los tres. Catálogo con búsqueda por título, género/plataforma y páginas; API comprobada con filtros y paginación. Filtro de indies también revisado desde la interfaz. |
| Registros propios: user crea, ve, edita y elimina solo los suyos | Cumplido en la biblioteca personal: estado, horas, puntuación, notas y favorito. [Rutas](../backend/src/routes/library.routes.ts) asignan `ownerId` desde la sesión. Otro user recibe 404 en GET/PATCH/DELETE sobre un registro ajeno. CRUD propio y aislamiento comprobados en producción. |
| Admin puede gestionar registros de todos | Cumplido. `/admin/library` y `scope=all`; lectura y edición de una biblioteca ajena comprobadas con admin. Catálogo general público, con escritura reservada al admin. |
| Admin puede crear usuarios y cambiar roles | Cumplido. [Panel de usuarios](../frontend/src/pages/Users.tsx) usa `authClient.admin.createUser` y `authClient.admin.setRole`. Crear cuenta, iniciar sesión y cambiar/restaurar rol se comprobaron por HTTP contra Better Auth en producción. |
| Google además de GitHub, accesible a cualquier cuenta | Implementado. Cliente y proyecto de producción separados; audiencia **External**, estado **In production**, sin lista de emails permitidos en la app. Juan confirmó el flujo real en producción. Falta solamente la comprobación adicional con una cuenta ajena al proyecto, indicada abajo. |
| Agente/chat con LangChain, mencionado como mejora de nota | Implementado. [Agente](../backend/src/agent/catalog-agent.ts) con `createAgent`, `ChatGroq` y herramientas `search_catalog` y `my_library`. No es una respuesta prefabricada. Catálogo real, fuentes e historial comprobados con Groq en producción. |
| Chat sobre registros propios | Comprobación adicional completada: una cuenta temporal agregó Portal 2 con 7 horas y puntuación 8; Groq respondió esos datos y devolvió la fuente real. El historial guardó ambas intervenciones y otra cuenta, incluso admin, recibió 404. Se eliminaron conversación, registro y cuenta temporal. |

El opcional de propiedad se aplica a **registros de biblioteca**, conservando el mínimo de lectura para user en el catálogo público. El profesor admite catálogo general público y administración de todos los registros por admin; la biblioteca implementa el ciclo completo del usuario propietario.

El agente recupera datos con herramientas sobre MongoDB. No implementa embeddings ni vector store: la aclaración del profesor menciona el agente/chat como mejora opcional y la consigna no exige una arquitectura de RAG vectorial. El stack histórico y los ejemplos adicionales de las clases sirven de referencia; no agregan entregables a esta consigna.

## Entrega obligatoria

1. Repositorio: [JuanBocadi/checkpoint](https://github.com/JuanBocadi/checkpoint).
2. Frontend desplegado: [Checkpoint](https://checkpoint-juanbocadi.onrender.com).
3. [README raíz](../README.md), con proyecto, ejecución, API y URLs; backend: [API Checkpoint](https://checkpoint-api-juanbocadi.onrender.com).
4. Usuarios de prueba, comprobados en producción:

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | `admin@checkpoint.test` | `AdminCheckpoint2026!` |
| user | `user@checkpoint.test` | `UserCheckpoint2026!` |

## Alcance y comprobaciones adicionales pendientes

- **Google con otra cuenta:** la configuración de audiencia pública en producción y el login de Juan están confirmados. No se probó una segunda cuenta ajena al proyecto. Es la comprobación externa adicional pendiente; no falta implementar otro proveedor ni publicar nuevamente la app.
- **Repaso manual amplio:** todavía puede recorrerse en navegador cada formulario con datos inválidos y cada operación de los paneles admin. Las implementaciones fueron revisadas y sus permisos y operaciones fueron comprobados con tests y HTTP; eso no equivale a afirmar que se recorrió manualmente cada control visual.
- **Sesión tras F5:** observada con la cuenta de Juan en producción; email y logout también se comprobaron por HTTP. No se repitió un recorrido manual separado de F5 para cada proveedor.
- **Secretos:** el resultado del escaneo está limitado a los valores privados conocidos y patrones buscados en el historial alcanzable. No se publican credenciales de infraestructura ni las evidencias privadas de la auditoría.

El [checklist de entrega](entrega.md) conserva la separación entre comprobaciones realizadas y repaso manual adicional.
