import { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../services'
import raiseAnalyticsEvent from '../../../raiseAnalyticsEvent'

export default class CheckCourtReturnController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public checkCourtReturn(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getCourtReturn(prisonNumber, activeCaseLoadId)
      return res.render('pages/bookedtoday/arrivals/checkCourtReturn.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { activeCaseLoadId } = res.locals.user
      const data = await this.expectedArrivalsService.getCourtReturn(prisonNumber, activeCaseLoadId)

      if (!prisonNumber) {
        return res.redirect('/feature-not-available')
      }

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
      })

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed court return returned',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: ${data.fromLocationType},`,
        req.hostname
      )

      return res.redirect(`/prisoners/${prisonNumber}/prisoner-returned-from-court`)
    }
  }
}
