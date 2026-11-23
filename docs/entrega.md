# Comprobación final de la entrega

Estado verificado el 23/11/2026. Se distinguen las pruebas confirmadas de un repaso manual adicional de la interfaz. Las comprobaciones HTTP no equivalen a pruebas manuales de formularios.

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
- [x] Cliente Google OAuth configurado en Render y Audience en producción para cualquier cuenta.
- [x] Groq API key configurada y chatbot probado con el catálogo real.
- [x] Seed ejecutado sobre Atlas con ambas cuentas de corrección y login local verificado.
- [x] Rediseño publicado desde `293bd7b`; JavaScript, CSS y 24 imágenes comprobados contra el build local.
- [x] `/credits` y las rutas internas del nuevo frontend responden correctamente en producción.

## Pruebas confirmadas en producción

- [x] Catálogo anónimo, detalle y paginación por HTTP a través del frontend.
- [x] Las rutas profundas comprobadas devuelven la SPA al solicitarlas directamente.
- [x] Registro con email nuevo crea un `user`.
- [x] Login email funciona y permite recuperar la sesión desde otra solicitud.
- [x] User recibe 403 al escribir en el catálogo y al solicitar operaciones de administración.
- [x] Sin sesión, una escritura devuelve 401.
- [x] Admin crea un juego (201), lo edita y lo elimina (204).
- [x] La API informa errores de validación de campos con 400.
- [x] ID inexistente devuelve 404; un ID mal formado devuelve 400.
- [x] Login GitHub completa el flujo en producción, confirmado por Juan.
- [x] Logout invalida la sesión.
- [x] Admin cambia el rol de una cuenta temporal mediante Better Auth y la sesión refleja el cambio.
- [x] Admin crea usuarios mediante Better Auth; la cuenta creada puede ingresar.
- [x] User puede agregar juegos a su biblioteca, editar progreso y quitar sus propios registros.
- [x] Otra cuenta user recibe 404 al consultar, editar o eliminar registros ajenos por su ID.
- [x] Admin puede consultar todas las bibliotecas y editar registros ajenos por la API.
- [x] Login Google completa el flujo en producción, confirmado por Juan.
- [x] Asistente responde con datos del catálogo y devuelve fuentes enlazables.
- [x] Historial del chat persiste entre solicitudes y otro usuario, incluso admin, recibe 404 al consultarlo.
- [x] Cuentas, registros de biblioteca y conversación temporales eliminados al terminar las comprobaciones.

## Repaso manual adicional de la interfaz

- [ ] Buscar y combinar filtros desde el listado; abrir una ficha y recargarla con F5.
- [ ] Comprobar la sesión con F5 después de los accesos sociales y por email.
- [ ] Con user, abrir `/admin` y comprobar el mensaje de falta de permisos.
- [ ] Recorrer formularios de registro, login y videojuegos con datos inválidos.
- [ ] Recorrer los paneles de usuarios y bibliotecas como admin.
- [ ] Pedir una recomendación basada en la biblioteca propia y recargar el historial del chat.
- [ ] Comprobar Google con otra cuenta ajena al proyecto.

La suite automatizada comprueba permisos, validaciones, sesiones, aislamiento de bibliotecas y conversaciones, y el ciclo de herramientas del asistente, incluida la biblioteca del usuario autenticado. Este repaso permite comprobar también la presentación de esos comportamientos en el navegador.

## Documentación

- [x] README contiene link real del repo y las dos URLs de Render verificadas.
- [x] Las cuentas y contraseñas publicadas funcionan en producción.
- [x] Revisión de 149 blobs del historial alcanzable sin secretos privados conocidos ni patrones de credenciales detectados; `.env` y `.local/` no están versionados.
- [x] `.env.example` está completo, con credenciales vacías.
- [x] Builds locales y 23 pruebas pasan.
- [x] Blueprint validado contra el esquema oficial de Render.
- [x] Login local con Google completado y confirmado por Juan.
- [x] Login local con GitHub completado y confirmado por Juan.
- [x] Chatbot local probado con Groq real y fuentes del catálogo.

## Entrega al profesor

Repositorio: [JuanBocadi/checkpoint](https://github.com/JuanBocadi/checkpoint).

Frontend: [Checkpoint](https://checkpoint-juanbocadi.onrender.com).

Backend: [API Checkpoint](https://checkpoint-api-juanbocadi.onrender.com/api/health).

Ambas cuentas de corrección, los accesos sociales y el asistente fueron comprobados en producción. La [verificación automática del ajuste desplegado](https://github.com/JuanBocadi/checkpoint/actions/runs/45211322592) completó ambos builds y la suite del backend.

Copiar el enlace del repositorio, la URL del frontend y las dos cuentas de prueba del README. No entregar la URI de MongoDB, el secreto de Better Auth ni el Client Secret de GitHub.
