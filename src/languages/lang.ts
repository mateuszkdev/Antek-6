import { Collection } from 'discord.js'
import Antek from '../Antek'

// - langs - //
import pl from './langs/pl'
// -------- // 

export default class LangsManager {

    cache: Collection<string, string>

    constructor () {
        this.cache = new Collection()
    }

    check (guildID: string): boolean {

        if (Antek.db.prepare('SELECT * FROM langs WHERE gid = ?').get(guildID)) return true
        else return false

    }

    insert (guildID: string, lang: string): string {

        Antek.db.prepare('INSERT INTO langs (gid, lang) VALUES(?,?)').run(guildID, lang)
        return lang

    }

    change (guildID: string, newLang: string): string {

        if (this.check(guildID)) {
            
            Antek.db.prepare('UPDATE langs SET lang = ? WHERE gid = ?').run(newLang, guildID)

            return newLang
        }

    }

    // async getLang (guildID) {

    //     if (!Antek.langs.cache.get(guildID)) {
    //         if (this.check(guildID)) Antek.langs.cache.set(guildID, await this.insert(guildID, 'pl'))
    //         else Antek.langs.cache.set(guildID, await Antek.db.prepare('SELECT lang FROM langs WHERE gid = ?').get(guildID))
    //     }

    //     const gLang = Antek.langs.cache.get(guildID)

    //     switch (gLang) {
    //         case 'pl': return pl
    //     }

    // }

}