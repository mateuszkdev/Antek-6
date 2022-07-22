import Antek, { EconomyUtility } from '../../Antek'
import { commandArguments, commandOutput, Command } from '../../types'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['balance', 'bal', 'money', 'portfel', 'stan', 'piniadzezalas']
        this.description = 'Sprawdź stan konta (dostęp tylko do swojego! [ Piniąszki sąsiada to nie twoja sprawa ])'
        this.category = 'economy'

    }

    async run({ message }: commandArguments): Promise<commandOutput> {

        const { money, energy, xp, level } = new EconomyUtility(message.author.id).getData()
        const data = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(message.author.id)

        return {
            author: ['Informacje o stanie konta', Antek.user.displayAvatarURL()],
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            fields: [
                ['> **Pieniądze**', `**\`${money}\`**`, true],
                ['> **Energia**', `**\`${energy}/100\`**`],
                ['> **Poziom**', `**\`${level}\`**`, true],
                ['> **XP**', `**\`${xp}\`**`, true],
                ['> **Ranking walk**', `**\`${data.rank}\`**`]
            ],
            thumbnail: message.author.displayAvatarURL({ dynamic: true })
        }

    }

}