import { useEffect, useState } from "react";
import { Link } from "react-router";
import { authClient, useSession } from "../lib/auth-client";
import { errorMessage } from "../lib/api";
import { Loading, Notice } from "../components/Ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type User = { id: string; name: string; email: string; role?: string | null };
export function Users() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    authClient.admin
      .listUsers({
        query: {
          limit: 10,
          offset: page * 10,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      })
      .then((result) => {
        if (!active) return;
        if (result.error)
          setError(result.error.message ?? "No pudimos cargar los usuarios.");
        else {
          setUsers(result.data.users);
          setTotal(result.data.total);
        }
      })
      .catch((error) => {
        if (active) setError(errorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, revision]);
  async function setRole(user: User, role: "user" | "admin") {
    setBusy(user.id);
    setError("");
    setSuccess("");
    try {
      const result = await authClient.admin.setRole({ userId: user.id, role });
      if (result.error)
        setError(result.error.message ?? "No se pudo cambiar el rol.");
      else {
        setSuccess(`Rol de ${user.name} actualizado a ${role}.`);
        setRevision((v) => v + 1);
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="container section">
      <p className="eyebrow">Panel de administración</p>
      <h1>
        La comunidad<span className="accent">.</span>
      </h1>
      <div className="admin-tabs">
        <Link to="/admin">Videojuegos</Link>
        <span className="active">Usuarios y roles</span>
        <Link to="/admin/library">Bibliotecas</Link>
      </div>
      <p className="muted">
        Los registros públicos reciben el rol user. Desde este panel también
        podés crear cuentas y asignarles un rol. Tu propio rol se conserva desde
        este panel.
      </p>
      <CreateUserForm
        created={() => {
          setRevision((v) => v + 1);
          setPage(0);
        }}
      />
      {error && <Notice error>{error}</Notice>}
      {success && <Notice>{success}</Notice>}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.name}
                      {user.id === session?.user.id && (
                        <span className="badge">Vos</span>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <label>
                        <span className="sr-only">Rol de {user.name}</span>
                        <select
                          value={user.role ?? "user"}
                          disabled={!!busy || user.id === session?.user.id}
                          onChange={(e) =>
                            void setRole(
                              user,
                              e.target.value as "user" | "admin",
                            )
                          }
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              className="button ghost"
              disabled={page === 0 || !!busy}
              onClick={() => setPage((v) => v - 1)}
            >
              Anterior
            </button>
            <span>
              Página {page + 1} de {Math.max(1, Math.ceil(total / 10))}
            </span>
            <button
              className="button ghost"
              disabled={(page + 1) * 10 >= total || !!busy}
              onClick={() => setPage((v) => v + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Ingresá al menos 2 caracteres.").max(80),
  email: z.email("Ingresá un email válido."),
  password: z.string().min(8, "Usá al menos 8 caracteres.").max(128),
  role: z.enum(["user", "admin"]),
});
function CreateUserForm({ created }: { created: () => void }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "user" },
  });
  async function submit(values: z.infer<typeof createUserSchema>) {
    setError("");
    setSuccess("");
    try {
      const result = await authClient.admin.createUser(values);
      if (result.error) {
        setError(result.error.message ?? "No se pudo crear el usuario.");
        return;
      }
      reset({ name: "", email: "", password: "", role: "user" });
      setSuccess("Usuario creado correctamente.");
      created();
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <details className="create-user">
      <summary>Crear un usuario</summary>
      <form className="editor-card" onSubmit={handleSubmit(submit)} noValidate>
        {error && <Notice error>{error}</Notice>}
        {success && <Notice>{success}</Notice>}
        <div className="form-grid">
          <label>
            Nombre
            <input autoComplete="off" {...register("name")} />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </label>
          <label>
            Email
            <input type="email" autoComplete="off" {...register("email")} />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>
          <label>
            Contraseña inicial
            <input
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>
          <label>
            Rol
            <select {...register("role")}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="button" disabled={isSubmitting}>
            {isSubmitting ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </details>
  );
}
