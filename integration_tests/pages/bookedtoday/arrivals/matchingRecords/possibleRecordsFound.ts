import Page, { PageElement } from '../../../page'

export default class PossibleRecordsFoundPage extends Page {
  constructor() {
    super('Possible existing records have been found')
  }

  static goTo(id: string): PossibleRecordsFoundPage {
    cy.visit(`/prisoners/${id}/possible-records-found`)
    return Page.verifyOnPage(PossibleRecordsFoundPage)
  }

  perElement = (element): PageElement => cy.get(`.data-qa-per-record-${element}`)

  matchingElement = (element): PageElement => cy.get(`.data-qa-matching-record-${element}`)

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  errorSummary = (): PageElement => cy.get('.govuk-error-summary__list')

  errorMessage = (): PageElement => cy.get('.govuk-error-message')

  searchAgainLink = (): PageElement => cy.get('[data-qa=ammend-search]')

  radioButtonOne = (): PageElement => cy.get('#record-1')

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
