import type { TemporaryAbsence } from 'welcome'
import TemporaryAbsencesService from './temporaryAbsencesService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import WelcomeClient from '../data/welcomeClient'

jest.mock('../data/hmppsAuthClient')
jest.mock('../data/welcomeClient')

const token = 'some token'

describe('Temporary absences service', () => {
  const welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
  const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>
  let service: TemporaryAbsencesService

  const WelcomeClientFactory = jest.fn()

  const temporaryAbsence: TemporaryAbsence = {
    firstName: 'JOHN',
    lastName: 'DOE',
    dateOfBirth: '1971-01-01',
    prisonNumber: 'G0013AB',
    reasonForAbsence: 'Hospital appointment',
  }

  const temporaryAbsences: TemporaryAbsence[] = [
    {
      firstName: 'Mark',
      lastName: 'Prisoner',
      dateOfBirth: '1985-01-05',
      prisonNumber: 'G0016GD',
      reasonForAbsence: 'Hospital appointment',
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      reasonForAbsence: 'Hospital appointment',
    },
    {
      firstName: 'Barry',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012HK',
      reasonForAbsence: 'External visit',
    },
    {
      firstName: 'Karl',
      lastName: 'Offender',
      dateOfBirth: '1985-01-01',
      prisonNumber: 'G0015GD',
      reasonForAbsence: 'Hospital appointment',
    },
  ]

  const res = { locals: { user: { activeCaseLoadId: 'MDI' } } }

  beforeEach(() => {
    jest.resetAllMocks()
    WelcomeClientFactory.mockReturnValue(welcomeClient)
    service = new TemporaryAbsencesService(hmppsAuthClient, WelcomeClientFactory)
    hmppsAuthClient.getSystemClientToken.mockResolvedValue(token)
    welcomeClient.getTemporaryAbsences.mockResolvedValue(temporaryAbsences)
    welcomeClient.getTemporaryAbsence.mockResolvedValue(temporaryAbsence)
  })

  describe('getTemporaryAbsences', () => {
    it('Retrieves temporary absences sorted alphabetically by name', async () => {
      const result = await service.getTemporaryAbsences(res.locals.user.activeCaseLoadId)

      expect(result).toStrictEqual([
        {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1971-01-01',
          prisonNumber: 'G0013AB',
          reasonForAbsence: 'Hospital appointment',
        },
        {
          firstName: 'Karl',
          lastName: 'Offender',
          dateOfBirth: '1985-01-01',
          prisonNumber: 'G0015GD',
          reasonForAbsence: 'Hospital appointment',
        },
        {
          firstName: 'Mark',
          lastName: 'Prisoner',
          dateOfBirth: '1985-01-05',
          prisonNumber: 'G0016GD',
          reasonForAbsence: 'Hospital appointment',
        },
        {
          firstName: 'Barry',
          lastName: 'Smith',
          dateOfBirth: '1970-01-01',
          prisonNumber: 'G0012HK',
          reasonForAbsence: 'External visit',
        },
      ])
      expect(hmppsAuthClient.getSystemClientToken).toBeCalled()
      expect(welcomeClient.getTemporaryAbsences).toBeCalledWith(res.locals.user.activeCaseLoadId)
    })

    it('WelcomeClientFactory is called with a token', async () => {
      await service.getTemporaryAbsences(res.locals.user.activeCaseLoadId)

      expect(WelcomeClientFactory).toBeCalledWith(token)
    })
  })

  describe('getTemporaryAbsence', () => {
    it('Calls upstream service correctly', async () => {
      await service.getTemporaryAbsence('MDI', 'G0013AB')

      expect(WelcomeClientFactory).toBeCalledWith(token)
      expect(welcomeClient.getTemporaryAbsence).toBeCalledWith('MDI', 'G0013AB')
    })

    it('Should format and return correct data', async () => {
      const result = await service.getTemporaryAbsence('MDI', 'G0013AB')

      expect(result).toStrictEqual({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1971-01-01',
        prisonNumber: 'G0013AB',
        reasonForAbsence: 'Hospital appointment',
      })
    })
  })
})
