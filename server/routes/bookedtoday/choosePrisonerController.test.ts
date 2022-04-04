import { Arrival, SexKeys, PotentialMatch } from 'welcome'
import type { Express } from 'express'
import request from 'supertest'
import * as cheerio from 'cheerio'
import { user, appWithAllRoutes, stubCookie } from '../__testutils/appSetup'
import { expectSettingCookie } from '../__testutils/requestTestUtils'

import ExpectedArrivalsService, { LocationType } from '../../services/expectedArrivalsService'
import { State } from './arrivals/state'

jest.mock('../../services/expectedArrivalsService')

const expectedArrivalsService = new ExpectedArrivalsService(null, null) as jest.Mocked<ExpectedArrivalsService>

let app: Express

beforeEach(() => {
  stubCookie(State.newArrival, {
    firstName: 'Harry',
    lastName: 'Stanton',
    dateOfBirth: '1961-01-01',
    pncNumber: '01/123456',
    expected: true,
  })
  app = appWithAllRoutes({ services: { expectedArrivalsService } })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /confirm-arrival/choose-prisoner', () => {
  const expectedArrivalsGroupedByType = new Map()
  expectedArrivalsGroupedByType.set(LocationType.COURT, [
    {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1971-01-01',
      prisonNumber: 'G0013AB',
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_REMAND',
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
  ])
  expectedArrivalsGroupedByType.set(LocationType.PRISON, [
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
  ])
  expectedArrivalsGroupedByType.set(LocationType.CUSTODY_SUITE, [
    {
      firstName: 'Mark',
      lastName: 'Prisoner',
      dateOfBirth: '1985-01-05',
      prisonNumber: 'G0016GD',
      pncNumber: '01/6789A',
      date: '2021-09-01',
      fromLocation: 'Coventry',
      moveType: 'PRISON_RECALL',
    },
    {
      firstName: 'Barry',
      lastName: 'Smith',
      dateOfBirth: '1970-01-01',
      prisonNumber: 'G0012HK',
      pncNumber: '01/2345A',
      date: '2021-09-01',
      fromLocation: 'Sheffield',
      moveType: 'PRISON_RECALL',
    },
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
  ])
  expectedArrivalsGroupedByType.set(LocationType.OTHER, [
    {
      firstName: 'Steve',
      lastName: 'Smith',
      dateOfBirth: '1985-05-05',
      prisonNumber: 'G0015GF',
      pncNumber: '01/5568B',
      date: '2021-09-01',
      fromLocation: 'Manchester',
      moveType: 'COURT_APPEARANCE',
    },
    {
      firstName: 'Harry',
      lastName: 'Stanton',
      dateOfBirth: '1961-01-01',
      prisonNumber: null,
      pncNumber: '01/3456A',
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_REMAND',
    },
  ])

  beforeEach(() => {
    expectedArrivalsService.getArrivalsForToday.mockResolvedValue(expectedArrivalsGroupedByType)
  })

  it('should render /confirm-arrival/choose-prisoner page', () => {
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        const $ = cheerio.load(res.text)
        expect($('h1').text()).toContain('Select prisoner to add to the establishment roll')
      })
  })

  it('should call service method correctly', () => {
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(res => {
        expect(expectedArrivalsService.getArrivalsForToday).toHaveBeenCalledWith(user.activeCaseLoadId)
      })
  })

  it('should handle unexpected server error', () => {
    expectedArrivalsService.getArrivalsForToday.mockRejectedValue(new Error('an error occurred'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner')
      .expect(500)
      .expect('Content-Type', 'text/html; charset=utf-8')
  })
})

describe('GET /confirm-arrival/choose-prisoner/:id', () => {
  const arrival = ({
    isCurrentPrisoner,
    fromLocationType,
    prisonNumber,
    pncNumber,
    potentialMatches,
  }: {
    isCurrentPrisoner: boolean
    fromLocationType: LocationType
    prisonNumber: string
    pncNumber: string
    potentialMatches: PotentialMatch[]
  }) =>
    ({
      id: '1111-2222-3333-4444',
      firstName: 'Harry',
      lastName: 'Stanton',
      dateOfBirth: '1961-01-01',
      prisonNumber,
      pncNumber,
      date: '2021-09-01',
      fromLocation: 'Reading',
      moveType: 'PRISON_REMAND',
      potentialMatches,
      isCurrentPrisoner,
      fromLocationType,
    } as Arrival)

  describe('from court', () => {
    it('should clear cookie', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: 'A1234AA',
          pncNumber: '01/123456',
          fromLocationType: LocationType.COURT,
          isCurrentPrisoner: true,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect(res => {
          expectSettingCookie(res, State.newArrival).toBeUndefined()
        })
    })

    it('should redirect to court transfer when current', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: 'A1234AA',
          pncNumber: '01/123456',
          fromLocationType: LocationType.COURT,
          isCurrentPrisoner: true,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/check-court-return')
    })

    it('should redirect to search when not current and no identifiers', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: undefined,
          pncNumber: undefined,
          fromLocationType: LocationType.COURT,
          isCurrentPrisoner: false,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/search-for-existing-record/new')
    })

    it('should redirect to single match', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: undefined,
          pncNumber: '01/123456',
          fromLocationType: LocationType.COURT,
          isCurrentPrisoner: false,
          potentialMatches: [
            {
              firstName: 'Harry',
              lastName: 'Stanton',
              dateOfBirth: '1961-01-01',
              prisonNumber: 'A1234BC',
              pncNumber: '01/123456',
              sex: SexKeys.MALE,
            },
          ],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/record-found')
    })

    it('should redirect to multiple matches', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: undefined,
          pncNumber: '01/123456',
          fromLocationType: LocationType.COURT,
          isCurrentPrisoner: false,
          potentialMatches: [
            {
              firstName: 'Harry',
              lastName: 'Stanton',
              dateOfBirth: '1961-01-01',
              prisonNumber: 'A1234BC',
              pncNumber: '01/123456',
              sex: SexKeys.MALE,
            },
            {
              firstName: 'Hurry',
              lastName: 'Stenton',
              dateOfBirth: '1961-01-02',
              prisonNumber: 'A1234BD',
              pncNumber: '01/12345&',
              sex: SexKeys.MALE,
            },
          ],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/possible-records-found')
    })

    it('should redirect to no match', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: undefined,
          pncNumber: 'A1234AA',
          fromLocationType: LocationType.COURT,
          isCurrentPrisoner: false,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/no-record-found')
    })
  })

  describe('from custody suite', () => {
    it('should redirect to feature not available', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: 'A1234AA',
          pncNumber: '01/123456',
          fromLocationType: LocationType.CUSTODY_SUITE,
          isCurrentPrisoner: true,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/feature-not-available')
    })

    it('should redirect to search when not current and no identifiers', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: undefined,
          pncNumber: undefined,
          fromLocationType: LocationType.CUSTODY_SUITE,
          isCurrentPrisoner: false,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/search-for-existing-record/new')
    })

    it('should redirect to search results when not current and PNC provided', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: '01/123456',
          pncNumber: undefined,
          fromLocationType: LocationType.CUSTODY_SUITE,
          isCurrentPrisoner: false,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/no-record-found')
    })

    it('should redirect to search results when not current and Prison Number provided', () => {
      expectedArrivalsService.getArrival.mockResolvedValue(
        arrival({
          prisonNumber: '01/123456',
          pncNumber: undefined,
          fromLocationType: LocationType.CUSTODY_SUITE,
          isCurrentPrisoner: false,
          potentialMatches: [],
        })
      )
      return request(app)
        .get('/confirm-arrival/choose-prisoner/aaa-111-222')
        .expect('Content-Type', /text\/plain/)
        .expect('Location', '/prisoners/1111-2222-3333-4444/no-record-found')
    })
  })

  it('should call service method correctly', () => {
    expectedArrivalsService.getArrival.mockResolvedValue(
      arrival({
        prisonNumber: 'A1234AA',
        pncNumber: '01/123456',
        fromLocationType: LocationType.COURT,
        isCurrentPrisoner: true,
        potentialMatches: [],
      })
    )
    return request(app)
      .get('/confirm-arrival/choose-prisoner/aaa-111-222')
      .expect(res => {
        expect(expectedArrivalsService.getArrival).toHaveBeenCalledWith('aaa-111-222')
      })
  })

  it('should handle unexpected server error', () => {
    expectedArrivalsService.getArrival.mockRejectedValue(new Error('an error occurred'))
    return request(app)
      .get('/confirm-arrival/choose-prisoner/aaa-111-222')
      .expect(500)
      .expect('Content-Type', 'text/html; charset=utf-8')
  })
})
