import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'apps/**', 'scripts/**', 'app-store-screenshots-source/**']),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@next/next/no-img-element': 'off',
      // Next 16 / React Compiler: завантаження зі сховища браузера та синхронізація з URL
      // у useEffect — свідомий патерн тут (уникнення hydration mismatch), тому лише попередження
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);
