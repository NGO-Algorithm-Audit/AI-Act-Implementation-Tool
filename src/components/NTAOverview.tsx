import { Button, Card, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ntaItems } from "../data/ntaConfig";

// The NTA 8047 overview screen: sits between the main screen and the four
// sub-questionnaires. Rows are rendered like the questionnaire rows on the
// main screen (Intro.tsx) — whole row clickable, blue tag, Start button.
export default function NTAOverview({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: (key: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card style={{ minHeight: "300px" }}>
      <Card.Header className="d-flex flex-row justify-content-between align-items-center">
        <div className="d-flex flex-row align-items-center gap-2">
          <span
            className="badge"
            style={{
              fontSize: "0.85rem",
              whiteSpace: "nowrap",
              backgroundColor: "#005AA7",
              color: "#fff",
            }}
          >
            {t("questionnaire NTA name")}
          </span>
          <Card.Title className="my-1" style={{ marginLeft: "8px" }}>
            {t("questionnaire NTA title")}
          </Card.Title>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-outline-secondary btn-sm ml-4"
          aria-label={t("back to overview")}
        >
          ← {t("back to overview")}
        </button>
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-between">
        <ListGroup>
          {ntaItems.map((item) => (
            <ListGroup.Item
              key={item.key}
              className="d-flex flex-row justify-content-between align-items-center"
              onClick={() => onStart(item.key)}
              style={{ cursor: "pointer" }}
            >
              <p className="m-0 mr-4">
                <span
                  className="badge me-2"
                  style={{ backgroundColor: "#005AA7", color: "#fff" }}
                >
                  {t(item.nameKey)}
                </span>
                <span style={{ marginLeft: "8px" }}>{t(item.titleKey)}</span>
              </p>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onStart(item.key);
                }}
              >
                {t("startButton")}
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
