import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXOpeningElement[name.name="Button"]:not(:has(JSXAttribute[name.name="colorPalette"]))',
          message:
            "Direct Button usage must declare an intentional colorPalette.",
        },
        {
          selector:
            'JSXOpeningElement[name.name="IconButton"]:not(:has(JSXAttribute[name.name="colorPalette"]))',
          message:
            "Direct IconButton usage must declare an intentional colorPalette.",
        },
        {
          selector:
            "JSXOpeningElement[name.name=/^(button|input|select|textarea)$/]",
          message:
            "Use the Chakra UI primitive instead of a raw production HTML control.",
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
);
