import type { RequestHandler } from 'express'
import type { ExpectedArrivalsService } from '../../../../services'

export default class NoExistingRecordsFoundController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/unexpectedArrivals/noExistingRecordsFound.njk')
    }
  }
}
