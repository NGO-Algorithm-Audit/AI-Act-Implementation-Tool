export const AIContDoorgaan = {
  properties: {
    AICont: {
      enum: ["Doorgaan"],
    },
    q8: {
      type: "string",
      title:
        "Gaat de output van het algoritme over een individuele burger of een casus die een individuele burger aangaat?",
      enum: ["ja", "nee"],
    },
  },
  dependencies: {
    q8: {
      oneOf: [
        {
          properties: {
            q8: {
              enum: ["ja"],
            },
            q9: {
              type: "string",
              title:
                "Wordt de output van het algoritme gedeeld met andere organisaties?",
              enum: ["ja", "nee"],
            },
          },
          required: ["q9"],
          dependencies: {
            q9: {
              oneOf: [
                {
                  properties: {
                    q9: {
                      enum: ["ja"],
                    },
                  },
                },
                {
                  properties: {
                    q9: {
                      enum: ["nee"],
                    },
                    q10: {
                      type: "string",
                      title:
                        "Wordt de output van het algoritme langer opgeslagen dan de doorlooptijd van het primaire proces waarvoor het algoritme wordt ingezet?",
                      enum: ["ja", "nee"],
                    },
                  },
                  required: ["q10"],
                  dependencies: {
                    q10: {
                      oneOf: [
                        {
                          properties: {
                            q10: {
                              enum: ["ja"],
                            },
                          },
                        },
                        {
                          properties: {
                            q10: {
                              enum: ["nee"],
                            },
                            outputIntermediate: {
                              type: "string",
                              title: "Volgende stap",
                              default:
                                "De volgende vragen gaan over het proces waarin de toepassing gebruikt wordt. Focus hierbij op het proces. \nHet maakt voor deze vragen niet uit of de toepassing slechts een kleine voorbereidende rol in het besluitvormingsproces heeft.",
                            },
                            impact: {
                              $ref: "#/definitions/impactAI",
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
};
