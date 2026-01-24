export const identificationSchema = {
  "JSONSchema": {
    "title": "Identification of AI systems and high-impact algorithms",
    "type": "object",
    "definitions": {
      "outputNoAI": {
        "type": "string",
        "title": "Result",
        "default": "Based on your answers, your application is not an AI system or high-impact algorithm."
      },
      "outputAI": {
        "type": "string",
        "title": "Result",
        "default": "Based on your answers, your application is an AI system under the AI Act. Complete the following questionnaire to determine which requirements of the AI Act your application must comply with."
      },
      "outputAlgorithm": {
        "type": "string",
        "title": "Result",
        "default": "Based on your answers, your application is a high-impact algorithm. It is advised to implement policies and processes to mitigate the risks that stem from these systems. High-impact algorithms emplyed by Dutch government must be registered in the Dutch algorithm register and adhere to internal algorithm policies."
      },
      "outputAlgorithmAndAI": {
        "type": "string",
        "title": "Result",
        "default": "Based on your answers, your application is a high-impact algorithm. It is advised to implement policies and processes to mitigate the risks that stem from these systems. High-impact algorithms emplyed by Dutch government must be registered in the Dutch algorithm register and adhere to internal algorithm policies.\n\nYour application is based on your answers most likely also an AI system according to the AI Act. Complete the following questionnaire to determine which requirements of the AI Act your application must comply with."
      },
      "outputIntermediateAISystem": {
        "type": "string",
        "title": "Result",
        "default": "Based on your answers, your application is an AI system according to the AI Act. It may also qualify as a high-impact algorithm. Complete the following questionnaire to find out."
      },
      "effect": {
        "title": "Effect",
        "type": "object",
        "properties": {
          "q7": {
            "type": "string",
            "title": "Which of the following options best describes your application's impact on the outcome of the process?",
            "enum": [
              "The outcome of the process is directly determined by the application without human intervention. Once the proces is complete, a human analyst may review and evaluate the results.",
              "The outcome of the process is heavily influenced by the application. For instance, because work instructions determine what the effect is of certain outtput of the application. A human analyst can deviate from the outcome, but most often does the output of the application determines the outcome of the process.",
              "The outcome of the process is partly influenced by the application. The output of the application is important for the outcome, but the ultimate decision is taken by a human analyst. This analyst has sufficient information, knowledge/experience, mandate and available time to take the decision.",
              "The application determines the process flow, but the outcome of the process is fully determined by a human. For example, when the output of the application is a riskscore which determines whether an investigation is launched or a case should be processed with more scrutiny, but the investigation or processing of the case is performed fully manually.",
              "The process flow and outcome of the process is fully determined by a human and is influenced by multiple factors. The output of the application is one of many factors and is not decisive in the decision.",
              "Another type of output"
            ]
          }
        },
        "required": ["q7"],
        "dependencies": {
          "q7": {
            "oneOf": [
              {
                "properties": {
                  "q7": {
                    "enum": [
                      "The process flow and outcome of the process is fully determined by a human and is influenced by multiple factors. The output of the application is one of many factors and is not decisive in the decision."
                    ]
                  },
                  "output": { "$ref": "#/definitions/outputNoAI" }
                }
              },
              {
                "properties": {
                  "q7": { "enum": ["Another type of output"] },
                  "q7_option5": {
                    "type": "string",
                    "title": "Describe the effect of the application on the process"
                  },
                  "output": { "$ref": "#/definitions/outputNoAI" }
                },
                "required": ["q7_option5"]
              },
              {
                "properties": {
                  "q7": {
                    "enum": [
                      "The outcome of the process is directly determined by the application without human intervention. Once the proces is complete, a human analyst may review and evaluate the results.",
                      "The outcome of the process is heavily influenced by the application. For instance, because work instructions determine what the effect is of certain outtput of the application. A human analyst can deviate from the outcome, but most often does the output of the application determines the outcome of the process.",
                      "The outcome of the process is partly influenced by the application. The output of the application is important for the outcome, but the ultimate decision is taken by a human analyst. This analyst has sufficient information, knowledge/experience, mandate and available time to take the decision.",
                      "The application determines the process flow, but the outcome of the process is fully determined by a human. For example, when the output of the application is a riskscore which determines whether an investigation is launched or a case should be processed with more scrutiny, but the investigation or processing of the case is performed fully manually."
                    ]
                  },
                  "output": { "$ref": "#/definitions/outputAlgorithm" }
                }
              }
            ]
          }
        }
      },
      "effectAI": {
        "title": "EffectAI",
        "type": "object",
        "properties": {
          "q7": {
            "type": "string",
            "title": "Which of the following options best describes the effect of your application on the outcome of the application?",
            "enum": [
              "The outcome of the process is directly determined by the application without human intervention. Once the proces is complete, a human analyst may review and evaluate the results.",
              "The outcome of the process is heavily influenced by the application. For instance, because work instructions determine what the effect is of certain outtput of the application. A human analyst can deviate from the outcome, but most often does the output of the application determines the outcome of the process.",
              "The outcome of the process is partly influenced by the application. The output of the application is important for the outcome, but the ultimate decision is taken by a human analyst. This analyst has sufficient information, knowledge/experience, mandate and available time to take the decision.",
              "The application determines the process flow, but the outcome of the process is fully determined by a human. For example, when the output of the application is a riskscore which determines whether an investigation is launched or a case should be processed with more scrutiny, but the investigation or processing of the case is performed fully manually.",
              "The process flow and outcome of the process is fully determined by a human and is influenced by multiple factors. The output of the application is one of many factors and is not decisive in the decision.",
              "Another type of output"
            ]
          }
        },
        "required": ["q7"],
        "dependencies": {
          "q7": {
            "oneOf": [
              {
                "properties": {
                  "q7": {
                    "enum": [
                      "The process flow and outcome of the process is fully determined by a human and is influenced by multiple factors. The output of the application is one of many factors and is not decisive in the decision."
                    ]
                  },
                  "output": { "$ref": "#/definitions/outputAI" }
                }
              },
              {
                "properties": {
                  "q7": { "enum": ["Another type of output"] },
                  "q7_option5": {
                    "type": "string",
                    "title": "Describe the effect of the application on the process"
                  },
                  "output": { "$ref": "#/definitions/outputAI" }
                },
                "required": ["q7_option5"]
              },
              {
                "properties": {
                  "q7": {
                    "enum": [
                      "The outcome of the process is directly determined by the application without human intervention. Once the proces is complete, a human analyst may review and evaluate the results.",
                      "The outcome of the process is heavily influenced by the application. For instance, because work instructions determine what the effect is of certain outtput of the application. A human analyst can deviate from the outcome, but most often does the output of the application determines the outcome of the process.",
                      "The outcome of the process is partly influenced by the application. The output of the application is important for the outcome, but the ultimate decision is taken by a human analyst. This analyst has sufficient information, knowledge/experience, mandate and available time to take the decision.",
                      "The application determines the process flow, but the outcome of the process is fully determined by a human. For example, when the output of the application is a riskscore which determines whether an investigation is launched or a case should be processed with more scrutiny, but the investigation or processing of the case is performed fully manually."
                    ]
                  },
                  "output": { "$ref": "#/definitions/outputAlgorithmAndAI" }
                }
              }
            ]
          }
        }
      },
      "impact": {
        "title": "impact",
        "type": "object",
        "properties": {
          "q4": {
            "type": "string",
            "title": "Is in the process a decision made for individual citizens or civil servants?",
            "enum": ["Yes", "No"]
          }
        },
        "required": ["q4"],
        "dependencies": {
          "q4": {
            "oneOf": [
              {
                "properties": {
                  "q4": {
                    "enum": ["Yes"]
                  },
                  "q5": {
                    "type": "string",
                    "title": "What type of decision is taken in the process?\n\nSelect the option that most closely resembles the type of decision.",
                    "enum": [
                      "Decision on the prioritization of applications, requests, complaints, and objections.",
                      "Decision on formal complaints and objections",
                      "Decision with direct financial consequences for a citizen or civil servant,\nsuch as decisions regarding benefits, allowances, subsidies, fines, refunds, or the possibility of a payment plan",
                      "Decision on applications and requests without direct financial consequences,\nsuch as the approval of a service request or the granting of a permit",
                      "Decision on inspection, investigation, or requests for additional information",
                      "Decision on school assignments.",
                      "Decisions on providing advice or (proactively) offering services or provisions.",
                      "Other type of decisions"
                    ]
                  }
                },
                "required": ["q5"]
              },
              {
                "properties": {
                  "q4": {
                    "enum": ["No"]
                  },
                  "q6": {
                    "type": "string",
                    "title": "Does the process contribute to how a governmental institution categorizes or approaches (groups of) citizens or civil servants?",
                    "enum": ["Yes", "I am not sure", "No"]
                  }
                },
                "required": ["q6"]
              }
            ]
          },
          "q5": {
            "oneOf": [
              {
                "properties": {
                  "q5": {
                    "enum": ["Other type of decisions"]
                  },
                  "q5_option8": {
                    "type": "string",
                    "title": "Describe the type of decision",
                    "default": ""
                  },
                  "output": {
                    "$ref": "#/definitions/outputNoAI"
                  }
                },
                "required": ["q5_option8"]
              },
              {
                "properties": {
                  "q5": {
                    "enum": [
                      "Decision on the prioritization of applications, requests, complaints, and objections.",
                      "Decision on formal complaints and objections",
                      "Decision with direct financial consequences for a citizen or civil servant,\nsuch as decisions regarding benefits, allowances, subsidies, fines, refunds, or the possibility of a payment plan",
                      "Decision on applications and requests without direct financial consequences,\nsuch as the approval of a service request or the granting of a permit",
                      "Decision on inspection, investigation, or requests for additional information",
                      "Decision on school assignments.",
                      "Decisions on providing advice or (proactively) offering services or provisions."
                    ]
                  },
                  "effect": {
                    "$ref": "#/definitions/effect"
                  }
                }
              }
            ]
          },
          "q6": {
            "oneOf": [
              {
                "properties": {
                  "q6": {
                    "enum": ["Yes"]
                  },
                  "effect": {
                    "$ref": "#/definitions/effect"
                  }
                }
              },
              {
                "properties": {
                  "q6": {
                    "enum": ["I am not sure"]
                  },
                  "q6_unsure": {
                    "type": "string",
                    "title": "Give a short description of the process and how this affects citizens or civil servants.",
                    "default": ""
                  },
                  "effect": {
                    "$ref": "#/definitions/effect"
                  }
                },
                "required": ["q6_unsure"]
              },
              {
                "properties": {
                  "q6": {
                    "enum": ["No"]
                  },
                  "output": {
                    "$ref": "#/definitions/outputNoAI"
                  }
                }
              }
            ]
          }
        }
      },
      "impactAI": {
        "title": "impactAI",
        "type": "object",
        "properties": {
          "q4": {
            "type": "string",
            "title": "Is in the process a decision made about a individual citizens?",
            "enum": ["Yes", "No"]
          }
        },
        "required": ["q4"],
        "dependencies": {
          "q4": {
            "oneOf": [
              {
                "properties": {
                  "q4": {
                    "enum": ["Yes"]
                  },
                  "q5": {
                    "type": "string",
                    "title": "What type of decision is made in this process?\n\nSelect the option that most closely resembles the type of decision.",
                    "enum": [
                      "Decision on the prioritization of applications, requests, complaints, and objections",
                      "Decision on formal complaints and objections",
                      "Decision with direct financial consequences for a citizen or civil servant,\nsuch as decisions regarding benefits, allowances, subsidies, fines, refunds, or the possibility of a payment plan",
                      "Decision on applications and requests without direct financial consequences,\nsuch as the approval of a service request or the granting of a permit",
                      "Decision on inspection, investigation, or requests for additional information",
                      "Decision on school assignments.",
                      "Decisions on providing advice or (proactively) offering services or provisions.",
                      "Other type of decisions"
                    ]
                  }
                },
                "required": ["q5"]
              },
              {
                "properties": {
                  "q4": {
                    "enum": ["No"]
                  },
                  "q6": {
                    "type": "string",
                    "title": "Does the process contribute to how a governmental institution categorizes or approaches (groups of) citizens or civil servants?",
                    "enum": ["Yes", "I am not sure", "No"]
                  }
                },
                "required": ["q6"]
              }
            ]
          },
          "q5": {
            "oneOf": [
              {
                "properties": {
                  "q5": {
                    "enum": ["Other or other type of decision"]
                  },
                  "q5_option8": {
                    "type": "string",
                    "title": "Describe the type of decision",
                    "default": ""
                  },
                  "output": {
                    "$ref": "#/definitions/outputAI"
                  }
                },
                "required": ["q5_option8"]
              },
              {
                "properties": {
                  "q5": {
                    "enum": [
                      "Decision on the prioritization of applications, requests, complaints, and objections.",
                      "Decision on formal complaints and objections",
                      "Decision with direct financial consequences for a citizen or civil servant,\nsuch as decisions regarding benefits, allowances, subsidies, fines, refunds, or the possibility of a payment plan",
                      "Decision on applications and requests without direct financial consequences,\nsuch as the approval of a service request or the granting of a permit",
                      "Decision on inspection, investigation, or requests for additional information",
                      "Decision on school assignments.",
                      "Decisions on providing advice or (proactively) offering services or provisions."
                    ]
                  },
                  "effect": {
                    "$ref": "#/definitions/effectAI"
                  }
                }
              }
            ]
          },
          "q6": {
            "oneOf": [
              {
                "properties": {
                  "q6": {
                    "enum": ["Yes"]
                  },
                  "effect": {
                    "$ref": "#/definitions/effectAI"
                  }
                }
              },
              {
                "properties": {
                  "q6": {
                    "enum": ["I am not sure"]
                  },
                  "q6_unsure": {
                    "type": "string",
                    "title": "Give a short description of the process and how this affects citizens or civil servants.",
                    "default": ""
                  },
                  "effect": {
                    "$ref": "#/definitions/effectAI"
                  }
                },
                "required": ["q6_unsure"]
              },
              {
                "properties": {
                  "q6": {
                    "enum": ["No"]
                  },
                  "output": {
                    "$ref": "#/definitions/outputAI"
                  }
                }
              }
            ]
          }
        }
      }
    },
    "properties": {
      "q1": {
        "type": "array",
        "title": "What type of output does the application derive?",
        "items": {
          "type": "string",
          "enum": [
            "An estimated score, ranking or probability",
            "An estimated label or classification, such as yes/no, high/low or allocation to groups\nfor instance, for routing, communication purposes or risk classification.",
            "A recommendation",
            "A decision",
            "Content, such as written text, video, audio or images",
            "Object recognition, facial recognition or voice recognition",
            "A dashboard or graph with straight-forward data visualisation\nIf one of the above options are displayed on this dashboard, select this option.",
            "Another type of output"
          ]
        },
        "minItems": 1,
        "uniqueItems": true
      }
    },
    "dependencies": {
      "q1": {
        "oneOf": [
          {
            "properties": {
              "q1": {
                "maxItems": 1,
                "contains": {
                  "enum": ["Another type of output"]
                }
              },
              "q1_option6": {
                "type": "string",
                "title": "Give a description of the output",
                "default": ""
              },
              "output": {
                "$ref": "#/definitions/outputNoAI"
              }
            },
            "required": ["q1_option6"]
          },
          {
            "properties": {
              "q1": {
                "maxItems": 1,
                "contains": {
                  "enum": [
                    "A dashboard or graph with straight-forward data visualisation\nIf one of the above options are displayed on this dashboard, select this option."
                  ]
                }
              },
              "output": {
                "$ref": "#/definitions/outputNoAI"
              }
            }
          },
          {
            "properties": {
              "q1": {
                "anyOf": [
                  {
                    "contains": {
                      "enum": ["An estimated score, ranking or probability"]
                    }
                  },
                  {
                    "contains": {
                      "enum": [
                        "An estimated label or classification, such as yes/no, high/low or allocation to groups\nfor instance, for routing, communication purposes or risk classification."
                      ]
                    }
                  },
                  {
                    "contains": {
                      "enum": ["A recommendation"]
                    }
                  },
                  {
                    "contains": {
                      "enum": ["A decision"]
                    }
                  },
                  {
                    "contains": {
                      "enum": [
                        "Content, such as written text, video, audio or images"
                      ]
                    }
                  },
                  {
                    "contains": {
                      "enum": [
                        "Object recognition, facial recognition or voice recognition"
                      ]
                    }
                  }
                ]
              },
              "q2": {
                "type": "string",
                "title": "Is the design of the application based on data?",
                "enum": [
                  "Yes, design choices were made manually, but insights from data analysis helped inform the design",
                  "Yes, the application contains components derived from data. There is fitting or learning of a model or automatic variable selection using statistics, optimization, simulation, machine learning or a similar technique",
                  "No, the design is not based on data analyses"
                ]
              }
            },
            "required": ["q2"]
          }
        ]
      },
      "q2": {
        "oneOf": [
          {
            "properties": {
              "q2": {
                "enum": [
                  "Yes, design choices were made manually, but insights from data analysis helped inform the design"
                ]
              },
              "q2_yes1": {
                "type": "string",
                "title": "Explain how the algorithm was developed and the role data analysis played in influencing its design.",
                "default": ""
              },
              "outputIntermediate": {
                "type": "string",
                "title": "Next step",
                "default": "The following questions pertain to the process in which the application is used. For answering these questions, focus on how the application is integrated into the overall process.\n\nFor these questions, the application's role in the decision-making process is not relevant."
              },
              "impact": {
                "$ref": "#/definitions/impact"
              }
            },
            "required": ["q2_yes1"]
          },
          {
            "properties": {
              "q2": {
                "enum": [
                  "Yes, the application contains components derived from data. There is fitting or learning of a model or automatic variable selection using statistics, optimization, simulation, machine learning or a similar technique"
                ]
              },
              "q2_yes2": {
                "type": "string",
                "title": "Describe the used method.",
                "default": ""
              },
              "outputIntermediate": {
                "type": "string",
                "title": "Based on your answers, your application is probably an AI system according to the AI Act. It may also qualify as a high-impact algorithm. Complete the following questionnaire to find out.",
                "default": "The following questions pertain to the process in which the application is used. For answering these questions, focus on how the application is integrated into the overall process.\n\nFor these questions, the application's role in the decision-making process is not relevant."
              },
              "impact": {
                "$ref": "#/definitions/impactAI"
              }
            },
            "required": ["q2_yes2"]
          },
          {
            "properties": {
              "q2": {
                "enum": ["No, the design is not based on data analyses"]
              },
              "q3": {
                "type": "string",
                "title": "Is the application an automation of human-defined rules? ",
                "enum": [
                  "Yes, the application is a straightforward automation of rules defined in law, regulation, or formal policy",
                  "Yes, automatisation of rules, but these are not explicitly defined in law, regulation, or formal policy",
                  "Yes, logic- and knowledge-based approaches in which output are infered from encoded knowledge or symbolic representation",
                  "No"
                ]
              }
            },
            "required": ["q3"]
          }
        ]
      },
      "q3": {
        "oneOf": [
          {
            "properties": {
              "q3": {
                "enum": [
                  "Yes, the application is a straightforward automation of rules defined in law, regulation, or formal policy"
                ]
              },
              "q3_yes1": {
                "type": "string",
                "title": "Which official law, regulation or policy? Which article, clause or paragraph of the regulation?",
                "default": ""
              },
              "output": {
                "$ref": "#/definitions/outputNoAI"
              }
            },
            "required": ["q3_yes1"]
          },
          {
            "properties": {
              "q3": {
                "enum": [
                  "Yes, automatisation of rules, but these are not explicitly defined in law, regulation, or formal policy"
                ]
              },
              "outputIntermediate": {
                "type": "string",
                "title": "Next step",
                "default": "The following questions pertain to the process in which the application is used. For answering these questions, focus on how the application is integrated into the overall process.\n\nFor these questions, the application's role in the decision-making process is not relevant."
              },
              "impact": {
                "$ref": "#/definitions/impact"
              }
            }
          },
          {
            "properties": {
              "q3": {
                "enum": [
                  "Yes, logic- and knowledge-based approaches in which output are infered from encoded knowledge or symbolic representation"
                ]
              },
              "outputIntermediate": {
                "type": "string",
                "title": "Your application is an AI system according to the AI Act. It may also qualify as a high-impact algorithm. Complete the following questionnaire to find out.",
                "default": "The following questions pertain to the process in which the application is used. For answering these questions, focus on how the application is integrated into the overall process.\n\nFor these questions, the application's role in the decision-making process is not relevant."
              },
              "impact": {
                "$ref": "#/definitions/impactAI"
              }
            }
          },
          {
            "properties": {
              "q3": {
                "enum": ["No"]
              },
              "q3_no": {
                "type": "string",
                "title": "Give a description of the design of the application.",
                "default": ""
              },
              "outputIntermediate": {
                "type": "string",
                "title": "Next step",
                "default": "The following questions pertain to the process in which the application is used. For answering these questions, focus on how the application is integrated into the overall process.\n\nFor these questions, the application's role in the decision-making process is not relevant."
              },
              "impact": {
                "$ref": "#/definitions/impact"
              }
            },
            "required": ["q3_no"]
          }
        ]
      }
    }
  },
  "uiSchema": {
    "q1": {
      "ui:widget": "checkboxes"
    },
    "q2": {
      "ui:widget": "radio",
      "ui:description": "Data encompasses all forms of electronic information, including text, images, and audio. Various types of algorithms can be derived from data. In rule-based algorithms, thresholds for (decision) rules or weighting factors for decisions can be calculated from data. Classical statistical models, such as regression models, are also derived from data. Machine learning is used to train a model from data. Large language models, such as ChatGPT, utilize machine learning."
    },
    "q3": {
      "ui:widget": "radio",
      "ui:description": "An example of rules established in laws or regulations is a rule-based algorithm that automatically determines whether the income and asset requirements are met when applying for social assistance. In this case, the rules in the algorithm are a direct implementation of norms set, for instance, in the Dutch Participation Act.\n\nWhen a standard is not clearly defined in legislation and is interpreted, the application is not a one-to-one automation of the law or regulation.\n\nExamples of rules created by humans include a rule-based algorithm where a work instruction is translated into a decision rule, a risk profile where the rules are manually created based on employees' experience, or legal standards that are further specified into rules.\n\nLogic- and knowledge-based approaches are also known as 'symbolic AI systems'. These types of AI systems include knowledge representation, inductive (logical) programming, knowledge bases, inference and deduction machines, and (symbolic) reasoning. These forms of technology are rare."
    },
    "q4": {
      "ui:widget": "radio",
      "ui:enableMarkdownInDescription": true,
      "ui:description": "Consider prioritization, follow-up on a question or request from a citizen. For example, whether or not to request additional information from a citizen, whether or not to select for inspection or control, whether or not to (proactively) offer a specific provision in the context of social assistance, etc.\n\n**Note: A decision is much broader than a formal decision as defined in Dutch Public Administration Law.**"
    },
    "q5": {
      "ui:widget": "radio"
    },
    "q6": {
      "ui:widget": "radio"
    },
    "q7": {
      "ui:widget": "radio",
      "ui:description": "If in doubt, choose the top option among those you are unsure about."
    },
    "outputIntermediate": {
      "ui:widget": "textarea",
      "ui:classNames": "intermediate-output"
    }
  }
}
