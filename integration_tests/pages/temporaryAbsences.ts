import Page, { PageElement } from './page'

export default class TemporaryAbsencesPage extends Page {
  constructor() {
    super('Select prisoner returning from temporary absence')
  }

  static goTo(): Cypress.Chainable<Cypress.AUTWindow> {
    return cy.visit('/confirm-arrival/return-from-temporary-absence')
  }

  temporaryAbsences = (index: number): PageElement => cy.get(`[data-qa=temporaryAbsence-title-${index}]`)
}
