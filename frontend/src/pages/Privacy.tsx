import { Link } from "react-router";

export function Privacy() {
  return (
    <article className="container section editor-container privacy-page">
      <p className="eyebrow">Checkpoint · Proyecto académico</p>
      <h1>
        Privacidad<span className="accent">.</span>
      </h1>
      <p>
        Checkpoint es un proyecto académico de Juan Cruz Bocadi para explorar
        videojuegos y registrar partidas. Esta página describe el tratamiento de
        los datos en la aplicación.
      </p>
      <h2>Cuenta y sesión</h2>
      <p>
        Al registrarte guardamos tu nombre, email y la información necesaria
        para autenticarte. Las contraseñas se almacenan mediante el hash que
        genera Better Auth. Si elegís Google o GitHub, recibimos los datos de
        identidad que autorizás, como nombre, email y foto de perfil. Usamos
        cookies de sesión para mantener tu acceso.
      </p>
      <h2>Biblioteca y conversaciones</h2>
      <p>
        Tu progreso, puntuaciones, favoritos y notas se guardan en MongoDB. Los
        administradores pueden gestionar los registros de las bibliotecas. El
        historial del asistente está disponible solo para la cuenta que creó
        cada conversación y podés eliminarlo desde su panel.
      </p>
      <h2>Asistente de IA</h2>
      <p>
        Al enviar una consulta al asistente, Groq procesa tu mensaje y el
        contexto reciente de la conversación, junto con los datos de juegos
        necesarios para responder. Si pedís recomendaciones basadas en tu
        biblioteca, se comparten los títulos, estados, horas, puntuaciones y
        favoritos consultados. Tus notas privadas no se envían. Evitá compartir
        información sensible en los mensajes.
      </p>
      <h2>Servicios utilizados</h2>
      <p>
        La publicación utiliza Render para alojar la app, MongoDB Atlas para los
        datos, Better Auth para la autenticación y Groq para el asistente. El
        acceso social usa Google o GitHub según tu elección. La interfaz puede
        cargar tipografías desde Google Fonts.
      </p>
      <h2>Contacto y gestión de datos</h2>
      <p>
        Para consultas sobre tus datos o solicitar la eliminación de tu cuenta,
        contactá al responsable desde el{" "}
        <a
          href="https://github.com/JuanBocadi/checkpoint/issues"
          target="_blank"
          rel="noreferrer"
        >
          repositorio del proyecto
        </a>
        . No publiques contraseñas ni datos privados en un issue público; usá
        esa vía para coordinar un contacto privado.
      </p>
      <Link className="button ghost" to="/">
        Volver al catálogo
      </Link>
    </article>
  );
}
