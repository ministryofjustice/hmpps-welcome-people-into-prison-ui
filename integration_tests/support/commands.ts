import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command'

addMatchImageSnapshotCommand({
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
  customDiffConfig: { threshold: 0.3 },
  capture: 'fullPage',
})

Cypress.Commands.add('signIn', (options = { failOnStatusCode: true }) => {
  cy.request(`/`)
  cy.task('getSignInUrl').then((url: string) => cy.visit(url, options))
})
