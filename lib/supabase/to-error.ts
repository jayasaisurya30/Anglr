/**
 * Postgrest/Storage/Auth clients return error objects that are not `Error` instances.
 * Throwing them makes Next.js dev overlay show "[object Object]".
 */
type SupabaseErrorLike = {
  message?: string;
  hint?: string;
  details?: string;
} | null;

export function toSupabaseError(
  e: SupabaseErrorLike | Error,
  fallback: string
): Error {
  if (e instanceof Error) return e;
  if (e == null || typeof e !== "object")
    return new Error(fallback);
  const parts = [e.message, e.hint, e.details].filter(
    (s): s is string => typeof s === "string" && s.length > 0
  );
  return new Error(parts.length ? parts.join(" — ") : fallback);
}
