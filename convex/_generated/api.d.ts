/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dataMigration from "../dataMigration.js";
import type * as flags from "../flags.js";
import type * as leaderboard from "../leaderboard.js";
import type * as mistakes from "../mistakes.js";
import type * as presence from "../presence.js";
import type * as quizzes from "../quizzes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dataMigration: typeof dataMigration;
  flags: typeof flags;
  leaderboard: typeof leaderboard;
  mistakes: typeof mistakes;
  presence: typeof presence;
  quizzes: typeof quizzes;
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
