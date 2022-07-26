import moment from 'moment'
import { Readable } from 'stream'
import EventsRetriever from './eventsRetriever'
import { HmppsAuthClient, WelcomeClient } from '../server/data'

jest.mock('../server/data')

const welcomeClient = new WelcomeClient(null) as jest.Mocked<WelcomeClient>
const hmppsAuthClient = new HmppsAuthClient(null) as jest.Mocked<HmppsAuthClient>

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

    const events = await eventsRetriever.retrieveEventsForDay(moment('2021-07-01 09:01:01'))

    expect(events).toStrictEqual([
      ['1', '2', '3'],
      ['4', '5', '6'],
    ])

    const call = welcomeClient.getEventsCSV.mock.calls[0]

    expect(
      moment({ year: 2021, month: 6, day: 1, hour: 0, minute: 0, seconds: 0, milliseconds: 0 }).isSame(call[1])
    ).toBe(true)
    expect(call[2]).toBe(1)
  })

  it('Handles no events', async () => {
    hmppsAuthClient.getSystemClientToken.mockResolvedValue('tokens')
    welcomeClient.getEventsCSV.mockImplementation(writable => {
      Readable.from('a,b,c\n').pipe(writable)
    })

    const events = await eventsRetriever.retrieveEventsForDay(moment('2021-07-01'))
    expect(events).toStrictEqual([])
  })
})
