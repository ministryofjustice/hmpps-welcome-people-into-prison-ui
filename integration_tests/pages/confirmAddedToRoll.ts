import Page, { PageElement } from './page'

export default class ConfrimAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll')
  }

  confirmationBanner = (): PageElement => cy.get(`[data-qa=confirmation-banner]`)

  confirmationParagraph = (): PageElement => cy.get(`[data-qa=confirmation-paragraph]`)

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)
}
