import { Antek } from '../Antek'
import { readdirSync } from 'fs'

import { error } from '../utils/console'

const ascii = require('ascii-table')
const table = new ascii("Events")
table.setHeading("FileName", "Status")

const preTableLog = (eventName: string) => (status: string) => {
    table.addRow(eventName, status)
}

export default class EventsHandler {

    constructor (Antek: Antek) {

        readdirSync(`${__dirname}/../events/`)
            .filter(f => f.endsWith('.js') && !f.startsWith('--'))
            .forEach(file => {

                const log = preTableLog(file)

                try {
                    
                    const eventName = file.split('.')[0]

                    const event = require(`${__dirname}/../events/${file}`)
                    
                    Antek.on(eventName, (...args) => new event.default().execute(...args))
                    log('✅')

                } catch (e) {
                    error(e)
                    log('❌')
                }

            })

            console.log(table.toString())

    }

}