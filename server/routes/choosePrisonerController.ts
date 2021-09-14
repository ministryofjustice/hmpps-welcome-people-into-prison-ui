import { RequestHandler } from 'express'
import IncomingMovementsService from '../services/incomingMovementsService'

export default class ChoosePrisonerController {
  public constructor(private readonly incomingMovementsService: IncomingMovementsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const incomingMovements = await this.incomingMovementsService.getMovesForToday(activeCaseLoadId)
      return res.render('pages/choosePrisoner.njk', {
        incomingMovements,
      })
    }
  }
}
