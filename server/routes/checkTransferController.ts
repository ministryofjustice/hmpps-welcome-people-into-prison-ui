import { RequestHandler } from 'express'
import TransfersService from '../services/transfersService'
import raiseAnalyticsEvent from '../raiseAnalyticsEvent'

export default class CheckTransferController {
  public constructor(private readonly transfersService: TransfersService) {}

  public checkTransfer(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const { prisonNumber } = req.params
      const data = await this.transfersService.getTransfer(activeCaseLoadId, prisonNumber)
      return res.render('pages/checkTransfer.njk', { data })
    }
  }

  public addToRoll(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params
      const { username } = req.user
      const { activeCaseLoadId } = res.locals.user
      const data = await this.transfersService.getTransfer(activeCaseLoadId, prisonNumber)

      raiseAnalyticsEvent(
        'Add to the establishment roll',
        'Confirmed transfer',
        `AgencyId: ${activeCaseLoadId}, From: ${data.fromLocation}, Type: 'PRISON',`,
        req.hostname
      )

      req.flash('prisoner', {
        firstName: data.firstName,
        lastName: data.lastName,
      })

      await this.transfersService.confirmTransfer(username, prisonNumber)
      res.redirect(`/prisoners/${prisonNumber}/confirm-transfer`)
    }
  }
}
