type NotifyClientStub = {
  sendEmail: (...args: unknown[]) => Promise<void>
}

const notifyClientStub: NotifyClientStub = {
  async sendEmail() {
    return undefined
  },
}

export default notifyClientStub
