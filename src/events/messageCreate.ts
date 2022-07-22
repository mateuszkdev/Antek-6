import { Emoji, Message } from 'discord.js'
import Antek, { EconomyUtility } from '../Antek'
import { Command } from '../types'

import prefixUtil from '../database/dbUtils/preparePrefix'
import executeCommand from '../utils/executeCommand'
import Embed from '../utils/embed'

export default class {

    async execute (message: Message) {

        if (!message.guild || message.author.bot 
            // || message.author.id == '290881759732563982'
             ) return

        const eco = new EconomyUtility(message.author.id)
        eco.repair()
        eco.updateXP(message)
        eco.updateEnergy()

        if (!Antek.prefixes.get(message.guild.id)) {

            const dbPrefix = new prefixUtil()

            const isInDb = await dbPrefix.check(message.guild.id)

            if (!isInDb) {
                Antek.prefixes.set(message.guild.id, await dbPrefix.insert(message.guild.id, Antek.config.prefix))
            } else {
                Antek.prefixes.set(message.guild.id, await Antek.db.prepare('SELECT prefix FROM prefixes WHERE gid = ?').get(message.guild.id).prefix)
            }

        }

        if (!Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(message.author.id)) {
            Antek.db.prepare('INSERT INTO users (userID, money, rank, premium) VALUES (?, ?, ?, ?)')
                .run(message.author.id, 0, 0, 'false')
        }
        
        const prefix = process.argv[2] == 'beta' ? Antek.config.prefixBeta : Antek.prefixes.get(message.guild.id)

        const regexps = [new RegExp(`<@!${Antek.user.id}>`), new RegExp(`<@${Antek.user.id}>`)]
        regexps.forEach(r => {
            if (r.test(message.content)) return new Embed({ 
                text: `> <a:ogloszenia:836509403251343360> Prefix na tym serwerze: \`${prefix}\``, 
                thumbnail: Antek.user.displayAvatarURL(), 
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })], 
                author: ['Ping? Pong', Antek.user.displayAvatarURL()] 
            }, message)
        })


        if (!message.content.startsWith(prefix)) return

        if (Antek.gbans.get(message.author.id)) return new Embed({
            color: 'RED',
            author: ['No przypau..', 'https://cdn.discordapp.com/emojis/792065860038295612.gif?v=1'],
            footer: ['', message.author.displayAvatarURL({ dynamic: true })],
            fields: [
                ['> Globalna blokada', '`Możesz odwołać się na serwerze wsparcia!`'],
                ['> **Powód**', `\`${(Antek.gbans.get(message.author.id).reason)}\``]
            ]
        }, message)

        const [cmdName, ...args] = message.content.slice(prefix.length).split(/ +/gm)

        let command: Command | undefined

        command = Antek.commands.get(Antek.aliases.get(cmdName.toLowerCase())) ?? Antek.commands.get(cmdName.toLowerCase())

        if (!command) return

        new executeCommand().execute(command, message, args)

    }

}