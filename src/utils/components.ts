import { MessageButton, Message, MessageActionRow, Interaction, Collection } from 'discord.js'
import { CustomButton, commandOutput, ButtonCollector } from '../types'
import Embed from './embed'

export default class Components {

    private message: Message
    private output: commandOutput
    private embed: Embed

    constructor (message: Message, output: commandOutput, outputEmbed: Embed) {
        this.message = message
        this.output = output
        this.embed = outputEmbed
    }

    async start (): Promise<boolean> {

        try {
            if (this.output.customButtons && this.output.customButtons.length >= 1) {

                const components: MessageActionRow[] = []
    
                this.output.customButtons.forEach(x =>{ 
        
                    const row = new MessageActionRow()
                    const btn = new MessageButton()
                    x.emoji ? btn.setEmoji(x.emoji) : null
                    x.id ? btn.setCustomId(x.id) : null
                    x.style ? btn.setStyle(x.style) : null
                    x.text ? btn.setLabel(x.text) : null
                    x.url ? btn.setURL(x.url) : null
        
                    row.addComponents(btn)
                    components.push(row)
                })
    
                if (this.output.closeButton) {
                    const btn = new MessageButton()
                    .setCustomId('AntekCloseButton').setLabel('Zamknij').setStyle('DANGER')
                    components[components.length-1].addComponents(btn)
                }
        
                const msg = await this.message.reply({
                    embeds: [this.embed], components
                })
    
                if (this.output.buttonCollectors) {
    
                    const collectorActions: Collection<string, ButtonCollector> = new Collection()
        
                    this.output.buttonCollectors.forEach(e => {
                        collectorActions.set(e.id, e)
                    })
        
                    const filter = (i: Interaction) => i.user.id === this.message.author.id
                    const collector = msg.createMessageComponentCollector({ filter, time: 20 * 1000 })
        
                    collector.on('collect', async (interaction) => {
        
                        if (interaction.customId == 'AntekCloseButton') {
                            this.message.delete()
                            msg.delete()
                            interaction.reply({ content: 'Bye amigo, szerokosci i jebac mocka', ephemeral: true })
                        }
                        else if (!collectorActions.has(interaction.customId)) return
                        else return collectorActions.get(interaction.customId).execute(interaction, collector)
        
                    })
        
                    collector.on('end', () => {
                        this.embed.setFooter(`Czas interakcje minął.`)
                        msg.edit({ embeds: [this.embed] })
                    })
        
                    if (this.output.delete) {
        
                        setTimeout(() => {
        
                            collector.stop()
                            msg.delete()
        
                        }, this.output.delete * 1000)
        
                    }
        
                }
    
            } else return false
        } catch {}

    }

}