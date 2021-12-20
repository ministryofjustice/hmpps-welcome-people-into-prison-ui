import { RequestHandler } from 'express'
import ExpectedArrivalsService from '../services/expectedArrivalsService'
import { setSex } from './state'

export default class SexController {
  public constructor(private readonly expectedArrivalsService: ExpectedArrivalsService) {}

  public view(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params

      const data = await this.expectedArrivalsService.getArrival(id)

      const genderValue = this.convertGenderKeyToValue(data.gender)

      if (genderValue) {
        setSex(res, genderValue)
        return res.redirect(`/prisoners/${id}/imprisonment-status`)
      }

      return res.render('pages/sex.njk', {
        errors: req.flash('errors'),
        data,
      })
    }
  }

  public assignSex(): RequestHandler {
    return async (req, res) => {
      const { id } = req.params
      const { sex } = req.body

      if (req.errors) {
        return res.redirect(`/prisoners/${id}/sex`)
      }

      setSex(res, sex)

      return res.redirect(`/prisoners/${id}/imprisonment-status`)
    }
  }

  private convertGenderKeyToValue(value: string): string {
    if (value?.toUpperCase() === 'MALE') return 'M'
    if (value?.toUpperCase() === 'FEMALE') return 'F'
    return null
  }
}
