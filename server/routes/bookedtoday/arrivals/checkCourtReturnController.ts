import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import raiseAnalyticsEvent from '../../../raiseAnalyticsEvent'

export default class CheckCourtReturnController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public checkCourtReturn(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const data = await this.expectedArrivalsService.getArrival(id)
      return res.render('pages/bookedtoday/arrivals/checkCourtReturn.njk', { data, id })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { username } = req.user
      const { activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getArrival(id)

      const prisonNumber = await this.expectedArrivalsService.confirmCourtReturn(username, id, activeCaseLoadId)

      if (!prisonNumber) {
        return res.redirect('/feature-not-available')
      }

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
        prisonNumber: prisonNumber.prisonNumber,
      })

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed court return returned',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      return res.redirect(`/prisoners/${id}/prisoner-returned-from-court`)
    }
  }
}
