import { Message } from 'discord.js'
import Antek from '../Antek'
import { economyUserInterface, XpAndLevel, Eco } from '../types'
import Embed from './embed'
import betterReply from './betterReply'

export class EconomyUtility {

    userID: string

    constructor (userID: string) {
        this.userID = userID
    }

    getAll (): economyUserInterface {
        const data = Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)
        const money = Antek.db.prepare('SELECT money FROM users WHERE userID = ?').get(this.userID)

        return {
            xp: data.xp || 0,
            level: data.level || 0,
            energy:  data.energy || 0,
            userID: this.userID, money
        }
    
    }

    updateEnergy (): void {

        const data = Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)

        const isIt = Math.round(Math.random() * 1) >= 1 ? true : false

        let energy = data.energy

        isIt && energy < 100 && (energy += 5)

        energy != data.energy && Antek.db.prepare('UPDATE economy SET energy = ? WHERE userID = ?').run(~~energy, this.userID)

    }

    getData (): Eco {
        const { money } = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(this.userID)
        const { xp, level, energy } = Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)
        return {
            money, xp, level, energy
        }
    }

    addMoney (count: number): number {

        const data = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(this.userID)

        const money = (data.money + count)

        Antek.db.prepare('UPDATE users SET money = ? WHERE userID = ?').run(~~money, this.userID)

        return money

    }

    takeMoney (count: number): number {

        const data = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(this.userID)

        const money = (data.money - count)

        Antek.db.prepare('UPDATE users SET money = ? WHERE userID = ?').run(~~money, this.userID)

        return money

    }

    takeEnergy (count: number): number {
        
        const data = Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)

        let energy = data.energy

        energy -= count

        Antek.db.prepare('UPDATE economy SET energy = ? WHERE userID = ?').run(~~energy, this.userID)

        return energy

    }

    checkEnergyAmount (requiredAmount: number): boolean {

        const data = Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)

        const energy = parseInt(data.energy)

        if (energy >= requiredAmount) return true
        else return false

    }

    updateXP ( message?: Message): XpAndLevel {

        let data: XpAndLevel = Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)

        const baseMultiplier: number = 110
        const requiredXpForNextLevel = baseMultiplier * data.level

        const newXp = ~~(Math.random() * 4) + 1
        data.xp += newXp

        if (data.xp > requiredXpForNextLevel) {
            data.level++; data.xp = 0
            if (!Antek.db.prepare('SELECT * FROM noNotify WHERE guildID = ?').get(message.guild.id)) {
                message.reply({
                    embeds: [new Embed({
                        color: '#665b42',
                        text: `> **Level UP**\n Level: \`${data.level}\``
                    }, message, true)]
                })
            }

        }

        Antek.db.prepare('UPDATE economy SET xp = ?, level = ? WHERE userID = ?').run(~~data.xp, data.level, this.userID)

        return { xp: data.xp, level: data.level }
    }

    repair (): void {

        if (!Antek.db.prepare('SELECT * FROM economy WHERE userID = ?').get(this.userID)) {
            Antek.db.prepare('INSERT INTO economy (userID, level, xp, energy) VALUES(?, ?, ?, ?)').run(this.userID, 1, 0, 100)
        }

    }

}