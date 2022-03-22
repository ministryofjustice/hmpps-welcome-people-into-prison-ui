import type { RequestHandler } from 'express'

export default class SingleMatchingRecordFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/unexpectedArrivals/singleExistingRecordFound.njk')
    }
  }
}
