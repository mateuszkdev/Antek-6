import { MessageEmbed } from 'discord.js'
import { commandArguments, commandOutput, Command } from '../../types'

import { MessageActionRow, MessageSelectMenu } from 'discord.js'

const embed = new MessageEmbed().setDescription('test')

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['test']
        
    }

    async run ({ message }: commandArguments): Promise<commandOutput> {

        return {
            text: 's',
            image: 'https://cdn.discordapp.com/banners/395266229436153868/a_983923a5c4e2641891074114a17207db.png?size=2048'
        }

    }

}