import Antek from '../Antek'
import { Item } from '../types'

export const levels = {

    0: { name: 'Normalny', multiplier: 1.1 },
    1: { name: 'Przeciętny', multiplier: 1.3 },
    2: { name: 'Rzadki', multiplier: 1.7 },
    3: { name: 'Magiczny', multiplier: 2.2 },
    4: { name: 'Epicki', multiplier: 2.5 },
    5: { name: 'Legendarny', multiplier: 3 },
    6: { name: 'Mistrzowski', multiplier: 3.2 }


}

export const items = {

    economy: {

        'Emerald': { icon: '<:emeraldzik:862071469932281917>', value: 'Waluta', occurrence: [ 5, 6 ], price: { min: 1000, max: 1000 }},
        'Diamond': { icon: '<:diamondzik:862072049132371978>', value: 'Waluta', occurrence: [ 6 ], price: { min: 1500, max: 1500  }},

    },

    toUse: {

        'Kupon': { icon: '🎟', value: 'Przedmiot użytkowy', occurrence: [ 4, 5 ] },
        'Box': { icon: '📦', value: 'Przedmiot użytkowy', occurrence: [ 2, 3, 4, 5, 6 ]}

    },

    neutral: {

        'Szampan': { icon: '🍾', value: 'Napój', occurrence: [ 0, 1, 2 ], price: { min: 300, max: 432 }},
        'Liść': { icon: '🍂', value: 'Natura', occurrence: [ 0, 1 ], price: { min: 100, max: 250 }},
        'Okulary': { icon: '🕶', value: 'Ubranie', occurrence: [ 2, 3, 4 ], price: { min: 123, max: 321 }},
        
    },

    defense: {

        'Pajęczyna': { icon: '🕸', value: 'Spowolnienie', occurrence: [ 4, 5, 6 ], price: { min: 500, max: 670 }},
        'Tarcza': { icon: '🛡', value: 'Przyjmowanie obrażeń', occurrence: [ 2, 3, 4, 5, 6 ], price: { min: 900, max: 1200 }},
        
    },

    attack: {

        'Łuk': { icon: '🏹', value: 'Obrażenia z dystansu', occurrence: [ 4, 5, 6 ], price: { min: 650, max: 945 }},
        'Pistolet': { icon: '🔫', value: 'Seryjne obrażenia', occurrence: [ 6 ], price: { min: 4500, max: 6000 }},
        'Noż': { icon: '🔪', value: 'Wysokie obrażenia', occurrence: [3, 4, 5, 6], price: { min: 1000, max: 1650 }}

    },
    
    mine: {

        'Zwykły kilof': { icon: '⛏', value: 'Praca w kopalni', occurrence: [ 4, 6 ], price: { min: 450, max: 560 }}

    }

}

class Utils {

    category: string
    item: Object

    get randomCategory () {

        let array = Object.keys(items).map(k => k)
        this.category = array[~~(Math.random() * array.length)]
        return this.category
        
    }

    get randomItem () {

        let array = Object.keys(items[this.category]).map(k => k)
        this.item = array[~~(Math.random() * array.length)]
        return this.item

    }

    randomPrice (min: number, max: number, multiplier: number) {
        return (~~(Math.random() * max) + min) * (multiplier / 2)
    }

    randomType (occurrence: number[]) {

        let array = occurrence.reverse()

        const it = []

        array.forEach((id, i) => {

            for (let j = 0; j <= i; j++) {
                it.push(id)
                it.push(id)
            }

        })

        return levels[it[~~(Math.random() * it.length)]]

    }

    itemPower (price, multiplier) {
        return ((~~(Math.random() * price) + 100) * (multiplier / 1.5))
    }

}

export default class ItemGenerator {

    data: Item

    constructor (id: string) {

        while (true) {

            this.data = this.init

            const items = Antek.db.prepare('SELECT * FROM items WHERE userID = ? AND name = ?').all(id, this.data.name)

            if (!items[0]) break

        }

        delete this.data.occurrence

    }

    get init () {

        const utils = new Utils()

        const category      = utils.randomCategory
        const item          = utils.randomItem
        const occurrence    = utils.randomType(items[category][item].occurrence)
        const price         = items[category][item].price ? utils.randomPrice(items[category][item].price.min, items[category][item].price.max, occurrence.multiplier) : 500
        const power         = utils.itemPower(price, occurrence.multiplier)

        return {

            name: item,
            ...items[category][item],
            level: occurrence.name,
            price, power

        }

    }

    get get (): Item {
        return this.data
    }

}