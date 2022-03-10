import Page, { PageElement } from '../../../page'

export default class PossibleRecordsFoundPage extends Page {
  constructor() {
    super('Possible existing records have been found')
  }

  static goTo(id: string): PossibleRecordsFoundPage {
    cy.visit(`/prisoners/${id}/possible-records-found`)
    return Page.verifyOnPage(PossibleRecordsFoundPage)
  }

  arrival = () => ({
    fieldName: name => cy.get(`.data-qa-per-record-${name}`),
  })

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  searchAgain = (): PageElement => cy.get('[data-qa=ammend-search]')

  chooseMatch = match => ({
    fieldName: name => cy.get(`.data-qa-matching-record-${match}-${name}`),
  })

  match = (index): PageElement => cy.get(`#record-${index}`)

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
