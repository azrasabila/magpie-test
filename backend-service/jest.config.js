export default {
    preset: "ts-jest",
    testEnvironment: "node",
    testTimeout: 30000,
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  };
  