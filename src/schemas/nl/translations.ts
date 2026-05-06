import type { IdentificationTranslations } from "../shared/identification-types";
import nlJson from "../../i18n/nl/translation.json";

const ALGO_REGISTER_URL =
  "https://www.digitaleoverheid.nl/document/handreiking-algoritmeregister/";
const GDPR_URL  = "https://gdpr-info.eu/";
const SADM_URL = "https://gdpr-info.eu/art-22-gdpr/";
const AI_ACT_ART3_URL =
  "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-3";
const AI_ACT_RECITAL12_URL =
  "https://ai-act-service-desk.ec.europa.eu/en/ai-act/recital-12";

const B_AI   = `<span class="badge badge-secondary" style="background-color:#c9a84c;font-size:0.85rem;padding:3.2px 5.12px">AI-systeem</span>`;
const B_ALGO = `<span class="badge badge-secondary" style="background-color:#fd7e14;font-size:0.85rem;padding:3.2px 5.12px;margin-left:0">impactvol algoritme</span>`;
const B_SADM = `<span class="badge badge-secondary" style="background-color:#6B8A9E;font-size:0.85rem;padding:3.2px 5.12px;margin-left:0">volledig geautomatiseerde besluitvorming (sADM)</span>`;
const B_GDPR = `<span class="badge badge-secondary" style="background-color:#198754;font-size:0.85rem;padding:3.2px 5.12px;margin-left:0">AVG</span>`;

export const nlTranslations: IdentificationTranslations = {
  schemaTitle: "AI-verordening, AVG en impactvolle algoritmes",

  // Q1
  q1Title: "Wat is de uitkomst van de toepassing?",
  q1Description: "U kunt meerdere antwoorden selecteren.",
  q1Options: {
    score: "Een ingeschatte score, rangschikking of kans.",
    label: "Een ingeschat label of classificatie (zoals ja/nee, hoog/laag of een indeling in groepen).",
    recommendation: "Een aanbeveling.",
    decision: "Een beslissing.",
    content: "Content, zoals geschreven tekst, video, audio, afbeeldingen of machine-leesbare data.",
    recognition: "Objectherkenning, gezichtsherkenning of stemherkenning.",
    dashboard: "Een dashboard of grafiek, met enkel rechtstreekse datavisualisatie.",
    other: "Een ander soort output.",
  },
  q1OtherDescription: "Geef een beschrijving van de output",
  q1Badges: [
    { label: nlJson["article art3 label"], color: "#F37962", url: AI_ACT_ART3_URL },
  ],
  q1EnumTooltips: [
    null,
    "Bijvoorbeeld ten behoeve van routering, communicatiecampagnes of risicoclassificatie.",
    null,
    null,
    "Hieronder valt ook de output van een 'AI-agent'.",
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
    "Wanneer in dit dashboard een van de eerdere opties wordt weergegeven, kies dan de eerdere optie.",
    null,
  ],

  // Q2
  q2Title: "Is het ontwerp van de toepassing gebaseerd op data?",
  q2Options: {
    dataInspired:
      "Ja, keuzes over ontwerp zijn handmatig gemaakt, maar inzichten uit data-analyse hebben geholpen bij het ontwerp.",
    dataDerived:
      "Ja, de toepassing bevat componenten die zijn afgeleid uit data. Er is sprake van het fitten of leren van een model of automatische variabele selectie met behulp van statistiek, optimalisatie, simulatie, machine learning of een vergelijkbare techniek.",
    noData: "Nee, het ontwerp van de toepassing is niet gebaseerd op data.",
  },
  q2DescribeInsights: "Beschrijf hoe inzichten uit data-analyse hebben geholpen bij het ontwerp van de toepassing.",
  q2DescribeMethod: "Beschrijf de methode",
  q2Description:
    "Data omvat alle vormen van elektronische gegevens. Tekst, afbeeldingen, audio zijn ook data.\n\nToepassingen kunnen met de hand worden ontworpen. Maar ook wanneer deze handmatig is opgesteld, wordt het ontwerp soms gebaseerd op data-analyse. Zo kunnen drempelwaardes voor (uitval)regels berekend worden uit data of criteria gekozen worden aan de hand van berekende correlaties.\n\nHet komt ook voor dat componenten (zoals modellen en algoritmes) meer automatisch uit data worden afgeleid. Bijvoorbeeld door een statistisch model te fitten op data of d.m.v. machine learning een model of regelgebaseerd algoritme te leren uit data. Ook vormen van simulatie en optimalising kunnen gebruikt worden om een model af te leiden uit data.",
  q2Badges: [
    { label: nlJson["article art3 label"], color: "#F37962", url: AI_ACT_ART3_URL },
    { label: nlJson["article recital12 label"], color: "#F37962", url: AI_ACT_RECITAL12_URL },
  ],
  q2EnumTooltips: [
    null,
    null,
    null,
  ],

  // Q3
  q3Title: "Is de toepassing automatisering van door mensen opgestelde regels?",
  q3Options: {
    oneToOne:
      "Ja, een-op-een automatisering van in wet- of regelgeving of formeel beleid vastgestelde regels.",
    informal:
      "Ja, automatisering van regels, maar deze zijn niet expliciet vastgesteld in wet- of regelgeving of formeel beleid.",
    symbolic:
      "Ja, logica- en kennis-gebaseerde benaderingen van AI waarbij uitkomsten worden afgeleid uit gecodeerde kennis of uit een symbolische weergave van de op te lossen taak.",
    no: "Nee.",
  },
  q3FormalRefTitle:
    "Welk formeel beleid, wet- of regelgeving? Welk artikel, lid of paragraaf van deze regelgeving?",
  q3SymbolicDescription: "Beschrijf waarom je denkt een op logica- of kennis-gebaseerd AI-systeem te gebruiken.",
  q3NoDescription: "Geef een korte beschrijving van het ontwerp van de toepassing.",
  q3Description: `Een voorbeeld van in wet- of regelgeving vastgestelde regels is een regelgebaseerd algoritme dat bij aanvraag voor een bijstandsuitkering geautomatiseerd aangeeft wanneer niet is voldaan inkomens- en vermogenseisen. De regels in het algoritme zijn in dat geval een letterlijke implementatie van normen gespecificeerd in de Participatiewet.\nWanneer een norm open is gedefninieerd in wet- of regelgeving en deze verder worden gespecificeerd in de toepassing, is de toepassing **geen** een-op-een automatisering van wet- of regelgeving.\n\nVoorbeelden van door mensen opgestelde regels zijn:
- een regelgebaseerd algoritme waarbij een werkinstructie is vertaald naar een algoritme
- een risicoprofiel waarbij de regels met de hand zijn opgesteld op basis van ervaring van medewerkers
- open wettelijke normen die verder gespecificeerd zijn in regels
\n\nOp logica- en kennis-gebaseerde benaderingen worden ook wel symbolische AI-systemen genoemd (symbolic AI). Onder deze  vorm van AI-systemen vallen kennisrepresentatie, inductief (logisch) programmeren, kennisbanken, inferentie- en deductiemachines, (symbolisch) redeneren. Deze technologie wordt bijvoorbeeld ingezet in expert systemen.`,
  q3Badges: [
    { label: nlJson["article art3 label"], color: "#F37962", url: AI_ACT_ART3_URL },
    { label: nlJson["article recital12 label"], color: "#F37962", url: AI_ACT_RECITAL12_URL },
    { label: "Impactvol algoritme", color: "#fd7e14", url: ALGO_REGISTER_URL },
    { label: "Volledig geautomatiseerde besluitvorming", color: "#6B8A9E", url: SADM_URL },
  ],
  q3EnumTooltips: [
    null,
    null,
    "Logica- en kennis-gebaseerde benaderingen van AI zijn specifieke AI-systemen die niet vaak voorkomen. Als je denkt gebruik te maken van een dergelijk systeem, licht in de volgende vraag toe waarom je denkt dat dit het geval is.",
    null,
  ],

  // Q4
  q4Title:
    "Wordt in het proces een beslissing genomen voor individuen (consument of burger), organisaties of medewerkers?",
  q4Options: { yes: "Ja.", no: "Nee." },
  q4Description:
    "Bijvoorbeeld:\n- Prioritering van vragen of verzoeken van burgers\n- Bepalen of aanvullende informatie van een burger nodig is\n- Selecteren van personen voor controles of inspecties\n- Beoordelen of een persoon in aanmerking komt voor diensten of voorzieningen",
  q4DescriptionPublicSectorNote:
    "**Let op:** een beslissing is veel breder dan een formeel besluit zoals gedefinieerd in de Algemene wet bestuursrecht Art. 1:3. De term 'beslissing' wordt ook gebruikt in de context van Art. 22 AVG.",
  q4Badges: [
    { label: "Impactvol algoritme", color: "#fd7e14", url: ALGO_REGISTER_URL },
    { label: nlJson["article gdpr art22 label"], color: "#F37962", url: SADM_URL },
  ],

  // Q5
  q5Title:
    "Wat voor soort beslissing wordt er genomen in dit proces?\n\nKies de optie die de grootste overeenkomst heeft met de soort beslissing.",
  q5Options: {
    prioritization:
      "Beslissing over prioritering van aanvragen, verzoeken, klachten en bezwaren.",
    formalComplaints: "Beslissing over formele klachten en bezwaren.",
    financial:
      "Beslissing met directe financiële gevolgen voor burger of ambtenaar.",
    inspection:
      "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing.",
    schools: "Beslissing over toewijzing van scholen of kinderopvang.",
    eligibility:
      "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening.",
    otherLegal:
      "Een andere beslissing met rechtsgevolgen.",
    other: "Overige of andere beslissingen.",
  },
  q5OtherDescription: "Beschrijf het soort beslissing",
  q5EnumDescriptions: [
    null,
    null,
    "Zoals: beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling.",
    null,
    null,
    null,
    "Zoals: het toekennen van een vergunning of het aangaan van een overeenkomst.",
    null,
  ],
  q5Badges: [
    { label: "Impactvol algoritme", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q5_1
  q5_1Title: "Is de controle of het onderzoek bijzonder ingrijpend voor de betrokkene?",
  q5_1Options: {
    yes1: "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten op een uitkering, toeslag, teruggaaf of komt de betrokkenen niet in aanmerking voor een voorschot.",
    yes2: "Ja, omdat de controle of het onderzoek wordt uitgevoerd komt de betrokkene niet in aanmerking voor een betalingsregeling.",
    yes3: "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten om in aanmerking te komen voor een dienst, voorziening of vergunning, of wordt een dienst, voorziening of vergunning (tijdelijk) ontzegd.",
    yes4: "Ja, omdat de controle of het onderzoek is ingrijpend, bijvoorbeeld omdat een fysieke controle plaatsvind (bijv. een huisbezoek) of omdat het onderzoek op een andere manier een grote invloed heeft op het (prive) leven van de betrokkene.",
    yes5: "Ja, de controle is om een andere reden bijzonder ingrijpend voor de betrokkene.",
    no: "Nee.",
  },
  q5_1Badges: [
    { label: "Impactvol algoritme", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q6
  q6Title:
    "Draagt het proces bij aan hoe de overheid (groepen) burgers of ambtenaren categoriseert of benadert?",
  q6TitleGeneric:
    "Draagt het proces bij aan hoe de organisatie (groepen) consumenten, organisaties of medewerkers categoriseert of benadert?",
  q6Options: { yes: "Ja.", unsure: "Ik weet het niet zeker.", no: "Nee." },
  q6UnsureDescription:
    "Geef een korte beschrijving van het proces en hoe dit burgers of ambtenaren raakt.",
  q6Badges: [
    { label: "Impactvol algoritme", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q7
  q7Title:
    "Welke van de volgende opties beschrijft het effect van de toepassing op de uitkomst het beste?",
  q7Options: {
    direct:
      "De toepassing bepaalt de uitkomst direct of heeft er een sterke invloed op.",
    partial:
      "De toepassing beïnvloedt het proces of de uitkomst, maar een mens neemt de uiteindelijke beslissing.",
    human:
      "De uitkomst wordt volledig door een mens bepaald; de toepassing is één van meerdere factoren en is niet doorslaggevend.",
    other: "Een ander soort effect.",
  },
  q7OtherDescription: "Beschrijf het effect van de toepassing op het proces",
  q7EnumTooltips: [
    "Bijvoorbeeld: werkinstructies schrijven het gevolg is van een bepaalde uitkomst van de toepassing voor. Een medewerker kan in uitzonderlijke gevallen van het gevolg afwijken, maar meestal bepaalt het resultaat van het systeem wat het eindresultaat van het proces zal zijn.",
    "Deze medewerker heeft de juiste informatie, ervaring/kunde, mandaat en beschikbare tijd om de beslissing te maken.",
    null,
    null,
  ],
  q7Description: "Kies bij twijfel de bovenste van de opties waarover u twijfelt.",
  q7Badges: [
    { label: "Impactvol algoritme", color: "#fd7e14", url: ALGO_REGISTER_URL },
  ],

  // Q8
  q8Title: "Worden persoonsgegevens verwerkt door de toepassing?",
  q8Options: { yes: "Ja.", no: "Nee." },
  q8Description: "Persoonsgegevens zijn alle informatie waarmee een specifiek individu direct of indirect geïdentificeerd kan worden, zoals een naam, e-mailadres, ID-nummer of locatiegegevens.",
  q8AlertDescription: "Voorbeelden van niet-persoonsgegevens zijn:\n- Groepsstatistieken waarbij geen individu kan worden onderscheiden\n- Geanonimiseerde gegevens\n- Output over fysieke zaken die niet aan een individu zijn gekoppeld, zoals sensormetingen, weergegevens, machine- en operationele gegevens, gegevens over stedenbouw en infrastructuur\n- Financiële gegevens van bedrijven\n- Gegevens over stadswijken en buurten.\n\nMerk op: ondernemingen waarbij de ondernemer persoonlijk aansprakelijk is (zzp'er, eenmanszaak, vennootschap onder firma, maatschap) worden beschouwd als persoonsgegevens.",
  q8Badges: [
    { label: "Persoonsgegevens", color: "#198754", url: GDPR_URL },
  ],

  // Q8b
  q8bTitle:
    "Worden persoonskenmerken geëvalueerd, geanalyseerd of voorspeld?",
  q8bOptions: { yes: "Ja.", no: "Nee." },
  q8bDescription:
    "Persoonskenmerken zijn o.a. beroepsprestaties, economische situatie, gezondheid, persoonlijke voorkeuren, interesses, betrouwbaarheid, gedrag, locatie of verplaatsingen analyseren of voorspellen.",
  q8bAlertDescription: "Het evalueren, analyseren of voorspellen van persoonskenmerken van een natuurlijk persoon staat bekend als _profilering_.",
  q8bBadges: [
    { label: "Profilering", color: "#4F46E5", url: "https://gdpr-info.eu/art-4-gdpr/" },
    { label: nlJson["article gdpr art4 label"], color: "#F37962", url: "https://gdpr-info.eu/art-4-gdpr/" },
  ],

  // Q9
  q9Title: "Wordt de output van het algoritme gedeeld met andere organisaties?",
  q9Options: { yes: "Ja.", no: "Nee." },
  q9Badges: [
    { label: nlJson["article gdpr art22 label"], color: "#F37962", url: SADM_URL },
  ],

  // Q10
  q10Title:
    "Wordt de output van het algoritme langer opgeslagen dan de doorlooptijd van het primaire proces waarvoor het algoritme wordt ingezet?",
  q10Options: { yes: "Ja.", no: "Nee." },
  q10Badges: [
    { label: nlJson["article gdpr art22 label"], color: "#F37962", url: SADM_URL },
  ],

  // Intermediate output
  nextStepTitle: "Volgende stap",
  nextStepText:
    "De volgende vragen gaan over het proces waarin de toepassing gebruikt wordt. Focus hierbij op het proces.\n\nHet maakt voor deze vragen niet uit of de toepassing een kleine of grote rol speelt in het besluitvormingsproces.",

  // Storage/sharing warning
  storageWarning:
    "Let op: Het langdurig opslaan of delen met derden van de output van een algoritme kan leiden tot aanmerkelijke (onvoorziene) gevolgen voor een betrokkene. Hierdoor kan in juridische zin sprake zijn van sADM volgens AVG artikel 22 ook wanneer het primaire gebruik van het algoritme dit niet is. Bepaal in overleg met relevante juridische experts of door opslag of delen van de uitkomsten indirect sprake kan zijn van sADM. Zie ook https://www.autoriteitpersoonsgegevens.nl/documenten/advies-geautomatiseerde-besluitvorming",

  // Outputs
  outputResultTitle: "Uitkomst",
  outputs: {
    AI:            `Op basis van uw antwoorden is uw toepassing:\n\n✅ een ${B_AI} volgens de AI-verordening\n\n❌ geen ${B_ALGO}\n\n❌ geen ${B_SADM} volgens artikel 22 van de ${B_GDPR}`,
    Algo:          `Op basis van uw antwoorden is uw toepassing:\n\n✅ een ${B_ALGO}\n\n❌ geen ${B_SADM} volgens artikel 22 van de ${B_GDPR}\n\n❌ geen ${B_AI} volgens de AI-verordening`,
    sADM:          `Op basis van uw antwoorden is uw toepassing:\n\n❌ geen ${B_ALGO}\n\n❌ geen ${B_AI} volgens de AI-verordening\n\n💡 mogelijk ${B_SADM} volgens artikel 22 van de ${B_GDPR}`,
    AlgoAndAI:     `Op basis van uw antwoorden is uw toepassing:\n\n✅ een ${B_AI} volgens de AI-verordening\n\n✅ een ${B_ALGO}\n\n❌ geen ${B_SADM} volgens artikel 22 van de ${B_GDPR}`,
    AlgoAndSADM:   `Op basis van uw antwoorden is uw toepassing:\n\n❌ geen ${B_AI} volgens de AI-verordening\n\n✅ een ${B_ALGO}\n\n💡 mogelijk ${B_SADM} volgens artikel 22 van de ${B_GDPR}`,
    AlgoSADMAndAI: `Op basis van uw antwoorden is uw toepassing:\n\n✅ een ${B_AI} volgens de AI-verordening\n\n✅ een ${B_ALGO}\n\n💡 mogelijk ${B_SADM} volgens artikel 22 van de ${B_GDPR}`,
    None:          `Op basis van uw antwoorden is uw toepassing:\n\n❌ geen ${B_ALGO}\n\n❌ geen ${B_SADM} volgens artikel 22 van de ${B_GDPR}\n\n❌ geen ${B_AI} volgens de AI-verordening`,
  },
  outputNextSteps: {
    AI: `Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.`,
    Algo: `- Neem algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.`,
    sADM: `- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van sADM.`,
    AlgoAndAI: `- Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.
- Neem het algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.`,
    AlgoAndSADM: `- Neem het algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.
- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van sADM.`,
    AlgoSADMAndAI: `- Vul de AI risicoclassificatie vragenlijst in om te bepalen aan welke vereisten uit de AI-verordening de toepassing moet voldoen.
- Neem het algoritme op in het Algoritmeregister.
- Zorg dat wordt voldaan aan intern geldend algoritmebeleid.
- Bepaal in overleg met relevante juridische experts of er daadwerkelijk sprake is van sADM.`,
  },
};
