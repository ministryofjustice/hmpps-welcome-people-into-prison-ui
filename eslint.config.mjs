import hmppsConfig from '@ministryofjustice/eslint-config-hmpps'

const config = hmppsConfig({
  extraIgnorePaths: ['assets', 'cypress.json', 'reporter-config.json'],
})

config.push({
  name: 'jquery',
  files: [`assets/js/**/*.js`],
  languageOptions: {
    globals: {
      $: true,
      module: true,
    },
  },
  rules: {
    'func-names': 0,
  },
})

config.push({
  name: 'allow-any-in-tests',
  files: [`**/*.test.ts`],
  rules: {
    '@typescript-eslint/no-explicit-any': 0,
  },
})

export default config
