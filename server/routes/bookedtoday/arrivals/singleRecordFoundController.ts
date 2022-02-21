import type { RequestHandler } from 'express'
import { State } from './state'

export default class SingleRecordFoundController {
  public view(): RequestHandler {
    return async (req, res) => {
      const data = State.newArrival.get(req)
      return res.render('pages/bookedtoday/arrivals/confirmArrivalOneMatchFound.njk', { data })
    }
  }
}
