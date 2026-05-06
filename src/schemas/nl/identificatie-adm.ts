import { createIdentificationSchema } from "../shared/identification-factory";
import { nlTranslations } from "./translations";

export const identificationSchema = createIdentificationSchema(nlTranslations);
