import { RequestHandler } from 'express'
import TransfersService from '../services/transfersService'

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
      // TODO: implement post action in next ticket
      res.redirect(`/prisoners/${prisonNumber}/confirmation`)
    }
  }
}
