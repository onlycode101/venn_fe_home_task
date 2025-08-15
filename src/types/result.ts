export type Result<T, E = unknown> =
  | { data: T; error: null; status: number | null }
  | { data: null; error: E; status: number | null };
