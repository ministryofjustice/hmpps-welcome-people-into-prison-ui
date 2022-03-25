import Page, { PageElement } from '../../../page'

export default class MultipleMatchingRecordsPage extends Page {
  constructor() {
    super('Possible existing records have been found')
  }

  arrival = () => ({
    fieldName: name => cy.get(`.data-qa-per-record-${name}`),
  })

  search = (): PageElement => cy.get('[data-qa=ammend-search]')

  match = index => ({
    fieldName: name => cy.get(`.data-qa-matching-record-${index}-${name}`),
    prisonerImage: (): PageElement => cy.get(`[data-qa=prisoner-image-${index}]`),
    select: (): PageElement => cy.get(`#record-${index}`),
  })

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
