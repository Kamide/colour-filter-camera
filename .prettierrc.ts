import type { PluginConfig as SortImports } from "@ianvs/prettier-plugin-sort-imports";
import type { Config as Prettier } from "prettier";
import type { PluginOptions as Tailwindcss } from "prettier-plugin-tailwindcss";

const prettier: Prettier = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
};

const sortImports: SortImports = {
  importOrderCaseSensitive: true,
};

const tailwindcss: Tailwindcss = {
  // language=file-reference
  tailwindStylesheet: "./src/index.css",
  tailwindFunctions: ["cn"],
};

export default {
  ...prettier,
  ...sortImports,
  ...tailwindcss,
};
