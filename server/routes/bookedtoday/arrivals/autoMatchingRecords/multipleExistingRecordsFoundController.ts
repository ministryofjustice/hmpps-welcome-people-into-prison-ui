import type { RequestHandler } from 'express'

export default class MultipleExistingRecordsFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/bookedtoday/arrivals/autoMatchingRecords/multipleExistingRecordsFound.njk')
    }
  }
}
