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

  dateType = (value): PageElement => cy.get('[name=dateType]').check(value)

  day = (): PageElement => cy.get('[data-qa=another-date-day]')

  month = (): PageElement => cy.get('[data-qa=another-date-month]')

  year = (): PageElement => cy.get('[data-qa=another-date-year]')

  reason = (value): PageElement => cy.get('[name=reason]').check(value)

  result = (value): PageElement => cy.get('[name=result]').check(value)

  submit = (): PageElement => cy.get(`[data-qa=submit]`)
}
