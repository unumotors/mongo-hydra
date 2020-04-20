/* eslint no-await-in-loop: 0 */
const settings = require('../config/settings')

async function retry(f, times = 30, ms = 1000) {
  let retries = times
  let lastError
  let returnValue
  while (retries >= 0) {
    try {
      returnValue = await f()
      lastError = null
      break
    } catch (error) {
      if (settings.hydra.defaultLoggingLevel == 'debug') {
        console.error('Error in retry:')
        console.error(error)
      }
      lastError = error
    }
    retries--
    await sleep(ms)
  }

  if (lastError) throw lastError
  return returnValue
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = retry
