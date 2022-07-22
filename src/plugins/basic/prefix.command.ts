import { Command, commandArguments, commandOutput } from '../../types'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['prefix', 'prfiks', 'przedrostek', 'pref']
        this.permissons = ['ADMINISTRATOR']
        this.category = 'basic'
        this.description = 'Zmień prefix Antka na serwerze.'
        this.usage = '[clear | nowy prefix]'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        if (!args[0]) return {
            error: 'Musisz podać nowy prefix! Ewenautlanie wpisac "clear" aby ustawić domyślny..'
        }

        let newPrefix = args[0] == 'clear' ? Antek.config.prefix : args[0]

        if (newPrefix.length > 5) return {
            error: 'Prefix nie może być dłuższy niż 5 znaków.'
        }

        const bannedWords = ['chuj', 'dupa', 'cycki', 'cipa', 'debil']

        if (bannedWords.includes(newPrefix.replace(/ +/gm, ""))) return {
            error: 'Nie możesz ustawić takiego prefixu.. Mamo debi...'
        }

        Antek.prefixes.set(message.guild.id, newPrefix)
        Antek.db.prepare('UPDATE prefixes SET prefix = ? WHERE gid = ?').run(newPrefix, message.guild.id)

        return {

            author: ['Zmiana prefixu', Antek.user.displayAvatarURL()],
            text: `> Pomyślnie zmieniono przefix na: \`${newPrefix}\``,
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            thumbnail: message.guild.iconURL(),
            timestamp: new Date()

        }

    }

}