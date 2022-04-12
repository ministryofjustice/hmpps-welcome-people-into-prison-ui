import Page, { PageElement } from '../../../page'

export default class ImprisonmentStatusPage extends Page {
  constructor() {
    super('Why is this person in prison?')
  }

  prisonerName = (): PageElement => cy.get(`[data-qa=prisoner-name]`)

  imprisonmentStatusRadioButton = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  continue = (): PageElement => cy.get(`[data-qa=continue]`)
}
