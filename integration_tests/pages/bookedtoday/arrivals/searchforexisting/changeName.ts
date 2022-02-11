import Page, { PageElement } from '../../../page'

export default class ChangeNamePage extends Page {
  constructor() {
    super("Change this person's name")
  }

  firstName = (): PageElement => cy.get(`#first-name`)

  lastName = (): PageElement => cy.get(`#last-name`)

  save = (): PageElement => cy.get(`[data-qa=save]`)
}
