import { useEffect, useState } from "react";
import { api, errorMessage } from "./api";

export function useApi<T>(path: string, revision = 0) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string;
  }>({ data: null, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: "" });
    api<T>(path, { signal: controller.signal })
      .then((data) => {
        setState({ data, loading: false, error: "" });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error: errorMessage(error) });
      });
    return () => controller.abort();
  }, [path, revision]);
  return state;
}
