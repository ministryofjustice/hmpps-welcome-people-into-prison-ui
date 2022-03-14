import Page, { PageElement } from '../../../page'

export default class SingleExistingRecordFoundPage extends Page {
  constructor() {
    super('This person has an existing prisoner record')
  }

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
