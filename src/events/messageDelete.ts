import { Message } from 'discord.js'
import Antek from '../Antek'
import { snipeInterface } from '../types'

export default class {

    execute (m: Message) {

        const data: snipeInterface = {
            content: m.content,
            authorID: m.author.id,
            channelID: m.channel.id,
            guildID: m.guild.id
        }

        if (m.attachments) m.attachments.forEach((a: any) => data.attachemtns = a)

        const snipes = Antek.snipes.get(m.guild.id) || []

        snipes.push(data)

        Antek.snipes.set(m.guild.id, snipes)

    }

}