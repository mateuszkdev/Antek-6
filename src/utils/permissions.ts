import { GuildMember } from 'discord.js'
import { PermissionsName } from '../types'
import Antek from '../Antek'

interface permissionsOuput {
    message?: string
    perms?: boolean
}

export default class {

    check (member: GuildMember | null, permissions?: PermissionsName[], devOnly?: boolean, disabled?: boolean, cmdName?: string): permissionsOuput {

        let hasPerms: boolean = true

        if (disabled && Antek.config.devsIDs.includes(member.user.id)) return { perms: true, message: 'Jestś devem to możesz xD' }
        if (disabled) return { message: 'Ta komenda jest wyłączona.' }

        if (devOnly && !Antek.config.devsIDs.includes(member.user.id)) return { message: 'Ta komenda jest tylko dla właściciela.' }

        if (!permissions) return { perms: true }

        permissions.forEach(perm => {

            if (!member?.permissions.has(perm)) hasPerms = false

        })

        try { 
            const data = Antek.db.prepare('SELECT * FROM perms WHERE id = ? AND guildID = ? AND name = ?').get(member.user.id, member.guild.id, cmdName)
            if (data) hasPerms = true
        } catch {}

        try {
            const data = Antek.db.prepare('SELECT * FROM perms WHERE guildID = ? AND name = ?').all(member.guild.id, cmdName)
            data.forEach(e => {
                if (member.roles.cache.has(e.id)) hasPerms = true
            })
        } catch {}

        return hasPerms ? { perms: true } : { perms: false }

    }

    set (id: string, guildID: string, commandName: string): { message: string } | boolean  {

        try {

            if (!Antek.db.prepare('SELECT * FROM perms WHERE id = ? AND guildID = ? AND name = ?').get(id, guildID, commandName)) {

                Antek.db.prepare('INSERT INTO perms (id, guildID, name) VALUES (?, ?, ?)').run(id, guildID, commandName)
                return true

            } else return {
                message: 'To ID (osoby/roli) jest już w bazie przypisane do tej komendy.'
            }

        } catch (e) {
            return { message: e }
        }

    }

    removeID (id: string, guildID: string, commandName: string): { message: string } | boolean {

        try {

            if (Antek.db.prepare('SELECT * FROM perms WHERE id = ? AND guildID = ? AND name = ?').get(id, guildID, commandName)) {

                Antek.db.prepare('DELETE FROM perms WHERE id = ? AND guildID = ? AND name = ?').run(id, guildID, commandName)
                return true

            } else return {
                message: 'Nie ma takiego ID (osoby/roli) przypsisanej do tej komendy!'
            }

        } catch (e) {
            return { message: e }
        }

    }

    clearCommandAllPermissinos (guildID: string, commandName: string): { message: string } | boolean {

        try {

            if (!Antek.db.prepare('SELECT * FROM perms WHERE guildID = ? AND name = ?').get(guildID, commandName)) {

                Antek.db.prepare('DELETE FROM perms WHERE guildID = ? AND name = ?').run(guildID, commandName)
                return true

            } else return {
                message: 'Ta komenda nie ma przypisanych żadnych dodatkowych uprawnień.'
            }

        } catch (e) {
            return { message: e }
        }

    }

}