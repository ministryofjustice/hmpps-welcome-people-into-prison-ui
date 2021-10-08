import { RequestHandler } from 'express'
import path from 'path'

import ExpectedArrivalsService from '../services/expectedArrivalsService'

export default class PrisonerController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  placeHolderImage = path.join(process.cwd(), '/assets/images/placeholder-image.png')

  public getImage(): RequestHandler {
    return async (req, res) => {
      const { prisonNumber } = req.params

      await this.expectedArrivalsService
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
