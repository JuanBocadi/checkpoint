import { Link, useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  librarySchema,
  statuses,
  type LibraryEntry,
  type LibraryInput,
} from "../schemas/library";
import { useApi } from "../lib/use-api";
import { api, errorMessage } from "../lib/api";
import { Loading, Notice } from "../components/Ui";

export function LibraryEditor({ all = false }: { all?: boolean }) {
  const { id } = useParams();
  const { data, loading, error } = useApi<{ data: LibraryEntry }>(
    `/library/${id}`,
  );
  return (
    <div className="container section editor-container">
      <Link className="back-link" to={all ? "/admin/library" : "/library"}>
        Volver a la biblioteca
      </Link>
      <p className="eyebrow">Tu progreso</p>
      <h1>
        Una partida a tu manera<span className="accent">.</span>
      </h1>
      {loading ? (
        <Loading />
      ) : error ? (
        <Notice error>{error}</Notice>
      ) : (
        data && <LibraryForm entry={data.data} all={all} />
      )}
    </div>
  );
}
function LibraryForm({ entry, all }: { entry: LibraryEntry; all: boolean }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LibraryInput>({
    resolver: zodResolver(librarySchema),
    defaultValues: {
      status: entry.status,
      hoursPlayed: entry.hoursPlayed,
      rating: entry.rating,
      notes: entry.notes,
      favorite: entry.favorite,
    },
  });
  async function submit(values: LibraryInput) {
    setError("");
    try {
      await api(`/library/${entry._id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
      navigate(all ? "/admin/library" : "/library");
    } catch (error) {
      setError(errorMessage(error));
    }
  }
  return (
    <form className="editor-card" onSubmit={handleSubmit(submit)} noValidate>
      <h2>{entry.game?.title ?? "Registro de juego"}</h2>
      {error && <Notice error>{error}</Notice>}
      <div className="form-grid">
        <label>
          Estado
          <select {...register("status")}>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          {errors.status && (
            <span className="field-error">{errors.status.message}</span>
          )}
        </label>
        <label>
          Horas jugadas
          <input
            type="number"
            step="0.5"
            min="0"
            {...register("hoursPlayed", { valueAsNumber: true })}
          />
          {errors.hoursPlayed && (
            <span className="field-error">{errors.hoursPlayed.message}</span>
          )}
        </label>
        <label>
          Puntuación
          <select
            {...register("rating", {
              setValueAs: (value) =>
                value === "" || value == null ? null : Number(value),
            })}
          >
            <option value="">Sin puntuar</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}/10
              </option>
            ))}
          </select>
          {errors.rating && (
            <span className="field-error">{errors.rating.message}</span>
          )}
        </label>
      </div>
      <label>
        Notas personales
        <textarea
          rows={5}
          {...register("notes")}
          placeholder="¿Qué te gustó? ¿Por dónde vas en la historia?"
        />
        {errors.notes && (
          <span className="field-error">{errors.notes.message}</span>
        )}
      </label>
      <label className="checkbox-label">
        <input type="checkbox" {...register("favorite")} />
        Marcar como favorito
      </label>
      <div className="form-actions">
        <Link className="button ghost" to={all ? "/admin/library" : "/library"}>
          Cancelar
        </Link>
        <button className="button" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar progreso"}
        </button>
      </div>
    </form>
  );
}
