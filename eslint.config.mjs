import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Prohibir console.log en código de producción
      // Usar Winston logger en su lugar: import logger from '@/config/logger'
      "no-console": "error",
      
      // Prohibir imports entre API y Dashboard (separación arquitectónica estricta)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/dashboard/**"],
              message: "❌ API no puede importar desde Dashboard. Usa @/shared/ para código compartido.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/dashboard/**/*.{ts,tsx}", "pages/dashboard/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/api/controllers/**", "**/api/services/**", "**/api/repositories/**"],
              message: "❌ Dashboard no puede importar lógica de API. Dashboard debe consumir endpoints REST.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
