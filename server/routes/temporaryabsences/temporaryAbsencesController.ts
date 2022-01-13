import { RequestHandler } from 'express'
import type { TemporaryAbsencesService } from '../../services'

export default class TemporaryAbsencesController {
  public constructor(private readonly temporaryAbsencesService: TemporaryAbsencesService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { activeCaseLoadId } = res.locals.user
      const temporaryAbsences = await this.temporaryAbsencesService.getTemporaryAbsences(activeCaseLoadId)
      return res.render('pages/temporaryabsences/temporaryAbsences.njk', {
        temporaryAbsences,
      })
    }
  }
}
