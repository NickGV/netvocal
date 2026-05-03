import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

export default [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Keep it minimal; rely on Next defaults.
    },
  },
]
