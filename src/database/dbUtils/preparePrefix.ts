import Antek from '../../Antek'

export default class {

    check (guildID: string): boolean {

        if (Antek.db.prepare('SELECT * FROM prefixes WHERE gid = ?').get(guildID)) return true
        else return false

    }

    insert (guildID: string, prefix: string): string {

        Antek.db.prepare('INSERT INTO prefixes (gid, prefix) VALUES(?,?)').run(guildID, prefix)
        return prefix

    }

}