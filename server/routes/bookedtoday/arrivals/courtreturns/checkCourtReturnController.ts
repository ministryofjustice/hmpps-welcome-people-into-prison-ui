import { RequestHandler } from 'express'
import type { ExpectedArrivalsService, RaiseAnalyticsEvent } from '../../../../services'

export default class CheckCourtReturnController {
  public constructor(
    private readonly expectedArrivalsService: ExpectedArrivalsService,
    private readonly raiseAnalyticsEvent: RaiseAnalyticsEvent
  ) {}

  public checkCourtReturn(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username } = req.user

      const data = await this.expectedArrivalsService.getPrisonerDetailsForArrival(username, id)
      const prisonerEscortRecord = await this.expectedArrivalsService.getArrival(username, id)
      return res.render('pages/bookedtoday/arrivals/courtreturns/checkCourtReturn.njk', {
        data,
        id,
        prisonerEscortRecord,
      })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username } = req.user
      const { activeCaseLoadId } = res.locals.user
      const arrival = await this.expectedArrivalsService.getArrival(username, id)
      const data = await this.expectedArrivalsService.getPrisonerDetailsForArrival(username, id)

      const arrivalResponse = await this.expectedArrivalsService.confirmCourtReturn(
        username,
        id,
        activeCaseLoadId,
        data.prisonNumber
      )

      if (!arrivalResponse) {
        return res.redirect('/feature-not-available')
      }

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
        prisonNumber: data.prisonNumber,
        location: arrivalResponse.location,
      })

      this.raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed court return returned',
        `AgencyId: ${activeCaseLoadId}, From: ${arrival.fromLocation}, Type: ${arrival.fromLocationType},`
      )

      return res.redirect(`/prisoners/${id}/prisoner-returned-from-court`)
    }
  }
}
