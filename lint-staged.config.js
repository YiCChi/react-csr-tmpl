const lintStagedConfig = {
  // Type check TypeScript files
  // Lint then format TypeScript files
  '**/*.(ts|tsx)': (fileNames) => [`pnpm exec biome format --write ${fileNames.join(' ')}`],
};

export default lintStagedConfig;
