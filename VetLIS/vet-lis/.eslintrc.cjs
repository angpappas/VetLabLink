module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended", "plugin:prettier/recommended"],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    parser: "@typescript-eslint/parser",
    plugins: ["react-refresh"],
    rules: {
        "react-hooks/exhaustive-deps": "off",
        "react-refresh/only-export-components": ["off", { allowConstantExport: true }],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_"
            }
        ],
        "no-prototype-builtins": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "padding-line-between-statements": [
            "error",
            { blankLine: "always", prev: "block-like", next: "*" },
            { blankLine: "always", prev: "multiline-block-like", next: "*" },
            { blankLine: "always", prev: "multiline-expression", next: "*" }
        ],
        "prettier/prettier": [
            "warn",
            {
                endOfLine: "auto"
            }
        ]
    }
};
