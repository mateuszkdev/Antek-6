import fetch from 'node-fetch'
const API = 'https://discord.com/api/v8'
import Antek from '../Antek'

export default async (messageID: string, channelID: string, guildID: string | any, content: any) => {

    const data = {
        message_id: messageID,
        channel_id: channelID,
        guild_id: guildID
    }

    let msg: any = {}

    if (typeof content == 'string') msg = { content }
    else msg = { embed: content }

    msg.message_reference = data

    msg.tts = false

    msg = JSON.stringify(msg)
    
    const token = Antek.token

    const res = await fetch(`${API}/channels/${channelID}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${token}`
        },
        body: msg
    })

    return await res.json()

}