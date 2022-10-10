const lintStagedConfig = {
  // Type check TypeScript files
  // Lint then format TypeScript files
  '**/*.(ts|tsx)': () => [
    'pnpm exec tsc --noEmit',
    `pnpm exec eslint --fix ${filenames.join(' ')}`,
    `pnpm exec prettier --write ${filenames.join(' ')}`,
  ],

  // Format MarkDown and JSON
  '**/*.(md|json)': (filenames) => `pnpm exec prettier --write ${filenames.join(' ')}`,
};

export default lintStagedConfig;
