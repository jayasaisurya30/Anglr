/**
 * Curated list for the catch form species picker. "Other" covers edge cases without free-typing species.
 * Exported as A–Z via `localeCompare` (case-insensitive).
 */
const FISH_SPECIES_SOURCE = [
  "Largemouth bass",
  "Smallmouth bass",
  "Spotted bass",
  "Striped bass",
  "White bass",
  "Rock bass",
  "Black crappie",
  "White crappie",
  "Bluegill",
  "Redear sunfish",
  "Pumpkinseed",
  "Warmouth",
  "Green sunfish",
  "Channel catfish",
  "Flathead catfish",
  "Blue catfish",
  "Bullhead",
  "Northern pike",
  "Muskellunge",
  "Tiger muskie",
  "Chain pickerel",
  "Walleye",
  "Sauger",
  "Yellow perch",
  "White perch",
  "Rainbow trout",
  "Brown trout",
  "Brook trout",
  "Cutthroat trout",
  "Lake trout",
  "Steelhead",
  "Chinook salmon",
  "Coho salmon",
  "Pink salmon",
  "Atlantic salmon",
  "Common carp",
  "Grass carp",
  "Freshwater drum",
  "Bowfin",
  "Gar",
  "Snook",
  "Redfish",
  "Speckled trout",
  "Weakfish",
  "Flounder",
  "Halibut",
  "Black sea bass",
  "Tautog",
  "Bluefish",
  "Spanish mackerel",
  "King mackerel",
  "Yellowfin tuna",
  "Bluefin tuna",
  "Blackfin tuna",
  "Mahi-mahi",
  "Wahoo",
  "Greater amberjack",
  "Grouper",
  "Red snapper",
  "Swordfish",
  "Marlin",
  "Sailfish",
  "American shad",
  "Herring",
  "Tilapia",
  "Other",
] as const;

export type FishSpeciesId = (typeof FISH_SPECIES_SOURCE)[number];

export const FISH_SPECIES: readonly FishSpeciesId[] = [
  ...FISH_SPECIES_SOURCE,
].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

export const FISH_SPECIES_SET: ReadonlySet<string> = new Set(FISH_SPECIES);

/** Include a legacy / off-list saved value at the top when editing. */
export function fishSpeciesSelectOptions(
  savedSpecies: string | null | undefined
): string[] {
  const s = savedSpecies?.trim();
  if (!s) return [...FISH_SPECIES];
  if (FISH_SPECIES_SET.has(s)) return [...FISH_SPECIES];
  return [s, ...FISH_SPECIES];
}
