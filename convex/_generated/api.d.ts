/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as categories from "../categories.js";
import type * as chapman from "../chapman.js";
import type * as dahnertConditions from "../dahnertConditions.js";
import type * as dahnertDDxClusters from "../dahnertDDxClusters.js";
import type * as data_cardiothoracicsLongCases from "../data/cardiothoracicsLongCases.js";
import type * as data_caseQualitySpec from "../data/caseQualitySpec.js";
import type * as data_chapmanSeed from "../data/chapmanSeed.js";
import type * as data_differentialPatternsSeed from "../data/differentialPatternsSeed.js";
import type * as data_gastroVascularLongCases from "../data/gastroVascularLongCases.js";
import type * as data_headNeckLongCases from "../data/headNeckLongCases.js";
import type * as data_mnemonicsSeed from "../data/mnemonicsSeed.js";
import type * as data_obrienLongCaseShells from "../data/obrienLongCaseShells.js";
import type * as data_paediatricsLongCases from "../data/paediatricsLongCases.js";
import type * as data_radiopaediaPlaylistGuide from "../data/radiopaediaPlaylistGuide.js";
import type * as data_rapidCasesSeed from "../data/rapidCasesSeed.js";
import type * as data_rapidShells_axrShells from "../data/rapidShells/axrShells.js";
import type * as data_rapidShells_backfillExisting90 from "../data/rapidShells/backfillExisting90.js";
import type * as data_rapidShells_cxrShells from "../data/rapidShells/cxrShells.js";
import type * as data_rapidShells_mskRapidShells from "../data/rapidShells/mskRapidShells.js";
import type * as data_rapidShells_paedsCxrShells from "../data/rapidShells/paedsCxrShells.js";
import type * as data_rapidShells_paedsMskShells from "../data/rapidShells/paedsMskShells.js";
import type * as data_sectionsSeed from "../data/sectionsSeed.js";
import type * as data_textbookRefsSeed from "../data/textbookRefsSeed.js";
import type * as data_vivaFrameworkSeed from "../data/vivaFrameworkSeed.js";
import type * as data_womensHealthGU_longCases from "../data/womensHealthGU_longCases.js";
import type * as differentialPatterns from "../differentialPatterns.js";
import type * as discriminators from "../discriminators.js";
import type * as enhanceHighYield from "../enhanceHighYield.js";
import type * as highYield from "../highYield.js";
import type * as imageAnnotations from "../imageAnnotations.js";
import type * as longCases from "../longCases.js";
import type * as migrate from "../migrate.js";
import type * as mnemonics from "../mnemonics.js";
import type * as pendingNotes from "../pendingNotes.js";
import type * as qa_validateCases from "../qa/validateCases.js";
import type * as rag from "../rag.js";
import type * as rapidCases from "../rapidCases.js";
import type * as s3Storage from "../s3Storage.js";
import type * as sections from "../sections.js";
import type * as seed from "../seed.js";
import type * as seedAllData from "../seedAllData.js";
import type * as seedData_mskCases from "../seedData/mskCases.js";
import type * as seedDukeCases from "../seedDukeCases.js";
import type * as seedHighYield from "../seedHighYield.js";
import type * as studyImages from "../studyImages.js";
import type * as textIngestion from "../textIngestion.js";
import type * as textbookReferences from "../textbookReferences.js";
import type * as updateCategoryCounts from "../updateCategoryCounts.js";
import type * as updateFindings from "../updateFindings.js";
import type * as vivaFramework from "../vivaFramework.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  categories: typeof categories;
  chapman: typeof chapman;
  dahnertConditions: typeof dahnertConditions;
  dahnertDDxClusters: typeof dahnertDDxClusters;
  "data/cardiothoracicsLongCases": typeof data_cardiothoracicsLongCases;
  "data/caseQualitySpec": typeof data_caseQualitySpec;
  "data/chapmanSeed": typeof data_chapmanSeed;
  "data/differentialPatternsSeed": typeof data_differentialPatternsSeed;
  "data/gastroVascularLongCases": typeof data_gastroVascularLongCases;
  "data/headNeckLongCases": typeof data_headNeckLongCases;
  "data/mnemonicsSeed": typeof data_mnemonicsSeed;
  "data/obrienLongCaseShells": typeof data_obrienLongCaseShells;
  "data/paediatricsLongCases": typeof data_paediatricsLongCases;
  "data/radiopaediaPlaylistGuide": typeof data_radiopaediaPlaylistGuide;
  "data/rapidCasesSeed": typeof data_rapidCasesSeed;
  "data/rapidShells/axrShells": typeof data_rapidShells_axrShells;
  "data/rapidShells/backfillExisting90": typeof data_rapidShells_backfillExisting90;
  "data/rapidShells/cxrShells": typeof data_rapidShells_cxrShells;
  "data/rapidShells/mskRapidShells": typeof data_rapidShells_mskRapidShells;
  "data/rapidShells/paedsCxrShells": typeof data_rapidShells_paedsCxrShells;
  "data/rapidShells/paedsMskShells": typeof data_rapidShells_paedsMskShells;
  "data/sectionsSeed": typeof data_sectionsSeed;
  "data/textbookRefsSeed": typeof data_textbookRefsSeed;
  "data/vivaFrameworkSeed": typeof data_vivaFrameworkSeed;
  "data/womensHealthGU_longCases": typeof data_womensHealthGU_longCases;
  differentialPatterns: typeof differentialPatterns;
  discriminators: typeof discriminators;
  enhanceHighYield: typeof enhanceHighYield;
  highYield: typeof highYield;
  imageAnnotations: typeof imageAnnotations;
  longCases: typeof longCases;
  migrate: typeof migrate;
  mnemonics: typeof mnemonics;
  pendingNotes: typeof pendingNotes;
  "qa/validateCases": typeof qa_validateCases;
  rag: typeof rag;
  rapidCases: typeof rapidCases;
  s3Storage: typeof s3Storage;
  sections: typeof sections;
  seed: typeof seed;
  seedAllData: typeof seedAllData;
  "seedData/mskCases": typeof seedData_mskCases;
  seedDukeCases: typeof seedDukeCases;
  seedHighYield: typeof seedHighYield;
  studyImages: typeof studyImages;
  textIngestion: typeof textIngestion;
  textbookReferences: typeof textbookReferences;
  updateCategoryCounts: typeof updateCategoryCounts;
  updateFindings: typeof updateFindings;
  vivaFramework: typeof vivaFramework;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
