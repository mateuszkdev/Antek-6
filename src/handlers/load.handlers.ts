import { Antek } from '../Antek'
import { readdirSync } from 'fs'

import CommandsHandler from './commands.handler'
import EventsHandler from './events.handler'

export const load = (Antek: Antek) => {

    new CommandsHandler(Antek)
    new EventsHandler(Antek)

}