import { AICont } from "./identificatie/AICont-EN";
import { saving_sharing_AIAlgosADM } from "./identificatie/saving_sharing_AIAlgosADM-EN";
import { noAICont } from "./identificatie/noAICont-EN";
import { saving_sharing_AlgosADM } from "./identificatie/saving_sharing_AlgosADM-EN";
import { noAIandAlgoCont } from "./identificatie/noAIandAlgoCont-EN";
import { saving_sharing_sADM } from "./identificatie/saving_sharing_sADM-EN";
import { q5, q5Dependencies } from "./identificatie/q5-EN";

export const identificationSchema = {
  JSONSchema: {
    title:
      "1B - [BETA] Identification of AI systems, impactful algorithms and solely automated decision-making (sADM)",
    type: "object",
    definitions: {
      outputAI: {
        type: "string",
        title: "Result",
        default: `Based on your answers, your application is:
- an AI system according to the AI Act;
- not a high-impact algorithm;
- not solely automated decision-making (sADM).

Next steps:
- Complete the AI risk classification questionnaire to determine which requirements of the AI Act the application must meet.`,
      },
      outputAlgo: {
        type: "string",
        title: "Result",
        default: `Based on your answers, your application is:
- a high-impact algorithm;
- not solely automated decision-making (sADM);
- not an AI system according to the AI Act.

Next steps:
- Include the algorithm to the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.`,
      },
      outputsADM: {
        type: "string",
        title: "Result",
        default: `Based on your answers, your application is:
- not a high-impact algorithm;
- not an AI system according to the AI Act;
- possibly solely automated decision-making (sADM) according to Article 22 of the GDPR.
Next steps:
- Consult with relevant legal experts to determine whether sADM is actually involved.`,
      },
      outputAlgoandAI: {
        type: "string",
        title: "Result",
        default: `Based on your answers, your application is:
- an AI system according to the AI Act;
- a high-impact algorithm;
- not solely automated decision-making (sADM).

Next steps:
- Complete the AI risk classification questionnaire to determine which requirements of the AI Act the application must meet.
- Include the algorithm in the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.`,
      },
      outputAlgoandsADM: {
        type: "string",
        title: "Result",
        default: `Based on your answers, your application is:
- not an AI system according to the AI Act;
- a high-impact algorithm;
- possibly solely automated decision-making (sADM) according to Article 22 of the GDPR.

Next steps:
- Include the algorithm in the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.
- Consult with relevant legal experts to determine whether sADM is actually involved.`,
      },
      outputAlgosADMandAI: {
        type: "string",
        title: "Result",
        default: `Based on your answers, your application is:
- an AI system according to the AI Act;
- a high-impact algorithm;
- possibly solely automated decision-making (sADM) according to Article 22 of the GDPR.

Next steps:
- Complete the AI risk classification questionnaire to determine which requirements of the AI Act the application must meet.
- Include the algorithm in the Algorithm Register.
- Ensure compliance with internally applicable algorithm policy.
- Consult with relevant legal experts to determine whether sADM is actually involved.`,
      },
      outputAIStop: {
        type: "string",
        title: "Result",
        default:
          "Based on your answers, your application is an AI system according to the AI Act.",
      },
      outputNoAIStop: {
        type: "string",
        title: "Result",
        default:
          "Based on your answers, your application is not an AI system.",
      },
      outputNoAIandAlgoStop: {
        type: "string",
        title: "Result",
        default:
          "Based on your answers, your application is neither an AI system nor a high-impact algorithm.",
      },
      outputNone: {
        type: "string",
        title: "Result",
        default:
          `Based on your answers, your application is:
- not a high-impact algorithm;
- not solely automated decision-making (sADM);
- not an AI system according to the AI Act.`,
      },
      automation_sADM: {
        title: "Automation",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Which of the following options best describes the effect of the application on the outcome?",
            enum: [
              "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
              "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
              "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
              "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
              "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
              "Another type of effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
                      "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
                      "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
                },
              },
              {
                properties: {
                  q7: { enum: ["Another type of effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Describe the effect of the application on the process",
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
                      "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputsADM" },
                },
              },
            ],
          },
        },
      },
      automation_Algo: {
        title: "Automation",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Which of the following options best describes the effect of the application on the outcome?",
            enum: [
              "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
              "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
              "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
              "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
              "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
              "Another type of effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
                },
              },
              {
                properties: {
                  q7: { enum: ["Another type of effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Describe the effect of the application on the process",
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
                      "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
                      "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
                      "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgo" },
                },
              },
            ],
          },
        },
      },
      automation_AlgosADM: {
        title: "Automation",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Which of the following options best describes the effect of the application on the outcome?",
            enum: [
              "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
              "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
              "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
              "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
              "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
              "Another type of effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
                },
              },
              {
                properties: {
                  q7: { enum: ["Another type of effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Describe the effect of the application on the process",
                  },
                  output: { $ref: "#/definitions/outputNone" }, //wordt outputNone
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
                      "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgoandsADM" },
                },
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
                      "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgo" },
                },
              },
            ],
          },
        },
      },
      automation_AIAlgosADM: {
        title: "Automation",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Which of the following options best describes the effect of the application on the outcome?",
            enum: [
              "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
              "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
              "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
              "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
              "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
              "Another type of effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAI" }, //fixed naar outputAI
                },
              },
              {
                properties: {
                  q7: { enum: ["Another type of effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Describe the effect of the application on the process",
                  },
                  output: { $ref: "#/definitions/outputAI" }, //fixed naar outputAI
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
                      "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgosADMandAI" },
                },
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
                      "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgoandAI" },
                },
              },
            ],
          },
        },
      },
      automation_AIAlgo: {
        title: "Automation",
        type: "object",
        properties: {
          q7: {
            type: "string",
            title:
              "Which of the following options best describes the effect of the application on the outcome?",
            enum: [
              "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
              "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
              "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
              "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
              "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
              "Another type of effect",
            ],
          },
        },
        required: ["q7"],
        dependencies: {
          q7: {
            oneOf: [
              {
                properties: {
                  q7: {
                    enum: [
                      "The course of the process and the outcome of the process are determined entirely by a human being and depend on several factors. The result of the application is only one of the factors and is not decisive in decisions.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAI" },
                },
              },
              {
                properties: {
                  q7: { enum: ["Another type of effect"] },
                  q7_option5: {
                    type: "string",
                    title:
                      "Describe the effect of the application on the process",
                  },
                  output: { $ref: "#/definitions/outputAI" },
                },
                required: ["q7_option5"],
              },
              {
                properties: {
                  q7: {
                    enum: [
                      "The outcome of the process is directly determined by the application (no human intervention is required). Once the process is complete, people can still check or analyze the results.",
                      "The outcome of the process is strongly influenced by the application. For example, because work instructions determine the consequence of a particular outcome of the application. In some cases, an employee can make different choices, but usually the result of the system determines the final outcome of the process.",
                      "The outcome of the process is partly influenced by the application. The result of the application is important for the end result, but the final decision is made by an employee. This employee has the right information, experience/skills, mandate, and available time to make the decision.",
                      "The application (partly) determines the course of the process, but the outcome of the process is entirely determined by an employee. For example, when the outcome of the application is a risk score on the basis of which a control process is started or a more intensive file evaluation takes place, but the control or evaluation is then carried out entirely by an employee.",
                    ],
                  },
                  output: { $ref: "#/definitions/outputAlgoandAI" },
                },
              },
            ],
          },
        },
      },
      impact_sADM: {
        title: "Impact",
        type: "object",
        properties: {
          q4: {
            type: "string",
            title:
              "Is a decision made in the process for individual citizens, organizations, or employees?",
            enum: ["Yes", "No"],
          },
        },
        required: ["q4"],
        dependencies: {
          q4: {
            oneOf: [
              {
                properties: {
                  q4: {
                    enum: ["Yes"],
                  },
                  q5
                },
                required: ["q5"],
              },
              {
                properties: {
                  q4: {
                    enum: ["No"],
                  },
                  output: { $ref: "#/definitions/outputNone" },
                },
              },
            ],
          },
          ...q5Dependencies(
            "#/definitions/outputNone",
            "#/definitions/automation_sADM",
            "#/definitions/outputNone",
            "#/definitions/automation_sADM",
            "#/definitions/outputNone"
          ),
        },
      },
      impact_AlgosADM: {
        title: "Impact",
        type: "object",
        properties: {
          q4: {
            type: "string",
            title:
              "Is a decision made in the process for individual citizens, organizations, or employees?",
            enum: ["Yes", "No"],
          },
        },
        required: ["q4"],
        dependencies: {
          q4: {
            oneOf: [
              {
                properties: {
                  q4: {
                    enum: ["Yes"],
                  },
                  q5,
                },
                required: ["q5"],
              },
              {
                properties: {
                  q4: {
                    enum: ["No"],
                  },
                  q6: {
                    type: "string",
                    title:
                      "Does the process contribute to how the government categorizes or approaches groups of citizens, organizations, or civil servants?",
                    enum: ["Yes", "I am not sure", "No"],
                  },
                },
                required: ["q6"],
              },
            ],
          },
          ...q5Dependencies(
            "#/definitions/outputNone",
            "#/definitions/automation_AlgosADM",
            "#/definitions/automation_Algo",
            "#/definitions/automation_AlgosADM",
            "#/definitions/automation_Algo"
          ),
          q6: {
            oneOf: [
              {
                properties: {
                  q6: {
                    enum: ["Yes"],
                  },
                  automation: { $ref: "#/definitions/automation_Algo" },
                },
              },
              {
                properties: {
                  q6: {
                    enum: ["I am not sure"],
                  },
                  q6_unsure: {
                    type: "string",
                    title:
                      "Provide a brief description of the process and how it affects citizens, organisations or civil servants.",
                    default: "",
                  },
                  automation: { $ref: "#/definitions/automation_Algo" },
                },
                required: ["q6_unsure"],
              },
              {
                properties: {
                  q6: {
                    enum: ["No"],
                  },
                  output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
                },
              },
            ],
          },
        },
      },
      impact_AIAlgosADM: {
        title: "Impact",
        type: "object",
        properties: {
          q4: {
            type: "string",
            title:
              "Is a decision made in the process for individual citizens, organizations, or employees?",
            enum: ["Yes", "No"],
          },
        },
        required: ["q4"],
        dependencies: {
          q4: {
            oneOf: [
              {
                properties: {
                  q4: {
                    enum: ["Yes"],
                  },
                  q5,
                },
                required: ["q5"],
              },
              {
                properties: {
                  q4: {
                    enum: ["No"],
                  },
                  q6: {
                    type: "string",
                    title:
                      "Does the process contribute to how the government categorizes or approaches groups of citizens, organizations, or civil servants?",
                    enum: ["Yes", "I am not sure", "No"],
                  },
                },
                required: ["q6"],
              },
            ],
          },
          ...q5Dependencies(
            "#/definitions/outputAI",
            "#/definitions/automation_AIAlgosADM",
            "#/definitions/automation_AIAlgo",
            "#/definitions/automation_AIAlgosADM",
            "#/definitions/automation_AIAlgo"
          ),
          q6: {
            oneOf: [
              {
                properties: {
                  q6: {
                    enum: ["Yes"],
                  },
                  automation: { $ref: "#/definitions/automation_AIAlgo" },
                },
              },
              {
                properties: {
                  q6: {
                    enum: ["I am not sure"],
                  },
                  q6_unsure: {
                    type: "string",
                    title:
                      "Provide a brief description of the process and how it affects citizens, organisations or civil servants.",
                    default: "",
                  },
                  automation: { $ref: "#/definitions/automation_AIAlgo" },
                },
                required: ["q6_unsure"],
              },
              {
                properties: {
                  q6: {
                    enum: ["No"],
                  },
                  output: { $ref: "#/definitions/outputAI" },
                },
              },
            ],
          },
        },
      },
    },
    properties: {
      q1: {
        type: "array",
        title: "What is the outcome of the application?",
        items: {
          type: "string",
          enum: [
            "An estimated score, ranking, or probability",
            "An estimated label or classification such as yes/no, high/low, or a division into groups. \nFor example, for routing, communication campaigns, or risk classification.",
            "A recommendation",
            "A decision",
            "Content, such as written text, video, audio, or images",
            "Object recognition, facial recognition, or voice recognition",
            "A dashboard or graph, with only direct data visualization. \nIf one of the previous options is displayed in this dashboard, choose the previous option.",
            "Another type of output",
          ],
        },
        minItems: 1,
        uniqueItems: true,
      },
    },
    dependencies: {
      q1: {
        oneOf: [
          {
            properties: {
              q1: {
                maxItems: 1,
                contains: {
                  enum: ["Another type of output"],
                },
              },
              q1_option6: {
                type: "string",
                title: "Provide a description of the output",
                default: "",
              },
              output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
            },
            required: ["q1_option6"],
          },
          {
            properties: {
              q1: {
                maxItems: 1,
                contains: {
                  enum: [
                    "A dashboard or graph, with only direct data visualization. \nIf one of the previous options is displayed in this dashboard, choose the previous option.",
                  ],
                },
              },
              output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
            },
          },
          {
            properties: {
              q1: {
                minItems: 2,
                maxItems:2,
                allOf: [
                  {
                    contains: {
                      enum: ["A dashboard or graph, with only direct data visualization. \nIf one of the previous options is displayed in this dashboard, choose the previous option."],
                    },
                  },
                  {
                    contains: {
                      enum: ["Another type of output"],
                    },
                  },
                ],
              },
              q1_option6: {
                type: "string",
                title: "Provide a description of the output",
                default: "",
              },
              output: { $ref: "#/definitions/outputNone" }, // wordt outputNone
            },
            required: ["q1_option6"],
          },
          {
            properties: {
              q1: {
                anyOf: [
                  {
                    contains: {
                      enum: ["An estimated score, ranking, or probability"],
                    },
                  },
                  {
                    contains: {
                      enum: [
                        "An estimated label or classification such as yes/no, high/low, or a division into groups. \nFor example, for routing, communication campaigns, or risk classification.",
                      ],
                    },
                  },
                  {
                    contains: {
                      enum: ["A recommendation"],
                    },
                  },
                  {
                    contains: {
                      enum: ["A decision"],
                    },
                  },
                  {
                    contains: {
                      enum: [
                        "Content, such as written text, video, audio, or images",
                      ],
                    },
                  },
                  {
                    contains: {
                      enum: [
                        "Object recognition, facial recognition, or voice recognition",
                      ],
                    },
                  },
                ],
              },
              q2: {
                type: "string",
                title: "Is the design of the application based on data?",
                enum: [
                  "Yes, design choices were made manually, but insights from data analysis helped with the design.",
                  "Yes, the application contains components derived from data. This involves fitting or learning a model or automatic variable selection using statistics, optimization, simulation, machine learning, or a similar technique.",
                  "No, the design of the application is not based on data analysis.",
                ],
              },
            },
            required: ["q2"],
          },
        ],
      },
      q2: {
        oneOf: [
          {
            properties: {
              q2: {
                enum: [
                  "Yes, design choices were made manually, but insights from data analysis helped with the design.",
                ],
              },
              noAICont,
            },
            required: ["noAICont"],
            dependencies: {
              noAICont: {
                oneOf: [
                  {
                    properties: {
                      noAICont: {
                        enum: ["Stop questionnaire, go to conclusions"],
                      },
                      output: { $ref: "#/definitions/outputNoAIStop" }, //wordt outputNoAIStop
                    },
                  },
                  { ...saving_sharing_AlgosADM },
                ],
              },
            },
          },
          {
            properties: {
              q2: {
                enum: [
                  "Yes, the application contains components derived from data. This involves fitting or learning a model or automatic variable selection using statistics, optimization, simulation, machine learning, or a similar technique.",
                ],
              },
              q2_yes2: {
                type: "string",
                title: "Describe the method",
                default: "",
              },
              AICont,
            },
            required: ["AICont"],
            dependencies: {
              AICont: {
                oneOf: [
                  {
                    properties: {
                      AICont: {
                        enum: ["Stop questionnaire, go to conclusions"],
                      },
                      output: { $ref: "#/definitions/outputAIStop" },
                    },
                  },
                  { ...saving_sharing_AIAlgosADM },
                ],
              },
            },
          },
          {
            properties: {
              q2: {
                enum: [
                  "No, the design of the application is not based on data analysis.",
                ],
              },
              q3: {
                type: "string",
                title:
                  "Is the application an automation of rules defined by humans? ",
                enum: [
                  "Yes, one-to-one automation of rules laid down in legislation or regulations or in formal policy.",
                  "Yes, automation of rules, but these are not explicitly laid down in legislation or regulations or formal policy.",
                  "Yes, logic- and knowledge-based approaches to AI in which outcomes are derived from encoded knowledge or from a symbolic representation of the task to be solved.",
                  "No",
                ],
              },
            },
            required: ["q3"],
          },
        ],
      },
      q3: {
        oneOf: [
          {
            properties: {
              q3: {
                enum: [
                  "Yes, one-to-one automation of rules laid down in legislation or regulations or in formal policy.",
                ],
              },
              q3_yes1: {
                type: "string",
                title:
                  "Which formal policy, law, or regulation? Which article, paragraph, or section of this regulation?",
                default: "",
              },
              noAIandAlgoCont,
            },
            required: ["q3_yes1", "noAIandAlgoCont"],
            dependencies: {
              noAIandAlgoCont: {
                oneOf: [
                  {
                    properties: {
                      noAIandAlgoCont: {
                        enum: ["Stop questionnaire, go to conclusions"],
                      },
                      output: { $ref: "#/definitions/outputNoAIandAlgoStop" },
                    },
                  },
                  { ...saving_sharing_sADM },
                ],
              },
            },
          },
          {
            properties: {
              q3: {
                enum: [
                  "Yes, automation of rules, but these are not explicitly laid down in legislation or regulations or formal policy.",
                ],
              },
              noAICont,
            },
            required: ["noAICont"],
            dependencies: {
              noAICont: {
                oneOf: [
                  {
                    properties: {
                      noAICont: {
                        enum: ["Stop questionnaire, go to conclusions"],
                      },
                      output: { $ref: "#/definitions/outputNoAIStop" }, //wordt outputNoAIStop
                    },
                  },
                  { ...saving_sharing_AlgosADM },
                ],
              },
            },
          },
          {
            properties: {
              q3: {
                enum: [
                  "Yes, logic- and knowledge-based approaches to AI in which outcomes are derived from encoded knowledge or from a symbolic representation of the task to be solved.",
                ],
              },
              AICont,
            },
            required: ["AICont"],
            dependencies: {
              AICont: {
                oneOf: [
                  {
                    properties: {
                      AICont: {
                        enum: ["Stop questionnaire, go to conclusions"],
                      },
                      output: { $ref: "#/definitions/outputAIStop" }, //wordt outputAIStop
                    },
                  },
                  { ...saving_sharing_AIAlgosADM },
                ],
              },
            },
          },
          {
            properties: {
              q3: {
                enum: ["No"],
              },
              q3_no: {
                type: "string",
                title:
                  "Provide a brief description of the design of the application.",
                default: "",
              },
              noAICont,
            },
            required: ["q3_no", "noAICont"],
            dependencies: {
              noAICont: {
                oneOf: [
                  {
                    properties: {
                      noAICont: {
                        enum: ["Stop questionnaire, go to conclusions"],
                      },
                      output: { $ref: "#/definitions/outputAIStop" }, //wordt outputAIStop
                    },
                  },
                  { ...saving_sharing_AlgosADM },
                ],
              },
            },
          },
        ],
      },
    },
  },
  uiSchema: {
    q1: {
      "ui:widget": "checkboxes",
    },
    q2: {
      "ui:widget": "radio",
      "ui:description":
        "Data includes all forms of electronic information. Text, images, and audio are also data.\n\nApplications can be designed manually. However, even when designed manually, the design is sometimes based on data analysis. For example, threshold values for (failure) rules can be calculated from data, or criteria can be selected based on calculated correlations.\n\nIt also happens that components (e.g., models and algorithms) are derived more automatically from data. For example, by fitting a statistical model to data or using machine learning to learn a model or rule-based algorithm from data. Forms of simulation and optimization can also be used to derive a model from data.\n\nLarge language models such as ChatGPT are also derived (learned) from large amounts of textual data.",
    },
    q3: {
      "ui:widget": "radio",
      "ui:enableMarkdownInDescription": true,
      "ui:description": `An example of rules laid down in legislation or regulations is a rule-based algorithm that automatically indicates when income and asset requirements are not met when applying for social assistance benefits.  In this case, the rules in the algorithm are a literal implementation of the standards in the Dutch Participation Act.\nWhen a standard is openly defined in legislation or regulations and is further specified in the application, the application is **not** a one-to-one automation of legislation or regulations.\n\nExamples of rules drawn up by humans are:
- a rule-based algorithm in which a work instruction has been translated into an algorithm
- a risk profile in which the rules have been drawn up manually based on the experience of employees
- open legal standards that are further specified in rules
\n\nLogic and knowledge-based approaches are also referred to as symbolic AI. This form of AI includes knowledge representation, inductive (logical) programming, knowledge bases, inference and deduction engines, and (symbolic) reasoning. This technology is often used in expert systems.`,
    },
    AICont: {
      "ui:widget": "radio",
    },
    noAICont: {
      "ui:widget": "radio",
    },
    noAIandAlgoCont: {
      "ui:widget": "radio",
    },
    q4: {
      "ui:widget": "radio",
      "ui:enableMarkdownInDescription": true,
      "ui:description":
        "Consider prioritizing the follow-up to a citizen's question or request, whether or not to ask a citizen to provide additional information, whether or not to select someone for a check or inspection, whether or not a person is eligible for services or facilities, etc.\n\n**Note: A decision is much broader than a formal decision as defined in Dutch Public Administration Law.**",
    },
    q5: {
      "ui:widget": "radio",
    },
    q5_1: {
      "ui:widget": "radio",
    },
    "q5_1-controle": {
      "ui:widget": "textarea",
    },
    q6: {
      "ui:widget": "radio",
    },
    q7: {
      "ui:widget": "radio",
      "ui:description":
        "If in doubt, choose the top option from those you are unsure about.",
    },
    q8: {
      "ui:widget": "radio",
      "ui:description": `Examples of output about an individual citizen are:
- an assessment of a characteristic

Examples of cases concerning an individual citizen are:
- matters linked to an individual, such as a transaction or an application

Examples of information that does not concern individuals are:
- Output about groups, in which the individuals are not assigned an output separately from the group
- Output about physical matters that are not linked to an individual, such as infrastructure
- Output about sectors, neighborhoods
- Output about policy and the influence of policy

When considering individuals, also consider businesses in which the entrepreneur is personally liable (self-employed, sole proprietorship, general partnership, professional partnership).`,
    },
    q9: {
      "ui:widget": "radio",
    },
    q10: {
      "ui:widget": "radio",
    },
    outputIntermediate: {
      "ui:widget": "textarea",
      "ui:classNames": "intermediate-output",
      "ui:enableMarkdownInDescription": true,
    },
    additionalOutputText: {
      "ui:widget": "hidden",
    },
  },
};
