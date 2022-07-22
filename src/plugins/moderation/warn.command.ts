import { commandArguments, commandOutput, Command } from '../../types'
import Antek from '../../Antek'
import Embed from '../../utils/embed'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['warn', 'w', 'uwazajsobie', 'idiotoXD', 'stopPierdoling']
        this.description = 'Ostrzeż użytkownika jeśli mu odbija palma! XD'
        this.usage = '[@mention | id] [reason]'
        this.permissons = ['MANAGE_MESSAGES']
        this.category = 'moderation'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const member =  await message.guild.members.fetch(<`${bigint}`>args[0].replace(/[<@!>]/gim, '')) ||
                        message.guild.members.cache.find(m => m.user.tag === args[0]) ||
                        message.mentions.members.first()

        if (member?.user.id) {

            if (member.user.id == message.author.id) return {
                error: 'Nie no, nie można dać warna samemu sobie.'
            }

            if (member.user.id == Antek.user.id) return {
                error: 'Antkowi warna chcesz dać? Co z tobą człowieku!'
            }
            
            if (member.user.bot) return {
                error: 'Warna botu nie można dać.'
            }

            if (member.permissions.has('ADMINISTRATOR')) return {
                error: 'Nie możesz dać warna osobie która ma permissje ADMINISTRATOR'
            }

            const reason = args.slice(1).join(" ") || 'Nie podano dokładnego powodu.'

            const id = Antek.casemanager.getID(message.guild.id)

            Antek.casemanager.add('warn', message.guild.id, member.user.id, reason, message.author.id, new Date().toString())

            member?.user.send({ embeds: [
                new Embed({
                    author: ['Ostrzeżenie!!', Antek.user.displayAvatarURL()],
                    color: 'ORANGE',
                    timestamp: new Date(),
                    footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                    thumbnail: message.guild.iconURL(),
                    fields: [
                        ['> **Serwer**', `**\`${message.guild.name}\`**`, true],
                        ['> **Powód**', `**\`${reason}\`**`, true]
                    ]
                }, message, true)
            ]})

            return {

                author: ['Ostrzeżenie!!', Antek.user.displayAvatarURL()],
                color: 'ORANGE',
                timestamp: new Date(),
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                thumbnail: message.guild.iconURL(),
                fields: [
                    ['> **Case ID**', `**\`${id}\`**`, true],
                    ['> **Osoba**', `**\`${member.user.tag}\`**`, true],
                    ['> **Moderator**', `${message.author}`, false],
                    ['> **Powód**', `**\`${reason}\`**`, true]
                ]

            }

        } else return {
            error: 'Musisz podać poprawnie osobę która ma dostać warna.'
        }

        return

    }

}