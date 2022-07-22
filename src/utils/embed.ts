import { MessageEmbed, Message } from 'discord.js'
import { commandOutput } from '../types'
import { colors } from '../Antek'

export default class Embed extends MessageEmbed {

    input: commandOutput
    message: Message

    constructor (input: commandOutput, message?: Message, dontSend?: boolean) {

        super ()

        this.input = input
        this.message = message

        if (!this.input.error) {
            if (this.input.author) this.setAuthor(this.input.author[0], this.input.author[1], this.input.author[2])
            if (this.input.color) this.setColor(this.input.color)
            else this.setColor(colors.succes)
    
            if (this.input.timestamp) this.setTimestamp()
            if (this.input.text)  this.input.text.length < 4096 ? this.setDescription(this.input.text) : this.setDescription(this.input.text.substring(0, 4082) + '...more')
            if (this.input.footer) this.setFooter(this.input.footer[0], this.input.footer[1])
            if (this.input.image) this.setImage(this.input.image)
            if (this.input.thumbnail) this.setThumbnail(this.input.thumbnail)
            if (this.input.field) this.addField(...this.input.field)
            if (this.input.fields) {
                this.input.fields.forEach(field => {
                    this.addField(...field)
                })
            }
        } else {
            this.setDescription(this.input.error)
            this.setColor('RED')
            this.setAuthor('Mamy problem!')
        }

        if (!dontSend) {
            this.message.channel.send({ embeds: [this]})
        }

    }

}
