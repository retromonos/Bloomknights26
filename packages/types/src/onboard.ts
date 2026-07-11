import type { County } from "./county";
import type { Utility } from "./utility";

export type OnboardRequest = {
  county: County;
  utilityCompany: Utility;
}