# Comprobación final de la entrega

Esta lista registra tareas de publicación pendientes; no confirma que ya estén hechas.

## Infraestructura

- [ ] Repo propio en GitHub con `backend/`, `frontend/` y varios commits descriptivos.
- [ ] Clúster Atlas, usuario de base y acceso de red para el backend.
- [ ] Backend Web Service activo y `/api/health` responde 200.
- [ ] Frontend Static Site activo.
- [ ] `/api/*` reescribe al backend antes del fallback de la SPA.
- [ ] `/*` reescribe a `/index.html`.
- [ ] `BETTER_AUTH_URL` y callback OAuth coinciden con el frontend real.
- [ ] OAuth App de producción tiene su Client ID/Secret en Render.
- [ ] Cliente Google OAuth configurado en Render y Audience en producción para cualquier cuenta.
- [ ] Groq API key configurada y chatbot probado con el catálogo real.
- [ ] Seed ejecutado sobre producción con ambas cuentas de corrección.

## Prueba desde el frontend publicado

- [ ] Visita anónima permite listar, buscar, filtrar y abrir el detalle.
- [ ] F5 funciona en detalle, login y administración.
- [ ] Registro con email nuevo crea un `user`.
- [ ] Login email funciona y conserva la sesión después de F5.
- [ ] User ve “Sin permisos” en `/admin` y recibe 403 al escribir en la API.
- [ ] Sin sesión, una escritura devuelve 401.
- [ ] Admin crea un juego (201), lo edita y lo elimina (204).
- [ ] Formularios muestran errores cuando se dejan campos inválidos.
- [ ] ID inexistente devuelve 404; un ID mal formado devuelve 400.
- [ ] Login GitHub completa el flujo y conserva la sesión luego de F5.
- [ ] Logout invalida la sesión.
- [ ] Panel de usuarios permite cambiar el rol de otra cuenta de prueba.
- [ ] Admin puede crear usuarios desde el panel.
- [ ] User puede agregar juegos a su biblioteca, editar progreso y quitar sus propios registros.
- [ ] Otra cuenta user no puede consultar ni modificar esos registros, incluso con su ID.
- [ ] Admin puede gestionar todas las bibliotecas desde `/admin/library`.
- [ ] Login Google funciona con una cuenta que no es tester.
- [ ] Asistente responde con datos del catálogo y muestra enlaces a juegos consultados.
- [ ] Asistente consulta solo la biblioteca del usuario que conversa.
- [ ] Historial del chat persiste con F5 y cada usuario ve solo el suyo.

## Documentación

- [ ] README contiene link real del repo y las dos URLs de Render verificadas.
- [ ] Las cuentas y contraseñas publicadas funcionan en producción.
- [ ] No hay secretos de infraestructura en archivos versionados ni en el historial.
- [ ] `.env.example` está completo, con credenciales vacías.
- [ ] Builds y pruebas pasan.

## Entrega al profesor

Copiar el enlace del repositorio, la URL del frontend y las dos cuentas de prueba del README. No entregar la URI de MongoDB, el secreto de Better Auth ni el Client Secret de GitHub.
