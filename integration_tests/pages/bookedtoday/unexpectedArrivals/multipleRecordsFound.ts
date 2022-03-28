import Page, { PageElement } from '../../page'

export default class MultipleRecordsFoundPage extends Page {
  constructor() {
    super('Possible existing records have been found')
  }

  arrival = () => ({
    fieldName: name => cy.get(`.data-qa-arrival-details-${name}`),
  })

  searchAgain = (): PageElement => cy.get('[data-qa=ammend-search]')

  match = index => ({
    fieldName: name => cy.get(`.data-qa-matching-record-${index}-${name}`),
    prisonerImage: (): PageElement => cy.get(`[data-qa=prisoner-image-${index}]`),
    select: (): PageElement => cy.get(`#record-${index}`),
  })

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
