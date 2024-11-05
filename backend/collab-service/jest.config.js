/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  testMatch: ["**/tests/**/*.test.ts"],
  // Exclude build directories and node_modules
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};