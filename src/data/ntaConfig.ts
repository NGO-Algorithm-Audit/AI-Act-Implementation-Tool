export interface NtaItem {
  /**
   * Sub-questionnaire key. Matches the basename of the schema files in
   * src/schemas/nta/{en,nl}/<key>.json.
   */
  key: string;
  /** Translation key for the short badge name (e.g. "Hoofdstuk 6") */
  nameKey: string;
  /** Translation key for the title shown on the NTA overview screen */
  titleKey: string;
}

/**
 * The four NTA 8047 sub-questionnaires, in the order they are listed on the
 * NTA overview screen. Rows render from this list rather than from the schema
 * glob, so the order is explicit and the rows show even if a schema fails to
 * load.
 */
export const ntaItems: NtaItem[] = [
  { key: "wenselijkheid", nameKey: "nta wenselijkheid name", titleKey: "nta wenselijkheid title" },
  { key: "ontwerp", nameKey: "nta ontwerp name", titleKey: "nta ontwerp title" },
  { key: "verificatie", nameKey: "nta verificatie name", titleKey: "nta verificatie title" },
  { key: "gebruik", nameKey: "nta gebruik name", titleKey: "nta gebruik title" },
];
