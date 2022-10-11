const lintStagedConfig = {
  // Type check TypeScript files
  // Lint then format TypeScript files
  '**/*.(ts|tsx)': (fileNames) => [
    `pnpm exec eslint --fix ${fileNames.join(' ')}`,
    `pnpm exec prettier --write ${fileNames.join(' ')}`,
  ],

  // Format MarkDown and JSON
  '**/*.(md|json)': (fileNames) => `pnpm exec prettier --write ${fileNames.join(' ')}`,
};

export default lintStagedConfig;
