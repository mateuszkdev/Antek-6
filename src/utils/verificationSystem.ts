import { Interaction, Message, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js'
import Antek from '../Antek'

export default class Verify {

    async first (): Promise<MessageActionRow[]> {

        const components: MessageActionRow[] = []

        components.push(new MessageActionRow().addComponents(
            new MessageButton().setStyle('SUCCESS').setLabel('Zweryfikuj się!').setCustomId('AntekVerificationSystem')
        ))

        return components

    }


    async second (): Promise<MessageActionRow[]> {

        const components: MessageActionRow[] = []

        components.push(new MessageActionRow().addComponents(
            new MessageSelectMenu().setCustomId('AntekVerificationSystemMenu').setPlaceholder('9+4=?').addOptions([
                {
                    description: '12',
                    label: 'Odpowiedź:',
                    value: 'bad'
                },
                {
                    description: '13',
                    label: 'Odpowiedź:',
                    value: 'ok'
                },
                {
                    description: '9',
                    label: 'Odpowiedź:',
                    value: 'bad2'
                },
            ])
        ))

        return components

    }

}