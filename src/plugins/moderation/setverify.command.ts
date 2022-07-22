import { commandArguments, commandOutput, Command } from '../../types'
import Antek from '../../Antek'
import Verify from '../../utils/verificationSystem'
import { MessageEmbed, TextChannel } from 'discord.js'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['ustawweryfikacje', 'setverify']
        this.permissons = ['MANAGE_GUILD', 'ADMINISTRATOR']
        this.description = 'Ustaw najelpsza weryfikacje ever na serwerze!'
        this.category = 'moderation'
        this.usage = '[#channel] [@role] [Text embedu]'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        if (!args[0]) return {
            error: 'Musisz podać kanał'
        }

        if (!message.mentions.channels.first()) return {
            error: 'Musisz oznaczyć kanał.'
        }

        if (!args[1] || !message.mentions.roles.first()) return {
            error: 'Musisz podać rolę która ma dawać bot!'
        }

        if (!args[2]) return {
            error: 'Podaj tekst który ma się znaleść w embedzie weryfikacji.'
        }

        const channel = message.mentions.channels.first() as TextChannel
        const role = message.mentions.roles.first()
        const components = await new Verify().first()
        const text = args.slice(2).join(' ')
    
        Antek.db.prepare('INSERT INTO verify (gid, channelID, roleID, messageID, text) VALUES (?, ?, ?, ?, ?)')
            .run(message.guild.id, channel.id, role.id, message.id, text)

        const antek = await message.guild.members.fetch(<`${bigint}`>Antek.user.id)
        const antekRole = antek.roles.highest

        channel.send({
            components,
            embeds: [
                new MessageEmbed()
                    .setAuthor('Weryfikacja', Antek.user.displayAvatarURL())
                    .setColor(antekRole.color)
                    .setDescription(text)
            ]
        })
    
        return {
            text: 'Success! Pomyślnie ustawiono weryfikację!',
            color: 'LUMINOUS_VIVID_PINK',
            closeButton: true,
            thumbnail: message.guild.iconURL(),
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            author: ['System weryfikacji.', Antek.user.displayAvatarURL()]
        }

    }

}