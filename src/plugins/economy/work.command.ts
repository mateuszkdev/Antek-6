import { commandArguments, commandOutput, Command } from '../../types'
import Antek, { EconomyUtility } from '../../Antek'

export default class extends Command {

    constructor () {

        super () 

        this.executors = ['work', 'praca', 'pracuj']
        this.category = 'economy'
        this.description = 'Zarabiaj w uczciwy sposób.'

    }

    async run ({ message }: commandArguments): Promise<commandOutput> {

        const requiredEnergy = 30

        const eco = new EconomyUtility(message.author.id)

        const { energy } = eco.getData()

        if (energy < requiredEnergy) return {
            error: `Nie masz wystarczająco energii, ta praca wymaga: ${requiredEnergy}, posiadasz: ${energy}`
        }

        const workstexts = [
            'Ścinasz drzewo', 'Sprzątasz dom', 'Piszesz bota', 'Kosisz trawnik.', 'Myjesz samochód',
            'Naprawiasz telefon.'
        ]

        const worktext = workstexts[~~(Math.random() * workstexts.length)]
        
        const moneyOptions = {
            min: 40, max: 120
        }

        const takeEnergyCount = 30

        const moneyFromWork = ~~((Math.random() * moneyOptions.max) + moneyOptions.min)

        eco.takeEnergy(takeEnergyCount)
        eco.addMoney(moneyFromWork)

        return {
            author: ['Normalna praca', Antek.user.displayAvatarURL()],
            footer: [message.author.tag, message.author.displayAvatarURL({ dynamic: true })],
            text: `> ${worktext}\n**Zarabiasz:** \`${moneyFromWork}\``
        }

    }

}