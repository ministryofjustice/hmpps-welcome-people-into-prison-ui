import moment from 'moment'
import { Readable } from 'stream'
import EventsRetriever from './eventsRetriever'
import { createMockWelcomeClient } from '../server/data/__testutils/mocks'

const welcomeClient = createMockWelcomeClient()

let eventsRetriever: EventsRetriever

describe('test', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    eventsRetriever = new EventsRetriever(welcomeClient)
  })

  it('Retrieves events as nested arrays', async () => {
    welcomeClient.getEventsCSV.mockImplementation(writable => {
      Readable.from('a,b,c\n1,2,3\n4,5,6').pipe(writable)
    })

    const dataStartDate = moment().subtract(6, 'months').startOf('day')
    const events = await eventsRetriever.retrieveEventsForPastSixMonths()

    expect(events).toStrictEqual([
      ['1', '2', '3'],
      ['4', '5', '6'],
    ])

    const call = welcomeClient.getEventsCSV.mock.calls[0]
    expect(dataStartDate.isSame(call[1])).toBe(true)
    expect(call[2]).toBe(183)
  })

  it('Handles no events', async () => {
    welcomeClient.getEventsCSV.mockImplementation(writable => {
      Readable.from('a,b,c\n').pipe(writable)
    })

    const events = await eventsRetriever.retrieveEventsForPastSixMonths()
    expect(events).toStrictEqual([])
  })
})
