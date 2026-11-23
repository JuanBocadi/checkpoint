# Comprobación final de la entrega

Estado verificado el 23/11/2026. Las casillas pendientes requieren comprobación adicional, en particular los accesos OAuth completos en el navegador. Las comprobaciones HTTP no equivalen a pruebas manuales de interfaz.

## Infraestructura

- [x] Repo propio en GitHub con `backend/`, `frontend/` y varios commits descriptivos.
- [x] Clúster Atlas y usuario con readWrite sobre `checkpoint`; conexión desde el backend local verificada.
- [x] Acceso de red autorizado para el backend de Render.
- [x] Backend Web Service activo y `/api/health` responde 200.
- [x] Frontend Static Site activo.
- [x] `/api/*` reescribe al backend antes del fallback de la SPA.
- [x] `/*` reescribe a `/index.html`.
- [x] `BETTER_AUTH_URL` y callback OAuth coinciden con el frontend real.
- [x] OAuth App de producción tiene su Client ID/Secret en Render.
- [ ] Cliente Google OAuth configurado en Render y Audience en producción para cualquier cuenta.
- [x] Groq API key configurada y chatbot probado con el catálogo real.
- [x] Seed ejecutado sobre Atlas con ambas cuentas de corrección y login local verificado.

## Prueba desde el frontend publicado

- [ ] Visita anónima permite listar, buscar, filtrar y abrir el detalle.
- [ ] F5 funciona en detalle, login y administración.
- [ ] Registro con email nuevo crea un `user`.
- [ ] Login email funciona y conserva la sesión después de F5.
- [ ] User ve “Sin permisos” en `/admin` y recibe 403 al escribir en la API.
- [x] Sin sesión, una escritura devuelve 401.
- [x] Admin crea un juego (201), lo edita y lo elimina (204).
- [ ] Formularios muestran errores cuando se dejan campos inválidos.
- [x] ID inexistente devuelve 404; un ID mal formado devuelve 400.
- [ ] Login GitHub completa el flujo y conserva la sesión luego de F5.
- [x] Logout invalida la sesión.
- [ ] Panel de usuarios permite cambiar el rol de otra cuenta de prueba.
- [ ] Admin puede crear usuarios desde el panel.
- [x] User puede agregar juegos a su biblioteca, editar progreso y quitar sus propios registros.
- [ ] Otra cuenta user no puede consultar ni modificar esos registros, incluso con su ID.
- [ ] Admin puede gestionar todas las bibliotecas desde `/admin/library`.
- [ ] Login Google funciona con una cuenta que no es tester.
- [ ] Asistente responde con datos del catálogo y muestra enlaces a juegos consultados.
- [ ] Asistente consulta solo la biblioteca del usuario que conversa.
- [ ] Historial del chat persiste con F5 y cada usuario ve solo el suyo.

## Documentación

- [x] README contiene link real del repo y las dos URLs de Render verificadas.
- [x] Las cuentas y contraseñas publicadas funcionan en producción.
- [ ] No hay secretos de infraestructura en archivos versionados ni en el historial.
- [x] `.env.example` está completo, con credenciales vacías.
- [x] Builds locales y 23 pruebas pasan.
- [x] Blueprint validado contra el esquema oficial de Render.
- [x] Login local con Google completado y confirmado por Juan.
- [x] Login local con GitHub completado y confirmado por Juan.
- [x] Chatbot local probado con Groq real y fuentes del catálogo.

## Entrega al profesor

Comprobación HTTP de producción: ambas cuentas inician sesión y conservan su sesión al consultar `/api/auth/get-session`; user recibe 403 al escribir en el catálogo o pedir todas las bibliotecas; Zod informa errores de campos con 400; el asistente responde con fuentes, persiste el historial y devuelve 404 al intentar abrirlo con otro usuario, incluso admin. Las rutas profundas devuelven la SPA. Los callbacks generados por GitHub y Google apuntan al frontend HTTPS. Faltan las comprobaciones manuales indicadas arriba.

Copiar el enlace del repositorio, la URL del frontend y las dos cuentas de prueba del README. No entregar la URI de MongoDB, el secreto de Better Auth ni el Client Secret de GitHub.
