import Page, { PageElement } from '../page'

export default class BodyScanConfirmation extends Page {
  constructor() {
    super('Body scan recorded', { hasBackLink: false })
  }

  confirmationBanner = (): PageElement => cy.get(`[data-qa=confirmation-banner]`)

  addCaseNote = (prisonNumber: string) => ({
    exists: () =>
      Page.checkLink(
        cy.get(`[data-qa=add-case-note]`),
        'Add a case note on their profile',
        `https://digital-dev.prison.service.justice.gov.uk/save-backlink?service=welcome-people-into-prison&returnPath=/confirm-arrival/choose-prisoner&redirectPath=/prisoner/${prisonNumber}/add-case-note`
      ),
  })
}
