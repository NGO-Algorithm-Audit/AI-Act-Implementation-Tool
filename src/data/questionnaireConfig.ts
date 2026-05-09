export interface QuestionnaireItem {
  /** Translation key for the short badge name (e.g. "AI Act.1") */
  nameKey: string;
  /** Translation key for the descriptive title */
  titleKey: string;
  /**
   * Key passed to the start-dispatcher.
   * null means the item is not yet available (coming soon).
   */
  startKey: string | null;
}

export const aiActItems: QuestionnaireItem[] = [
  { nameKey: "questionnaire AI2 name", titleKey: "questionnaire AI2 title", startKey: "AI2" },
  { nameKey: "questionnaire AI1 name", titleKey: "questionnaire AI1 title", startKey: "AI1" },
  { nameKey: "questionnaire AI3 name", titleKey: "questionnaire AI3 title", startKey: null },
  { nameKey: "questionnaire AI4 name", titleKey: "questionnaire AI4 title", startKey: null },
  { nameKey: "questionnaire AI5 name", titleKey: "questionnaire AI5 title", startKey: null },
  { nameKey: "questionnaire AI6 name", titleKey: "questionnaire AI6 title", startKey: null },
  { nameKey: "questionnaire AI7 name", titleKey: "questionnaire AI7 title", startKey: null },
];
