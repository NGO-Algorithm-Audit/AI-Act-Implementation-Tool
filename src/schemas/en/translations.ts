import type { IdentificationTranslations } from "../shared/identification-types";
import enJson from "../../i18n/en/translation.json";

const ALGO_REGISTER_URL =
  "https://www.digitaleoverheid.nl/document/handreiking-algoritmeregister/";
const GDPR_URL  = "https://gdpr-info.eu/";
const SADM_URL = "https://gdpr-info.eu/art-22-gdpr/";
const AI_ACT_ART3_URL =
  "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3";
const AI_ACT_RECITAL12_URL =
  "https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-12";

const B_AI   = `<span class="badge badge-secondary" style="background-color:#c9a84c;font-size:0.85rem;padding:3.2px 5.12px">AI system</span>`;
const B_ALGO = `<span class="badge badge-secondary" style="background-color:#fd7e14;font-size:0.85rem;padding:3.2px 5.12px;margin-left:0">high-impact algorithm</span>`;
const B_SADM = `<span class="badge badge-secondary" style="background-color:#6B8A9E;font-size:0.85rem;padding:3.2px 5.12px;margin-left:0">solely automated decision-making (sADM)</span>`;
const B_GDPR = `<span class="badge badge-secondary" style="background-color:#198754;font-size:0.85rem;padding:3.2px 5.12px;margin-left:0">GDPR</span>`;

export const enTranslations: IdentificationTranslations = {
  schemaTitle:
    "Identification – AI Act, GDPR and high-impact algorithms",

  // Q1
  q1Title: "What is the outcome of the application?",
  q1Description: "You can select multiple answers.",
  q1Options: {
    score: "An estimated score, ranking, or probability.",
    label: "An estimated label or classification (such as yes/no, high/low or a division into groups).",
    recommendation: "A recommendation.",
    decision: "A decision.",
    content: "Content, such as written text, video, audio, or images.",
    recognition: "Object recognition, facial recognition, or voice recognition.",
    dashboard: "A dashboard or graph, with only direct data visualization.",
    other: "Another type of output.",
  },
  q1OtherDescription: "Provide a description of the output",
  q1Badges: [
    { label: enJson["article art3 label"], color: "#F37962", url: AI_ACT_ART3_URL },
  ],
  q1EnumTooltips: [
    null,
    "For example, for routing, communication campaigns, or risk classification.",
    null,
    null,
    null,
    null,
    null,
    null,
  ],
  q1EnumDescriptions: [
    null,
    null,
    null,
    null,
    null,
    null,
    "If one of the previous options is displayed in this dashboard, choose the previous option.",
    null,
  ],

  // Q2
  q2Title: "Is the design of the application based on data?",
  q2Options: {
    dataInspired:
      "Yes, design choices were made manually, but insights from data analysis helped with the design.",
    dataDerived:
      "Yes, the application contains components derived from data. This involves fitting or learning a model or automatic variable selection using statistics, optimization, simulation, machine learning, or a similar technique.",
    genAI: "Generative or interactive AI is used for the application.",
    noData: "No, the design of the application is not based on data analysis.",
  },
  q2DescribeInsights: "Describe how insights from data analysis helped with application design.",
  q2DescribeMethod: "Describe the method",
  q2DescribeGenAI: "Describe the working of the generative or interactive AI application and specify which model is being used.",
  q2Description:
    "Data includes all forms of electronic information. Text, images, and audio are also data.\n\nApplications can be designed manually. However, even when designed manually, the design is sometimes based on data analysis. For example, threshold values for (failure) rules can be calculated from data, or criteria can be selected based on calculated correlations.\n\nIt also happens that components (e.g., models and algorithms) are derived more automatically from data. For example, by fitting a statistical model to data or using machine learning to learn a model or rule-based algorithm from data. Simulation and optimization can also be used to derive a model from data.",
  q2Badges: [
    { label: enJson["article art3 label"], color: "#F37962", url: AI_ACT_ART3_URL },
    { label: enJson["article recital12 label"], color: "#F37962", url: AI_ACT_RECITAL12_URL },
  ],
  q2EnumTooltips: [
    null,
    null,
    "Generative AI refers to AI systems that can generate new content, such as text, images, audio or code. Well-known examples of generative AI models are ChatGPT, Claude and Gemini etc. Interactive AI refers to AI systems that can interact with users in a dynamic way, such as chatbots and virtual assistants.",
    null,
  ],

  // Q3
  q3Title: "Is the application an automation of rules defined by humans? ",
  q3Options: {
    oneToOne:
      "Yes, one-to-one automation of rules laid down in legislation or regulations or in formal policy.",
    informal:
      "Yes, automation of rules, but these are not explicitly laid down in legislation or regulations or formal policy.",
    symbolic:
      "Yes, logic- and knowledge-based approaches to AI in which outcomes are derived from encoded knowledge or from a symbolic representation of the task to be solved.",
    no: "No.",
  },
  q3FormalRefTitle:
    "Which formal policy, law, or regulation? Which article, paragraph, or section of this regulation?",
  q3SymbolicDescription: "Describe why you think you are using a logic- or knowledge-based AI system.",
  q3NoDescription: "Provide a brief description of the design of the application.",
  q3Description: `An example of rules laid down in legislation or regulations is a rule-based algorithm that automatically indicates when income and asset requirements are not met when applying for social assistance benefits.  In this case, the rules in the algorithm are a literal implementation of the standards in the Dutch Participation Act.\nWhen a standard is openly defined in legislation or regulations and is further specified in the application, the application is **not** a one-to-one automation of legislation or regulations.\n\nExamples of rules drawn up by humans are:
- a rule-based algorithm in which a work instruction has been translated into an algorithm
- a risk profile in which the rules have been drawn up manually based on the experience of employees
- open legal standards that are further specified in rules
\n\nLogic and knowledge-based approaches are also referred to as symbolic AI. This form of AI includes knowledge representation, inductive (logical) programming, knowledge bases, inference and deduction engines, and (symbolic) reasoning. This technology is often used in expert systems.`,
  q3Badges: [
    { label: enJson["article art3 label"], color: "#F37962", url: AI_ACT_ART3_URL },
    { label: enJson["article recital12 label"], color: "#F37962", url: AI_ACT_RECITAL12_URL },
    { label: "High-impact algorithm", color: "#fd7e14", url: ALGO_REGISTER_URL },
    { label: "Solely automated decision-making", color: "#6B8A9E", url: SADM_URL },
  ],
  q3EnumTooltips: [
    null,
    null,
    "Logic- and knowledge-based approaches to AI are specific AI systems that do not occur frequently. If you think you are using such a system, please explain in the next question why you think this is the case.",
    null,
  ],

  // Q4
  q4Title:
    "Is a decision made in the process for individual citizens, organizations, or employees?",
  q4Options: { yes: "Yes.", no: "No." },
  q4Description:
    "For instance:\n- Prioritising citizen queries or requests\n- Determining whether additional information is needed from a citizen\n- Selecting individuals for checks or inspections\n- Assessing eligibility for services or facilities.\n\n**Note:** A decision is much broader than a formal decision as defined in Dutch Public Administration Law. The notion of 'decision' is also used in the context of Art. 22 GDPR.",
  q4Badges: [
    { label: "High-impact algorithm", color: "#fd7e14", url: ALGO_REGISTER_URL },
    { label: enJson["article gdpr art22 label"], color: "#F37962", url: SADM_URL },
  ],

  // Q5
  q5Title:
    "What kind of decision is made in this process? Choose the option that most closely matches the type of decision.",
  q5Options: {
    prioritization:
      "Decision on prioritization of applications, requests, complaints, and objections.",
    formalComplaints: "Decision on formal complaints and objections.",
    financial:
      "Decisions with direct financial consequences for citizens or civil servants.",
    inspection:
      "Decision on inspection, investigation, or request for additional information.",
    schools: "Decision on the allocation of schools or childcare.",
    eligibility: "Decisions on whether a person is eligible for a service or facility.",
    otherLegal:
      "Any other decision with legal consequences.",
    other: "Other or miscellaneous decisions.",
  },
  q5OtherDescription: "Describe the type of decision",
  q5EnumDescriptions: [
    null,
    null,
    "Such as: decisions affecting a person's income, employment contract, benefits, allowances, subsidies, fines, refunds, or payment arrangements.",
    null,
    null,
    null,
    "Such as: granting a permit or entering into an agreement.",
    null,
  ],
  q5Badges: [
    { label: "High-impact algorithm", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q5_1
  q5_1Title: "Is the check or investigation particularly intrusive for the person concerned?",
  q5_1Options: {
    yes1: "Yes, because the check or investigation means that the person concerned has to wait longer for a benefit, allowance, or refund, or is not eligible for an advance payment.",
    yes2: "Yes, because the check or investigation is being carried out, the person concerned is not eligible for a payment arrangement.",
    yes3: "Yes, because the check or investigation is being carried out, the person concerned has to wait longer to be eligible for a service, facility, or permit, or a service, facility, or permit is (temporarily) denied.",
    yes4: "Yes, the check or investigation itself is intrusive, for example because a physical check is carried out (e.g. a home visit) or because the investigation has a major impact on the (private) life of the person concerned in some other way.",
    yes5: "Yes, the check is particularly intrusive for the person concerned for another reason.",
    no: "No.",
  },
  q5_1ControlDescription: "Describe the consequences of the check for the person concerned.",
  q5_1Badges: [
    { label: "High-impact algorithm", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q6
  q6Title:
    "Does the process contribute to how the government categorizes or approaches groups of citizens, organizations, or civil servants?",
  q6Options: { yes: "Yes.", unsure: "I am not sure.", no: "No." },
  q6UnsureDescription:
    "Provide a brief description of the process and how it affects citizens, organisations or civil servants.",
  q6Badges: [
    { label: "High-impact algorithm", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q7
  q7Title:
    "Which of the following options best describes the effect of the application on the outcome?",
  q7Options: {
    direct:
      "The application directly determines or strongly influences the outcome.",
    partial:
      "The application influences the process or outcome, but a human makes the final decision.",
    human:
      "The outcome is entirely determined by a human; the application is one of several factors and is not decisive.",
    other: "Another type of effect.",
  },
  q7OtherDescription: "Describe the effect of the application on the process",
  q7EnumTooltips: [
    "For example, work instructions determine the consequence of a particular outcome of the application. In exceptional cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
    "This employee has the right information, experience/skills, mandate, and available time to make the decision.",
    null,
    null,
  ],
  q7Description: "If in doubt, choose the top option from those you are unsure about.",
  q7Badges: [
    { label: "High-impact algorithm", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q8
  q8Title: "Are personal data being processed by the application?",
  q8Options: { yes: "Yes.", no: "No." },
  q8Description: "Personal data are any information that can identify a specific individual, directly or indirectly, such as a name, email address, ID number, or location data.",
  q8AlertDescription: "Examples of non-personal data are:\n- Group statistics where no individual can be singled out\n- Anonymised data\n- Output about physical matters that are not linked to an individual, such as sensor readings, weather data, machine and operational data, urban planning and infrastructure data\n- Financial records about companies\n- Data about city districts and neighborhoods\n\nNote: businesses in which the entrepreneur is personally liable (self-employed, sole proprietorship, general partnership, professional partnership) are considered as personal data.",
  q8Badges: [
    { label: "GDPR", color: "#198754", url: GDPR_URL },
  ],

  // Q8b
  q8bTitle:
    "Are personal aspects relating to a natural person being evaluated, analyzed or predicted?",
  q8bOptions: { yes: "Yes.", no: "No." },
  q8bDescription:
    "Personal aspects include, for example, analysing or predicting job performance, economic situation, health, personal preferences, interests, reliability, behaviour, location or movements.",
  q8bAlertDescription: "Evaluating, analyzing or predicting personal aspects relating to a natural person is known as _profiling_.",
  q8bBadges: [
    { label: "Profiling", color: "#4F46E5", url: "https://gdpr-info.eu/art-4-gdpr/" },
    { label: enJson["article gdpr art4 label"], color: "#F37962", url: "https://gdpr-info.eu/art-4-gdpr/" },
  ],

  // Q9
  q9Title: "Is the output of the algorithm shared with other organizations?",
  q9Options: { yes: "Yes.", no: "No." },
  q9Badges: [
    { label: enJson["article gdpr art22 label"], color: "#F37962", url: SADM_URL },
  ],

  // Q10
  q10Title:
    "Is the output of the algorithm stored for longer than the duration of the primary process for which the algorithm is used?",
  q10Options: { yes: "Yes.", no: "No." },
  q10Badges: [
    { label: enJson["article gdpr art22 label"], color: "#F37962", url: SADM_URL },
  ],

  // Intermediate output
  nextStepTitle: "Next step",
  nextStepText:
    "The following questions concern the process wherein the application is used. Focus on the process itself.\n\nFor these questions, it is irrelevant whether the application plays a minor or major role in the decision-making process.",

  // Storage/sharing warning
  storageWarning:
    "Please note: Long-term storage or sharing of the output of an algorithm with third parties may have significant (unforeseen) consequences for a data subject. This may constitute sADM in a legal sense following Article 22, even if this is not the primary use of the algorithm. In consultation with relevant legal experts, determine whether storing or sharing the results could indirectly constitute sADM. See also https://www.autoriteitpersoonsgegevens.nl/documenten/advies-geautomatiseerde-besluitvorming",

  // Outputs
  outputResultTitle: "Result",
  outputs: {
    AI:            `Based on your answers, your application is:\n\n✅ an ${B_AI} according to the AI Act\n\n❌ not a ${B_ALGO}\n\n❌ not ${B_SADM} according to Article 22 of the ${B_GDPR}`,
    Algo:          `Based on your answers, your application is:\n\n✅ a ${B_ALGO}\n\n❌ not ${B_SADM} according to Article 22 of the ${B_GDPR}\n\n❌ not an ${B_AI} according to the AI Act`,
    sADM:          `Based on your answers, your application is:\n\n❌ not a ${B_ALGO}\n\n❌ not an ${B_AI} according to the AI Act\n\n💡 possibly ${B_SADM} according to Article 22 of the ${B_GDPR}`,
    AlgoAndAI:     `Based on your answers, your application is:\n\n✅ an ${B_AI} according to the AI Act\n\n✅ a ${B_ALGO}\n\n❌ not ${B_SADM} according to Article 22 of the ${B_GDPR}`,
    AlgoAndSADM:   `Based on your answers, your application is:\n\n❌ not an ${B_AI} according to the AI Act\n\n✅ a ${B_ALGO}\n\n💡 possibly ${B_SADM} according to Article 22 of the ${B_GDPR}`,
    AlgoSADMAndAI: `Based on your answers, your application is:\n\n✅ an ${B_AI} according to the AI Act\n\n✅ a ${B_ALGO}\n\n💡 possibly ${B_SADM} according to Article 22 of the ${B_GDPR}`,
    None:          `Based on your answers, your application is:\n\n❌ not a ${B_ALGO}\n\n❌ not ${B_SADM} according to Article 22 of the ${B_GDPR}\n\n❌ not an ${B_AI} according to the AI Act`,
  },
  outputNextSteps: {
    AI: `- Complete the AI risk classification questionnaire to determine which requirements of the AI Act the application must meet.`,
    Algo: `- Include the algorithm to the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.`,
    sADM: `- Consult with relevant legal experts to determine whether sADM is actually involved.`,
    AlgoAndAI: `- Complete the AI risk classification questionnaire to determine which requirements of the AI Act the application must meet.
- Include the algorithm in the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.`,
    AlgoAndSADM: `- Include the algorithm in the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.
- Consult with relevant legal experts to determine whether sADM is actually involved.`,
    AlgoSADMAndAI: `- Complete the AI risk classification questionnaire to determine which requirements of the AI Act the application must meet.
- Include the algorithm in the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.
- Consult with relevant legal experts to determine whether sADM is actually involved.`,
  },
};
