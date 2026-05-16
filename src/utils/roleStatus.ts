import type { TFunction } from "i18next";

// The six roles the Role-and-status questionnaire can classify a user as.
export type Role =
  | "provider"
  | "deployer"
  | "representative"
  | "importer"
  | "distributor"
  | "private";

export type Status = "in_use" | "in_development";

type Q12Key = "a3" | "a1" | "a2" | "a6" | "a7" | "a8" | "a11" | "a10";
type Q12bKey = "m1" | "m2" | "m3" | "m4";

// Maps each Role-and-status q12 answer to the role(s) it implies. The a6
// branch ("We use an externally developed AI system") is refined by q12b:
// "None of the above" keeps the user a pure deployer, any modification
// scenario turns them into a provider (Art. 25 value-chain responsibilities).
const Q12_MAP: { key: Q12Key; i18n: string; roles: Role[] }[] = [
  { key: "a3", i18n: "aiact2 q12 a3", roles: ["provider", "deployer"] },
  { key: "a1", i18n: "aiact2 q12 a1", roles: ["provider"] },
  { key: "a2", i18n: "aiact2 q12 a2", roles: ["provider", "deployer"] },
  { key: "a6", i18n: "aiact2 q12 a6", roles: ["provider", "deployer"] },
  { key: "a7", i18n: "aiact2 q12 a7", roles: ["importer"] },
  { key: "a8", i18n: "aiact2 q12 a8", roles: ["distributor"] },
  { key: "a11", i18n: "aiact2 q12 a11", roles: ["representative"] },
  { key: "a10", i18n: "aiact2 q12 a10", roles: ["private"] },
];

const Q12B_MAP: { key: Q12bKey; i18n: string }[] = [
  { key: "m1", i18n: "aiact2 q12b m1" },
  { key: "m2", i18n: "aiact2 q12b m2" },
  { key: "m3", i18n: "aiact2 q12b m3" },
  { key: "m4", i18n: "aiact2 q12b m4" },
];

/**
 * Derive the user's role(s) and AI-system status from the raw answers stored
 * for the Role-and-status questionnaire. Returns empty roles / null status
 * when the questionnaire has not been filled in (or its answers don't map).
 *
 * This is the single source of truth shared by OutputRoleStatus (the
 * questionnaire's own result page) and the Obligations screen.
 */
export function deriveRolesAndStatus(
  data: Record<string, unknown> | undefined,
  t: TFunction
): { roles: Role[]; status: Status | null } {
  if (!data) return { roles: [], status: null };

  const q12Match = Q12_MAP.find((m) => data.q12 === t(m.i18n));
  const q12bMatch = Q12B_MAP.find((m) => data.q12b === t(m.i18n));

  const roles: Role[] =
    q12Match?.key === "a6"
      ? q12bMatch?.key === "m4"
        ? ["deployer"]
        : ["provider"]
      : q12Match?.roles ?? [];

  const status: Status | null =
    data.q13 === t("aiact2 q13 a1")
      ? "in_use"
      : data.q13 === t("aiact2 q13 a2")
      ? "in_development"
      : null;

  return { roles, status };
}
