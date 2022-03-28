import Page, { PageElement } from '../../page'

export default class ConfirmTransferAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll', true)
  }

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  viewEstablishmentRoll = () => ({
    exists: () =>
      Page.checkLink(
        cy.get(`[data-qa=view-establishment-roll]`),
        'View establishment roll',
        'https://digital-dev.prison.service.justice.gov.uk/establishment-roll'
      ),
  })

  backToDigitalPrisonServices = () => ({
    exists: () =>
      Page.checkLink(
        cy.get('[data-qa=back-to-dps]'),
        'Back to Digital Prison Services',
        'https://digital-dev.prison.service.justice.gov.uk'
      ),
  })
}
