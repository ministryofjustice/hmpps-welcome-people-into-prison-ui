import fs from 'fs'
import path from 'path'
import config from './config'

const packageData = JSON.parse(
  fs.readFileSync(path.join(__dirname, `${__dirname.endsWith('/dist/server') ? '../' : ''}../package.json`)).toString(),
)
const { buildNumber } = config

export default { buildNumber, packageData }
