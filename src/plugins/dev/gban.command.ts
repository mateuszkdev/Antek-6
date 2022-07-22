import { Command, commandOutput, commandArguments} from '../../types'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['gban', 'dzifko', 'won', 'kek', 'XDD', 'nodebil', 'mocek']
        this.category = 'dev',
        this.description = 'Globalne banowanko na bota'
        this.usage = '[@mention | id] [powód]'
        this.dev = true

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        if (!args[0]) return {
            error: 'Musisz podać metodę! ban/unban'
        }

        switch (args[0]) {

            case 'ban':

                if (!args[1]) return {
                    error: 'Musisz podać osobę!'
                } 

         
                let target = await Antek.users.fetch(<`${bigint}`>args[1].replace(/[<@!>]/gim, '')) ?? message.mentions.members.first().user
        
                let reason = args[2] ? args.slice(2).join(" ") : 'Nie podano dokładnego powodu, ale prawdopodobnie dlatego że jesteś amebą'
        
                let id = target.id ? target.id : args[1]
        
                if (Antek.gbans.get(id)) return {
                    error: 'Ta osoba jest już globalnie zbanowana!'
                }
        
                Antek.db.prepare('INSERT INTO gbans (userID, reason) VALUES(?, ?)').run(id, reason)
                Antek.gbans.set(id, { reason })

                return {

                    color: 'GREEN', author: ['Poszeeeedł 102 metry', Antek.user.displayAvatarURL()],
                    footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                    thumbnail: target.id ? target.displayAvatarURL({ dynamic: true }) : '',
                    fields: [
                        ['> **Globalnie zbanowano**', `${target.id ? `**\`${target.tag}\`**` : `**\`${id}\`(brak osoby w cache)**`}`, true],
                        ['> **Powód**', reason, true]
                    ]

                }

            case 'unban':

                if (!args[1]) return {
                    error: 'Musisz podać osobę!'
                } 
         
                let target2 = await Antek.users.fetch(<`${bigint}`>args[1].replace(/[<@!>]/gim, '')) ?? message.mentions.members.first().user
                
                let id2 = target2.id ? target2.id : args[1]
        
                if (!Antek.gbans.get(id2)) return {
                    error: 'Ta osoba nie jest globalnie zbanowana!'
                }
        
                Antek.db.prepare('DELETE FROM gbans WHERE userID = ?').run(id2)
                Antek.gbans.delete(id2)

                return {

                    color: 'GREEN', author: ['Łoo panie ale londowanie', Antek.user.displayAvatarURL()],
                    footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                    thumbnail: target2.id ? target2.displayAvatarURL({ dynamic: true }) : '',
                    fields: [
                        ['> **Globalnie odbanowano**', `${target2.id ? `**\`${target2.tag}\`**` : `**\`${id2}\`(brak osoby w cache)**`}`, true]
                    ]

                }


            default: return {
                error: 'Nie ma takiej metody.'
            }

        }

    }

}