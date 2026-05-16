import { RJSFSchema } from "@rjsf/utils";
import { Col, Container, Row } from "react-bootstrap";
import Intro from "./components/Intro";
import WizardForm from "./components/WizardForm";
import ObligationsQuestionnaire from "./components/ObligationsQuestionnaire";
import validator from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { identificationSchema as nlIdentificationSchema } from "./schemas/nl/identificatie-adm";
import { identificationSchema as enIdentificationSchema } from "./schemas/en/identification-adm";
import { SettingsContext } from "./context/SettingsContext";
import { AppContext } from "./context/AppContext";

// Map English role keys produced by OutputRoleStatus's classifier to the
// Dutch keys the Risk-category result page (ported from ClassifyMyAI) uses.
const ROLE_EN_TO_NL: Record<string, string> = {
  provider: "aanbieder",
  deployer: "gebruiksverantwoordelijke",
  importer: "importeur",
  distributor: "distributeur",
};

// Derive the user's primary role from the Role-and-status questionnaire's
// raw answers. Returns a single Dutch role key (or null when the
// questionnaire hasn't been filled in / answer doesn't map to a role).
function deriveRole(roleStatusData: Record<string, any> | undefined): string | null {
  if (!roleStatusData) return null;
  const q12: string | undefined = roleStatusData.q12;
  const q12b: string | undefined = roleStatusData.q12b;
  if (!q12) return null;

  const q12Map: Record<string, { i18n: string; primary: string | null }> = {
    a3: { i18n: "aiact2 q12 a3", primary: "provider" },
    a1: { i18n: "aiact2 q12 a1", primary: "provider" },
    a2: { i18n: "aiact2 q12 a2", primary: "provider" },
    a6: { i18n: "aiact2 q12 a6", primary: "provider" }, // refined below
    a7: { i18n: "aiact2 q12 a7", primary: "importer" },
    a8: { i18n: "aiact2 q12 a8", primary: "distributor" },
    a11: { i18n: "aiact2 q12 a11", primary: null },
    a10: { i18n: "aiact2 q12 a10", primary: null },
  };
  const matchedKey = Object.keys(q12Map).find((k) => t(q12Map[k].i18n) === q12);
  if (!matchedKey) return null;

  const englishRole =
    matchedKey === "a6"
      ? q12b === t("aiact2 q12b m4")
        ? "deployer"
        : "provider"
      : q12Map[matchedKey].primary;
  if (!englishRole) return null;

  return ROLE_EN_TO_NL[englishRole] ?? englishRole;
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
  const [initialFieldKey, setInitialFieldKey] = useState<string | null>(null);
  const [showObligations, setShowObligations] = useState<boolean>(false);
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
    setShowObligations(false);
    setActiveFormIndex(index);
    setActiveForm(forms[i18n.language][index]);
  };

  const onStartObligations = () => {
    setActiveForm(null);
    setShowObligations(true);
  };

  // Schema titles are not always literal "Identification" / "Role and status";
  // match the same patterns WizardForm uses to label the badges.
  const ROLE_AND_STATUS_TITLE_RE = /^(Role and status|Rol en status|Deployer|Aanbieder)/i;
  const RISK_CATEGORY_TITLE_RE = /^(Risk category|Risicocategorie|Prohibited|Verboden)/i;
  const IDENTIFICATION_TITLE_RE = /^(Identification|Identificatie|AI Act,|AI-verordening,)/i;

  const onStartQuestionnaire = (key: string, fieldKey?: string) => {
    if (key === "OBL") {
      onStartObligations();
      return;
    }
    let idx = -1;
    if (key === "AI2") idx = findFormIndexByTitlePrefix(ROLE_AND_STATUS_TITLE_RE);
    else if (key === "AI1") idx = findFormIndexByTitlePrefix(RISK_CATEGORY_TITLE_RE);
    else if (key === "IDENT") idx = findFormIndexByTitlePrefix(IDENTIFICATION_TITLE_RE);
    if (idx < 0) return;
    setInitialFieldKey(fieldKey ?? null);
    onFormActivate(idx);
  };

  const roleStatusIndex = findFormIndexByTitlePrefix(ROLE_AND_STATUS_TITLE_RE);
  const riskIndex = findFormIndexByTitlePrefix(RISK_CATEGORY_TITLE_RE);

  // Single source of truth for the user's role.
  //
  // Production behaviour: filled in automatically when the user completes the
  // Role-and-status questionnaire (`deriveRole` reads the raw q12/q12b
  // answers stored in `allFormData`).
  //
  // For testing the role-aware UI without filling in the questionnaire,
  // replace the right-hand side with one of the four Dutch role keys:
  //   "aanbieder" | "gebruiksverantwoordelijke" | "importeur" | "distributeur"
  const role: string | null =
    roleStatusIndex >= 0 ? deriveRole(allFormData[roleStatusIndex]) : null;

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
      <AppContext.Provider value={{ role, onStartQuestionnaire }}>
      <Container fluid className="vh-100 mx-0">
        <Row className="justify-content-center align-items-center h-100">
          <Col xs={12} className="">
            {showObligations ? (
              <ObligationsQuestionnaire
                roleStatusData={
                  roleStatusIndex >= 0 ? allFormData[roleStatusIndex] : undefined
                }
                riskData={riskIndex >= 0 ? allFormData[riskIndex] : undefined}
                onBack={() => setShowObligations(false)}
                onStartQuestionnaire={onStartQuestionnaire}
              />
            ) : activeForm ? (
              <WizardForm
                key={activeFormIndex}
                id={activeFormIndex}
                schema={activeForm.JSONSchema}
                uiSchema={activeForm.uiSchema}
                formData={allFormData[activeFormIndex] ?? {}}
                onSubmit={onFormSubmit}
                onCancel={onFormSubmit}
                validator={validator}
                aiAct2Roles={role ? [role] : null}
                onStartQuestionnaire={onStartQuestionnaire}
                initialFieldKey={initialFieldKey}
                onInitialFieldConsumed={() => setInitialFieldKey(null)}
              />
            ) : (
              <Intro
                forms={formsMenu}
                onStart={(id: number) => onFormActivate(id)}
                onStartQuestionnaire={onStartQuestionnaire}
                onStartObligations={onStartObligations}
                activeLanguage={lang ? true : false}
              />
            )}
          </Col>
        </Row>
      </Container>
      </AppContext.Provider>
    </SettingsContext.Provider>
  );
}
