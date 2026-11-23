# Conexiones necesarias para completar la publicación

Las cuentas y los secretos son de Juan. No enviar claves por el chat ni ponerlas en commits. Backend y frontend publicados en Render el 23/11/2026, con Atlas y Groq verificados. Las instrucciones siguientes sirven como referencia de configuración; queda pendiente completar y probar OAuth en producción.

## GitHub

Repositorio creado: https://github.com/JuanBocadi/checkpoint.

Para permitir `git push`, iniciar sesión con Git Credential Manager cuando Git lo solicite. No hace falta escribir un token en el código. La conexión de GitHub en Codex y las credenciales locales de Git pueden ser independientes.

Para OAuth, crear dos OAuth Apps en Settings → Developer settings → OAuth Apps: una local y otra de producción. Los callbacks están en el README. Guardar sus valores en el entorno correspondiente.

## Atlas

Usar el proyecto de la cuenta de Juan y un clúster **Free**, con nombre `Checkpoint`. No seleccionar M10 o Flex para esta entrega.

Crear un usuario de base exclusivo para la app, con lectura/escritura en la base `checkpoint`. Guardar la contraseña en un lugar privado. La app necesita la URI de **Drivers**, con la contraseña codificada para URL y `/checkpoint` como base. Ingresarla solamente en `backend/.env` y en Environment de Render.

Autorizar las IP de salida de Render y la IP local usada para cargar datos, según las indicaciones de Network Access. No habilitar redes adicionales sin necesidad. El inicio de sesión de Google en Atlas no crea automáticamente un usuario de base para la aplicación.

## Render

Publicar el código y `render.yaml` en GitHub primero. Conectar el proveedor Git en Render, seleccionar el workspace de Juan y revisar el plan del Blueprint antes de aplicarlo. Crear el backend como Web Service Free y el frontend como Static Site.

Completar las variables privadas en Environment. El secreto de Better Auth se genera con el Blueprint. Actualizar el rewrite `/api/*`, `BETTER_AUTH_URL` y los callbacks usando los nombres **realmente asignados** por Render; no asumir que coinciden con la propuesta.

## Google Cloud

Proyecto de producción: `Checkpoint Produccion`. En Información de marca, la página principal es `https://checkpoint-juanbocadi.onrender.com` y la política de privacidad es `https://checkpoint-juanbocadi.onrender.com/privacy`. Ambas rutas responden 200. El estado de Público se confirmó como **En producción** el 23/11/2026. Queda pendiente completar el login y comprobarlo con una cuenta ajena a los testers.

1. Abrir https://console.cloud.google.com/ con la cuenta de Juan y crear el proyecto `Checkpoint`.
2. En Google Auth Platform, configurar nombre, email de soporte y audiencia External.
3. Crear un cliente OAuth **Web application**.
4. Para el proyecto de desarrollo, agregar `http://localhost:5173` y su callback `/api/auth/callback/google`. Para la publicación, crear un proyecto y cliente de producción separado y usar únicamente el origen HTTPS y callback reales de Render.
5. Guardar Client ID y Client Secret en el backend.
6. En Audience, publicar **In production**, cumpliendo los requisitos que solicite Google. Probar con una cuenta que no sea tester.

El usuario debe completar personalmente cualquier aceptación de términos o verificación de identidad que Google solicite. No se necesitan permisos de Gmail, Drive ni Calendar para este login.

En la creación del cliente, dejar desmarcada la opción para agentes de IA: este cliente se usa para autenticación. El chatbot usa Groq de forma independiente.

Google solo muestra el secreto completo al crearlo. Guardarlo de inmediato en el entorno privado. Si se cerró el diálogo y no se conservó, abrir Clientes → Checkpoint Web → Agregar secreto y guardar el nuevo. No subir el JSON de credenciales al repositorio. Referencia: [Administrar clientes OAuth](https://support.google.com/cloud/answer/15549257?hl=es).

El login local con Google fue completado y confirmado por Juan el 23/11/2026. El login público de producción se debe verificar después del deploy. Google documenta la separación entre entornos en sus [políticas OAuth](https://developers.google.com/identity/protocols/oauth2/policies).

## Groq

1. Abrir https://console.groq.com/ y crear la cuenta.
2. Crear una API key exclusiva para `Checkpoint`.
3. Guardarla como `GROQ_API_KEY` en `.env` y Environment de Render.
4. Reiniciar la demo o desplegar el backend para que lea la variable.
5. Probar `/chat`: pedir un indie barato, una comparación del catálogo y una recomendación usando la biblioteca.

No hace falta pasar la clave por Codex: puede ingresarse directamente en el archivo local y en Render. Revisar el plan y los límites de uso antes de habilitar facturación adicional. No se habilitará ningún plan de pago sin autorización de Juan.
