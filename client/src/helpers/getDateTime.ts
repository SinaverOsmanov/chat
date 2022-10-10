import {format} from 'date-fns'

export function getDateTime(date: Date) {

    const newDate = format(date, 'd/M/y')
    const time = format(date, 'HH:mm')

    return {newDate, time}
}