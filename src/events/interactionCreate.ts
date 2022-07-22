import { MessageComponentInteraction, MessageEmbed, TextChannel } from 'discord.js'
import Antek from '../Antek'
import Verify from '../utils/verificationSystem'
import { error } from '../utils/console'

export default class {

    async execute (i: MessageComponentInteraction | any) {

        if (process.argv[2] == 'beta') return

        try {
            if (i.customId == 'AntekVerificationSystem') {

                const components = await new Verify().second()
    
                i.reply({
                    content: 'Wybierz poprawna odpowiedź',
                    components,
                    ephemeral: true
                })
    
    
            } else if (i.customId == 'AntekVerificationSystemMenu') {
    
                if (!Antek.db.prepare('SELECT * FROM badverify WHERE gid = ? AND userID = ?').get(i.message.guild.id, i.user.id)){
                    Antek.db.prepare('INSERT INTO badverify (gid, userID, count) VALUES (?, ?, ?)').run(i.message.guild.id, i.user.id, 0)
                }

                const badVcountData = Antek.db.prepare('SELECT * FROM badverify WHERE gid = ? AND userID = ?').get(i.message.guild.id, i.user.id)

                if (badVcountData.count >= 2) {
                    try { await i.user.send({ content: 'Nie możesz się już zweryfikować na tym serwerze. Zbyt wiele błędnych prób. Napisz do Admina serwera.' }) } catch (d) { error(d) }
                    return
                }

                if (i.values[0] == 'ok') {
    
                    const data = Antek.db.prepare('SELECT * FROM verify WHERE gid = ?').get(i.message.guild.id)
                    i.reply({ content: 'Dobra odpowiedz', ephemeral: true })
                    const g = Antek.guilds.cache.get(data.gid)
                    const r = g.roles.cache.get(data.roleID)

                    if (i.member.roles.cache.has(r.id)) return

                    console.log(<`${bigint}`>g.ownerId)

                    if (!r) {

                        try { 
                            i.channel.send({ content: `System weryfikacji nie mógł zadziałać na tym serwerze: **${g.name}**, nie znaleziono roli o id z bazy danych.` }) 
                        } catch (x) { throw new Error(x) }

                    } else {

                        try {  await i.member.roles.add(r) } catch (g) { 

                            try { 
                                i.channel.send({ content: `System weryfikacji nie mógł zadziałać na tym serwerze. Antek nie posiada permissji do nadawania roli użytkownikowi. .` })
                                error(g)
                            } catch (x) { throw new Error(x) }
                            throw new Error(g) 
                        }

                    }
        
                } else {
                    
                    try { await i.user.send({ content: 'Zła odpowiedź! Pamiętaj że masz 2 próby. Później weryikacja się blokuje!' }) } catch (d) { error(d) }

                    let count = badVcountData.count + 1

                    Antek.db.prepare('UPDATE badverify SET count = ? WHERE gid = ? AND userID = ?').run(count, i.message.guild.id, i.user.id)

                    
                }
    
            }
        } catch (e) {
            error(e)
            Antek.logs.send({ embeds: [new MessageEmbed().setDescription(e.toString()).setFooter(`interactionCreate error`)] })
        }

    }

}