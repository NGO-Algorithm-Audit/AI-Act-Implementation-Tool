import { Alert, Button, Card, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";
import { ntaItems } from "../data/ntaConfig";

// External links in the guidance box open in a new tab, so the user does not
// lose their place in the questionnaire overview.
const MD_INLINE_BLANK_OPTS = {
  forceInline: true,
  overrides: {
    a: { props: { target: "_blank", rel: "noopener noreferrer" } },
  },
} as const;

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

        <Alert
          style={{ color: "#6d2c91", backgroundColor: "#f5eefa", borderColor: "#d9b3f0" }}
          className="py-2 px-3 mt-3 mb-0"
        >
          <small style={{ fontWeight: "bold", display: "block", marginBottom: "2px" }}>
            {t("user guidance title")}
          </small>
          <ul className="mb-0 ps-3" style={{ fontSize: "0.875em" }}>
            <li>
              <Markdown options={MD_INLINE_BLANK_OPTS}>
                {t("nta intro guidance copyright")}
              </Markdown>
            </li>
            <li>
              <Markdown options={MD_INLINE_BLANK_OPTS}>
                {t("nta intro guidance not official")}
              </Markdown>
            </li>
          </ul>
        </Alert>

        {/* tag with screen ID */}
        <div style={{ display: "inline-block", marginTop: "8px", marginBottom: "4px" }}>
          <span className="badge badge-secondary">id: NTA intro screen</span>
        </div>
      </Card.Body>
    </Card>
  );
}
