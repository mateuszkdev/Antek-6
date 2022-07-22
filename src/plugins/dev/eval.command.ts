import { Command, commandOutput, commandArguments } from '../../types'
import Client, { EconomyUtility } from '../../Antek'
import { inspect } from 'util'

const Embed = require('../../utils/embed').default
const eco = EconomyUtility


export default class extends Command {

    constructor () {

        super () 

        this.executors = ['eval', 'code']
        this.description = 'Eval'
        this.category = 'dev'
        this.usage = '[Kod js]'
        this.dev = true

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        let isJson: boolean = false
        if (args[0] == 'json') {
            args = args.slice(1)
            isJson = true
        }

        const code = args.join(' ')

        if (!code) return {
            error: 'Musisz podać kod.'
        }

        try {

            const Antek = require('../../Antek.js').default
            const db = Antek.db

            const evaled = await eval(code) || 'null'

            if (
                code.includes('token') || code.includes('process') || evaled.toString().includes(Client.token)
            )  return {
                text: `\`\`\`js\n.. catch (e) {
    Idiot alert: Somethink went wrong. U are a fool (or Mocek) at line 69: mamoDebil.ts
        
    }\n\`\`\``
            }

            let res =
                `
            📥
            \`\`\`js\n${code}\`\`\`
            📤
            \`\`\`js\n${isJson ? JSON.stringify(evaled) : inspect(evaled, { depth: 0 })}\`\`\`
            TYP
            \`\`\`js\n${typeof evaled}\`\`\`
            `

            return {
                closeButton: true,
                text: res,
                author: ['Eval :O', Client.user.displayAvatarURL({})],
                footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
                timestamp: new Date()
            }

        } catch (e) {
            return {
                text: `\`\`\`js\n.. catch (e) {

    ${e}
        
    }\n\`\`\``
            }
        }

    }

}