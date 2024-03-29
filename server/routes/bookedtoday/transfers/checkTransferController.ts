import type { RequestHandler } from 'express'
import type { RaiseAnalyticsEvent, TransfersService } from '../../../services'

export default class CheckTransferController {
  public constructor(
    private readonly transfersService: TransfersService,
    private readonly raiseAnalyticsEvent: RaiseAnalyticsEvent
  ) {}

  public checkTransfer(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { arrivalId } = req.query
      const { prisonNumber } = req.params
      const data = await this.transfersService.getTransfer(activeCaseLoadId, prisonNumber)
      return res.render('pages/bookedtoday/transfers/checkTransfer.njk', { data, arrivalId })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { username } = req.user
      const { arrivalId } = req.body
      const { activeCaseLoadId } = res.locals.user
      const data = await this.transfersService.getTransfer(activeCaseLoadId, prisonNumber)

      const arrivalResponse = await this.transfersService.confirmTransfer(
        username,
        prisonNumber,
        activeCaseLoadId,
        arrivalId
      )

      if (!arrivalResponse) {
        return res.redirect('/feature-not-available')
      }

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
        location: arrivalResponse.location,
      })

      this.raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed transfer',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: 'PRISON',`
      )

      return res.redirect(`/prisoners/${prisonNumber}/confirm-transfer`)
    }
  }
}
