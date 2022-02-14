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
      const data = await this.expectedArrivalsService.getArrival(id)
      return res.render('pages/bookedtoday/arrivals/courtreturns/checkCourtReturn.njk', { data, id })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username } = req.user
      const { activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getArrival(id)

      const arrivalResponse = await this.expectedArrivalsService.confirmCourtReturn(username, id, activeCaseLoadId)

      if (!arrivalResponse) {
        return res.redirect('/feature-not-available')
      }

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
        prisonNumber: arrivalResponse.prisonNumber,
        location: arrivalResponse.location,
      })

      this.raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed court return returned',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      return res.redirect(`/prisoners/${id}/prisoner-returned-from-court`)
    }
  }
}
