module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [2, "always", 200],
    "header-max-length": [2, "always", 200],
    // Allow sentence-case subjects (e.g. "chore: Refactor code structure...")
    "subject-case": [0, "never"],
  },
};
