import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient, useSession } from "../lib/auth-client";
import { Notice } from "../components/Ui";
import { errorMessage } from "../lib/api";
import { useApi } from "../lib/use-api";

const loginSchema = z.object({
  email: z.email("Ingresá un email válido."),
  password: z.string().min(8, "Usá al menos 8 caracteres.").max(128),
});
const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Ingresá tu nombre (mínimo 2 caracteres).")
    .max(80),
});

export function Auth({
  register: registering = false,
}: {
  register?: boolean;
}) {
  const { data: session, isPending } = useSession();
  const [error, setError] = useState("");
  const [socialPending, setSocialPending] = useState(false);
  const { data: features } = useApi<{
    data: { github: boolean; google: boolean };
  }>("/features");
  const navigate = useNavigate();
  const location = useLocation();
  const requestedPath = location.state?.from;
  const from =
    typeof requestedPath === "string" &&
    /^\/(admin|library|chat)(\/|$)/.test(requestedPath)
      ? requestedPath
      : "/";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string; password: string; name?: string }>({
    resolver: zodResolver(registering ? registerSchema : loginSchema),
  });
  if (!isPending && session)
    return (
      <Navigate
        to={
          from.startsWith("/admin") && session.user.role !== "admin"
            ? "/"
            : from
        }
        replace
      />
    );
  async function submit(values: {
    email: string;
    password: string;
    name?: string;
  }) {
    setError("");
    try {
      const result = registering
        ? await authClient.signUp.email({ ...values, name: values.name! })
        : await authClient.signIn.email(values);
      if (result.error) {
        setError(
          result.error.message ??
            "No se pudo iniciar sesión. Revisá tus datos.",
        );
        return;
      }
      navigate(from, { replace: true });
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  async function social(provider: "github" | "google") {
    setError("");
    setSocialPending(true);
    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: from,
        errorCallbackURL: "/login?oauth=error",
      });
      if (result.error)
        setError(
          result.error.message ?? `No pudimos conectar con ${provider}.`,
        );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSocialPending(false);
    }
  }
  return (
    <div className="container auth-layout section">
      <div className="auth-story">
        <p className="eyebrow">Tu lugar en la partida</p>
        <h1>
          {registering ? (
            <>
              Una cuenta.
              <br />
              Nuevos mundos.
            </>
          ) : (
            <>
              Qué bueno
              <br />
              verte de nuevo.
            </>
          )}
        </h1>
        <p>
          Un catálogo para quienes disfrutan descubrir.
          <br />
          Guardá tu lugar en Checkpoint.
        </p>
        <div className="auth-covers" aria-hidden="true">
          <img src="/images/games/hades-cover.jpg" alt="" />
          <img src="/images/games/hollow-knight-cover.jpg" alt="" />
          <img src="/images/games/stardew-valley-cover.jpg" alt="" />
        </div>
      </div>
      <section className="auth-card">
        <h2>{registering ? "Creá tu cuenta" : "Iniciar sesión"}</h2>
        <p className="muted">
          {registering
            ? "Creá tu biblioteca y registrá tus próximas partidas."
            : "Ingresá para continuar tu próxima partida."}
        </p>
        {(error || new URLSearchParams(location.search).has("oauth")) && (
          <Notice error>
            {error || "No se pudo completar el acceso. Intentá nuevamente."}
          </Notice>
        )}
        <form onSubmit={handleSubmit(submit)} noValidate>
          {registering && (
            <label>
              Nombre
              <input
                autoComplete="name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <span className="field-error">{errors.name.message}</span>
              )}
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete={registering ? "new-password" : "current-password"}
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>
          <button
            className="button full"
            disabled={isSubmitting || socialPending}
          >
            {isSubmitting
              ? "Procesando…"
              : registering
                ? "Crear cuenta"
                : "Ingresar"}
          </button>
        </form>
        <div className="divider">
          <span>o continuá con</span>
        </div>
        <div className="social-buttons">
          <button
            className="button ghost full"
            disabled={socialPending || isSubmitting || !features?.data.github}
            onClick={() => void social("github")}
          >
            {socialPending ? "Conectando…" : "GitHub"}
          </button>
          <button
            className="button ghost full"
            disabled={socialPending || isSubmitting || !features?.data.google}
            onClick={() => void social("google")}
          >
            Google
          </button>
        </div>
        {features && (!features.data.github || !features.data.google) && (
          <p className="muted">
            Algunos accesos sociales todavía no están disponibles.
          </p>
        )}
        <p className="auth-switch">
          {registering ? "¿Ya tenés cuenta?" : "¿Primera vez por acá?"}{" "}
          <Link to={registering ? "/login" : "/register"}>
            {registering ? "Iniciá sesión" : "Crear una cuenta"}
          </Link>
        </p>
      </section>
    </div>
  );
}
