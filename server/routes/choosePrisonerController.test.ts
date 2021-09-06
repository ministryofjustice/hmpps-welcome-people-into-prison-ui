import type { Movement } from 'welcome'
import ChoosePrisonerController from './choosePrisonerController'
import IncomingMovementsService from '../services/incomingMovementsService'
import { mockRequest, mockResponse } from './testutils/requestTestUtils'

jest.mock('../services/incomingMovementsService')

describe('Choose Prisoner Controller', () => {
  const incomingMovementsService = new IncomingMovementsService(null, null) as jest.Mocked<IncomingMovementsService>

  let controller: ChoosePrisonerController

  const req = mockRequest({})
  const res = mockResponse({ locals: { user: { username: 'USER-1', activeCaseLoadId: 'MDI' } } })

  const incomingMovements: Movement[] = [
    {
      firstName: 'Bob',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012BK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Wandsworth',
      moveType: 'VIDEO_REMAND',
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_TRANSFER',
    },
    {
      firstName: 'Sam',
      lastName: 'Smith',
      dateOfBirth: '1970-02-01',
      prisonNumber: 'G0014GM',
      pncNumber: '01/4567A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      moveType: 'PRISON_REMAND',
    },
    {
      firstName: 'Karl',
      lastName: 'Offender',
      dateOfBirth: '1985-01-01',
      prisonNumber: 'G0015GD',
      pncNumber: '01/5678A',
      date: '2021-09-01',
      fromLocation: 'Leeds',
      moveType: 'PRISON_TRANSFER',
    },
  ]

  beforeEach(() => {
    jest.resetAllMocks()

    controller = new ChoosePrisonerController(incomingMovementsService)
    incomingMovementsService.getIncomingMovements.mockResolvedValue(incomingMovements)
  })

  describe('view', () => {
    it('should return incoming movements', async () => {
      await controller.view()(req, res, null)

      expect(res.render).toHaveBeenCalledWith('pages/choosePrisoner.njk', {
        incomingMovements,
      })
    })

    it('should call service method correctly', async () => {
      await controller.view()(req, res, null)

      expect(incomingMovementsService.getIncomingMovements).toHaveBeenCalledWith(res.locals.user.activeCaseLoadId)
    })
  })
})
