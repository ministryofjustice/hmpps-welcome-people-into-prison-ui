import { RequestHandler } from 'express'
import path from 'path'

import IncomingMovementsService from '../services/incomingMovementsService'

export default class PrisonerController {
  public constructor(private readonly incomingMovementsService: IncomingMovementsService) {}

  placeHolderImage = path.join(process.cwd(), '/assets/images/placeholder-image.png')

  public getImage(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params

      await this.incomingMovementsService
        .getImage(prisonNumber)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(() => {
          res.sendFile(this.placeHolderImage)
        })
    }
  }
}
