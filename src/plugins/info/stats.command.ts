import { commandArguments, commandOutput, Command } from '../../types'
import Antek from '../../Antek'
import os from 'os'
import { version } from 'discord.js'

import 'dayjs/locale/pl'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('pl')

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['stats', 'mem', 'botstats', 'botinfo']
        this.category = 'info'
        this.description = 'Informacje o Antku'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        let count = 0
        Antek.guilds.cache.map(g => count += g.memberCount)

        return {

            author: ['Statystyki Antka', Antek.user.displayAvatarURL()],
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            fields: [
                [`> **Statystki Antka**`, [
                    `**•** Osoby: \`(cache: ${Antek.users.cache.size}) (wszystkie: ${count})\``,
                    `**•** Serwery: \`${Antek.guilds.cache.size}\``,
                    `**•** Kanały: \`${Antek.channels.cache.size}\``,
                    `**•** Komendy: \`${Antek.commands.size}\``,
                    `**•** Gbany: \`${Antek.gbans.size}\``
                ].join('\n')],
                ['> **Statystyki zasobów**', [
                    `**•** Pamięć RAM: \`${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB\``,
                    `**•** Procesor: \`${os.cpus().shift().model}\``,
                    `**•** Ping API: \`${Antek.ws.ping}ms\``
                ].join('\n')],
                ['> **Wersje**', [
                    `**•** Antek: \`6\``,
                    `**•** Discord.js: \`v${version.split('-')[0]}\``,
                    `**•** NodeJS: \`${process.version}\``
                ].join('\n')],
                ['> **Uptime**', [
                    `**•** API: \`${dayjs.duration(-Antek.uptime).humanize(true)}\``,
                    `**•** Node: \`${dayjs.duration(-process.uptime() * 1000).humanize(true)}\``,
                    `**•** OS: \`${dayjs.duration(-os.uptime() * 1000).humanize(true)}\``
                ].join('\n')]
            ]

        }

    }

}