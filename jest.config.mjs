import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/src/test/"],
  collectCoverageFrom: [
    "src/lib/actions/**/*.ts",
    "src/lib/validations/**/*.ts",
    "src/components/ui/**/*.tsx",
    "!**/*.d.ts",
  ],
};

export default createJestConfig(config);
