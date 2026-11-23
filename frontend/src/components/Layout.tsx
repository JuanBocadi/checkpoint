import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { authClient, useSession } from "../lib/auth-client";

export function Layout() {
  const { data: session, isPending } = useSession();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  async function logout() {
    const result = await authClient.signOut();
    if (result.error) {
      setError("No se pudo cerrar la sesión. Intentá otra vez.");
      return;
    }
    setError("");
    navigate("/");
  }
  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Link to="/" className="brand">
            <span className="brand-icon">
              C<span>+</span>
            </span>
            checkpoint<span className="brand-dot">.</span>
          </Link>
          <nav aria-label="Navegación principal">
            <NavLink to="/" end>
              Explorar
            </NavLink>
            {session && <NavLink to="/library">Mi biblioteca</NavLink>}
            <NavLink to="/chat">Asistente</NavLink>
            {session?.user.role === "admin" && (
              <NavLink to="/admin">Administrar</NavLink>
            )}
          </nav>
          <div className="account-nav">
            {isPending ? (
              <span className="muted">Conectando…</span>
            ) : session ? (
              <>
                <span className="account-name">
                  {session.user.name}
                  <small>
                    {session.user.role === "admin"
                      ? "Administrador"
                      : "Jugador"}
                  </small>
                </span>
                <button
                  className="button small ghost"
                  onClick={() => void logout()}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link className="login-link" to="/login">
                  Ingresar
                </Link>
                <Link className="button small" to="/register">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {error && (
        <div className="container">
          <p role="alert" className="error">
            {error}
          </p>
        </div>
      )}
      <main>
        <Outlet />
      </main>
      <footer className="site-footer container">
        <Link to="/" className="footer-brand">
          checkpoint.
        </Link>
        <span>Siempre hay una próxima partida.</span>
        <Link to="/privacy">Privacidad</Link>
        <span>Hecho por Juan · TP Full Stack 2026</span>
      </footer>
    </>
  );
}
