import Page, { PageElement } from '../../../page'

export default class ConfirmCourtReturnAddedToRollPage extends Page {
  constructor() {
    super('has returned to Moorland (HMP & YOI)', { hasBackLink: false })
  }

  addCaseNote = (prisonNumber: string) => ({
    exists: () =>
      Page.checkLink(
        cy.get(`[data-qa=add-case-note]`),
        'Add a case note on their profile',
        `https://prisoner-dev.digital.prison.service.justice.gov.uk/save-backlink?service=welcome-people-into-prison&returnPath=/confirm-arrival/choose-prisoner&redirectPath=/prisoner/${prisonNumber}/add-case-note`,
      ),
  })

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  viewEstablishmentRoll = () => ({
    exists: () =>
      Page.checkLink(
        cy.get(`[data-qa=view-establishment-roll]`),
        'View establishment roll',
        'https://prison-roll-count-dev.hmpps.service.justice.gov.uk',
      ),
  })
}
