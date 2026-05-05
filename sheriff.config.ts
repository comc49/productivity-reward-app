import { anyTag, noDependencies, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  version: 1,
  /**
   * Entry points let Sheriff trace the full import graph for each project.
   */
  entryPoints: {
    client: 'productivity-rewards/src/main.ts',
    api: 'api/src/main.ts',
  },
  /**
   * Each folder listed here becomes a module boundary.
   * External consumers MUST import through the barrel (index.ts).
   * Paths are relative to this config file (workspace root).
   */
  modules: {
    'productivity-rewards/src/app/wallet': 'scope:wallet',
    'productivity-rewards/src/app/tasks': 'scope:tasks',
    'api/src': 'scope:api',
  },
  depRules: {
    /** tasks domain may pull from the wallet domain and untagged root files */
    'scope:tasks': ['scope:wallet', 'root'],
    /** wallet is foundational — it depends on nothing */
    'scope:wallet': noDependencies,
    /** api is backend only — no cross-project deps */
    'scope:api': noDependencies,
    /** root-tagged files (outside defined modules) may import from anything */
    root: anyTag,
    /** noTag fallback for Sheriff versions that use noTag instead of root */
    noTag: anyTag,
  },
};
