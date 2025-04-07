module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Disable the no-explicit-any rule completely since many types in this codebase use any
    '@typescript-eslint/no-explicit-any': 'off',
    // Only warn for React hooks exhaustive deps to avoid blocking builds
    'react-hooks/exhaustive-deps': 'warn',
    // Lower severity for alt-text warnings
    'jsx-a11y/alt-text': 'warn',
    "no-unused-vars": "off",
    // Allow unused variables that start with underscore
    '@typescript-eslint/no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }]
  }
}; 