export const q5 = {
  type: "string",
  title:
    "Wat voor soort beslissing wordt er genomen in dit proces?\n\nKies de optie die de grootste overeenkomst heeft met de soort beslissing.",
  enum: [
    "Beslissing over prioritering van aanvragen, verzoeken, klachten en bezwaren",
    "Beslissing over formele klachten en bezwaren",
    "Beslissing met directe financiële gevolgen voor burger of ambtenaar, \nzoals bijvoorbeeld beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling.",
    "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing",
    "Beslissing over toewijzing van scholen of kinderopvang",
    "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening",
    "Een andere beslissing met rechtsgevolgen zoals bijvoorbeeld vergunning toekenning of het aangaan van een overeenkomst",
    "Overige of andere beslissingen",
  ],
};

export const q5Dependencies = (
  string1: string,
  string2: string,
  string3: string,
  string4: string,
  string5: string
) => {
  // If the $ref points to a definition whose name contains "output",
  // emit { output: { $ref: ... } } else emit { automation: { $ref: ... } }.
  const refToProp = (ref: string) => {
    const key = ref.includes("output") ? "output" : "automation";
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
            ...refToProp(string1),
          },
          required: ["q5_option8"],
        },
        {
          properties: {
            q5: {
              enum: [
                "Beslissing over formele klachten en bezwaren",
                "Beslissing met directe financiële gevolgen voor burger of ambtenaar, \nzoals bijvoorbeeld beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling.",
                "Beslissing over toewijzing van scholen of kinderopvang",
                "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening",
                "Een andere beslissing met rechtsgevolgen zoals bijvoorbeeld vergunning toekenning of het aangaan van een overeenkomst",
              ],
            },
            ...refToProp(string2),
          },
        },
        {
          properties: {
            q5: {
              enum: [
                "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing",
              ],
            },
            q5_1: {
              type: "string",
              title:
                "Is de controle of het onderzoek bijzonder ingrijpend voor de betrokkene?",
              enum: [
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten op een uitkering, toeslag, teruggaaf of komt de betrokkenen niet in aanmerking voor een voorschot.",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd komt de betrokkene niet in aanmerking voor een betalingsregeling.",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten om in aanmerking te komen voor een dienst, voorziening of vergunning, of wordt een dienst, voorziening of vergunning (tijdelijk) ontzegd.",
                "Ja, omdat de controle of het onderzoek is ingrijpend, bijvoorbeeld omdat een fysieke controle plaatsvind (bijv. een huisbezoek) of omdat het onderzoek op een andere manier een grote invloed heeft op het (prive) leven van de betrokkene.",
                "Ja, de controle is om een andere reden bijzonder ingrijpend voor de betrokkene.",
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
            ...refToProp(string3),
          },
        },
      ],
    },
    q5_1: {
      oneOf: [
        {
          properties: {
            q5_1: {
              enum: [
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten op een uitkering, toeslag, teruggaaf of komt de betrokkenen niet in aanmerking voor een voorschot.",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd komt de betrokkene niet in aanmerking voor een betalingsregeling.",
                "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten om in aanmerking te komen voor een dienst, voorziening of vergunning, of wordt een dienst, voorziening of vergunning (tijdelijk) ontzegd.",
                "Ja, omdat de controle of het onderzoek is ingrijpend, bijvoorbeeld omdat een fysieke controle plaatsvind (bijv. een huisbezoek) of omdat het onderzoek op een andere manier een grote invloed heeft op het (prive) leven van de betrokkene.",
                "Ja, de controle is om een andere reden bijzonder ingrijpend voor de betrokkene.",
              ],
            },
            "q5_1-controle": {
              type: "string",
              title: "Beschrijf het gevolg van de controle voor de betrokkene",
              default: "",
            },
            ...refToProp(string4),
          },
          required: ["q5_1-controle"],
        },
        {
          properties: {
            q5_1: {
              enum: ["Nee"],
            },
            ...refToProp(string5),
          },
        },
      ],
    },
  };
};
