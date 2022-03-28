import Page, { PageElement } from '../../../page'

export default class ConfirmAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll', true)
  }

  backLink = (): PageElement => cy.get(`[data-qa=back-link]`)

  confirmationBanner = (): PageElement => cy.get(`[data-qa=confirmation-banner]`)

  confirmationParagraph = (): PageElement => cy.get(`[data-qa=confirmation-paragraph]`)

  locationParagraph = (): PageElement => cy.get(`[data-qa=location-paragraph]`)

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
