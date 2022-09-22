import Page, { PageElement } from '../../../page'

export default class NoExistingRecordsFoundPage extends Page {
  constructor() {
    super('This person does not have an existing prisoner record')
  }

  search = (): PageElement => cy.get('[data-qa=search-instead]')

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
