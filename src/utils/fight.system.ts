import {
    GuildMember, Message
} from 'discord.js'
import Embed from '../utils/embed'
import { Item } from '../types'
import Antek from '../Antek'
const haste = require('hastebin-gen')

/**
 * 
 * @param s Number of seconds 
 * @returns Promise with timeout that works as sleep function
 */
const sleep = (s: number): Promise<any> => {
    return new Promise(resolve => setTimeout(resolve, s * 1000))
}

const types = {
    def: [
        'Przyjmowanie obrażeń'
    ],
    att: [
        'Obrażenia z dystansu', 'Seryjne obrażenia', 'Wysokie obrażenia'
    ]
}


/**
 * @name Fight main game class
 * @constructor {
 *  @param {GuildMember} member_1 Player_1 (starter)
 *  @param {GuildMember} member_2 Player_2 (rival)
 *  @param {Message} message Game init message
 * }
 */
export default class Fight {

    /**
     * @type Class types
     */
    gameStartTime: Date

    player_1: GuildMember; player_2: GuildMember
    
    basicHP: number; basicDMG: number

    filters: {
        player_1: (m: Message) => boolean
        player_2: (m: Message) => boolean
    }

    data: {

        oneHP: number
        game: { time: number | null }
        eq: {
            player_1: { defense: Item | undefined, attack: Item | undefined, assistance: Item | undefined } | undefined
            player_2: { defense: Item | undefined, attack: Item | undefined, assistance: Item | undefined } | undefined
        }
        hp: {
            player_1: number, player_2: number
        }
        chances: {
            critical: number, worst: number
        }
    }

    message: Message
    cache: { accepted: boolean, game: boolean }
    embed: Embed

    /**
     * 
     * @param {GuildMember} member_1 Player_1
     * @param {GuildMember} member_2 PLayer_2
     * @param {message }message message
     */
    constructor (member_1: GuildMember, member_2: GuildMember, message: Message) {

        this.gameStartTime = new Date()

        this.player_1 = member_1
        this.player_2 = member_2

        this.basicDMG = 1000
        this.basicHP = 100

        this.filters = {
            player_1: (m) => { return m.author.id === this.player_1.user.id },
            player_2: (m) => { return m.author.id === this.player_2.user.id }
        }

    
        this.data = {

            oneHP: 3000, 
            game: { time: null }, 
            eq: {
                player_1: undefined, player_2: undefined 
            },
            hp: {
                player_1: this.basicHP, player_2: this.basicHP 
            },
            chances: { 
                critical: 0.15, 
                worst: 0.35
            }

        }

        this.message = message

        this.cache = {
            accepted: false, game: true
        }

        this.embed = new Embed({

            author: ['Walka!', Antek.user.displayAvatarURL()],
            color: 'YELLOW',
            footer: [`${this.player_1.user.tag} vs ${this.player_2.user.tag}`],
            timestamp: new Date()

        }, message, true)

        this.getPlayerItems()
        this.main()

    }

    rootEmbed: Message

    /**
     * @name main Main game method. 
     */
    async main (): Promise<void> {

        let acceptTime = this.embed.setDescription(`**Antek Fight System**\n\n> Wybrano rywala: ${this.player_2}\n${this.player_2}, **wpisz** \`walka\`, aby rozpocząć!\n | \`Masz 20 sekund\` |`)
        this.rootEmbed = await this.message.channel.send({ embeds: [acceptTime]})
        this.cache.accepted = await this.accpet(acceptTime)

        if (!this.cache.accepted) return

         let it = [
            `**Rozpoczęta walka!**`, `Rywale ${this.player_1} \`|\` ${this.player_2}\n`,
            `> Pora wybrać przedmioty!\n **Wybiera** ${this.player_1}`
        ].join('\n')

        let start = this.embed.setDescription(it)
        this.rootEmbed.edit({ embeds: [start] })

        ///////////////////////////////

            /**
             * @action Items choose
             */

            // Player_1
            await sleep(3)
            await this.chooseItems('player_1')

            if (!this.cache.game) return

            // Player_2
            await sleep(3)
            await this.chooseItems('player_2')

            if (!this.cache.game) return

        ///////////////////////////////

        await sleep(2)
        this.startFight()

        // const totalTime = new Date() - this.gameStartTime

    }


    /**
     * @name criticalChanges Calculate critical hit chance
     * @param {Item} item 
     * @returns {boolean}
     */
    criticalChanges (item: Item): boolean {

        let data = {
            power: item.power,
            chance: this.data.chances.critical * 100,
            realChance: 0
        }
        data.realChance = ~~(Math.random() * 100) + data.chance
        if (data.realChance > 60) return true
        else return false

    }


    /**
     * @name worstChange Calcuate worst chance
     * @param {Item} item
     * @returns {boolean} 
     */
    worstChange (item: Item): boolean {

        let data = {
            power: item.power,
            chance: this.data.chances.worst * 100,
            realChance: 0
        }

        data.realChance = ~~(Math.random() * 100) + data.chance
        if (data.chance > 60) return true
        else return false

    }


    /**
     * @name changeDMGtoHP CHange dmg value into HP value
     * @param {number} dmg 
     * @returns {number}
     */
    changeDMGtoHP (dmg: number): number | string | any {
        const value: number | string = ((dmg / this.data.oneHP) * 17)
        return value.toFixed(2)
    }



    /**
     * @name dmgCalculate Calc dmg using crit and worst values from item power
     * @param {boolean} isCritical 
     * @param {boolean} isWorst 
     * @param {number} power 
     */
    dmgCalculate (isCritical: boolean, isWorst: boolean, power: number): number {

        let dmg = this.basicDMG
        if (isCritical) dmg += (this.basicDMG + (Math.random() * power)) - (this.basicDMG / 2)
        if (isWorst) dmg -= (this.basicDMG - (Math.random() / power)) + (this.basicDMG / 2)

        if (!isCritical && !isWorst) dmg = ~~(Math.random() * (power / 2))

        return dmg

    }


    /**
     * @name getHP Get HP from player data
     * @param {number} dmg 
     * @param {string} player 
     * @returns {boolean}
     */
    getHP (dmg: number, player: string): number {
        return this.data.hp[player] -= (this.changeDMGtoHP(dmg))
    }


    /**
     * @name whoWon Ckeck who won the game
     * @return {Object | boolean} Object with player that won or false 
     */
    get whoWon () {
        if (this.data.hp.player_1 <= 0 || this.data.hp.player_2 <= 0) {

            if (this.data.hp.player_1 < 0) return { winner: 'player_2' }
            else if (this.data.hp.player_2 < 0) return { winner: 'player_1' }
            else return false 

        } else return false
    }



    /**
     * @name fixNum Fix number into positive.
     * @param {number} x 
     * @returns {number}
     */
    fixNum (x: number): number {
        if (x < 0) return 0
        else return x
    }



    /**
     * @name updateUses Update items uses and add 1 into winner rank
     * @param {string} winnerID 
     */
    updateUses (winnerID: string): void {

        const execute = (player: string) => {

            const p = player == 'player_1' ? this.player_1.user.id : this.player_2.user.id

            Antek.db.prepare('UPDATE items SET use = ? WHERE userID = ? AND name = ?')
                .run(this.data.eq[player].attack.use, p, this.data.eq[player].attack.name)
            Antek.db.prepare('UPDATE items SET use = ? WHERE userID = ? AND name = ?')
                .run(this.data.eq[player].defense.use, p, this.data.eq[player].defense.name)
        }

        execute('player_1')
        execute('player_2')

        const rankNow = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(winnerID)
        Antek.db.prepare('UPDATE users SET rank = ? WHERE userID = ?').run(rankNow.rank + 1, winnerID)

    }



    async insertIntoHastebin (attacks: any[]): Promise<string> {

        let total = ''
        attacks.forEach(log => {
            log.atakujacy ? total += `>> Atakował: ${log.atakujacy}, zadając: ${log.zadaneObrazenia} obrażeń | Pozostało mu: ${this.fixNum(log.zyciePlayer1)} hp, rywalowi pozostalo: ${this.fixNum(log.zyciePlayer2)} hp`
            : total += `Koniec gry! Wygrywa: ${log.wygrywa}`

            total += '\n'
        })

        const url = await haste(total, { extension: 'txt' })
        return url

    }



    /**
     * @name startFight Start fight and check who will won and who is better XDDD
     */
    async startFight () {

        const playersTags = {
            'player_1': this.player_1.user.tag,
            'player_2': this.player_2.user.tag
        }

        const fightEmbed = new Embed({ color: 'YELLOW', timestamp: new Date() }, this.message, true)

        const template = (title: string, content: string, emoji: string): string => {
            return `> ${emoji} \`${title}\`\n> ${content}`
        }


        const renderEmbed = (player_move: string, dmg: number, isCritical: boolean, isWorst: boolean, hp: number, item_uses: number, round: number): Embed => {


            fightEmbed.setFooter(`Kolej: ${playersTags[player_move]}`)
            fightEmbed.setAuthor(`Fight! ${this.player_1.user.tag} VS ${this.player_2.user.tag}`, Antek.user.displayAvatarURL())
            fightEmbed.setDescription([

                `Runda: \`${round}\``,
                `> Cios z strony **${playersTags[player_move]}**`,

                template(`Obrażenia`, `${~~dmg}`, ':crossed_swords:'),
                template(`Krytyczny?`, `${isCritical ? '`Tak`' : '`Nie`'}`, '👊'),
                template(`Zablokowany cios?`, `${isWorst ? '`Tak`' : '`Nie`'}`, '🛡'),
                template(`Pozostałe użycia przedmiotu`, `${this.fixNum(item_uses)}`, '📑'),
                template(`Ilość HP rywala po zadanym ciosie`, `${~~this.fixNum(hp)}`, '⚠')

            ].join('\n'))


            return fightEmbed

        }


        const fightCache = {
            attacks: [],
            round: 1,
            user: 'player_1', rival: 'player_2'
        }

        while (true) {

            if (!this.cache.game) break

            let nowItems = this.data.eq[fightCache.user]
            let rivalDefense = this.data.eq[fightCache.rival].defense

            const isCritical = this.criticalChanges(nowItems.attack)
            const isWorst = this.worstChange(rivalDefense)
            const dmg = this.dmgCalculate(isCritical, isWorst, nowItems.attack.power)
            this.getHP(dmg, fightCache.rival)

            await sleep(2)

            const toEdit = renderEmbed(fightCache.user, dmg, isCritical, isWorst, this.data.hp[fightCache.rival], nowItems.attack.use, fightCache.round)
            this.rootEmbed.edit({ embeds: [toEdit]})

            await sleep(4)

            fightCache.attacks.push(
                {
                    atakujacy: playersTags[fightCache.user],
                    zadaneObrazenia: ~~dmg,
                    zyciePlayer1: ~~this.data.hp[fightCache.user],
                    zyciePlayer2: ~~this.data.hp[fightCache.rival]
                }
            )

            this.data.eq[fightCache.user].attack.use -= 1
            this.data.eq[fightCache.user].defense.use -= 1

            const isEnd = this.whoWon

            if (isEnd && isEnd.winner) {

                const winner = isEnd.winner == 'player_1' ? this.player_1 : this.player_2

                fightCache.attacks.push({
                    end: true, wygrywa: winner.user.tag
                })

                const haste = await this.insertIntoHastebin(fightCache.attacks)

                this.updateUses(fightCache.user == 'player_1' ? this.player_1.user.id : this.player_2.user.id)

                this.rootEmbed.edit({ embeds: [
                    new Embed({

                        color: 'GREEN',
                        footer: ['Gra skończona!!', winner.user.displayAvatarURL({ dynamic: true })],
                        text: `${winner}! Pokonujesz ${playersTags[fightCache.rival]}.\n> Pozostało ci: \`${this.fixNum(this.data.hp[fightCache.user])}\` hp.\n> Pełny zapis walki: [[KLIKNIJ]](${haste})`
                    }, this.message, true)
                ]})

                this.cache.game = false

            }

            fightCache.round++
            let s = fightCache.rival
            fightCache.rival = fightCache.user
            fightCache.user = s

        }


    }




    /**
     * @name chooseItems
     * @param {string} player
     * @returns {Promise<void>}
     * @description Method that player choose hes items to fight 
     */
    async chooseItems (player:  string): Promise<void> {

        const items = player == 'player_1' ? this.itemsPlayer_1 : this.itemsPlayer_2
        const filter = player == 'player_1' ? this.filters.player_1 : this.filters.player_2
        const member = player == 'player_1' ? this.player_1 : this.player_2

        let totalItems = ''
        items.forEach((item, i) => {
            totalItems += `\`> [ID: ${i+1}]\` ${item.icon}\n`
        })

        const chooseEmbed = new Embed({

            color: 'ORANGE', author: [`${member.user.tag} wybiera przedmioty do walki!`],
            thumbnail: member.user.displayAvatarURL({ dynamic: true }),
            text: `${totalItems}\n > **Jak wybrać**?\n > Wpisz **ID** przedmiotów oddzielając jest spacją, *przykład:* \`1 3\``,
            footer: ['Czas na wybranie przedmiotów: 20 sekund.']

        }, this.message, true)

        this.rootEmbed.edit({ embeds: [chooseEmbed]})
        
        const smallCache = { cache: false, next: false }

        /**
         * @name ItemsChooseWhile
         */
        while (true) {

            smallCache.cache = false
            await this.message.channel.awaitMessages({ max: 1, time: 20 * 1000, filter })
                .then(async msgs => {

                    const content = msgs.first().content
                    await msgs.first().delete()

                    let array = content.trim().split(/ +/gm)
                    const ids = this.idsFilter(array)

                    let nan = false
                    ids.forEach(id => {
                        if (!/[0-9]+/gm.test(id)) nan = true
                    })
                    
                    if (nan) {

                        smallCache.cache = true
                        this.rootEmbed.edit({ embeds: [chooseEmbed.setFooter(`${member.user.tag}! Wpisz poprawne ID.`)]})
                        return

                    } else {

                        smallCache.cache = true
                        const insert = await this.insertItemsToData(ids, items, player)

                        if (insert.error) {

                            smallCache.cache = true
                            let send = await this.message.channel.send({ embeds: [new Embed({ color: 'RED', text: `> ${insert.error}` }, this.message, true)]})
                            setTimeout(() => { send.delete() }, 2 * 1000)

                        } else {

                            smallCache.cache = true
                            const item_att = this.data.eq[player].attack.icon != undefined ? this.data.eq[player].attack : undefined
                            const item_def = this.data.eq[player].attack.icon != undefined ? this.data.eq[player].defense : undefined

                            const choosedItemsText = [
                                `> ⚔️ **\`Atak\`**\n${item_att.icon} **|** ${item_att.level} **|** ${item_att.name} **|** [Moc: **${item_att.power.toFixed(1)}**] **|** [Użycie: \`${100-item_att.use}\`**/**\`100\`]\n\n`,
                                `> 🛡️ **\`Obrona\`**\n${item_def.icon} **|** ${item_def.level} **|** ${item_def.name} **|** [Moc: **${item_def.power.toFixed(1)}**] **|** [Użycie: \`${100-item_def.use}\`**/**\`100\`]\n`
                            ].join('')


                            await this.rootEmbed.edit({ embeds: [
                                this.embed.setColor('GREEN').setFooter(`${member.user.tag} wybrał przedmioty!`)
                                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                                .setDescription(`**\`Wybrane przedmioty\`**\n\n${choosedItemsText}`)
                            ] })

                            smallCache.next = true
                    
                        }
                        
                    }

                })
                .catch(msgs => {

                    if (!smallCache.cache) {
                        this.cache.game = false
                        this.rootEmbed.edit({ embeds: [this.embed.setFooter('Czas na wybranie przedmiotów minął..').setDescription(`Walka przerwana przez ${member}.`).setColor('ORANGE')]})
                    }

                })

                if (smallCache.next) break

        }

    }

    
    // utils
    async insertItemsToData (itemdsIds: any[], items, player): Promise<any> {

        let array = []
        let pass = true

        itemdsIds.forEach(id => {
            if (items[(id-1)]) array.push(items[(id-1)])
            else pass = false
        })

        if (!pass) return { error: 'Nie posiadasz przedmiotu o takim ID!!!' }

        const fightTypes = []; Object.keys(types).forEach(key => { fightTypes.push(...types[key]) })
        array.forEach(item => {
            if (!fightTypes.includes(item.type)) return pass = false
        })

        if (!pass) return { error: 'Wybrano przedmiot który nie nadaje się do walki.' }

        array.forEach(item => {
            if (item.use <= 20) pass = false
        })

        if (!pass) return { error: 'Wybrany przedmio ma słabą wytrzymałość! Nie nadaje się do walki!' }

        this.data.eq[player] = { defense: undefined, attack: undefined, assistance: undefined }
        pass = true

        array.forEach(item => {

            if (!this.data.eq[player].attack && types.att.includes(item.type)){
                this.data.eq[player].attack = item
            }
            else if (!this.data.eq[player].defense && types.def.includes(item.type)){
                this.data.eq[player].defense = item
            }
            else pass = false

        })

        if (!pass) return { error: 'Wybrano zbyt wiele przedmiotów jednego typu!!!' }

        return array

    }



    // utils
    idsFilter (ids: string[]): number[] | string[] {

        const new_ = []
        ids.forEach(id => {
            if (!new_.includes(id)) new_.push(id)
        }) 

        return new_

    }



    /**
     * Get player items from databse
     */
    itemsPlayer_1: any
    itemsPlayer_2: any
    getPlayerItems (): void {
        this.itemsPlayer_1 = Antek.db.prepare('SELECT * FROM items WHERE userID = ?').all(this.player_1.user.id)
        this.itemsPlayer_2 = Antek.db.prepare('SELECT * FROM items WHERE userID = ?').all(this.player_2.user.id)
    }
 


    /**
     * 
     * @param {Embed} emd rootEmbed as single variable 
     * @returns {boolean} 
     */
    async accpet (emd: Embed): Promise<boolean> {

        this.cache.accepted = false

        await this.message.channel.awaitMessages({ max: 1, time: 20 * 1000, filter: this.filters.player_2,  })

            .then(async msgs => {
                
                const content = msgs.first().content
                msgs.first().delete()

                if (content == 'walka') this.cache.accepted = true
                else this.rootEmbed.edit({ embeds: [emd.setColor('RED').setFooter(`${this.player_2.user.tag} nie zaakceptował gry!`)]})

            })

            .catch(msgs => {
                this.cache.accepted ? null : this.rootEmbed.edit({ embeds: [emd.setColor('RED').setFooter(`${this.player_2.user.tag} nie zaakceptował gry!`)]})
            })


        return this.cache.accepted

    }

}