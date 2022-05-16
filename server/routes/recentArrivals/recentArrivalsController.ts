import { RequestHandler } from 'express'

export default class RecentArrivalsController {
  public view(): RequestHandler {
    return async (req, res) => {
      return res.render('pages/recentArrivals/recentArrivals.njk', {})
    }
  }
}
