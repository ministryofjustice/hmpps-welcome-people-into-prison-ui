import moment from 'moment'
import { Readable } from 'stream'
import EventsRetriever from './eventsRetriever'
import { createMockHmppsAuthClient, createMockWelcomeClient } from '../server/data/__testutils/mocks'

const welcomeClient = createMockWelcomeClient()
const hmppsAuthClient = createMockHmppsAuthClient()

let eventsRetriever: EventsRetriever

describe('test', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    eventsRetriever = new EventsRetriever(hmppsAuthClient, () => welcomeClient)
  })

  it('Retrieves events as nested arrays', async () => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue('tokens')
    welcomeClient.getEventsCSV.mockImplementation(writable => {
      Readable.from('a,b,c\n1,2,3\n4,5,6').pipe(writable)
    })

    const dataStartDate = moment().subtract(1, 'years').startOf('day')
    const events = await eventsRetriever.retrieveEventsForPastYear()

    expect(events).toStrictEqual([
      ['1', '2', '3'],
      ['4', '5', '6'],
    ])

    const call = welcomeClient.getEventsCSV.mock.calls[0]
    expect(dataStartDate.isSame(call[1])).toBe(true)
    expect(call[2]).toBe(365)
  })

  it('Handles no events', async () => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue('tokens')
    welcomeClient.getEventsCSV.mockImplementation(writable => {
      Readable.from('a,b,c\n').pipe(writable)
    })

    const events = await eventsRetriever.retrieveEventsForPastYear()
    expect(events).toStrictEqual([])
  })
})
