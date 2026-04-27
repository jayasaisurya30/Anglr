/** Primary line for cards, modals, feed (species + optional nickname). */
export function catchSpeciesTitle(
  species: string | null | undefined,
  nickname: string | null | undefined
): string {
  const sp = species?.trim() ?? "";
  const nick = nickname?.trim() ?? "";
  if (!sp && !nick) return "Untitled catch";
  if (!sp) return nick;
  if (!nick) return sp;
  return `${sp} · ${nick}`;
}

/** Shorter label for badges / alt text (species only, or nickname if no species). */
export function catchSpeciesBadgeLabel(
  species: string | null | undefined,
  nickname: string | null | undefined
): string {
  const sp = species?.trim() ?? "";
  const nick = nickname?.trim() ?? "";
  if (sp) return sp;
  if (nick) return nick;
  return "Catch";
}
