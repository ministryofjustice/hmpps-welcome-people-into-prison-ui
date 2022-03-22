import type { RequestHandler } from 'express'

export default class NoExistingRecordsFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/unexpectedArrivals/noExistingRecordsFound.njk')
    }
  }
}
