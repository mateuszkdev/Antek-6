import { commandArguments, commandOutput, Command, snipeInterface } from '../../types'
import Antek from '../../Antek'
import SnipeWH from '../../utils/SnipeWebHook'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['snipe', 'odkasuj', 'niekasuj', 'oddawaj', 'paniecopan']
        this.category = 'info'
        this.description = 'Zobacz usunięte wiadomości'
        this.usage = '[id / all]'

    }

    async run({ message, args }: commandArguments): Promise<commandOutput> {
        
        let xd = Antek.snipes.get(message.guild.id) || undefined

        if (!xd) return {
            error: 'Na tym serwerze nie zostało nic usunięte'
        }

        if (!Antek.snipes.get(message.guild.id).filter(x => x.channelID == message.channel.id)) return {
            error: 'Na tym kanale nie zostało nic usunięte!'
        }

        if (args[0] == 'all') {

            let text = ''
            Antek.snipes.get(message.guild.id).filter(x => x.channelID == message.channel.id).forEach(async (snipe: snipeInterface, i: number) => {

                const u = await Antek.users.fetch(<`${bigint}`>snipe.authorID)
                text += `\`[ID: ${++i}]\` | ${u.tag} \`${snipe.content.slice(0, 10)}...\``

            })

            return {
                author: ['Lista snipe', Antek.user.displayAvatarURL()],
                text, footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })]
            }

        } else {

            if (args[0] && isNaN(parseInt(args[0])) && args[0] !== 'all') return {
                error: 'Numer snipe musi być liczbą!'
            }

            if (!args[0]) {

                if (!Antek.snipes.get(message.guild.id) && !Antek.snipes.get(message.guild.id).filter(x => x.channelID == message.channel.id)) return {
                    error: 'Brak snipe'
                }

                let data = Antek.snipes.get(message.guild.id).filter(x => x.channelID == message.channel.id).pop()
                new SnipeWH(message.channel, data)

            } else if (Antek.snipes.get(message.guild.id) && Antek.snipes.get(message.guild.id).filter(x => x.channelID)[parseInt(args[0])-1]) {

                let data = Antek.snipes.get(message.guild.id).filter(x => x.channelID == message.channel.id).reverse()[parseInt(args[0])-1]
                new SnipeWH(message.channel, data)

            } else return {
                error: 'Brak takiego snipe'
            }
 
        }

    }

}