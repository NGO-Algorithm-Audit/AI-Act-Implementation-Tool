import { RJSFSchema } from "@rjsf/utils";
import { Col, Container, Row } from "react-bootstrap";
import Intro from "./components/Intro";
import WizardForm from "./components/WizardForm";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { identificationSchema as nlIdentificationSchema } from "./schemas/nl/identificatie-adm";
import { identificationSchema as enIdentificationSchema } from "./schemas/en/identification-adm";

export default function App() {
  const { i18n } = useTranslation();
  const [forms, setForms] = useState<{ [key: string]: RJSFSchema[] }>({
    nl: [],
    en: [],
  });

  // Not yet used but very likely to be used in the future.
  const [, setFormData] = useState({});
  const [activeForm, setActiveForm] = useState<RJSFSchema | null>(null);
  let formsMenu = [{ id: 0, title: t("no forms") }];

  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang");

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [i18n]);

  if (forms[i18n.language] && forms[i18n.language].length > 0) {
    formsMenu = (forms[i18n.language] as RJSFSchema[]).map((item, index) => {
      return { id: index, title: item.JSONSchema.title ?? t("no forms title") };
    });
  }

  const onFormSubmit = (index: number, data?: any) => {
    setFormData((prevData) => ({ ...prevData, [index]: data ?? null }));
    setActiveForm(null);
  };

  const onFormActivate = (index: number) => {
    setActiveForm(forms[i18n.language][index]);
  };

  useEffect(() => {
    // Use Vite's import.meta.glob to get a map of file paths in nested directories
    const jsonFiles = import.meta.glob("/src/schemas/*/*.json");

    const loadJsonFiles = async () => {
      const forms = {} as { [key: string]: RJSFSchema[] };

      const dataEntries: [string, RJSFSchema][] = await Promise.all(
        Object.entries(jsonFiles).map(async ([path, importFile]) => {
          const module = await importFile();
          return [path, (module as { default: RJSFSchema }).default]; // Return file path and content
        })
      );

      // Convert array of entries to an array per language
      for (const [path, data] of dataEntries) {
        const language: string = path.split("/")[3] ?? "nl";
        const dataObject = forms[language] ?? [];
        dataObject.push(data);
        forms[language] = dataObject;
      }
      forms.nl.push(nlIdentificationSchema);
      forms.en.push(enIdentificationSchema);

      setForms(forms);
    };

    loadJsonFiles();
  }, []);

  return (
    <Container fluid className="vh-100 mx-0">
      <Row className="justify-content-center align-items-center h-100">
        <Col xs={12} className="">
          {activeForm ? (
            <WizardForm
              id={activeForm.JSONSchema.title}
              schema={activeForm.JSONSchema}
              uiSchema={activeForm.uiSchema}
              formData={{}}
              onSubmit={onFormSubmit}
              onCancel={onFormSubmit}
              validator={validator}
            />
          ) : (
            <Intro
              forms={formsMenu}
              onStart={(id: number) => onFormActivate(id)}
              activeLanguage={lang ? true : false}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
