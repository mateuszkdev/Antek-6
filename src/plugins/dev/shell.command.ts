import { commandArguments, commandOutput, Command } from '../../types'
import { execSync } from 'child_process'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['shell', 'cmd', '@', 'sudo', '$']
        this.description = 'Shell'
        this.category = 'dev'
        this.dev = true
        this.usage = '...args'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {
        
        const cmd = args.join(" ")
        let ex

        try {
            ex = await execSync(cmd)
            return {
                closeButton: true,
                color: 'BLUE',
                author: ['Shell', Antek.user.displayAvatarURL()],
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                text: `\`\`\`${ex || 'null'}\`\`\``
    
            }
        } catch (e) {
            return {
                text: e, color: 'RED', author: ['Shell']
            }
        }
        
    }

}