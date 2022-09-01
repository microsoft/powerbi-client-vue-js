module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['src/tests/**/*.ts'],
  rules: {
    "@typescript-eslint/no-explicit-any": "off"
  }
}