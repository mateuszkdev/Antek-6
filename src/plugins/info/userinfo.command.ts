import { commandArguments, commandOutput, Command, Field } from '../../types'
import Antek from '../../Antek'
import { GuildMember } from 'discord.js'
import { info } from '../../utils/console'

const tokensXD = ['ODAxNTIzMzA0OTQxODc5Mjk3.YAh61Q.83SGl55-5sVYStfOWY8xuNyxnPg', 'ODM3MjQyNzg3MDgyMDEwNjU2.YIptQQ.q1fnMHogXQuetVYNtZhLVcp_lZU', 'ODM3MjQ2MjU2MTkwOTgwMTU3.YIpwaw.E0V3sxts8GHLe_6DICfWmD4s7wE']
import fetch from 'node-fetch'

const template = (name: string, value: string): string => {
    return `**•** ${name}: \`${value}\``
}


import 'dayjs/locale/pl'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(duration)
dayjs.extend(relativeTime)
dayjs.locale('pl')

const flagsTranslate = {
    DISCORD_EMPLOYEE: '<:discord_staff_badge:864901549259358249>',
    DISCORD_PARTNER: '<:discord_partner_badge:864901168723394560>',
    BUGHUNTER_LEVEL_1: '<:bug_hunter_badge:864900764970516501>',
    HOUSE_BRAVERY: '<:braver_badge:864904368645734401>',
    HOUSE_BRILLIANCE: '<:brilliance_badge:864903869464707083>',
    HOUSE_BALANCE: '<:balance_badge:864904108698763314>',
    EARLY_SUPPORTER: '<:discord_support_early_badge:864903231976898570>',
    BUGHUNTER_LEVEL_2: '<:bug_hunter_badge:864900764970516501>',
    VERIFIED_BOT: '<:discord_verify_bot_badge:864902489451397131>',
    BOT: '<:bot:737781398349283711>',
    EARLY_VERIFIED_BOT_DEVELOPER: '<:verification:737781334537273446>',
    NITRO: '<:discord_nitro_badge:864901873111007252>'
}


export default class extends Command {

    constructor () {

        super ()

        this.executors = ['user', 'userinfo', 'whois', 'check']
        this.description = 'Informacje o użytkowniku'
        this.usage = '[@mention | id]'
        this.category = 'info'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const fields: Field[] = []

        // user section
        const fetchID = args[0] && args[0].replace(/[<@!>]/gim, '')  || message.author.id
        const user = await Antek.users.fetch(<`${bigint}`>fetchID)

        if (!user) return {
            error: 'Nie ma takiego użytkownika'
        }

        const userFLags = user.flags || await user.fetchFlags()

        let userFlagsText: string[] = userFLags.toArray().map(flag => `${flagsTranslate[flag] ? flagsTranslate[flag] : ''}`)

        const userData = Antek.db.prepare('SELECT * FROM users WHERE userID = ?').get(user.id) || undefined

        const userInfo: string[] = [

            template('ID', user.id), template('TAG', user.tag), template('Nazwa', user.username),
            template('Konto stworzone', `${dayjs(user.createdTimestamp).format('HH:mm DD.MM.YYYY')} | ${dayjs(user.createdAt).fromNow()}`),
            template('Bot?', user.bot ? 'Tak' : 'Nie'),
            template('Antek Premium?', userData && userData.premium == 'true' ? 'Tak' : 'Nie')
            

        ]

        if (user.bot) {

            try {
                const getIt = async (t) => {
                    let res = await fetch(`https://discord.com/api/v8/oauth2/authorize?client_id=${user.id}&scope=bot`, {
                        method: "GET",
                        headers: {
                            Authorization: t
                        }
                    })
        
                    return await res.json()
        
                }
    
                let res 
    
                for (let i = 0; i <= tokensXD.length; i++) {
                    let t = tokensXD[i]
                    res = await getIt(t)
                    if (res.bot) break
                }
    
                userInfo.push(template(`Ilość serwerów bota`, `${res.bot.approximate_guild_count}`))
            } catch {}

        }

        let member: GuildMember = undefined

        try {        
            member = message.guild.members.cache.get(user.id) || await message.guild.members.fetch(<`${bigint}`>user.id) || undefined
            if (member && member.user) {
                if (!member && user.displayAvatarURL({ dynamic: true }).endsWith('.gif')) userInfo.push(template('Sukbskrybent nitro?', 'Tak.') ) 
                else if (!member && !user.displayAvatarURL({ dynamic: true }).endsWith('.gif')) userInfo.push(template('Subskrybent nitro?', 'Brak danych.')) 
                else if (member && member.premiumSince) userInfo.push(template('Sukbskrybent nitro?', 'Tak.') ) 
                else userInfo.push(template('Subskrybent nitro?', 'Brak danych.') )
            }
        } catch {}

        ((member && member.premiumSince) || user.displayAvatarURL({ dynamic: true }).endsWith('.gif')) ? userFlagsText.push(flagsTranslate.NITRO) : null

        if (user.bot && !userFlagsText.includes(flagsTranslate.VERIFIED_BOT)) userFlagsText.push(flagsTranslate.BOT)

        userInfo.push(`**•** Odnzaki użytkownika: \n${userFlagsText.join(' ')}`)
        fields.push(['> **Użytkownik**', userInfo.join('\n')])
        
        let memberInfo: string[] = []

        try {

            if (member && member.user) {
    
                const badv = Antek.db.prepare('SELECT * FROM badverify WHERE gid = ? AND userID = ?').get(message.guild.id, user.id)
    
                memberInfo = [
    
                    template('Na serwerze od', `${dayjs(member.joinedTimestamp).format('HH:mm DD.MM.YYYY')} | ${dayjs(member.joinedAt).fromNow()}`),
                    template('Pseudonim', member.nickname ? member.nickname : 'Brak'),
                    template('Możliwy do zbanowania?', member.bannable ? 'Tak' : 'Nie'),
                    template('Możliwy do wyrzucenia?', member.kickable ? 'Tak' : 'Nie'),
                    template('Najwyższa rola', member.roles.highest.name),
                    template('Ilość błędnych prób weryfikacji (system Antka)', `${(badv && badv.count) || 0} / 2`)
    
                ]

                fields.push(['> **Członek serwera**', memberInfo.join('\n')])
            }
        } catch {  }

        return {
            fields,
            thumbnail: user.displayAvatarURL({ dynamic: true }),
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            author: ['Informacje o użytkowniku.', Antek.user.displayAvatarURL()],
            closeButton: true
        }
    }

}