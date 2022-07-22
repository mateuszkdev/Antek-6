import { TextChannel, MessageEmbed } from 'discord.js'
import Antek from '../Antek'

export default async () => {

    Antek.config.devsIDs.forEach(async id => {
        await Antek.users.fetch(<`${bigint}`>id)
    })

    Antek.db.prepare('CREATE TABLE IF NOT EXISTS prefixes (gid, prefix)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS langs (gid, lang)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS users (userID, money, rank, premium)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS items (userID, name, icon, type, level, price, power, use)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS gbans (userID, reason)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS cases (caseID, type, gid, userID, reason, moderatorID, date)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS economy (userID, level, xp, energy)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS verify (gid, channelID, roleID, messageID, text)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS badverify (gid, userID, count)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS perms (id, guildID, name)').run()
    Antek.db.prepare('CREATE TABLE IF NOT EXISTS noNotify (guildID)').run()

    const gbans = Antek.db.prepare('SELECT * FROM gbans').all()
    gbans.forEach(gban => {
        Antek.gbans.set(gban.userID, gban)
    })

}