import { LogLevels } from "../lib/logger/logLevels";

/**
 * Enable this if you want a lot of text to be logged to console.
 * @type {boolean}
 */
export const ENABLE_DEBUG_MODE: boolean = true;

/**
 * Enable this to enable screeps profiler
 */
export const USE_PROFILER: boolean = true;

/**
 * Minimum number of ticksToLive for a Creep before they go to renew.
 * @type {number}
 */
export const DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL: number = 700;

/**
 * Debug level for log output
 */
export const LOG_LEVEL: number = LogLevels.INFO;

/**
 * Prepend log output with current tick number.
 */
export const LOG_PRINT_TICK: boolean = true;

/**
 * Prepend log output with source line.
 */
export const LOG_PRINT_LINES: boolean = true;

/**
 * Load source maps and resolve source lines back to typeascript.
 */
export const LOG_LOAD_SOURCE_MAP: boolean = true;

/**
 * Maximum padding for source links (for aligning log output).
 */
export const LOG_MAX_PAD: number = 100;

/**
 * VSC location, used to create links back to source.
 * Repo and revision are filled in at build time for git repositories.
 */
// export const LOG_VSC = { repo: "@@_repo_@@", revision: "@@_revision_@@", valid: false };
export const LOG_VSC = { repo: "@@_repo_@@", revision: __REVISION__, valid: false };

/**
 * URL template for VSC links, this one works for github and gitlab.
 */
export const LOG_VSC_URL_TEMPLATE = (path: string, line: string) => {
  return `${LOG_VSC.repo}/blob/${LOG_VSC.revision}/${path}#${line}`;
};

export const BUILD_LEVELS = {
  LEVEL_0: {
    HARVESTERS: 2,
  },
  LEVEL_1: {
    HARVESTERS: 2,
  },
  LEVEL_2: {
    HARVESTERS: 4,
  },
  LEVEL_3: {
    HARVESTERS: 8,
  },
  LEVEL_4: {
    HARVESTERS: 12,
  },
  LEVEL_5: {
    HARVESTERS: 14,
  },
};
