import { Command, commandArguments, commandOutput } from '../../types'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['avatar', 'awatar', 'av', 'aw']
        this.description = 'Awatar użytkownika'
        this.category = 'info'
        this.usage = '[@mention | id]'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const fetchID = args[0] && args[0].replace(/[<@!>]/gim, '')  || message.author.id
        const user = await Antek.users.fetch(<`${bigint}`>fetchID)

        if (!user) return { error: 'Nie ma takiejgo użytkownika, jak? nie wiem.' }

        const avatars = {
            png: user.displayAvatarURL({ size: 2048 }).replace(/webp/gmi, 'png'),
            dynamic: user.displayAvatarURL({ dynamic: true, size: 2048 }),
            webp: user.displayAvatarURL({ size: 2048 })
        }

        return {

            author: [`Avatar ${user.tag}`, Antek.user.displayAvatarURL()],
            text: `[[PNG]](${avatars.png}) | [[WEBP]](${avatars.webp}) ${/gif/gmi.test(avatars.dynamic) ? `| [[GIF]](${avatars.dynamic})` : ''}`,
            image: avatars.dynamic,
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })]

        }

    }

}