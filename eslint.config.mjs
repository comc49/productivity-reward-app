import nx from '@nx/eslint-plugin';
import sheriff from '@softarc/eslint-plugin-sheriff';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', 'sheriff.config.ts'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  // ── Sheriff: module boundary & deep-import enforcement ──────────────────
  // Uses sheriff.config.ts at the workspace root to drive the rules.
  // `barrelModulesOnly` enables:
  //   @softarc/sheriff/dependency-rule  – enforces depRules from config
  //   @softarc/sheriff/deep-import      – blocks direct imports into module internals
  sheriff.configs.barrelModulesOnly,
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];
