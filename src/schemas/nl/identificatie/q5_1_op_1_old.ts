export const q5_1_op_1 = {
  type: "string",
  title:
    "Wat voor soort beslissing wordt er genomen in dit proces?\n\nKies de optie die de grootste overeenkomst heeft met de soort beslissing.",
  enum: [
    "Beslissing over prioritering van aanvragen, verzoeken, klachten en bezwaren",
    "Beslissing over formele klachten en bezwaren",
    "Beslissing met directe financiële gevolgen voor burger of ambtenaar, zoals beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling",
    "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing",
    "Beslissing over toewijzing van scholen of kinderopvang",
    "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening",
    "Een andere beslissing met rechtsgevolgen, zoals vergunning toekenning of het aangaan van een overeenkomst",
    "Overige of andere beslissingen",
  ],
};
export const q5_1_op_1Dependencies = (
  output: string,
  effect1: string,
  output2: string,
  effect2: string,
  output3: string
) => ({
  q5_1_op_1: {
    oneOf: [
      {
        properties: {
          q5_1_op_1: {
            enum: ["Overige of andere beslissingen"],
          },
          q5_1_op_1_option8: {
            type: "string",
            title: "Beschrijf het soort beslissing",
            default: "",
          },
          output: {
            $ref: output, //"#/definitions/outputNone"
          },
        },
        required: ["q5_1_op_1_option8"],
      },
      {
        properties: {
          q5_1_op_1: {
            enum: [
              "Beslissing over formele klachten en bezwaren",
              "Beslissing met directe financiële gevolgen voor burger of ambtenaar, zoals beslissingen over een arbeidscontract, uitkering, toeslag, subsidie, boete, terugbetaling of mogelijkheid tot betalingsregeling",
              "Beslissing over toewijzing van scholen of kinderopvang",
              "Beslissingen of een persoon in aanmerking komt voor een dienst of voorziening",
              "Een andere beslissing met rechtsgevolgen, zoals vergunning toekenning of het aangaan van een overeenkomst",
            ],
          },
          effect: { $ref: effect1 }, //"#/definitions/automation"
        },
      },
      {
        properties: {
          q5_1_op_1: {
            enum: [
              "Beslissing over controle, onderzoek of verzoek tot aanvullende informatieverschaffing",
            ],
          },
          q5_1_op_1_option5: {
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
          q5_1_op_1: {
            enum: [
              "Beslissing over prioritering van aanvragen, verzoeken, klachten en bezwaren",
            ],
          },
          output: { $ref: output2 }, //"#/definitions/outputNone"
        },
      },
    ],
  },
  q5_1_op_1_option5: {
    oneOf: [
      {
        properties: {
          q5_1_op_1_option5: {
            enum: [
              "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten op een uitkering, toeslag, teruggaaf of komt de betrokkenen niet in aanmerking voor een voorschot",
              "Ja, omdat de controle of het onderzoek wordt uitgevoerd komt de betrokkene niet in aanmerking voor een betalingsregeling",
              "Ja, omdat de controle of het onderzoek wordt uitgevoerd moet de betrokkene langer wachten om in aanmerking te komen voor een dienst, voorziening of vergunning, of wordt een dienst, voorziening of vergunning (tijdelijk) ontzegd",
              "Ja, omdat de controle of het onderzoek is ingrijpend, bijvoorbeeld omdat een fysieke controle plaatsvind (bijv. een huisbezoek) of omdat het onderzoek op een andere manier een grote invloed heeft op het (prive) leven van de betrokkene.",
              "Ja, de controle is om een andere reden bijzonder ingrijpend voor de betrokkene",
            ],
          },
          "q5_1_op_1-option5-controle": {
            type: "string",
            title: "Beschrijf het gevolg van de controle voor de betrokkene",
            default: "",
          },
          effect: { $ref: effect2 }, //"#/definitions/automation"
        },
        required: ["q5_1_op_1-option5-controle"],
      },
      {
        properties: {
          q5_1_op_1_option5: {
            enum: ["Nee"],
          },
          output: { $ref: output3 }, //"#/definitions//outputNone"
        },
      },
    ],
  },
});
