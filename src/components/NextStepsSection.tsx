import { useTranslation } from "react-i18next";
import { aiActItems, QuestionnaireItem } from "../data/questionnaireConfig";

function ItemBadge({
  item,
  onStartQuestionnaire,
}: {
  item: QuestionnaireItem;
  onStartQuestionnaire?: (key: string) => void;
}) {
  const { t } = useTranslation();
  const isAvailable = item.startKey !== null;
  return (
    <span
      role={isAvailable ? "button" : undefined}
      className="badge"
      style={{
        backgroundColor: isAvailable ? "var(--cma-primary)" : "#aaa",
        color: "#fff",
        cursor: isAvailable ? "pointer" : "default",
        opacity: isAvailable ? 1 : 0.65,
      }}
      onClick={isAvailable && item.startKey ? () => onStartQuestionnaire?.(item.startKey!) : undefined}
    >
      {t(item.nameKey)}
    </span>
  );
}

export default function NextStepsSection({
  roles,
  onStartQuestionnaire,
  annexIArt6Branch,
}: {
  roles: string[];
  onStartQuestionnaire?: (key: string) => void;
  annexIArt6Branch?: "A" | "B";
}) {
  const { t } = useTranslation();

  if (!roles.includes("aanbieder")) return null;

  // Annex I Section B + Art. 6(1) third-party assessment: only Art. 6(1),
  // 102-109 and 112 of the AI Act apply directly, so no further AI AQT
  // obligation modules apply for the provider.
  if (annexIArt6Branch === "B") {
    return (
      <div>
        <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary)" }}>{t("aiact2 result provider continue label")}</h6>
        <div style={{ borderTop: "1px solid var(--cma-primary)", paddingTop: "8px", fontSize: "0.85rem" }}>
          {t("riskcat result next steps none")}
        </div>
      </div>
    );
  }

  const rows: { labelKey: string; item: QuestionnaireItem }[] = [
    { labelKey: "aiact2 result provider continue ai3 label", item: aiActItems[2] },
    { labelKey: "aiact2 result provider continue ai5 label", item: aiActItems[4] },
    { labelKey: "aiact2 result provider continue ai6 label", item: aiActItems[5] },
    { labelKey: "aiact2 result provider continue ai7 label", item: aiActItems[6] },
  ];

  return (
    <div>
      <h6 className="fw-bold mb-1 mt-2" style={{ color: "var(--cma-primary)" }}>{t("aiact2 result provider continue label")}</h6>
      <div style={{ borderTop: "1px solid var(--cma-primary)", paddingTop: "8px" }} className="d-flex flex-column gap-2">
        {rows.map(({ labelKey, item }) => (
          <div key={labelKey} className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "0.85rem", marginRight: "0.25rem" }}>{t(labelKey)}</span>
            <ItemBadge item={item} onStartQuestionnaire={onStartQuestionnaire} />
          </div>
        ))}
      </div>
    </div>
  );
}
