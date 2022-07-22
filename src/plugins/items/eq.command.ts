import { MessageReaction, User } from 'discord.js'
import Antek from '../../Antek'
import { Command, commandOutput, commandArguments } from '../../types'
import Embed from '../../utils/embed'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['eq', 'ekwipunek', 'itemy', 'przedmioty', 'ek']
        this.category = 'items'
        this.usage = '[id]'
        this.description = 'Twój ekwipunek'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const emojis = {
            sell: '<:coinik:862251714903277590>',
            sellID: '862251714903277590',
            close: '<:close_embed:862271638959947776>',
            closeID: '862271638959947776'
        }

        const cache = {
            can: true
        }

        const items = Antek.db.prepare('SELECT * FROM items WHERE userID = ?').all(message.author.id)

        if (!items[0]) return {
            error: 'Nie posiadasz **żadnych** przedmiotów w ekwipunku!'
        }

        const userData = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(message.author.id)

        const action = args[0] || 'all'

        if (action == 'all') {

            let total = ''

            items.forEach(item => {

                total += `> \`[ID: ${items.indexOf(item)+1}]\` | ${item.icon} **${item.name}** *(${item.level})*\n`

            })

            return {

                author: ['Twóje WSZYSTKE przedmioty.', Antek.user.displayAvatarURL()],
                text: `**Stan konta:** \`${userData.money}\`\n\n${total.replace(/,/g, '')}`,
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                timestamp: new Date(),
                thumbnail: 'https://cdn.discordapp.com/attachments/859838930156519477/862267115108171806/backpack.png'

            }

        } else if (isFinite(parseInt(action))) {

            const dbID = parseInt(action) - 1

            if (!items[dbID]) return {
                error: `Nie posiadasz przedmiotu o ID **${action}**!`
            }

            const item = items[dbID]

            const itemEmbed = new Embed({

                author: [`Przedmiot: ${item.name}`, Antek.user.displayAvatarURL()],
                timestamp: new Date(),
                color: 'GREEN',
                footer: [`Przedmiot ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true })],
                thumbnail: 'https://cdn.discordapp.com/attachments/859838930156519477/862267115108171806/backpack.png',
                fields: [
                    [`Item`, `> ${item.icon}`, true], [`Przeznaczenie`, `> ${item.type}`, true],
                    ['Rodzaj', `> ${item.level}`], ['Wartość', `> <:coinik:862251714903277590> \`${item.price.toFixed(3)}\``, true], [`Moc`, `> ${item.power.toFixed(3)}`, true],
                    ['Zużycie', `> \`${100 - (item.use)}\` **/** \`100\``]
                ]

            }, message, true)

            const embedToSend = itemEmbed
            embedToSend.addField('Możliwości!', `> ${emojis.close} Zamyka embed.\n> ${emojis.sell} sprzedaje przedmiot.`)

            const msg = await message.channel.send({ embeds: [embedToSend]})
                await msg.react(emojis.close)
                await msg.react(emojis.sell)

            const filter = (r: MessageReaction, u: User) => {
                return (r.emoji.id === emojis.closeID || r.emoji.id === emojis.sellID) && u.id === message.author.id
            }

            const collector = await msg.createReactionCollector({ filter, time: 35000, max: 2 })

            collector.on('collect', async (reaction) => {

                const emoji = reaction.emoji.id
                await msg.reactions.removeAll()

                switch (emoji) {

                    case emojis.sellID:

                            let nowMoney = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(message.author.id)
                            Antek.db.prepare(`UPDATE users SET money = ? WHERE userID = ?`).run((nowMoney.money + item.price), message.author.id)
                            Antek.db.prepare(`DELETE FROM items WHERE userID = ? AND name = ?`).run(message.author.id, item.name)

                            itemEmbed.setFooter(`Przedmiot sprzedany!!`, message.author.displayAvatarURL({ dynamic: true }))
                            itemEmbed.setColor('ORANGE')

                            cache.can = false
                            collector.stop()

                        break;

                    case emojis.closeID:

                            msg.delete()
                            new Embed({ color: 'RED', text: 'Zamknięto ekwipunek!' }, msg)
                            cache.can = false
                            collector.stop()

                        break;

                }

            })

            collector.on('end', async () => {

                if (!cache.can) return

                await msg.reactions.removeAll()

                embedToSend.setFooter(`Czas na dodanei reakcji minął!`, message.author.displayAvatarURL({ dynamic: true }))
                embedToSend.setColor('YELLOW')
                msg.edit({ embeds: [embedToSend]})

            })

        }

    }
}