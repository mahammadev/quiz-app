/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as classes from "../classes.js";
import type * as flags from "../flags.js";
import type * as invitations from "../invitations.js";
import type * as join from "../join.js";
import type * as leaderboard from "../leaderboard.js";
import type * as migrations from "../migrations.js";
import type * as mistakes from "../mistakes.js";
import type * as orgMembers from "../orgMembers.js";
import type * as organizations from "../organizations.js";
import type * as platform from "../platform.js";
import type * as presence from "../presence.js";
import type * as quizzes from "../quizzes.js";
import type * as userProgress from "../userProgress.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  classes: typeof classes;
  flags: typeof flags;
  invitations: typeof invitations;
  join: typeof join;
  leaderboard: typeof leaderboard;
  migrations: typeof migrations;
  mistakes: typeof mistakes;
  orgMembers: typeof orgMembers;
  organizations: typeof organizations;
  platform: typeof platform;
  presence: typeof presence;
  quizzes: typeof quizzes;
  userProgress: typeof userProgress;
  users: typeof users;
  utils: typeof utils;
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
