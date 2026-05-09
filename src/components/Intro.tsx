import { Alert, Card, Button, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function ({
  forms,
  onStart,
  activeLanguage = false,
}: {
  forms: { id: number; title: string }[];
  onStart: (index: number) => void;
  activeLanguage?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card style={{ minHeight: "300px" }}>
      <Card.Body className="d-flex flex-column justify-content-between">
        <Alert variant="success" className="mb-3">
          {t("intro banner")}
        </Alert>
        <div className="d-flex flex-row justify-content-between align-items-top mb-2">
          <Card.Title>{t("cardTitle")}</Card.Title>
          {!activeLanguage && <LanguageSwitcher />}
        </div>

        <div className="mb-4"> 
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
          <p>
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

        <ListGroup>
          {forms.map((form) => (
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
                  {(() => {
                    const title = String(form.title ?? "");
                    if (/^(Risk category|Risicocategorie|Prohibited|Verboden)/i.test(title))
                      return t("questionnaire 2 name");
                    if (/^(Role and status|Rol en status|Deployer|Aanbieder)/i.test(title))
                      return t("questionnaire 3 name");
                    return t("questionnaire 1 name");
                  })()}
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
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
