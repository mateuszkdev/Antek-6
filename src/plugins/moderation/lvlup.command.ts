import { commandArguments, commandOutput, Command } from '../../types'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super ()

        this.category = 'moderation'
        this.description = 'Wyłącz / włącz powiadomienia o lvlup na serwerze.'
        this.executors = ['lvlup', 'notify']
        this.permissons = ['ADMINISTRATOR']
        this.usage = 'on / off'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        if (!args[0]) return {
            error: 'Musisz podać opcje! < on / off >'
        }

        const operation = (args[0] == 'on' || args[0] == 'off') ? args[0] : null

        switch (operation) {

            case 'on':

                if (!Antek.db.prepare('SELECT * FROM noNotify WHERE guildID = ?').get(message.guild.id)) return {
                    error: 'Powiadomienia są aktualnie włączone.'
                }

                Antek.db.prepare('DELETE FROM noNotify WHERE guildID = ?').run(message.guild.id)

                return {
                    author: ['Włączanie powiadomień', Antek.user.displayAvatarURL()],
                    text: '> Pomyślnie **włączono** powiadomienia o LvlUP!',
                    footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                    color: 'GREEN'
                }

            case 'off':

                if (Antek.db.prepare('SELECT * FROM noNotify WHERE guildID = ?').get(message.guild.id)) return {
                    error: 'Powiadomienia są już wyłączone.'
                }

                Antek.db.prepare('INSERT INTO noNotify (guildID) VALUES (?)').run(message.guild.id)

                return {
                    author: ['Wyłączanie powiadomień', Antek.user.displayAvatarURL()],
                    text: '> Pomyślnie **wyłączono** powiadomienia o LvlUP!',
                    footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                    color: 'ORANGE'
                }

        }

    }
    
}