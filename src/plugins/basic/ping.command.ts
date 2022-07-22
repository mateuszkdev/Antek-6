import Antek from '../../Antek'
import { Command, commandOutput, commandArguments } from '../../types'

export default class extends Command {

    constructor () {

        super()

        this.executors = ['ping', 'pong', 'pingpong', 'pongping']
        this.category = 'Basic'
        this.description = 'Ping bota'

    }

    async run ({ }: commandArguments): Promise<commandOutput> {

        return {
            author: ['Ping, Pong!'],
            text: `> Ping bota wynosi: \`${Antek.ws.ping}\`ms`
        }

    }

}