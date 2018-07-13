import * as moment from 'moment'

/**
 * format time into human readable format using moment
 * @param time
 */
export function formatTime(time: number, format: string = 'HH:mm:ss') {
  const momentTime = time * 1000
  return moment.utc(momentTime).format(format)
}
