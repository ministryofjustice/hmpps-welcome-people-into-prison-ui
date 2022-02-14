import Page, { PageElement } from '../../page'

export default class ConfrimAddedToRollPage extends Page {
  constructor() {
    super('has been added to the establishment roll')
  }

  confirmationBanner = (): PageElement => cy.get(`[data-qa=confirmation-banner]`)

  confirmationParagraph = (): PageElement => cy.get(`[data-qa=confirmation-paragraph]`)

  locationParagraph = (): PageElement => cy.get(`[data-qa=location-paragraph]`)

  addAnotherToRoll = (): PageElement => cy.get(`[data-qa=add-another-to-roll]`)

  viewEstablishmentRoll = (): PageElement => cy.get(`[data-qa=view-establishment-roll]`)

  backToDigitalPrisonServices = (): PageElement => cy.get('[data-qa=back-to-dps]')
}
