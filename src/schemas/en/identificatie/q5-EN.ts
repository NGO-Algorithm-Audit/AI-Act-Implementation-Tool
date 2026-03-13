export const q5 = {
  type: "string",
  title:
    "What kind of decision is made in this process? Choose the option that most closely matches the type of decision.",
  enum: [
    "Decision on prioritization of applications, requests, complaints, and objections",
    "Decision on formal complaints and objections",
    "Decisions with direct financial consequences for citizens or civil servants, \ne.g., decisions affecting a person's income, employment contract, benefits, allowances, subsidies, fines, refunds, or payment arrangements.",
    "Decision on inspection, investigation, or request for additional information",
    "Decision on the allocation of schools or childcare",
    "Decisions on whether a person is eligible for a service or facility",
    "Any other decision with legal consequences, such as granting a permit or entering into an agreement",
    "Other or miscellaneous decisions",
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
              enum: ["Other or miscellaneous decisions"],
            },
            q5_option8: {
              type: "string",
              title: "Describe the type of decision",
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
                "Decision on formal complaints and objections",
                "Decisions with direct financial consequences for citizens or civil servants, \ne.g., decisions affecting a person's income, employment contract, benefits, allowances, subsidies, fines, refunds, or payment arrangements.",
                "Decision on the allocation of schools or childcare",
                "Decisions on whether a person is eligible for a service or facility",
                "Any other decision with legal consequences, such as granting a permit or entering into an agreement",
              ],
            },
            ...refToProp(string2),
          },
        },
        {
          properties: {
            q5: {
              enum: [
                "Decision on inspection, investigation, or request for additional information",
              ],
            },
            q5_1: {
              type: "string",
              title:
                "Is the check or investigation particularly intrusive for the person concerned?",
              enum: [
                "Yes, because the check or investigation means that the person concerned has to wait longer for a benefit, allowance, or refund, or is not eligible for an advance payment.",
                "Yes, because the check or investigation is being carried out, the person concerned is not eligible for a payment arrangement.",
                "Yes, because the check or investigation is being carried out, the person concerned has to wait longer to be eligible for a service, facility, or permit, or a service, facility, or permit is (temporarily) denied.",
                "Yes, the check or investigation itself is intrusive, for example because a physical check is carried out (e.g. a home visit) or because the investigation has a major impact on the (private) life of the person concerned in some other way.",
                "Yes, the check is particularly intrusive for the person concerned for another reason.",
                "No",
              ],
            },
          },
        },
        {
          properties: {
            q5: {
              enum: [
                "Decision on prioritization of applications, requests, complaints, and objections",
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
                "Yes, because the check or investigation means that the person concerned has to wait longer for a benefit, allowance, or refund, or is not eligible for an advance payment.",
                "Yes, because the check or investigation is being carried out, the person concerned is not eligible for a payment arrangement.",
                "Yes, because the check or investigation is being carried out, the person concerned has to wait longer to be eligible for a service, facility, or permit, or a service, facility, or permit is (temporarily) denied.",
                "Yes, the check or investigation itself is intrusive, for example because a physical check is carried out (e.g. a home visit) or because the investigation has a major impact on the (private) life of the person concerned in some other way.",
                "Yes, the check is particularly intrusive for the person concerned for another reason.",
              ],
            },
            "q5_1-controle": {
              type: "string",
              title: "Describe the consequences of the check for the person concerned.",
              default: "",
            },
            ...refToProp(string4),
          },
          required: ["q5_1-controle"],
        },
        {
          properties: {
            q5_1: {
              enum: ["No"],
            },
            ...refToProp(string5),
          },
        },
      ],
    },
  };
};
