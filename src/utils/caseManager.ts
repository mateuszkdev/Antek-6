import Antek from '../Antek'
import { CaseType, caseInterface } from '../types'

export default class CaseManager {

    add (type: CaseType, guildID?: string, userID?: string, reason?: string, moderatorID?: string, date?: string /* timestamp */): void {

        let id = (Antek.db.prepare('SELECT * FROM cases WHERE gid = ?').all(guildID).length) + 1 || 1

        Antek.db.prepare('INSERT INTO cases (caseID, type, gid, userID, reason, moderatorID, date) VALUES(?, ?, ?, ?, ?, ?, ?)').run(
            id, type, guildID, userID, reason, moderatorID, date
        )

        return

    }

    find (guildID: string, caseID: string): caseInterface {

        const Case = Antek.db.prepare('SELECT * FROM cases WHERE caseID = ? AND gid = ?').get(guildID, caseID)

        return {
            type: Case.type, date: Case.date, id: Case.id, gid: Case.gid, userID: Case.userID, reason: Case.reason, moderatorID: Case.moderatorID
        }

    }

    getID (guildID: string): number {

        let id = Antek.db.prepare('SELECT * FROM cases WHERE gid = ?').all(guildID).length || 0
    
        return ++id

    }

}