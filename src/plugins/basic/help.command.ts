import { Command, commandOutput, Field, commandArguments } from '../../types'
import Antek from '../../Antek'
import { readdirSync } from 'fs'
import Embed from '../../utils/embed'
import { MessageActionRow, MessageButton } from 'discord.js'

export default class extends Command {

    constructor () {

        super () 

        const XD = new Date().getDate()

        this.executors = ['help', 'pomoc', 'p', 'h', `${XD}`]
        this.category = 'basic'
        this.description = 'Pomoc z botem'
        this.usage = '[komenda]'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const emoji = '<a:ogloszenia:836509403251343360>'
        const emojiLink = 'https://cdn.discordapp.com/emojis/836509403251343360.gif?v=1'

        if (!args[0]) {

            const embed = new Embed({
                thumbnail: Antek.user.displayAvatarURL(),
                author: [`Menu pomocy`, `${emojiLink}`],
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                timestamp: new Date(),
                text: [

                    `__**\`Prefix\`**__  \`${Antek.prefixes.get(message.guild.id)}\n\``,

                    `__**\`Komendy\`**__ \`${Antek.prefixes.get(message.guild.id)}pomoc komendy\n\``,

                    '**`Linki`**',
                    `> [[SUPPORT]](https://mateusz.ml/djshelp)`,
                    `> [[DEVELOPER]](https://mateusz.ml)`,
                    `> [[QUICK HELP]](https://mateusz.ml/dm)`,

                ].join('\n')

            }, message, true)

            message.reply({
                embeds: [embed],
                components: [
                    new MessageActionRow().addComponents(new MessageButton().setStyle('LINK').setURL('https://discord.com/api/oauth2/authorize?client_id=544180497522098177&permissions=8&scope=bot').setLabel('DODAJ MNIE'))
                ]
            })
            
            return

        } if (args[0] == 'komendy') {

            let text = ''

            readdirSync(`${__dirname}/../`).forEach(c => {

                if (c.toLowerCase() == 'dev' && !Antek.config.devsIDs.includes(message.author.id)) return

                const commands = Antek.commands.filter(cmd => cmd.category === c)
                text += `> **${c[0].toUpperCase()}${c.slice(1).toLowerCase()}**\n${commands.map(cmd => `\`${cmd.executors[0]}\` `).join(', ')}\n\n`
                
            })

            return {

                thumbnail: Antek.user.displayAvatarURL(),
                author: ['Menu pomocy - komendy', `${emojiLink}`],
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                timestamp: new Date(),
                text

            }

        } else {

            if (Antek.commands.get(Antek.aliases.get(args[0])) || Antek.commands.get(args[0])) {

                const command = Antek.commands.get(Antek.aliases.get(args[0])) ?? Antek.commands.get(args[0])

                if (!command) return { error: 'Błąd XD' }

                const temp = (a: string, b: string): Field => {
                    return [`> **${a}**`, `**\`${b}\`**`, true]
                }

                const permissionsNames = require('../../../permissions.json')

                return {

                    thumbnail: Antek.user.displayAvatarURL(),
                    author: [`Pomoc: ${command.executors[0]}`, `${emojiLink}`],
                    footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                    fields: [
                        temp('Nazwa', `${command.executors[0]}`),
                        temp('Kategoria', `${command.category}`),
                        ['> **Aliases**', `${command.executors.slice(1).map(e => `\`${e}\``).join(', ')}`],
                        temp('Dostępność', `${command.disable ? 'Wyłączona' : 'Włączona'}`),
                        temp('Developerska?', `${command.dev ? 'Tak' : 'Nie'}`),
                        ['> **Wymagane uprawnienia**', `${command.permissons ? command.permissons.map((p: any) => `${permissionsNames[p]}`) : '**`Brak`**'}`],
                        temp('Użycie', `${command.usage ? command.usage : '**`Brak`**'}`),
                        temp('Opis', `${command.description ? command.description : '**`Brak`**'}`)
                    ]

                }

            } else return {
                error: `Nie ma takiej komendy! Wpisz ${Antek.prefixes.get(message.guild.id)}pomoc komendy`
            }

        }
                
    }

}