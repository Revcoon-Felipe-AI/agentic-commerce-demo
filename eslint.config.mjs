import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const RESTRICT_SUPABASE_SDK = {
  paths: [
    {
      name: '@supabase/supabase-js',
      message:
        'Import from @/lib/supabase/{client,server,admin} or @/lib/products / @/lib/products.client / @/lib/db/* instead.',
    },
  ],
}

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      '.claude/**',
      'src/**',
      'design/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    rules: {
      'no-restricted-imports': ['error', RESTRICT_SUPABASE_SDK],
    },
  },
  {
    files: ['lib/supabase/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]

export default config
