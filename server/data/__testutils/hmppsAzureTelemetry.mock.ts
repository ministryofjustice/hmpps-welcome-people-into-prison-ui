const telemetry = {
  processors: {
    filterSpanWherePath: jest.fn(),
    enrichSpanNameWithHttpRoute: jest.fn(),
  },
  setSpanAttributes: jest.fn(),
}

const initialiseTelemetry = jest.fn().mockReturnValue({
  addFilter: jest.fn().mockReturnThis(),
  addModifier: jest.fn().mockReturnThis(),
  startRecording: jest.fn(),
})

const flushTelemetry = jest.fn().mockResolvedValue(undefined)

export { initialiseTelemetry, flushTelemetry, telemetry }
