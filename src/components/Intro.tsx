import { Card, Button, ListGroup } from "react-bootstrap";
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
            {/* second sentence */}
            {t("description2")}
            <a
              href="https://algoritmes.pleio.nl/attachment/entity/f1a35292-7ea6-4e47-93fa-b3358e9ab2e0"
              target="_blank"
            >
              {t("Handreiking_link")}
            </a>
            {t("description3")}
            {/* third sentence */}
            {t("description4")}
            <a
              href="https://eur-lex.europa.eu/eli/reg/2016/679/oj"
              target="_blank"
            >
              {t("Art_22_link")}
            </a>
            {t("description5")}
            {t("description6")}
          </p>
          <p>
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
            >
              <p className="m-0 mr-4">{form.title}</p>
              <Button variant="primary" onClick={() => onStart(form.id)}>
                {t("startButton")}
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
