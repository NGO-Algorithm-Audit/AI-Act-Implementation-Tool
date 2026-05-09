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
import { SettingsContext } from "./context/SettingsContext";

// Map English role keys produced by OutputRoleStatus's classifier to the
// Dutch keys the Risk-category result page (ported from ClassifyMyAI) uses.
const ROLE_EN_TO_NL: Record<string, string> = {
  provider: "aanbieder",
  deployer: "gebruiksverantwoordelijke",
  importer: "importeur",
  distributor: "distributeur",
};

// Mirror of OutputRoleStatus's q12 → role mapping, but operating directly on
// raw answers so it can run at the App level without translations.
function deriveAiAct2Roles(roleStatusData: Record<string, any> | undefined): string[] | null {
  if (!roleStatusData) return null;
  const q12: string | undefined = roleStatusData.q12;
  const q12b: string | undefined = roleStatusData.q12b;
  if (!q12) return null;

  const q12Map: Record<string, { i18n: string; roles: string[] }> = {
    a3: { i18n: "aiact2 q12 a3", roles: ["provider", "deployer"] },
    a1: { i18n: "aiact2 q12 a1", roles: ["provider"] },
    a2: { i18n: "aiact2 q12 a2", roles: ["provider", "deployer"] },
    a6: { i18n: "aiact2 q12 a6", roles: ["provider", "deployer"] },
    a7: { i18n: "aiact2 q12 a7", roles: ["importer"] },
    a8: { i18n: "aiact2 q12 a8", roles: ["distributor"] },
    a11: { i18n: "aiact2 q12 a11", roles: [] },
    a10: { i18n: "aiact2 q12 a10", roles: [] },
  };
  const matchedKey = Object.keys(q12Map).find((k) => t(q12Map[k].i18n) === q12);
  if (!matchedKey) return null;

  const englishRoles =
    matchedKey === "a6"
      ? q12b === t("aiact2 q12b m4")
        ? ["deployer"]
        : ["provider"]
      : q12Map[matchedKey].roles;

  return englishRoles.map((r) => ROLE_EN_TO_NL[r] ?? r);
}

export default function App() {
  const { i18n } = useTranslation();
  const [forms, setForms] = useState<{ [key: string]: RJSFSchema[] }>({
    nl: [],
    en: [],
  });

  const [allFormData, setAllFormData] = useState<Record<number, any>>({});
  const [activeForm, setActiveForm] = useState<RJSFSchema | null>(null);
  const [activeFormIndex, setActiveFormIndex] = useState<number>(0);
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

  const findFormIndexByTitlePrefix = (prefixes: RegExp): number => {
    const list = forms[i18n.language] ?? [];
    return list.findIndex((f) =>
      prefixes.test(String(f.JSONSchema?.title ?? ""))
    );
  };

  const onFormSubmit = (index: number, data?: any) => {
    setAllFormData((prev) => ({ ...prev, [index]: data ?? null }));
    setActiveForm(null);
  };

  const onFormActivate = (index: number) => {
    setActiveFormIndex(index);
    setActiveForm(forms[i18n.language][index]);
  };

  const onStartQuestionnaire = (key: string) => {
    if (key === "AI2") {
      const idx = findFormIndexByTitlePrefix(/^(Role and status|Rol en status)/i);
      if (idx >= 0) onFormActivate(idx);
    } else if (key === "AI1") {
      const idx = findFormIndexByTitlePrefix(/^(Risk category|Risicocategorie)/i);
      if (idx >= 0) onFormActivate(idx);
    }
  };

  const roleStatusIndex = findFormIndexByTitlePrefix(/^(Role and status|Rol en status)/i);
  const aiAct2Roles =
    roleStatusIndex >= 0 ? deriveAiAct2Roles(allFormData[roleStatusIndex]) : null;

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
      
      // Reverse so Role and status comes before Risk category
      forms.nl.reverse();
      forms.en.reverse();

      // FIX: Use unshift instead of push to place TS schemas at the top
      forms.nl.unshift(nlIdentificationSchema);
      forms.en.unshift(enIdentificationSchema);

      setForms(forms);
    };

    loadJsonFiles();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ hideSourceBadges: false, identifyAlgorithms: true, sector: "general" }}
    >
      <Container fluid className="vh-100 mx-0">
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} className="">
            {activeForm ? (
              <WizardForm
                id={activeFormIndex}
                schema={activeForm.JSONSchema}
                uiSchema={activeForm.uiSchema}
                formData={allFormData[activeFormIndex] ?? {}}
                onSubmit={onFormSubmit}
                onCancel={onFormSubmit}
                validator={validator}
                aiAct2Roles={aiAct2Roles}
                onStartQuestionnaire={onStartQuestionnaire}
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
    </SettingsContext.Provider>
  );
}
