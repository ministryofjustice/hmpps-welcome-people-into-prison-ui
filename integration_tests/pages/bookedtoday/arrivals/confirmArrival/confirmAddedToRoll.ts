import Page, { PageElement } from '../../../page'

const banner = '[data-qa=confirmation-banner]'
const paragraph = '[data-qa=confirmation-paragraph]'
const location = '[data-qa=location-paragraph]'

export default class ConfirmAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll', { hasBackLink: false })
  }

  confirmationBanner = (): PageElement => cy.get(`[data-qa=confirmation-banner]`)

  confirmationParagraph = (): PageElement => cy.get(`[data-qa=confirmation-paragraph]`)

  details = ({
    prison,
    locationName,
    prisonNumber,
    name,
  }: {
    prison: string
    locationName: string
    prisonNumber: string
    name: string
  }) => {
    cy.get(paragraph).contains(prison)
    cy.get(location).contains(locationName)
    cy.get(banner).contains(prisonNumber)
    cy.get(banner).contains(name)
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
