import Page from '../page'

export default class ConfirmTemporaryAbsenceAddedToRollPage extends Page {
  constructor() {
    super('has returned to Moorland (HMP & YOI)', { hasBackLink: false })
  }

  static goTo(id: string): ConfirmTemporaryAbsenceAddedToRollPage {
    cy.visit(`/prisoners/${id}/prisoner-returned`)
    return Page.verifyOnPage(ConfirmTemporaryAbsenceAddedToRollPage)
  }

  addCaseNote = (prisonNumber: string) => ({
    exists: () =>
      Page.checkLink(
        cy.get(`[data-qa=add-case-note]`),
        'Add a case note on their profile',
        `https://digital-dev.prison.service.justice.gov.uk/prisoner/${prisonNumber}/add-case-note`
      ),
  })

  backToNewArrivals = () => ({
    exists: () => Page.checkLink(cy.get('[data-qa=back-to-new-arrivals]'), 'Back to new arrivals', '/'),
  })

  viewEstablishmentRoll = () => ({
    exists: () =>
      Page.checkLink(
        cy.get(`[data-qa=view-establishment-roll]`),
        'View establishment roll',
        'https://digital-dev.prison.service.justice.gov.uk/establishment-roll'
      ),
  })
}
