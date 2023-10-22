module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/strict-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'prettier',
	],
	plugins: ['@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
	rules: {
		'@typescript-eslint/consistent-type-exports': 'error',
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/member-ordering': 'error',
		'@typescript-eslint/method-signature-style': 'error',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'variable',
				format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
			},
			{
				selector: 'parameter',
				format: ['camelCase'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'memberLike',
				modifiers: ['private'],
				format: ['camelCase'],
				leadingUnderscore: 'require',
			},
			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},
			{
				selector: 'function',
				format: ['camelCase'],
			},
			{
				selector: 'function',
				modifiers: ['exported'],
				format: ['camelCase', 'PascalCase'],
			},
		],
		'@typescript-eslint/no-import-type-side-effects': 'error',
		'@typescript-eslint/no-confusing-void-expression': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/prefer-enum-initializers': 'error',
		'@typescript-eslint/prefer-readonly': 'error',
		'@typescript-eslint/prefer-regexp-exec': 'error',
		'@typescript-eslint/promise-function-async': 'error',
		'@typescript-eslint/sort-type-constituents': 'error',
		'@typescript-eslint/switch-exhaustiveness-check': 'error',

		// extension rules
		'default-param-last': 'off',
		'@typescript-eslint/default-param-last': 'error',
		'init-declarations': 'off',
		'@typescript-eslint/init-declarations': 'error',
		'no-dupe-class-members': 'off',
		'@typescript-eslint/no-dupe-class-members': 'error',
		'no-invalid-this': 'off',
		'@typescript-eslint/no-invalid-this': 'error',
		'no-loop-func': 'off',
		'@typescript-eslint/no-loop-func': 'error',
		'no-redeclare': 'off',
		'@typescript-eslint/no-redeclare': 'error',
		'no-unused-expressions': 'off',
		'@typescript-eslint/no-unused-expressions': 'error',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
		],
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': 'error',

		// Formatting is almost using prettier. Only use these 3 formatting rules in linter.
		'@typescript-eslint/lines-between-class-members': 'error',
		'@typescript-eslint/member-delimiter-style': 'error',
		'@typescript-eslint/padding-line-between-statements': [
			'error',
			{
				blankLine: 'always',
				prev: '*',
				next: 'return',
			},
			{
				blankLine: 'always',
				prev: ['const', 'let', 'var'],
				next: '*',
			},
			{
				blankLine: 'any',
				prev: ['const', 'let', 'var'],
				next: ['const', 'let', 'var'],
			},
			{
				blankLine: 'always',
				prev: ['case', 'default'],
				next: '*',
			},
			{
				blankLine: 'always',
				prev: 'directive',
				next: '*',
			},
			{
				blankLine: 'any',
				prev: 'directive',
				next: 'directive',
			},
			{
				blankLine: 'always',
				prev: '*',
				next: ['interface', 'type'],
			},
		],
	},
};
