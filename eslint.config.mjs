import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next.js recommended ESLint setup (flat config):
// core-web-vitals = React, React Hooks, accessibility (jsx-a11y) and Next.js rules
// typescript      = typescript-eslint rules
// Docs: https://nextjs.org/docs/app/api-reference/config/eslint
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
