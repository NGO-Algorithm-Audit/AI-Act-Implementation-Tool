export const saving_sharing_sADM = {
  properties: {
    noAIandAlgoCont: {
      enum: ["Continue"],
    },
    q8: {
      type: "string",
      title:
        "Does the output of the algorithm concern an individual citizen or a case that concerns an individual citizen?",
      enum: ["Yes", "No"],
    },
  },
  dependencies: {
    q8: {
      oneOf: [
        {
          properties: {
            q8: {
              enum: ["No"],
            },
            outputIntermediate: {
              type: "string",
              title: "Next step",
              default:
                "The following questions concern the process wherein the application is used. Focus on the process itself. \nFor these questions, it does not matter whether the application only plays a minor preparatory role.",
            },
            impact: {
              $ref: "#/definitions/impact_sADM",
            },
          },
        },
        {
          properties: {
            q8: {
              enum: ["Yes"],
            },
            q9: {
              type: "string",
              title:
                "Is the output of the algorithm shared with other organizations?",
              enum: ["Yes", "No"],
            },
          },
          required: ["q9"],
          dependencies: {
            q9: {
              oneOf: [
                {
                  properties: {
                    q9: {
                      enum: ["Yes"],
                    },
                    additionalOutputText: {
                      default: `Please note: Long-term storage or sharing of the output of an algorithm with third parties may have significant (unforeseen) consequences for a data subject. This may constitute sADM in a legal sense following Article 22, even if this is not the primary use of the algorithm. In consultation with relevant legal experts, determine whether storing or sharing the results could indirectly constitute sADM. See also https://www.autoriteitpersoonsgegevens.nl/documenten/advies-geautomatiseerde-besluitvorming`,
                    },
                    outputIntermediate: {
                      type: "string",
                      title: "Next step",
                      default:
                        "The following questions concern the process wherein the application is used. Focus on the process itself. \nFor these questions, it does not matter whether the application only plays a minor preparatory role.",
                    },
                    impact: {
                      $ref: "#/definitions/impact_sADM",
                    },
                  },
                },
                {
                  properties: {
                    q9: {
                      enum: ["No"],
                    },
                    q10: {
                      type: "string",
                      title:
                        "Is the output of the algorithm stored for longer than the duration of the primary process for which the algorithm is used?",
                      enum: ["Yes", "No"],
                    },
                  },
                  required: ["q10"],
                  dependencies: {
                    q10: {
                      oneOf: [
                        {
                          properties: {
                            q10: {
                              enum: ["Yes"],
                            },
                            additionalOutputText: {
                              default: `Please note: Long-term storage or sharing of the output of an algorithm with third parties may have significant (unforeseen) consequences for a data subject. This may constitute sADM in a legal sense following Article 22, even if this is not the primary use of the algorithm. In consultation with relevant legal experts, determine whether storing or sharing the results could indirectly constitute sADM. See also https://www.autoriteitpersoonsgegevens.nl/documenten/advies-geautomatiseerde-besluitvorming`,
                            },
                            outputIntermediate: {
                              type: "string",
                              title: "Next step",
                              default:
                                "The following questions concern the process wherein the application is used. Focus on the process itself. \nFor these questions, it does not matter whether the application only plays a minor preparatory role.",
                            },
                            impact: {
                              $ref: "#/definitions/impact_sADM",
                            },
                          },
                        },
                        {
                          properties: {
                            q10: {
                              enum: ["No"],
                            },
                            outputIntermediate: {
                              type: "string",
                              title: "Next step",
                              default:
                                "The following questions concern the process wherein the application is used. Focus on the process itself. \nFor these questions, it does not matter whether the application only plays a minor preparatory role.",
                            },
                            impact: {
                              $ref: "#/definitions/impact_sADM",
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
