import Antek from '../../Antek'
import { commandArguments, commandOutput, Command } from '../../types'
import permissions from '../../utils/permissions'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['perms', 'permissions', 'permissje', 'uprawnienia', 'perm', 'maszpan']
        this.category = 'moderation'
        this.permissons = ['MANAGE_GUILD', 'ADMINISTRATOR']
        this.description = 'Custom uprawnienia dla komend na role / użytkownika'
        this.usage = '<allow / deny> <id roli / wzmianka roli / id użytkownika / wzmianka użytkownika > [nazwa komendy (może być alias)]'

    }

    async run({ message, args }: commandArguments): Promise<commandOutput> {
        
        interface dbD  {
            id?: string; cmdName?: string;
        }
        const dbData: dbD = {}

        const operation = (args[0] && args[0] == 'allow' || args[0] == 'deny' || args[0] == 'list') ? args[0] : undefined
        if (!operation) return {
            error: 'Musisz podać pierwszy argument. ( allow / deny / list )'
        }

        if (operation == 'list') {

            const allowed = Antek.db.prepare('SELECT * FROM perms WHERE guildID = ?').all(message.guild.id)

            let text = ''

            allowed.forEach(e => {

                let rORm: 'r' | 'm'
                try {
                    let x = message.guild.roles.cache.get(<`${bigint}`>e.id)
                    if (x.name) rORm = 'r'
                } catch {}

                try {
                    if (rORm == 'r') return
                    let xd = message.guild.members.cache.get(<`${bigint}`>e.id)
                    if (xd.user) rORm = 'm'
                } catch {}

                if (!rORm) return

                switch (rORm) {
                    case 'm':
                            const m = message.guild.members.cache.get(<`${bigint}`>e.id) 
                            text += `\`[ALLOW]\` ${m} **-** ${e.name}\n`
                        break;
                    case 'r': 
                            const r = message.guild.roles.cache.get(<`${bigint}`>e.id)
                            text += `\`[ALLOW]\` ${r} **-** ${e.name}\n`
                        break;
                    default: return
                }

            })

            text.length <= 1 ? text = '\`Brak\`' : null

            return {

                text,
                author: ['Custom permissje', Antek.user.displayAvatarURL()],
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],

            }

        }

        let roleORmember: 'role' | 'member'
        
        if (!args[1]) return {
            error: 'Musisz podać osobę lub rolę <id roli / wzmianka roli / id użytkownika / wzmianka użytkownika>'
        }

        let ID: string = args[1].replace(/[<@!&>]/gmi, '')

        if (!args[2]) return {
            error: 'Musisz podać nazwę komendy (może być też alias)'
        }

        if (Antek.aliases.has(args[2])) {
            const aliasCMD =  Antek.commands.get(Antek.aliases.get(args[2]))
            if (aliasCMD.executors[0]) dbData.cmdName = aliasCMD.executors[0]
        }
        else if (Antek.commands.has(args[2])) dbData.cmdName = args[2]
        else return {
            error: 'Nie ma takiej komendy!'
        }

        if (Antek.commands.get(dbData.cmdName).category == 'dev') return {
            error: 'Nie możesz nadawać praw do komendy developerskiej!'
        }

        const permsUtil = new permissions()

        const cmd = Antek.commands.get(dbData.cmdName)

        if (!cmd.permissons) return {
            error: 'Ta komenda jest dostępna dla każdego!'
        }

        let hasP = permsUtil.check(message.member, cmd.permissons, cmd.dev, cmd.disable, cmd.executors[0])

        if (!hasP) return {
            error: 'Nie udało się sprawdzić uprawnień komendy.'
        }

        if (hasP.message) return {
            error: hasP.message
        }

        if (!hasP.perms) return {
            error: 'Nie możesz zmieniać uprawnień do komendy do której NIE MASZ uprawnień!'
        }

        if (!roleORmember && message.guild.roles.cache.has(<`${bigint}`>args[1].replace(/[<@&>]/gmi, ''))) {
            roleORmember = 'role'
            const r = message.guild.roles.cache.get(<`${bigint}`>ID)
            dbData.id = r.id
        }

        if (!roleORmember && message.guild.members.cache.has(<`${bigint}`>args[1].replace(/[<@!>]/gmi, ''))) {
            roleORmember = 'member'
            const m = message.guild.members.cache.get(<`${bigint}`>ID)
            dbData.id = m.id
        }


        const embedData: commandOutput = {
            author: ['Custom permissje', Antek.user.displayAvatarURL()],
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            color: operation == 'allow' ? 'GREEN' : 'RED'
        }

        switch (roleORmember) {

            case 'member':

                    switch (operation) {

                        case 'allow': 

                                let x = permsUtil.set(dbData.id, message.guild.id, dbData.cmdName)
                                if ((x as { message: string }).message) return {
                                    error: (x as { message: string }).message
                                }
                                const m1 = message.guild.members.cache.get(<`${bigint}`>dbData.id)
                                return {
                                    ...embedData,
                                    text: `> Pomyślnie nadano uprawnienia użytkownikowi ${m1} do komendy ${dbData.cmdName}`
                                }
                                
                        case 'deny':

                                let x2 = permsUtil.removeID(dbData.id, message.guild.id, dbData.cmdName)
                                if ((x2 as { message: string }).message) return {
                                    error: (x2 as { message: string }).message
                                }
                                const m2 = message.guild.members.cache.get(<`${bigint}`>dbData.id)
                                return {
                                    ...embedData,
                                    text: `> Pomyślnie zabrano uprawnienia użytkownikowi ${m2} do komendy ${dbData.cmdName}`
                                }

                    }

            case 'role':

                switch (operation) {

                    case 'allow': 

                            let x3 = permsUtil.set(dbData.id, message.guild.id, dbData.cmdName)
                            if ((x3 as { message: string }).message) return {
                                error: (x3 as { message: string }).message
                            }
                            const r1 = message.guild.roles.cache.get(<`${bigint}`>dbData.id)
                            return {
                                ...embedData,
                                text: `> Pomyślnie nadano uprawnienia roli ${r1} do komendy ${dbData.cmdName}`
                            }
                            
                    case 'deny':

                            let x4 = permsUtil.removeID(dbData.id, message.guild.id, dbData.cmdName)
                            if ((x4 as { message: string }).message) return {
                                error: (x4 as { message: string }).message
                            }
                            const r2 = message.guild.roles.cache.get(<`${bigint}`>dbData.id)
                            return {
                                ...embedData,
                                text: `> Pomyślnie zabrano uprawnienia roli ${r2} do komendy ${dbData.cmdName}`
                            }

                }
            
            default: return {
                error: `Nie ma takiej roli / osoby na serwerze, lub argument nie pasuje do opcji. Wpisz ${Antek.prefixes.get(message.guild.id)}pomoc perms`
            }
        }

    }

}