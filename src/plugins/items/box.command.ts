import { MessageReaction, User } from 'discord.js'
import Antek from '../../Antek'
import { Command, commandOutput, commandArguments } from '../../types'
import Embed from '../../utils/embed'
import ItemGenerator from '../../utils/items'

export default class extends Command {

    constructor () {

        super()

        this.executors = ['openbox', 'box', 'pudełko', 'kuppudełko'],
        this.description = 'Otwiera pudełko z losową zawartością!',
        this.category = 'items'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        try {

        const userItems = Antek.db.prepare('SELECT * FROM items WHERE userID = ?').all(message.author.id)
        const userData = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(message.author.id)

        let coins = userData.money
        const isPremium = userData.premium == 'true' ? true : false

        const oneBoxPrice = isPremium ? Antek.config.boxPrice.premium : Antek.config.boxPrice.standard
        const maxItems = isPremium ? 20 : 10


        // if (userItems.length >= maxItems) return {
        //     error: isPremium ? 'Nie masz już miejsca w ekwipunku :((' : 'Ups.. Brak miejsca w ekwipunku! Przejdź na **premium** i zyskaj dodatkowe 10 miejsc!'
        // }

        // if (coins < oneBoxPrice) return {
        //     error: `Nie posiadasz wystarczającej kwoty, koszt to ${oneBoxPrice}`
        // }

        const item = new ItemGenerator(message.author.id).get
        
        coins -= oneBoxPrice
        Antek.db.prepare('UPDATE users SET money = ? WHERE userID = ?').run(coins, message.author.id)

        const embed = new Embed({
            author: ['Otwarto tajnemnicze pudełko!', Antek.user.displayAvatarURL()],
            thumbnail: 'https://cdn.discordapp.com/attachments/836198573862813707/862250107952562186/QGxkc_9Vve5NjUU8aVPe4h4hcDb8FykwyBcWFyKfPlmenfgvEwQjSrd3hP1aP-feMp1loVkp_V8kwWiJSH7YIIf5Rye2hnT03Mhf.png',
            timestamp: new Date(),
            footer: [`Otworzył: ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true })],
            fields: [
                [`Wylosowano`, `> ${item.name}`, true], [`Item`, `> ${item.icon}`, true], [`Przeznaczenie`, `> ${item.value}`, true],
                ['Rodzaj', `> ${item.level}`, true], ['Wartość', `> ${item.price.toFixed(3)}`, true], [`Moc`, `> ${item.power.toFixed(3)}`, true]
            ],
            color: 'YELLOW'
        }, message, true)

        if (item.name == 'Kupon' || item.name == 'Box') embed.addField('Wow! Ten przedmiot można użyć!', '> Zachowaj go a nastęnie użyj! `Pudełko` możesz otworzyć, `Kupon` możesz wymienić na pudełko, **lub** dać komuś innemu!')

        const emojis = {
            ok: '<:green_check:815665707944771615>',
            sell: '<:coinik:862251714903277590>',
            okID: '815665707944771615',
            sellID: '862251714903277590'
        }

        embed.addField('Możliwości!', `> ${emojis.ok} dodaje przedmiot do eq.\n> ${emojis.sell} sprzedaje przedmiot.`)

        const msg = await message.channel.send({ embeds: [embed]})
            await msg.react(emojis.ok)
            await msg.react(emojis.sell)

        const filter = (r: MessageReaction, u: User) => {
            return (r.emoji.id === emojis.okID || r.emoji.id === emojis.sellID) && u.id === message.author.id
        }

        const collector = await msg.createReactionCollector({ filter, time: 35000, max: 2 })

        const c = { a: false }

        collector.on('collect', async (reaction) => {

            const emoji = reaction.emoji.id

            await msg.reactions.removeAll()

            switch (emoji) {

                case emojis.okID:

                        Antek.db.prepare(`INSERT INTO items (userID, name, icon, type, level, price, power, use) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`)
                            .run(message.author.id, item.name, item.icon, item.value, item.level, item.price, item.power, 100)
                        c.a = true
                        embed.setFooter(`Przedmiot trafił do ekwipunku.`, message.author.displayAvatarURL({ dynamic: true }))
                        embed.setColor('GREEN')
                        msg.edit({ embeds: [embed]})

                    break;

                case emojis.sellID:

                        Antek.db.prepare(`UPDATE users SET money = ? WHERE userID = ?`).run(((userData.money - oneBoxPrice) + item.price), message.author.id)
                        embed.setFooter('Przedmiot sprzedano.', message.author.displayAvatarURL({ dynamic: true }))
                        embed.setColor('ORANGE')
                        msg.edit({ embeds: [embed]})

                    break;

            }

        })

        collector.on('end', async () => {

            if (!c.a) {
                Antek.db.prepare('INSERT INTO items (userID, name, icon, type, level, price, power, use) VALUES(?, ?, ?, ?, ?, ?, ?, ?)')
                    .run(msg.author.id, item.name, item.icon, item.value, item.level, item.price, item.power, 100)

                    await msg.reactions.removeAll()

                    embed.setColor('RED')
                    embed.setFooter(`Czas minał. Przedmiot został automatycznie dodany do eq.`, message.author.displayAvatarURL({ dynamic: true }))
                    msg.edit({ embeds: [embed]})
            }

        })

        } catch (e) {}

    }

}