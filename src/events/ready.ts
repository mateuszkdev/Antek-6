import Antek from '../Antek'
import initDB from '../database/tablesInit'
import { success } from '../utils/console'

import fetch from 'node-fetch'
const API = 'https://discord.com/api/v9'

export default class {

    async execute () {

        initDB()

        Antek.user.setPresence({ activities: [{ name: `@${Antek.user.username} 🙋‍♂️ D.js v13`, type: 'COMPETING' }], status: 'dnd' })
        Antek.user.setStatus('idle')
        success(`${Antek.user.tag} connected.`)


    }

}