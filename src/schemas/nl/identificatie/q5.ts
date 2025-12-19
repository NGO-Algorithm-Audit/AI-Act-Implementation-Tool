export const q5 = {
  type: "string",
  title:
    "Wat voor soort beslissing wordt er genomen in dit proces?\n\nKies de optie die de grootste overeenkomst heeft met de soort beslissing.",
  enum: [
    "Beslissing over prioritering van aanvragen, verzoeken, klachten en bezwaren",
    "Beslissing over formele klachten en bezwaren",
    "Beslissing met directe financiële gevolgen voor burger of ambtenaar, \nzoals bijvoorbeeld beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling",
    "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing",
    "Beslissing over toewijzing van scholen of kinderopvang",
    "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening",
    "Een andere beslissing met rechtsgevolgen zoals bijvoorbeeld vergunning toekenning of het aangaan van een overeenkomst",
    "Overige of andere beslissingen",
  ],
};

export const q5Dependencies = (
  output: string,
  effect1: string,
  effect2: string,
  effect3: string,
  effect4: string
) => {
  // If the $ref points to a definition whose name contains "output",
  // emit { output: { $ref: ... } } else emit { effect: { $ref: ... } }.
  const refToProp = (ref: string) => {
    const key = ref.includes("output") ? "output" : "effect";
    return { [key]: { $ref: ref } };
  };

  return {
    q5: {
      oneOf: [
        {
          properties: {
            q5: {
              enum: ["Overige of andere beslissingen"],
            },
            q5_option8: {
              type: "string",
              title: "Beschrijf het soort beslissing",
              default: "",
            },
            output: {
              $ref: output,
            },
          },
          required: ["q5_option8"],
        },
        {
          properties: {
            q5: {
              enum: [
                "Beslissing over formele klachten en bezwaren",
                "Beslissing met directe financiële gevolgen voor burger of ambtenaar, \nzoals bijvoorbeeld beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling",
                "Beslissing over toewijzing van scholen of kinderopvang",
                "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening",
                "Een andere beslissing met rechtsgevolgen zoals bijvoorbeeld vergunning toekenning of het aangaan van een overeenkomst",
              ],
            },
            ...refToProp(effect1),
          },
        },
        {
          properties: {
            q5: {
              enum: [
                "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing",
              ],
            },
            q5_option5: {
              type: "string",
              title:
                "Is de controle of het onderzoek bijzonder ingrijpend voor de betrokkene?",
              enum: [
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten op een uitkering, toeslag, teruggaaf of komt de betrokkenen niet in aanmerking voor een voorschot",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd komt de betrokkene niet in aanmerking voor een betalingsregeling",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten om in aanmerking te komen voor een dienst, voorziening of vergunning, of wordt een dienst, voorziening of vergunning (tijdelijk) ontzegd",
                "Ja, omdat de controle of het onderzoek is ingrijpend, bijvoorbeeld omdat een fysieke controle plaatsvind (bijv. een huisbezoek) of omdat het onderzoek op een andere manier een grote invloed heeft op het (prive) leven van de betrokkene",
                "Ja, de controle is om een andere reden bijzonder ingrijpend voor de betrokkene",
                "Nee",
              ],
            },
          },
        },
        {
          properties: {
            q5: {
              enum: [
                "Beslissing over prioritering van aanvragen, verzoeken, klachten en bezwaren",
              ],
            },
            ...refToProp(effect2),
          },
        },
      ],
    },
    q5_option5: {
      oneOf: [
        {
          properties: {
            q5_option5: {
              enum: [
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten op een uitkering, toeslag, teruggaaf of komt de betrokkenen niet in aanmerking voor een voorschot",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd komt de betrokkene niet in aanmerking voor een betalingsregeling",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten om in aanmerking te komen voor een dienst, voorziening of vergunning, of wordt een dienst, voorziening of vergunning (tijdelijk) ontzegd",
                "Ja, omdat de controle of het onderzoek is ingrijpend, bijvoorbeeld omdat een fysieke controle plaatsvind (bijv. een huisbezoek) of omdat het onderzoek op een andere manier een grote invloed heeft op het (prive) leven van de betrokkene.",
                "Ja, de controle is om een andere reden bijzonder ingrijpend voor de betrokkene",
              ],
            },
            "q5-option5-controle": {
              type: "string",
              title: "Beschrijf het gevolg van de controle voor de betrokkene",
              default: "",
            },
            ...refToProp(effect3),
          },
          required: ["q5-option5-controle"],
        },
        {
          properties: {
            q5_option5: {
              enum: ["Nee"],
            },
            ...refToProp(effect4),
          },
        },
      ],
    },
  };
};
