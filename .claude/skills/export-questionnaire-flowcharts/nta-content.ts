// Hand-written, condensed paraphrases for the NTA 8047 chart boxes — the one piece of
// chart wording a script must never generate (house rule: never paste the schema
// `title` verbatim, see SKILL.md). One entry per chapter per `ui:id`. Both the
// standalone chapter chart and the merged `nta` chart are built from this same file
// by nta-generate.mjs, so a wording change here updates both charts at once instead of
// having to be retyped in two places.
//
// Break each entry into 2-4 short lines with explicit <br/>, the way every other chart
// master authors its line breaks. Do not include NTA chapter or paragraph numbers here
// (e.g. "hoofdstuk 6", "§ 6.2") — those are intentionally left out of the generated
// charts; edit that framing in descriptions.ts instead, by hand.

export const NTA_CONTENT: Record<string, Record<string, string>> = {
  wenselijkheid: {
    q1: "Probleem, oorzaken, omvang<br/>en gevolgen van niet ingrijpen<br/>in kaart gebracht?",
    q2: "Doel, wettelijke opdracht en<br/>bevoegdheid van het<br/>besluitvormingsproces<br/>onderbouwd?",
    q3: "Bij toezicht of handhaving:<br/>effect op gedrag onderbouwd en<br/>minder ingrijpende opties<br/>overwogen?",
    q4: "Geraakte personen en<br/>stakeholders in kaart gebracht,<br/>betrokken en hun belangen<br/>vastgelegd?",
    q5: "Alternatieven voor profilering<br/>onderzocht en afgewogen, met<br/>inbreng van stakeholders?",
    q6: "Juridische, technische en<br/>ethische expertise en<br/>stakeholders bij bovenstaande<br/>stappen betrokken?",
    q7: "Afsluitend, multidisciplinair<br/>beslismoment over verder<br/>ontwikkelen gehouden?",
  },
  ontwerp: {
    q1: "Keuze doelvariabele en dataset<br/>onderbouwd: relatie met doel,<br/>definitie, meetbaarheid en<br/>datakwaliteit?",
    q2: "Als de doelvariabele niet<br/>categorisch is: onderbouwd<br/>waarom dat niet mogelijk of<br/>wenselijk was?",
    q3: "Populatie, steekproef,<br/>ontwikkel-, validatie- en<br/>testdataset afgebakend?",
    q4: "Bij één dataset zonder<br/>willekeurige steekproef:<br/>afweging tegen alternatieven<br/>gemotiveerd vastgelegd?",
    q5: "Datakwaliteit beoordeeld op<br/>juistheid, volledigheid,<br/>representativiteit, samenhang<br/>en actualiteit?",
    q6: "Datasets gedocumenteerd op<br/>herkomst, opbouw en<br/>bewerkingen?",
    q7: "Selectiekenmerken<br/>multidisciplinair getoetst op<br/>juridische en ethische<br/>bezwaren?",
    q8: "Selectiekenmerken kwantitatief<br/>getoetst op verband met<br/>beschermde gronden<br/>(proxyanalyse)?",
    q9: "Type instrument (regels, data-<br/>gedreven of combinatie)<br/>gekozen en onderbouwd?",
    q10: "Bij een regelgebaseerd<br/>instrument: elke regel,<br/>drempelwaarde en gewicht<br/>onderbouwd?",
    q11: "Prestaties gemeten op de<br/>validatiedataset, getoetst aan<br/>vooraf bepaalde marges?",
    q12: "Indirect onderscheid tussen<br/>groepen multidisciplinair<br/>gemeten en getoetst aan<br/>marges?",
    q13: "Als onderscheid niet meetbaar<br/>was: doorgaan onderbouwd met<br/>risicobeperkende maatregelen<br/>en monitoring?",
    q14: "Prestaties en onderscheid<br/>statistisch getoetst op toeval?",
    q15: "Maatstaven en marges vooraf<br/>vastgesteld, met motivatie voor<br/>latere herziening?",
    q16: "Na elke iteratie prestaties en<br/>onderscheid herhaald tot beide<br/>aanvaardbaar zijn?",
    q17: "Afsluitend, multidisciplinair<br/>beslismoment over verder<br/>ontwikkelen gehouden?",
  },
  verificatie: {
    q1: "Prestaties en onderscheid<br/>opnieuw gemeten op de<br/>testdataset, binnen de vooraf<br/>bepaalde marges?",
    q2: "Getoetst op legitiem doel,<br/>geschiktheid, subsidiariteit en<br/>proportionaliteit?",
    q3: "Instrument voldoet aan alle vier<br/>voorwaarden van de juridische<br/>toets?",
    q4: "Gevalideerd met een kleine,<br/>gedocumenteerde pilot met<br/>stopcriteria en evaluatie?",
    q5: "Ontwikkelproces onafhankelijk<br/>getoetst aan eigen normen,<br/>algoritmebeleid en extern<br/>beleid?",
    q6: "Juridische, technische en<br/>ethische expertise bij<br/>bovenstaande stappen<br/>betrokken?",
    q7: "Juridische toets<br/>multidisciplinair herhaald en<br/>eindoordeel over ingebruikname<br/>vastgelegd?",
  },
  gebruik: {
    q1: "Duidelijke instructies en<br/>waarborgen voor consistente,<br/>neutrale en gecontroleerde<br/>beoordeling door medewerkers?",
    q2: "Passende verhouding<br/>willekeurige/instrumentselectie,<br/>met signalering en<br/>bezwaarprocedure?",
    q3: "Geraakte personen<br/>geïnformeerd en gebruik van het<br/>instrument gepubliceerd?",
    q4: "Frequentie, uitvoering en<br/>aanleiding voor evaluatie en<br/>monitoring vooraf vastgelegd?",
    q5: "Doorlopend gevolgd of het<br/>proces verandert en het<br/>instrument nog voldoet?",
    q6: "Organisatorische waarborgen,<br/>context en beleid periodiek<br/>herbeoordeeld en vastgelegd?",
    q7: "Datakwaliteit, afwijkingen, data<br/>drift, prestaties en onderscheid<br/>periodiek gemeten?",
    q8: "Juridische toets na elke<br/>monitoringcyclus<br/>multidisciplinair<br/>herbeoordeeld?",
  },
};
