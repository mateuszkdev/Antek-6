import { Antek } from '../Antek'
import { readdirSync } from 'fs'

import { error } from '../utils/console'
import { Command } from '../types'


const ascii = require('ascii-table')
const table = new ascii("Commands")
table.setHeading("FileName", "Status")

const preTableLog = (cmdName: string) => (status: string) => {
    table.addRow(cmdName, status)
}

export default class CommandsHandler {

    constructor (Antek: Antek) {

        readdirSync(`${__dirname}/../plugins/`).forEach(dirName => {

            readdirSync(`${__dirname}/../plugins/${dirName}`)
                .filter(f => f.endsWith('js') && !f.startsWith('--'))
                .forEach(async file => {

                    const log = preTableLog(file)

                    try {

                        const commandDefault = require(`../plugins/${dirName}/${file}`).default
                        
                        const command: Command = new commandDefault()

                        

                        const cmdName = command.executors[0]
                        const cmdAliases = command.executors.slice(1)

                        if (!cmdName || !command.run) return log('❌')
                        if (Antek.commands.get(cmdName)) return log('❌')

                        Antek.commands.set(cmdName, command)
                        log('✅')

                        if (cmdAliases.length <= 0) return

                        cmdAliases.forEach(alias => {

                            if (Antek.aliases.get(alias)) return
                            Antek.aliases.set(alias, cmdName)

                        })
        
                    } catch (e) {
                        error(e)
                        log('❌')
                    }


                })            
        })

        console.log(table.toString())

    }

}