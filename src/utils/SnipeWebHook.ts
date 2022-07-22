import { TextChannel, GuildMember, User } from 'discord.js'
import { snipeInterface } from '../types'
import Antek from '../Antek'

export default class SnipeWH {

    channel: TextChannel
    data: snipeInterface

    constructor (channel: TextChannel | any, data: snipeInterface) {

        this.channel = channel
        this.data = data

        this.init()

    }

    private async init () {
        
        if (this.channel.guild.me.permissions.has('MANAGE_WEBHOOKS')) {
            const hok = await this.channel.createWebhook('Antek snipe', {
                reason: 'Na potrzeby Antek snipe.'
            })

            const u = await Antek.users.fetch(<`${bigint}`>this.data.authorID)

            const username = u.tag
            const avatarURL = u.displayAvatarURL({ dynamic: true })

            if (!this.data.attachemtns) await hok.send({ content: this.data.content, username, avatarURL })
            else await hok.send({ content: this.data.content, username, avatarURL, files: this.data.attachemtns })

            await hok.delete()

        } else {

            const u = await Antek.users.fetch(<`${bigint}`>this.data.authorID)
            if (this.data.attachemtns) await this.channel.send({ content: `> ${u.tag}: "${this.data.content}"` })

        }
        
    }

}