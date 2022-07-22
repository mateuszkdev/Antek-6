import { Command, commandOutput } from '../types'
import { Interaction, Message, MessageActionRow, MessageButton } from 'discord.js'
import Embed from './embed'
import Permissions from './permissions'
import Antek from '../Antek'
import { error } from '../utils/console'
import compontents from './components'

export default class {

    async execute (command: Command, message: Message, args: string[]) {

        try {
            const hasPerms = new Permissions().check(message.member, command.permissons, command.dev, command.disable, command.executors[0])

            if (hasPerms.perms && hasPerms.message) {
    
                new Embed({ color: '#36393f', text: hasPerms.message }, message)
    
                let output: commandOutput
    
                try {
                    output = await command.run({ message, args })
                } catch (e) {
                    error(e)
                    Antek.logs.send({
                        username: 'CommandError',
                        embeds: [{
                            description: `\`\`\`${e}\`\`\``,
                            footer: { text: `${command.executors[0]} error.` }
                        }]
                    })
                    return new Embed({ color: 'RED', text: '> Błąd komendy został zgłoszony.', author: [`Nagły błąd komendy!`] }, message)
                }
    
                if (!output) return
    
                if (!output.channel) output.channel = message.channel
    
                const embed = new Embed(output, message, true)
    
                const msg = await output.channel.send({ embed: [embed]})
    
                if (output.delete) {
                    setTimeout(() => {
                        msg.delete()
                    }, output.delete * 1000)
                }
    
            } else
    
            if (!hasPerms.perms || hasPerms.message) {
    
                if (!hasPerms.perms && !hasPerms.message) {
                    return new Embed({
    
                        color: 'RED', thumbnail: Antek.user.displayAvatarURL(),
                        text: `> **Ta komenda wymaga uprawnień:**\n${command.permissons.map(p => `\`${p}\``).join(', ')}`,
                        author: ['Brak uprawnień.', message.author.displayAvatarURL({ dynamic: true })]
        
                    }, message)
                } else 
    
                if (hasPerms.message && !hasPerms.perms) {
    
                    return new Embed({
    
                        color: 'RED', thumbnail: Antek.user.displayAvatarURL(),
                        text: `> \`${hasPerms.message}\``,
                        author: ['Brak uprawnień.', message.author.displayAvatarURL({ dynamic: true })]
        
                    }, message)
                }
    
            } else {
    
                let output: commandOutput
    
                try {
                    output = await command.run({ message, args })
                } catch (e) {
                    error(e)
                    Antek.logs.send({
                        username: 'CommandError',
                        embeds: [{
                            description: `\`\`\`${e}\`\`\``,
                            footer: { text: `${command.executors[0]} error.` }
                        }]
                    })
                    return new Embed({ color: 'RED', text: '> Błąd komendy został zgłoszony.', author: [`Nagły błąd komendy!`] }, message)
                }
    
                if (!output) return
    
                if (!output.channel) output.channel = message.channel
    
                const embed = new Embed(output, message, true)
                // const msg = await output.channel.send({ embeds: [embed]})
    
                const interactionExecute = await (new compontents(message, output, embed).start())
    
                if (!interactionExecute && output.customButtons) return
    
                const components = []
                if (output.closeButton) {
                    components.push(new MessageActionRow().addComponents(
                        new MessageButton().setCustomId('close').setLabel('Zamknij').setStyle('DANGER')
                    ))
                }
    
                const msg = await message.reply({ embeds: [embed], components: components ? components : null })
    
                const filter = (i: Interaction) => i.user.id === message.author.id
    
                const collector = msg.createMessageComponentCollector({ filter, time: 40 * 1000 })
    
                collector.on('collect', (interaction) => {
                    if (interaction.customId != 'close') return
                    message.delete()
                    msg.delete()
                    interaction.reply({ content: 'Bye amigo, szerokosci i jebac mocka', ephemeral: true })
                })
    
                collector.on('stop', (i) => {
                    return
                })
    
                if (output.delete) {
                    setTimeout(() => {
                        collector.stop()
                        msg.delete()
                    }, output.delete * 1000)
                }
    
            }
        } catch (e) {

        }

    }

}