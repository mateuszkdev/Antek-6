import { Client, ClientOptions, Collection, WebhookClient, MessageEmbed, Intents, IntentsString } from 'discord.js'
import { AntekConfig, Command, snipeInterface } from './types'
import { Database } from 'better-sqlite3'

import { load } from './handlers/load.handlers'
import { error } from './utils/console'
import CaseManager from './utils/caseManager'
export * from './utils/economyUtil'

export const colors = {
    succes: 0xbaed95,
    error: 'RED'
}

const { token }: AntekConfig = require('../settings/config.json')

export class Antek extends Client {

    config: AntekConfig

    commands: Collection<string, Command>
    aliases: Collection<string, string>
    mutes: Collection<string, string>
    gbans: Collection<string, any>
    prefixes: Collection<string, string>
    snipes: Collection<string, snipeInterface[]>

    logs: WebhookClient
    db: Database
    casemanager: CaseManager

    constructor (options: ClientOptions) {

        super (options)

        this.config = require('../settings/config.json')

        this.commands = new Collection()
        this.aliases = new Collection()
        this.mutes = new Collection()
        this.gbans = new Collection()
        this.prefixes = new Collection()
        this.casemanager = new CaseManager()

        this.snipes = new Collection()

        this.logs = new WebhookClient(
            `${BigInt(this.config.logs.webhookID)}`,
            this.config.logs.webhookToken
        )

        this.db = require('better-sqlite3')('./database.sqlite')

        try {
            load(this)
        } catch (e) {

            const erembed = new MessageEmbed()
            .setColor('RED')
            .setDescription(`\`\`\`${e}\`\`\``)

            this.logs.send({ username: 'Antek Dev Logs', embeds: [erembed], avatarURL: 'https://images-ext-2.discordapp.net/external/0ZrRbOEkgqGalJsgiTpJnHvvSgE88PPARxZYm87Zkcw/%3Fsize%3D2048/https/cdn.discordapp.com/avatars/544180497522098177/bda7821b14accdb6d1a56f9f4c8584a3.png?width=561&height=561'})
            error(e)
        
        }
        
        this.login(token)

    }

}
const intents: IntentsString[] = []
Object.keys(Intents.FLAGS).forEach(key => intents.push(Intents.FLAGS[key]))

export default new Antek({ intents, allowedMentions: { repliedUser: false, roles: [] } })

const x = new Collection<string, string>()

x.reduce((acc, value, key) => key.startsWith('user-'))