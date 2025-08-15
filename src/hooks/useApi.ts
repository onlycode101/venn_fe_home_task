/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";

type Status = "not-started" | "pending" | "success" | "error";

interface ApiState<T> {
  status: Status;
  data: T | null;
  error: unknown;
}

interface ApiReturnType<T, A extends any[] = any[]> extends ApiState<T> {
  execute: (...args: A) => Promise<T>;
  reset: () => void;
  isPending: boolean;
}

export default function useApi<T, Args extends any[] = any[]>(
  apiFn: (...args: Args) => Promise<T>,
): ApiReturnType<T, Args> {
  const [state, setState] = useState<ApiState<T>>({
    status: "not-started",
    data: null,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState({ status: "pending", data: null, error: null });

      try {
        const data = await apiFn(...args);
        setState({ status: "success", data, error: null });
        return data;
      } catch (err) {
        setState({ status: "error", data: null, error: err });
        throw err;
      }
    },
    [apiFn],
  );

  return {
    ...state,
    execute,
    reset: () => setState({ status: "not-started", data: null, error: null }),
    isPending: state.status === "pending",
  };
}
