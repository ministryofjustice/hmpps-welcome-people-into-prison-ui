import Page, { PageElement } from '../page'

export default class BodyScanPage extends Page {
  constructor() {
    super('Record an X-ray body scan for')
  }

  static goTo(prisonNumber: string): BodyScanPage {
    cy.visit(`/prisoners/${prisonNumber}/record-body-scan`)
    return Page.verifyOnPage(BodyScanPage)
  }

  bodyScanTitleName = (): PageElement => cy.get('[data-qa=record-body-scan-title]')

  dateRadioButtons = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  day = (): PageElement => cy.get('[data-qa=another-date-day]')

  month = (): PageElement => cy.get('[data-qa=another-date-month]')

  year = (): PageElement => cy.get('[data-qa=another-date-year]')

  reasonRadioButtons = (value): PageElement => cy.get('.govuk-radios__input[type="radio"]').check(value)

  submit = (): PageElement => cy.get(`[data-qa=submit]`)
}
