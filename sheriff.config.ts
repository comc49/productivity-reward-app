import { anyTag, noDependencies, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  /**
   * Entry points let Sheriff trace the full import graph for each project.
   */
  entryPoints: {
    client: 'client/src/main.ts',
    api: 'api/src/main.ts',
  },
  /**
   * Each folder listed here becomes a module boundary.
   * External consumers MUST import through the barrel (index.ts).
   * Paths are relative to this config file (workspace root).
   */
  modules: {
    'client/src/app/wallet': 'scope:wallet',
    'client/src/app/tasks': 'scope:tasks',
    'api/src': 'scope:api',
  },
  depRules: {
    /** tasks domain may pull from the wallet domain (for coin ops) */
    'scope:tasks': ['scope:wallet'],
    /** wallet is foundational — it depends on nothing */
    'scope:wallet': noDependencies,
    /** api is backend only — no cross-project deps */
    'scope:api': noDependencies,
    /**
     * Untagged files (app root, main.ts, app.config.ts, …) may import
     * from any module so they can wire everything together.
     */
    noTag: anyTag,
  },
};
