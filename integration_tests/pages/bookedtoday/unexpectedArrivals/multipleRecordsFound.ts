import Page, { PageElement } from '../../page'

export default class MultipleRecordsFoundPage extends Page {
  constructor() {
    super('Possible existing records have been found')
  }

  arrival = () => ({
    fieldName: name => cy.get(`.data-qa-arrival-details-${name}`),
  })

  prisonerImage = (): PageElement => cy.get(`[data-qa=prisoner-image]`)

  searchAgain = (): PageElement => cy.get('[data-qa=ammend-search]')

  chooseMatch = match => ({
    fieldName: name => cy.get(`.data-qa-matching-record-${match}-${name}`),
  })

  match = (index): PageElement => cy.get(`#record-${index}`)

  continue = (): PageElement => cy.get('[data-qa=continue]')
}
