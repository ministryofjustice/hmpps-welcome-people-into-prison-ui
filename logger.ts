import bunyan from 'bunyan'
import bunyanFormat from 'bunyan-format'

const formatOut = bunyanFormat({ outputMode: 'short', color: true })

const logger = bunyan.createLogger({ name: 'Hmpps Welcome People Into Prison Ui', stream: formatOut, level: 'debug' })

export default logger
