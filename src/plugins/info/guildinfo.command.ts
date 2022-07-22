import { commandArguments, commandOutput, Command, Field } from '../../types'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['guildinfo', 'guild', 'serverinfo', 'serwerinfo', 'server', 'serwer']
        this.description = 'Informacje o serwerze.'
        this.usage = '[id?]'
        this.category = 'info'
        
    }

    async run ({ message }: commandArguments): Promise<commandOutput> {

        const guild = await Antek.guilds.cache.get(<`${bigint}`>message.guild.id)

        const tempalte = (value, name) => {
            return `**•** ${name}: \`${value}\``
        }

        return {
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            thumbnail: guild.iconURL(),
            image: guild.bannerURL() ? guild.bannerURL({ size: 2048, format: 'png' }) : '',
            author: [`Infrmacje o serwerze ${guild.name}`, Antek.user.displayAvatarURL()],
            text: [
                tempalte((await guild.fetchOwner()).user.tag, 'Właścicel'),
                tempalte(guild.memberCount, 'Ilość osób'),
                tempalte(guild.channels.cache.size, 'Ilość kanałów'),
                tempalte(guild.roles.cache.size, 'Ilość ról'),
                tempalte(guild.emojis.cache.size, 'Ilość emoji'),
                tempalte(guild.roles.highest.name, 'Najwyższa rola')
            ].join('\n')
        }

    }

}