import { Command, commandOutput, commandArguments} from '../../types'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['command', 'cmd', 'c', 'niedlapsa']
        this.description = 'Wyłącza / włącza komendę.'
        this.category = 'dev'
        this.usage = 'on/off [name]'
        this.dev = true

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const action = args[0]
        const name = args[1]

        const allowedActions = ['on', 'off']

        if (!allowedActions.includes(action)) return {
            error: 'Nieznana opcja komendy.'
        }

        const command = Antek.commands.get(Antek.aliases.get(name)) ?? Antek.commands.get(name)

        if (!command) return {
            error: 'Nie ma takiej komendy!'
        }

        if (command.executors[0] == 'command') return {
            error: 'Nie możesz wyłączyć komendy do wyłączania komend XDD'
        }

        switch (action) {

            case 'on':

                    if (!command.disable) return {
                        error: 'Komenda jest już włączona.'
                    }

                    command.disable = false

                    Antek.commands.set(command.executors[0], command)

                    return {
                        author: [`Włączanie komendy.`, Antek.user.displayAvatarURL()],
                        text: `> Pomyślnie **włączono** komendę \`${command.executors[0]}\``,
                        footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                        color: 'GREEN'
                    }

                break;

            case 'off':

                    if (command.disable) return {
                        error: 'Komenda jest już wyłączona.'
                    }

                    command.disable = true

                    Antek.commands.set(command.executors[0], command)

                    return {
                        author: [`Wyłączanie komendy.`, Antek.user.displayAvatarURL()],
                        text: `> Pomyślnie **wyłączono** komendę \`${command.executors[0]}\``,
                        color: 'ORANGE',
                        footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })]
                    }

                break;

        }


    }

}