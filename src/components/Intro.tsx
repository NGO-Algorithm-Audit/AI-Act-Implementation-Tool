import { Alert, Card, Button, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchBar from "./SearchBar";

export default function ({
  forms,
  onStart,
  onStartQuestionnaire,
  onStartObligations,
  activeLanguage = false,
}: {
  forms: { id: number; title: string }[];
  onStart: (index: number) => void;
  onStartQuestionnaire?: (key: string) => void;
  onStartObligations?: () => void;
  activeLanguage?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const fullscreenUrl = `https://ai-documentation.s3.eu-central-1.amazonaws.com/index.html?lang=${
    i18n.language?.startsWith("nl") ? "nl" : "en"
  }`;

  return (
    <Card style={{ minHeight: "300px" }}>
      <Card.Body className="d-flex flex-column justify-content-between">
        <Alert
          className="mb-3"
          style={{
            backgroundColor: "#f0f0f0",
            borderColor: "#dddddd",
            color: "#212529",
          }}
        >
          {t("intro banner")}
          <a
            href="https://digital-strategy.ec.europa.eu/en/library/draft-guidelines-implementation-transparency-obligations-certain-ai-systems-under-article-50-ai-act"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("intro banner draft guidelines link")}
          </a>
          {t("intro banner 2")}
        </Alert>
        <SearchBar onStartQuestionnaire={onStartQuestionnaire} />
        <div className="d-flex flex-row justify-content-between align-items-top mb-2">
          <Card.Title>{t("cardTitle")}</Card.Title>
          <div className="d-flex flex-row align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() =>
                window.open(fullscreenUrl, "_blank", "noopener,noreferrer")
              }
              aria-label={t("fullscreen mode")}
              title={t("fullscreen mode")}
            >
              ⛶
            </Button>
            {!activeLanguage && <LanguageSwitcher />}
          </div>
        </div>

        <div className="mb-0">
          <p>
            {/* first sentence */}
            {t("description1")}
            <a
              href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj"
              target="_blank"
            >
              {t("AI_Act_link")}
            </a>
            {t("description1_1")}
            {/* second sentence */}
            {t("description2")}
            <a
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
            >
              {t("Art_22_link")}
            </a>

            {/* third sentence */}
                        {t("description3")}
            <a
              href="https://algoritmes.pleio.nl/attachment/entity/f1a35292-7ea6-4e47-93fa-b3358e9ab2e0"
              target="_blank"
            >
              {t("Handreiking_link")}
            </a>
            {t("description4")}
          </p>
          <p>
            {t("description5")}
          </p>
          <p className="mb-0">
            {t("description6")}
            {t("feedback")}{" "}
            
            <a
              href="https://github.com/NGO-Algorithm-Audit/AI-Act-Implementation-Tool"
              target="_blank"
            >
              Github
            </a>{" "}
            {t("or")}{" "}
            <a href="mailto:info@algorithmaudit.eu">info@algorithmaudit.eu</a>.
          </p>
        </div>

        {(() => {
          const isRisk = (title: string) =>
            /^(Risk category|Risicocategorie|Prohibited|Verboden)/i.test(title);
          const isRole = (title: string) =>
            /^(Role and status|Rol en status|Deployer|Aanbieder)/i.test(title);

          const questionnaireBadge = (title: string) => {
            if (isRisk(title)) return t("questionnaire 2 name");
            if (isRole(title)) return t("questionnaire 3 name");
            return t("questionnaire 1 name");
          };

          const renderFormItem = (form: { id: number; title: string }) => (
            <ListGroup.Item
              key={form.id}
              className="d-flex flex-row justify-content-between align-items-center"
              onClick={() => onStart(form.id)}
              style={{ cursor: "pointer" }}
            >
              <p className="m-0 mr-4">
                <span
                  className="badge me-2"
                  style={{ backgroundColor: "#005AA7", color: "#fff" }}
                >
                  {questionnaireBadge(String(form.title ?? ""))}
                </span>
                <span style={{ marginLeft: "8px" }}>{form.title}</span>
              </p>
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onStart(form.id);
                }}
              >
                {t("startButton")}
              </Button>
            </ListGroup.Item>
          );

          // Split the Identification questionnaire (determines which policy
          // frameworks apply) from the AI Act compliance questionnaires.
          const identForms = forms.filter(
            (f) => !isRisk(String(f.title ?? "")) && !isRole(String(f.title ?? ""))
          );
          const aiActForms = forms.filter(
            (f) => isRisk(String(f.title ?? "")) || isRole(String(f.title ?? ""))
          );

          return (
            <>
              <h6 className="mt-3 mb-1 fw-bold" style={{ color: "#005AA7" }}>
                {t("intro section identification")}
              </h6>
              <ListGroup>{identForms.map(renderFormItem)}</ListGroup>

              <h6 className="mt-4 mb-1 fw-bold" style={{ color: "#005AA7" }}>
                {t("intro section next steps subtitle")}
              </h6>
              <ListGroup>
                {aiActForms.map(renderFormItem)}
                {/* Fourth entry: the Obligations screen. Not a JSON-Schema
                    wizard, so it is rendered separately from `forms`. */}
                <ListGroup.Item
                  className="d-flex flex-row justify-content-between align-items-center"
                  onClick={() => onStartObligations?.()}
                  style={{ cursor: "pointer" }}
                >
                  <p className="m-0 mr-4">
                    <span
                      className="badge me-2"
                      style={{ backgroundColor: "#005AA7", color: "#fff" }}
                    >
                      {t("questionnaire 4 name")}
                    </span>
                    <span style={{ marginLeft: "8px" }}>{t("questionnaire 4 title")}</span>
                  </p>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartObligations?.();
                    }}
                  >
                    {t("startButton")}
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </>
          );
        })()}
      </Card.Body>
    </Card>
  );
}
