import { Command, commandOutput, commandArguments } from '../../types'
import FightSystem from '../../utils/fight.system'
import Antek from '../../Antek'

export default class extends Command {

    constructor () {

        super ()

        this.executors = ['walka', 'fight', 'walcz', 'pojedynek', 'pvp', 'napierdoleci', 'gin', 'kurwoo', 'walczsmieciu']
        this.category = 'items'
        this.usage = '@mention'
        this.description = 'Walcz z kimś przedmiotami z ekwipunku!'

    }

    async run ({ message, args }: commandArguments): Promise<commandOutput> {

        const rival = message.mentions.members.first()

        if (!rival) return {
            error: 'Musisz oznaczyć rywala!'
        }

        if (Antek.gbans.get(rival.id)) return {
            error: 'Wybrany rywal ma globalną blokadę!! Walka sie nie odbędzie, nie chcemy tu łotrów'
        }

        if (rival.user.id === message.author.id) return {
            error: 'Nie możesz walczyć sam z sobą!'
        }

        if (rival.user.bot) return {
            error: 'Nie możesz walczyć z botem!'
        }

        if (Antek.db.prepare('SELECT * FROM items WHERE userID = ?').all(message.author.id).length <= 2) return {
            error: 'Musisz posiadać minimum 2 przedmioty!'
        }

        if (Antek.db.prepare('SELECT * FROM items WHERE userID = ?').all(rival.user.id).length <= 2) return {
            error: 'Rywal musi posiadać minimum 2 przedmioty!'
        }

        new FightSystem(message.member, rival, message)

        return 

    }

}